// ============================================
// POST /api/chat — Conversational Agent Endpoint
// ============================================
// Uses Ollama (llama3.1:8b) locally. Tools are called deterministically
// server-side and results are injected as context — the LLM generates
// the conversational response on top of real, verified data.

import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/agent/systemPrompt";
import {
  getUserProfile,
  runSafetyCheck,
  getHerbData,
  getEvidenceClaims,
  logAudit,
  resolveHerbId,
} from "@/lib/agent/toolHandlers";
import type { UserProfile } from "@/lib/agent/toolHandlers";
import {
  enforceResponse,
  scanUserMessageForRedFlags,
  scanForUnknownHerb,
  ESCALATION_RESPONSE,
  UNKNOWN_HERB_RESPONSE,
} from "@/lib/agent/orchestrator";
import type { ConversationState } from "@/lib/agent/systemPrompt";
import { createInitialState } from "@/lib/agent/systemPrompt";

// ============================================
// OLLAMA CONFIG
// ============================================

const OLLAMA_BASE_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1:8b";

// ============================================
// IN-MEMORY STATE (per session)
// ============================================

const sessionStates = new Map<string, ConversationState>();
const sessionProfiles = new Map<string, UserProfile>();

function getOrCreateState(sessionId: string): ConversationState {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, createInitialState(sessionId));
  }
  return sessionStates.get(sessionId)!;
}

// ============================================
// HERB DETECTION IN USER MESSAGE
// ============================================

const HERB_PATTERNS: { pattern: RegExp; herbId: string }[] = [
  { pattern: /\bashwagandha\b/i, herbId: "herb_ashwagandha" },
  { pattern: /\btriphala\b/i, herbId: "herb_triphala" },
  { pattern: /\btulsi\b/i, herbId: "herb_tulsi" },
  { pattern: /\bholy\s*basil\b/i, herbId: "herb_tulsi" },
  { pattern: /\bbrahmi\b/i, herbId: "herb_brahmi" },
  { pattern: /\bbacopa\b/i, herbId: "herb_brahmi" },
  { pattern: /\bshatavari\b/i, herbId: "herb_shatavari" },
  { pattern: /\bguduchi\b/i, herbId: "herb_guduchi" },
  { pattern: /\bgiloy\b/i, herbId: "herb_guduchi" },
  { pattern: /\btinospora\b/i, herbId: "herb_guduchi" },
  { pattern: /\bharidra\b/i, herbId: "herb_haridra" },
  { pattern: /\bhaldi\b/i, herbId: "herb_haridra" },
  { pattern: /\bturmeric\b/i, herbId: "herb_haridra" },
  { pattern: /\bcurcumin\b/i, herbId: "herb_haridra" },
  { pattern: /\barjuna\b/i, herbId: "herb_arjuna" },
  { pattern: /\bamalaki\b/i, herbId: "herb_amalaki" },
  { pattern: /\bamla\b/i, herbId: "herb_amalaki" },
  { pattern: /\byashtimadhu\b/i, herbId: "herb_yashtimadhu" },
  { pattern: /\bmulethi\b/i, herbId: "herb_yashtimadhu" },
  { pattern: /\bliquorice\b/i, herbId: "herb_yashtimadhu" },
  { pattern: /\blicorice\b/i, herbId: "herb_yashtimadhu" },
];

function detectHerbsInMessage(message: string): string[] {
  const found = new Set<string>();
  for (const { pattern, herbId } of HERB_PATTERNS) {
    if (pattern.test(message)) {
      found.add(herbId);
    }
  }
  return [...found];
}

// ============================================
// CONCERN DETECTION (for evidence matching)
// ============================================

