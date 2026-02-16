// ============================================
// POST /api/assess — Risk Assessment Endpoint
// ============================================
// Validates intake, runs deterministic risk engine, logs to audit trail.
// No AI. No LLM. Pure rule-based assessment.

import { NextRequest, NextResponse } from "next/server";
import { runAssessment } from "@/lib/riskEngine";
import { getServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await runAssessment(body);

    // Abort early on validation errors (no session to log)
    if (result.status === "ERROR") {
      return NextResponse.json(
        { error: "Validation failed", details: result.audit_trail },
        { status: 400 }
      );
    }

    // ============================================
    // PHASE 3E: AUDIT LOGGING (append-only)
    // ============================================
    const db = getServiceClient();

    // 1. Create intake session
    const { error: sessionError } = await db.from("intake_sessions").insert({
      id: result.session_id,
      intake_data: body,
      assessment_result: result,
      status: "assessed",
    });

    if (sessionError) {
      console.error("Audit: intake_sessions insert failed:", sessionError.message);
    }

    // 2. Log disclaimer acceptance
    const forwardedFor = request.headers.get("x-forwarded-for") || "unknown";
    const ipSource = forwardedFor.split(",")[0].trim();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(ipSource)
    );
    const hashedIp = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const { error: disclaimerError } = await db
      .from("disclaimer_acceptances")
      .insert({
        session_id: result.session_id,
        ip_hash: hashedIp,
        user_agent: request.headers.get("user-agent") || "unknown",
        disclaimer_version: "v1.0",
        checkboxes: {
          educational: true,
          consult: true,
          responsibility: true,
        },
      });

    if (disclaimerError) {
      console.error(
        "Audit: disclaimer_acceptances insert failed:",
        disclaimerError.message
      );
    }

    // 3. Append audit trail entries (append-only, no UPDATE/DELETE)
    if (result.audit_trail.length > 0) {
      const auditRows = result.audit_trail.map((entry) => ({
        session_id: result.session_id,
        event_type: entry.event_type,
        event_data: entry.event_data,
        herb_id: entry.herb_id || null,
        risk_code: entry.risk_code || null,
        trigger_type: entry.trigger_type || null,
        trigger_value: entry.trigger_value || null,
      }));

      const { error: auditError } = await db
        .from("audit_log")
        .insert(auditRows);

      if (auditError) {
        console.error("Audit: audit_log insert failed:", auditError.message);
      }
    }

    // Return assessment (without audit_trail to reduce payload to client)
    const clientResult = {
      ...result,
      audit_trail: undefined,
    };

    return NextResponse.json(clientResult);
  } catch (err) {
    console.error("Assessment error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Assessment failed",
      },
      { status: 500 }
    );
  }
}
