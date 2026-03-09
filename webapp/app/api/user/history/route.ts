// ============================================
// GET /api/user/history?uid=xxx — Load assessment history
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }

  const db = getServiceClient();

  const { data, error } = await db
    .from("intake_sessions")
    .select("id, created_at, assessment_result, status")
    .eq("anonymous_uid", uid)
    .eq("status", "assessed")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("History fetch error:", error.message);
    return NextResponse.json({ error: "Failed to load history" }, { status: 500 });
  }

  // slim down — don't send full audit_trail in history listing
  const history = (data || []).map((row) => {
    const result = row.assessment_result as Record<string, unknown> | null;
    if (!result) return null;

    const recommended = (result.recommended_herbs as unknown[]) || [];
    const caution = (result.caution_herbs as unknown[]) || [];
    const avoid = (result.avoid_herbs as unknown[]) || [];

    return {
      id: row.id,
      date: row.created_at,
      concern: result.concern || "",
      concern_label: result.concern_label || "",
      recommended_count: recommended.length,
      caution_count: caution.length,
      avoid_count: avoid.length,
      total: recommended.length + caution.length + avoid.length,
    };
  }).filter(Boolean);

  return NextResponse.json({ history });
}