const CONCERN_PATTERNS: { pattern: RegExp; tag: string }[] = [
  { pattern: /\bstress\b/i, tag: "stress" },
  { pattern: /\banxi(?:ety|ous)\b/i, tag: "anxiety" },
  { pattern: /\bsleep|insomnia\b/i, tag: "sleep" },
  { pattern: /\bjoint|arthritis\b/i, tag: "joint_pain" },
  { pattern: /\bdigest|bloat|constipat|ibs\b/i, tag: "digestion" },
  { pattern: /\bimmun/i, tag: "immunity" },
  { pattern: /\bfatigue|tired|energy\b/i, tag: "fatigue" },
  { pattern: /\binflam/i, tag: "inflammation" },
  { pattern: /\bblood\s*sugar|diabet/i, tag: "blood_sugar" },
  { pattern: /\bheart|cardio|cholesterol|bp|blood\s*pressure\b/i, tag: "cardiovascular" },
  { pattern: /\bthyroid\b/i, tag: "thyroid" },
  { pattern: /\bmemory|focus|concentrat|cognit/i, tag: "cognitive" },
  { pattern: /\bskin|acne|eczema\b/i, tag: "skin" },
  { pattern: /\bhair\b/i, tag: "hair" },
  { pattern: /\bweight\b/i, tag: "weight" },
  { pattern: /\bperiod|menstr|pcos|pcod\b/i, tag: "menstrual" },
];

function detectConcern(message: string): string | undefined {
  for (const { pattern, tag } of CONCERN_PATTERNS) {
    if (pattern.test(message)) return tag;
  }
  return undefined;
}

// ============================================
// BUILD CONTEXT FROM TOOL RESULTS
// ============================================

interface ToolContext {
  profile: UserProfile | null;
  safetyResults: Awaited<ReturnType<typeof runSafetyCheck>>[];
  herbData: Awaited<ReturnType<typeof getHerbData>>[];
  evidenceClaims: Awaited<ReturnType<typeof getEvidenceClaims>>[];
  toolsCalled: string[];
}

async function gatherContext(
  sessionId: string,
  message: string,
  state: ConversationState
): Promise<ToolContext> {
  const toolsCalled: string[] = [];
  const ctx: ToolContext = {
    profile: null,
    safetyResults: [],
    herbData: [],
    evidenceClaims: [],
    toolsCalled,
  };

  // 1. Always load profile if not cached
  let profile: UserProfile | null | undefined = sessionProfiles.get(sessionId);
  if (!profile) {
    profile = await getUserProfile(sessionId);
    if (profile) {
      sessionProfiles.set(sessionId, profile);
      state.profile_loaded = true;
      state.profile = profile;
    }
    toolsCalled.push("getUserProfile");
  }
  ctx.profile = profile || null;

  // 2. Detect herbs mentioned in message
  const herbIds = detectHerbsInMessage(message);
  const concern = detectConcern(message);

  // 3. For each herb: run safety check, get herb data, get evidence
  for (const herbId of herbIds) {
    if (!profile) break;

    // Safety check
    const safetyResult = await runSafetyCheck(herbId, profile, concern);
    ctx.safetyResults.push(safetyResult);
    toolsCalled.push("runSafetyCheck");

    // Update conversation state
    state.safety_checks[herbId] = {
      herb_id: herbId,
      risk_code: safetyResult.overall_risk,
      cautions: safetyResult.cautions.map((c) => c.explanation),
      interactions: safetyResult.cautions
        .filter((c) => c.type === "medication_interaction")
        .map((c) => c.explanation),
      evidence_grade: safetyResult.evidence_grade,
      checked_at: new Date().toISOString(),
    };
    if (safetyResult.blocked) state.herbs_blocked.push(herbId);
    if (!state.herbs_discussed.includes(herbId)) state.herbs_discussed.push(herbId);

    // Herb data
    const data = await getHerbData(herbId);
    if (data) ctx.herbData.push(data);
    toolsCalled.push("getHerbData");

    // Evidence claims
    const claims = await getEvidenceClaims(herbId, concern);
    if (claims.length > 0) ctx.evidenceClaims.push(claims);
    toolsCalled.push("getEvidenceClaims");
  }

  return ctx;
}

function buildContextBlock(ctx: ToolContext): string {
  const parts: string[] = [];

  // Profile context
  if (ctx.profile) {
    parts.push(`USER PROFILE (from database):
- Age: ${ctx.profile.age}, Sex: ${ctx.profile.sex}
- Pregnancy status: ${ctx.profile.pregnancy_status}
- Chronic conditions: ${ctx.profile.chronic_conditions.length > 0 ? ctx.profile.chronic_conditions.join(", ") : "none reported"}
- Medications: ${ctx.profile.medications.length > 0 ? ctx.profile.medications.join(", ") : "none reported"}
- Current herbs: ${ctx.profile.current_herbs.length > 0 ? ctx.profile.current_herbs.join(", ") : "none reported"}`);
  }

  // Safety check results
  for (const sr of ctx.safetyResults) {
    let block = `\nSAFETY CHECK — ${sr.herb_name} (${sr.herb_id}):
- Overall risk: ${sr.overall_risk.toUpperCase()}
- Blocked: ${sr.blocked ? "YES — DO NOT RECOMMEND" : "No"}`;

    if (sr.block_reasons.length > 0) {
      block += `\n- Block reasons: ${sr.block_reasons.join("; ")}`;
    }
    if (sr.cautions.length > 0) {
      block += `\n- Cautions:`;
      for (const c of sr.cautions) {
        block += `\n  * [${c.type}] ${c.explanation}${c.clinical_action ? ` → ${c.clinical_action}` : ""}`;
      }
    }
    if (sr.evidence_grade) {
      block += `\n- Best evidence grade: ${sr.evidence_grade}`;
    }
    if (sr.evidence_summary) {
      block += `\n- Evidence summary: ${sr.evidence_summary}`;
    }
    parts.push(block);
  }

  // Herb data
  for (const herb of ctx.herbData) {
    if (!herb) continue;
    let block = `\nHERB DATA — ${herb.names.english} (${herb.botanical_name}):
- Names: English=${herb.names.english}, Sanskrit=${herb.names.sanskrit}, Hindi=${herb.names.hindi}
- Parts used: ${herb.parts_used.join(", ")}`;

    if (herb.dosage_ranges?.forms?.length) {
      const formStr = herb.dosage_ranges.forms
        .map((f) => `${f.form}: ${f.range_min}-${f.range_max} ${f.unit}`)
        .join(", ");
      block += `\n- Dosage: ${formStr}`;
      block += `\n- Dosage disclaimer: ${herb.dosage_ranges.disclaimer}`;
    }

    if (herb.side_effects) {
      const se = herb.side_effects;
      if (se.common?.length) block += `\n- Common side effects: ${se.common.join(", ")}`;
      if (se.rare?.length) block += `\n- Rare side effects: ${se.rare.join(", ")}`;
    }

    if (herb.misuse_patterns?.length) {
      block += `\n- Misuse patterns: ${herb.misuse_patterns.map((m) => m.title).join("; ")}`;
    }

    parts.push(block);
  }

  // Evidence claims
  if (ctx.evidenceClaims.length > 0) {
    let block = "\nEVIDENCE CLAIMS:";
    for (const claimGroup of ctx.evidenceClaims) {
      for (const claim of claimGroup) {
        block += `\n- [Grade ${claim.evidence_grade}] ${claim.claim}: ${claim.summary}`;
        if (claim.mechanism) block += ` (Mechanism: ${claim.mechanism})`;
      }
    }
    parts.push(block);
  }

  return parts.join("\n");
}

// ============================================
// OLLAMA API CALL
// ============================================

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callOllama(messages: OllamaMessage[]): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      options: {
        temperature: 0.4,
        top_p: 0.9,
        num_predict: 512,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.message?.content || "";
}

// ============================================
// MAIN HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      session_id,
      message,
      history = [],
    } = body as {
      session_id: string;
      message: string;
      history: { role: "user" | "assistant"; content: string }[];
    };

    if (!session_id || !message) {
      return NextResponse.json(
        { error: "session_id and message are required" },
        { status: 400 }
      );
    }

    // ─── Red flag pre-scan (orchestrator, code-level) ───
    const redFlagScan = scanUserMessageForRedFlags(message);
    if (redFlagScan.detected) {
      const state = getOrCreateState(session_id);
      state.red_flag_escalated = true;
      await logAudit(session_id, "RED_FLAG_ESCALATION", {
        flags: redFlagScan.flags,
        user_message: message.substring(0, 200),
      });
      return NextResponse.json({
        response: ESCALATION_RESPONSE,
        escalation: true,
      });
    }

    // ─── Check post-escalation state ───
    const state = getOrCreateState(session_id);
    if (state.red_flag_escalated) {
      return NextResponse.json({
        response:
          "I understand your interest, but based on the symptoms you mentioned earlier, please get medical evaluation first. I cannot provide herbal information when there may be a medical emergency.\n\nEmergency: **112** | iCall: **9152987821** | Vandrevala Foundation: **1860-2662-345**",
        escalation: true,
      });
    }

    // ─── Unknown herb pre-scan (deterministic, bypass LLM) ───
    const unknownHerbScan = scanForUnknownHerb(message);
    if (unknownHerbScan.detected) {
      await logAudit(session_id, "NO_HERB_ADVISED", {
        reason: "unknown_herb",
        herb_name: unknownHerbScan.herbName,
      });
      return NextResponse.json({
        response: UNKNOWN_HERB_RESPONSE,
      });
    }

    state.turn_count++;

    // ─── Gather tool context deterministically ───
    const ctx = await gatherContext(session_id, message, state);

    // ─── Build system prompt with injected context ───
    const contextBlock = buildContextBlock(ctx);
    const enrichedSystem = `${SYSTEM_PROMPT}

The current session_id is: ${session_id}

--- DATABASE CONTEXT (verified, authoritative — use this, do NOT make up data) ---
${contextBlock || "No specific herb context gathered for this message. Respond conversationally based on the user's question."}
--- END DATABASE CONTEXT ---

IMPORTANT INSTRUCTIONS FOR THIS RESPONSE:
- ONLY use facts from the DATABASE CONTEXT above. Do NOT invent data.
- If a herb is marked "Blocked: YES", say it is not recommended and explain why. Do NOT provide dosage.
- If a herb has cautions, list ALL cautions before any dosage info.
- Keep response under 200 words. Be conversational, warm, but careful.
- Always end herb-specific responses with: "This is educational information — please discuss with your healthcare provider."
- If no herb was mentioned, respond helpfully about general wellness or ask what they'd like to know.`;

    // ─── Build messages for Ollama ───
    const ollamaMessages: OllamaMessage[] = [
      { role: "system", content: enrichedSystem },
    ];

    // Add conversation history (keep last 10 turns to manage context size)
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      ollamaMessages.push({
        role: msg.role,
        content: msg.content,
      });
    }

    // Add current user message
    ollamaMessages.push({ role: "user", content: message });

    // ─── Call Ollama ───
    let responseText = await callOllama(ollamaMessages);

    // ─── Orchestrator enforcement (code-level safety net) ───
    const enforcement = enforceResponse(responseText, state, ctx.toolsCalled);
    responseText = enforcement.sanitized_response;

    // Log enforcement violations if any
    if (enforcement.violations.length > 0) {
      await logAudit(session_id, "ORCHESTRATOR_ENFORCEMENT", {
        violations: enforcement.violations,
        actions: enforcement.actions_taken,
      });
    }

    // Update state
    sessionStates.set(session_id, state);

    return NextResponse.json({
      response: responseText,
      escalation: false,
      tools_called: ctx.toolsCalled,
    });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Chat failed" },
      { status: 500 }
    );
  }
}
