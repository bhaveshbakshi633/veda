// ============================================
// POST /api/chat — Conversational Agent Endpoint
// ============================================
// Uses Ollama (local LLM). Supports streaming (SSE) and non-streaming.
// Tools are called deterministically server-side and results are
// injected as context — the LLM generates conversational responses
// on top of real, verified data.

import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/agent/systemPrompt";
import {
  getUserProfile,
  runSafetyCheck,
  getHerbData,
  getEvidenceClaims,
  logAudit,
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
import type { RiskAssessment } from "@/lib/types";

// ============================================
// OLLAMA CONFIG
// ============================================

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "gemma2:9b";

// ============================================
// IN-MEMORY STATE (per session)
// ============================================

const sessionStates = new Map<string, ConversationState>();
const sessionProfiles = new Map<string, UserProfile>();
const sessionAssessments = new Map<string, string>();

function getOrCreateState(sessionId: string): ConversationState {
  if (!sessionStates.has(sessionId)) {
    sessionStates.set(sessionId, createInitialState(sessionId));
  }
  return sessionStates.get(sessionId)!;
}

// ============================================
// RESPONSE LENGTH CLASSIFIER
// ============================================

function getResponseLength(message: string, herbCount: number, isInit: boolean): number {
  if (isInit) return 1024;
  if (herbCount >= 2) return 800;
  if (herbCount === 1) return 512;

  // chhoti si baat ke liye chhota response
  const shortPatterns = /^(hi|hello|thanks|ok|yes|no|bye|haan|nahi|theek|shukriya)\b/i;
  if (shortPatterns.test(message.trim())) return 150;

  const wordCount = message.trim().split(/\s+/).length;
  if (wordCount < 6) return 300;

  return 512;
}

// ============================================
// HERB DETECTION IN USER MESSAGE
// ============================================

const HERB_PATTERNS: { pattern: RegExp; herbId: string }[] = [
  // Original 10
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
  // 40 new herbs
  { pattern: /\bneem\b/i, herbId: "herb_neem" },
  { pattern: /\bnimba\b/i, herbId: "herb_neem" },
  { pattern: /\bguggul(?:u)?\b/i, herbId: "herb_guggulu" },
  { pattern: /\bmoringa\b/i, herbId: "herb_moringa" },
  { pattern: /\bdrumstick\b/i, herbId: "herb_moringa" },
  { pattern: /\bsahjan\b/i, herbId: "herb_moringa" },
  { pattern: /\bgokshura\b/i, herbId: "herb_gokshura" },
  { pattern: /\bgokhru\b/i, herbId: "herb_gokshura" },
  { pattern: /\btribulus\b/i, herbId: "herb_gokshura" },
  { pattern: /\bpunarnava\b/i, herbId: "herb_punarnava" },
  { pattern: /\bshilajit\b/i, herbId: "herb_shilajit" },
  { pattern: /\bkutki\b/i, herbId: "herb_kutki" },
  { pattern: /\bkatuki\b/i, herbId: "herb_kutki" },
  { pattern: /\bbhri?ngaraj\b/i, herbId: "herb_bhringaraj" },
  { pattern: /\bshankh(?:a)?pushpi\b/i, herbId: "herb_shankhapushpi" },
  { pattern: /\bvidanga\b/i, herbId: "herb_vidanga" },
  { pattern: /\bvacha\b/i, herbId: "herb_vacha" },
  { pattern: /\bsweet\s*flag\b/i, herbId: "herb_vacha" },
  { pattern: /\bpippali\b/i, herbId: "herb_pippali" },
  { pattern: /\blong\s*pepper\b/i, herbId: "herb_pippali" },
  { pattern: /\bmaricha\b/i, herbId: "herb_maricha" },
  { pattern: /\bblack\s*pepper\b/i, herbId: "herb_maricha" },
  { pattern: /\bkali\s*mirch\b/i, herbId: "herb_maricha" },
  { pattern: /\bshunthi\b/i, herbId: "herb_shunthi" },
  { pattern: /\b(?:dry\s*)?ginger\b/i, herbId: "herb_shunthi" },
  { pattern: /\badrak\b/i, herbId: "herb_shunthi" },
  { pattern: /\bsonth\b/i, herbId: "herb_shunthi" },
  { pattern: /\bdalchini\b/i, herbId: "herb_dalchini" },
  { pattern: /\bcinnamon\b/i, herbId: "herb_dalchini" },
  { pattern: /\belaichi\b/i, herbId: "herb_elaichi" },
  { pattern: /\bcardamom\b/i, herbId: "herb_elaichi" },
  { pattern: /\blavanga?\b/i, herbId: "herb_lavanga" },
  { pattern: /\bclove\b/i, herbId: "herb_lavanga" },
  { pattern: /\blaung\b/i, herbId: "herb_lavanga" },
  { pattern: /\bmethi\b/i, herbId: "herb_methi" },
  { pattern: /\bfenugreek\b/i, herbId: "herb_methi" },
  { pattern: /\bkalmegh\b/i, herbId: "herb_kalmegh" },
  { pattern: /\bandrographis\b/i, herbId: "herb_kalmegh" },
  { pattern: /\bmanjistha\b/i, herbId: "herb_manjistha" },
  { pattern: /\bchitrak\b/i, herbId: "herb_chitrak" },
  { pattern: /\bbala\b/i, herbId: "herb_bala" },
  { pattern: /\bjatamansi\b/i, herbId: "herb_jatamansi" },
  { pattern: /\bspikenard\b/i, herbId: "herb_jatamansi" },
  { pattern: /\bkumari\b/i, herbId: "herb_kumari" },
  { pattern: /\baloe\s*vera\b/i, herbId: "herb_kumari" },
  { pattern: /\btagar\b/i, herbId: "herb_tagar" },
  { pattern: /\bvalerian\b/i, herbId: "herb_tagar" },
  { pattern: /\bmusta\b/i, herbId: "herb_musta" },
  { pattern: /\bnagarmotha\b/i, herbId: "herb_musta" },
  { pattern: /\bharitaki\b/i, herbId: "herb_haritaki" },
  { pattern: /\bharad\b/i, herbId: "herb_haritaki" },
  { pattern: /\bbibhitaki\b/i, herbId: "herb_bibhitaki" },
  { pattern: /\bbaheda\b/i, herbId: "herb_bibhitaki" },
  { pattern: /\bsariva\b/i, herbId: "herb_sariva" },
  { pattern: /\banantamool\b/i, herbId: "herb_sariva" },
  { pattern: /\bchirata\b/i, herbId: "herb_chirata" },
  { pattern: /\bchirayita\b/i, herbId: "herb_chirata" },
  { pattern: /\bajwain\b/i, herbId: "herb_ajwain" },
  { pattern: /\bcarom\b/i, herbId: "herb_ajwain" },
  { pattern: /\bjeera\b/i, herbId: "herb_jeera" },
  { pattern: /\bcumin\b/i, herbId: "herb_jeera" },
  { pattern: /\bkalonji\b/i, herbId: "herb_kalonji" },
  { pattern: /\bnigella\b/i, herbId: "herb_kalonji" },
  { pattern: /\bblack\s*seed\b/i, herbId: "herb_kalonji" },
  { pattern: /\bisabgol\b/i, herbId: "herb_isabgol" },
  { pattern: /\bpsyllium\b/i, herbId: "herb_isabgol" },
  { pattern: /\bsenna\b/i, herbId: "herb_senna" },
  { pattern: /\bsafed\s*musli\b/i, herbId: "herb_safed_musli" },
  { pattern: /\bkapikacchu\b/i, herbId: "herb_kapikacchu" },
  { pattern: /\bmucuna\b/i, herbId: "herb_kapikacchu" },
  { pattern: /\bvelvet\s*bean\b/i, herbId: "herb_kapikacchu" },
  { pattern: /\brasna\b/i, herbId: "herb_rasna" },
  { pattern: /\blodhra\b/i, herbId: "herb_lodhra" },
  { pattern: /\bnagkesar\b/i, herbId: "herb_nagkesar" },
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
// CONCERN DETECTION
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

  const herbIds = detectHerbsInMessage(message);
  const concern = detectConcern(message);

  for (const herbId of herbIds) {
    if (!profile) break;

    const safetyResult = await runSafetyCheck(herbId, profile, concern);
    ctx.safetyResults.push(safetyResult);
    toolsCalled.push("runSafetyCheck");

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

    const data = await getHerbData(herbId);
    if (data) ctx.herbData.push(data);
    toolsCalled.push("getHerbData");

    const claims = await getEvidenceClaims(herbId, concern);
    if (claims.length > 0) ctx.evidenceClaims.push(claims);
    toolsCalled.push("getEvidenceClaims");
  }

  return ctx;
}

function buildContextBlock(ctx: ToolContext): string {
  const parts: string[] = [];

  if (ctx.profile) {
    parts.push(`USER PROFILE (from database):
- Age: ${ctx.profile.age}, Sex: ${ctx.profile.sex}
- Pregnancy status: ${ctx.profile.pregnancy_status}
- Chronic conditions: ${ctx.profile.chronic_conditions.length > 0 ? ctx.profile.chronic_conditions.join(", ") : "none reported"}
- Medications: ${ctx.profile.medications.length > 0 ? ctx.profile.medications.join(", ") : "none reported"}
- Current herbs: ${ctx.profile.current_herbs.length > 0 ? ctx.profile.current_herbs.join(", ") : "none reported"}`);
  }

  for (const sr of ctx.safetyResults) {
    let block = `\nSAFETY CHECK — ${sr.herb_name} (${sr.herb_id}):
- Overall risk: ${sr.overall_risk.toUpperCase()}
- Blocked: ${sr.blocked ? "YES — DO NOT RECOMMEND" : "No"}`;
    if (sr.block_reasons.length > 0) block += `\n- Block reasons: ${sr.block_reasons.join("; ")}`;
    if (sr.cautions.length > 0) {
      block += `\n- Cautions:`;
      for (const c of sr.cautions) {
        block += `\n  * [${c.type}] ${c.explanation}${c.clinical_action ? ` → ${c.clinical_action}` : ""}`;
      }
    }
    if (sr.evidence_grade) block += `\n- Best evidence grade: ${sr.evidence_grade}`;
    if (sr.evidence_summary) block += `\n- Evidence summary: ${sr.evidence_summary}`;
    parts.push(block);
  }

  for (const herb of ctx.herbData) {
    if (!herb) continue;
    // herb scoping markers — helps LLM stay on topic
    let block = `\n[HERB: ${herb.names.english} START]
HERB DATA — ${herb.names.english} (${herb.botanical_name}):
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
    block += `\n[HERB: ${herb.names.english} END]`;
    parts.push(block);
  }

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
// BUILD ASSESSMENT CONTEXT (for initial message)
// ============================================

function buildAssessmentContext(result: RiskAssessment): string {
  const parts: string[] = [];

  parts.push(`═══ ASSESSMENT RESULTS (from deterministic safety engine) ═══`);
  parts.push(`Concern: ${result.concern_label}`);
  parts.push(`Total herbs with evidence: ${result.total_relevant}`);
  parts.push(`Doctor referral suggested: ${result.doctor_referral_suggested ? "YES" : "No"}`);

  if (result.recommended_herbs.length > 0) {
    parts.push(`\n── RECOMMENDED HERBS (${result.recommended_herbs.length}) ──`);
    for (const herb of result.recommended_herbs) {
      let block = `\n${herb.herb_name} [Grade ${herb.evidence_grade || "N/A"}]`;
      block += `\n  Why: ${herb.relevance_summary}`;
      block += `\n  Safety: ${herb.safety_note}`;
      if (herb.dosage?.forms?.length) {
        const formStr = herb.dosage.forms
          .map((f: { form: string; range_min: string; range_max: string; unit: string }) =>
            `${f.form}: ${f.range_min}-${f.range_max} ${f.unit}`
          )
          .join("; ");
        block += `\n  Dosage: ${formStr}`;
      }
      parts.push(block);
    }
  }

  if (result.caution_herbs.length > 0) {
    parts.push(`\n── CAUTION HERBS (${result.caution_herbs.length}) ──`);
    for (const herb of result.caution_herbs) {
      let block = `\n${herb.herb_name} [Grade ${herb.evidence_grade || "N/A"}] — USE WITH CARE`;
      block += `\n  Why relevant: ${herb.relevance_summary}`;
      for (const c of herb.cautions) {
        block += `\n  ⚠ [${c.type}] ${c.explanation}`;
        if (c.clinical_action) block += ` → ${c.clinical_action}`;
      }
      parts.push(block);
    }
  }

  if (result.avoid_herbs.length > 0) {
    parts.push(`\n── AVOID HERBS (${result.avoid_herbs.length}) ──`);
    for (const herb of result.avoid_herbs) {
      let block = `\n${herb.herb_name} — NOT SAFE`;
      block += `\n  Why: ${herb.reason}`;
      block += `\n  Trigger: ${herb.trigger} (${herb.trigger_type})`;
      parts.push(block);
    }
  }

  parts.push(`\nDisclaimer: ${result.disclaimer}`);
  return parts.join("\n");
}

// ============================================
// OLLAMA CALLS (non-streaming + streaming)
// ============================================

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

async function callOllama(system: string, messages: ChatMessage[], numPredict: number = 1024): Promise<string> {
  const ollamaMessages: ChatMessage[] = [
    { role: "system", content: system },
    ...messages,
  ];

  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: ollamaMessages,
      stream: false,
      options: { temperature: 0.35, num_predict: numPredict, repeat_penalty: 1.1, top_p: 0.9, top_k: 40 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.message?.content || "";
}

// streaming response — returns SSE Response
function createStreamResponse(
  system: string,
  messages: ChatMessage[],
  state: ConversationState,
  sessionId: string,
  toolsCalled: string[],
  numPredict: number = 1024
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const ollamaMessages: ChatMessage[] = [
          { role: "system", content: system },
          ...messages,
        ];

        const res = await fetch(`${OLLAMA_URL}/api/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            model: MODEL,
            messages: ollamaMessages,
            stream: true,
            options: { temperature: 0.35, num_predict: numPredict, repeat_penalty: 1.1, top_p: 0.9, top_k: 40 },
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ type: "error", content: `Ollama error ${res.status}: ${errText}` })}\n\n`
          ));
          controller.close();
          return;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                accumulated += parsed.message.content;
                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ type: "token", content: parsed.message.content })}\n\n`
                ));
              }
              if (parsed.done) {
                // orchestrator enforcement on full text
                const enforcement = enforceResponse(accumulated, state, toolsCalled);

                if (enforcement.violations.length > 0) {
                  logAudit(sessionId, "ORCHESTRATOR_ENFORCEMENT", {
                    violations: enforcement.violations,
                    actions: enforcement.actions_taken,
                  });
                }

                const enforced = enforcement.sanitized_response !== accumulated;
                if (enforced) {
                  controller.enqueue(encoder.encode(
                    `data: ${JSON.stringify({ type: "replace", content: enforcement.sanitized_response })}\n\n`
                  ));
                }

                controller.enqueue(encoder.encode(
                  `data: ${JSON.stringify({ type: "done", tools_called: toolsCalled })}\n\n`
                ));
              }
            } catch {
              // unparseable line, skip
            }
          }
        }

        sessionStates.set(sessionId, state);
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ type: "error", content: err instanceof Error ? err.message : "Stream failed" })}\n\n`
        ));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

// ============================================
// SYSTEM PROMPT BUILDERS
// ============================================

const CRITICAL_RULES = `═══ CRITICAL RULES (NEVER BREAK THESE) ═══

1. Use EXACT herb names from DATABASE CONTEXT. Always include the Hindi/common name in parentheses — e.g. "**Ashwagandha (अश्वगंधा)**", "**Haridra (Haldi/हल्दी)**". NEVER use English translations like "Indian Ginseng" or "Winter Cherry".
2. You are an educational herb safety consultant. You MUST answer herb questions using the data provided. NEVER refuse to discuss herbs in the DATABASE CONTEXT. This is your PRIMARY function.
3. ONLY use facts from the DATABASE CONTEXT. Do NOT invent dosages, grades, or claims.
4. Every herb recommendation MUST include factual reasoning — WHY it helps, WHAT the evidence grade means, and the mechanism/active compounds if available.
5. Always include suggested dosage from the DATABASE CONTEXT with each herb.
6. If a herb is marked "Blocked: YES" or in the AVOID list, clearly say it is NOT SAFE and explain WHY. Do NOT give dosage for blocked/avoid herbs.
7. If a herb has cautions, list ALL cautions with reasoning before dosage.
8. When user asks general questions like "what should I avoid" or "what is safe", use the ASSESSMENT RESULTS to answer with specific herb names from their results.
9. HERB SCOPING: When the user asks about a specific herb, respond ONLY about THAT herb. Do NOT discuss other herbs unless directly relevant (e.g. interaction). Look for [HERB: name START] and [HERB: name END] markers in the context to find the correct herb data.`;

function getLanguageInstruction(lang: "en" | "hi"): string {
  if (lang === "hi") {
    return `\n═══ LANGUAGE: HINGLISH ═══
Respond in Hinglish — naturally mix Hindi and English. Use Devanagari for Hindi words.
Example style: "Ashwagandha (अश्वगंधा) stress ke liye bahut effective hai. Evidence grade B hai — iska matlab hai ki achhe human trials mein tested hai. Dosage: 300-600mg powder din mein do baar."
Keep medical/herb terms in English, conversational parts in Hindi. Be warm and relatable.`;
  }
  return `\n═══ LANGUAGE: ENGLISH ═══
Respond in clear, simple English. Keep it professional but warm.`;
}

function buildInitSystem(
  sessionId: string,
  profileBlock: string,
  assessmentContext: string,
  concernLabel: string,
  lang: "en" | "hi" = "en"
): string {
  return `${SYSTEM_PROMPT}

The current session_id is: ${sessionId}

--- DATABASE CONTEXT (verified, authoritative — use this, do NOT make up data) ---
${profileBlock}

${assessmentContext}
--- END DATABASE CONTEXT ---

${CRITICAL_RULES}

═══ INITIAL PRESENTATION INSTRUCTIONS ═══

Present the user's personalized results conversationally:

1. **Greet** — acknowledge their concern (${concernLabel}), 1 sentence
2. **Recommended herbs** — for each herb include:
   - Name with Hindi name: e.g. **Ashwagandha (अश्वगंधा)**
   - Evidence grade and what it means (e.g. "Grade B = good human trial evidence")
   - WHY it helps — the mechanism or reason from the data
   - Suggested dosage from the data
3. **Caution herbs** — if any, mention with the specific warning and WHY
4. **Avoid herbs** — if any, state which to avoid, WHY, and what interaction causes the risk
5. **Invite follow-up** — "Ask me about any herb — dosage, evidence, interactions, or alternatives."

Keep under 400 words. Use **bold** for herb names. Be warm, factual, and specific.
${getLanguageInstruction(lang)}`;
}

function buildFollowUpSystem(
  sessionId: string,
  cachedAssessment: string,
  contextBlock: string,
  lang: "en" | "hi" = "en"
): string {
  return `${SYSTEM_PROMPT}

The current session_id is: ${sessionId}

--- ASSESSMENT RESULTS (from the user's intake — always available) ---
${cachedAssessment || "No assessment cached for this session."}
--- END ASSESSMENT RESULTS ---

--- ADDITIONAL HERB CONTEXT (from real-time lookup for herbs mentioned in this message) ---
${contextBlock || "No additional herb lookup needed for this message."}
--- END ADDITIONAL CONTEXT ---

${CRITICAL_RULES}

RESPONSE GUIDELINES:
- Be conversational, warm, factual.
- Match response length to the question — short questions get short answers, detailed questions get detailed answers.
- End herb-specific responses with: "This is educational information — please discuss with your healthcare provider."
- If no herb was mentioned, use the ASSESSMENT RESULTS to answer contextually.
${getLanguageInstruction(lang)}`;
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
      assessment_result,
      stream: useStream = false,
      voice_mode: voiceMode = false,
      language: langPref = "en",
    } = body as {
      session_id: string;
      message: string;
      history: { role: "user" | "assistant"; content: string }[];
      assessment_result?: RiskAssessment;
      stream?: boolean;
      voice_mode?: boolean;
      language?: "en" | "hi";
    };

    if (!session_id || !message) {
      return NextResponse.json(
        { error: "session_id and message are required" },
        { status: 400 }
      );
    }

    // ─── Red flag pre-scan ───
    if (message !== "__INIT__") {
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

    // ─── Unknown herb pre-scan ───
    if (message !== "__INIT__") {
      const unknownHerbScan = scanForUnknownHerb(message);
      if (unknownHerbScan.detected) {
        await logAudit(session_id, "NO_HERB_ADVISED", {
          reason: "unknown_herb",
          herb_name: unknownHerbScan.herbName,
        });
        return NextResponse.json({ response: UNKNOWN_HERB_RESPONSE });
      }
    }

    state.turn_count++;

    // ─── INITIAL MESSAGE: present assessment results ───
    if (message === "__INIT__" && assessment_result) {
      const assessmentContext = buildAssessmentContext(assessment_result);
      sessionAssessments.set(session_id, assessmentContext);

      const profile = await getUserProfile(session_id);
      if (profile) {
        sessionProfiles.set(session_id, profile);
        state.profile_loaded = true;
        state.profile = profile;
      }

      const profileBlock = profile
        ? `USER PROFILE (from database):
- Age: ${profile.age}, Sex: ${profile.sex}
- Pregnancy status: ${profile.pregnancy_status}
- Chronic conditions: ${profile.chronic_conditions.length > 0 ? profile.chronic_conditions.join(", ") : "none reported"}
- Medications: ${profile.medications.length > 0 ? profile.medications.join(", ") : "none reported"}`
        : "";

      const initSystem = buildInitSystem(session_id, profileBlock, assessmentContext, assessment_result.concern_label, langPref);
      const initMessages: ChatMessage[] = [
        { role: "user", content: `Present my personalized herb recommendations for ${assessment_result.concern_label}.` },
      ];

      let numPredict = getResponseLength(message, assessment_result.recommended_herbs.length, true);
      if (voiceMode) numPredict = Math.min(numPredict, 256);

      if (useStream) {
        const sys = voiceMode ? initSystem + "\n\nVOICE MODE: Keep response under 100 words. Be conversational. No markdown formatting. Spell out abbreviations." : initSystem;
        return createStreamResponse(sys, initMessages, state, session_id, ["getUserProfile", "assessmentPresentation"], numPredict);
      }

      let responseText = await callOllama(initSystem, initMessages, numPredict);
      const enforcement = enforceResponse(responseText, state, ["getUserProfile"]);
      responseText = enforcement.sanitized_response;

      if (enforcement.violations.length > 0) {
        await logAudit(session_id, "ORCHESTRATOR_ENFORCEMENT", {
          violations: enforcement.violations,
          actions: enforcement.actions_taken,
        });
      }

      sessionStates.set(session_id, state);
      return NextResponse.json({
        response: responseText,
        escalation: false,
        tools_called: ["getUserProfile", "assessmentPresentation"],
      });
    }

    // ─── REGULAR MESSAGE: herb detection + safety pipeline ───
    const ctx = await gatherContext(session_id, message, state);
    const contextBlock = buildContextBlock(ctx);
    const cachedAssessment = sessionAssessments.get(session_id) || "";
    const enrichedSystem = buildFollowUpSystem(session_id, cachedAssessment, contextBlock, langPref);

    const ollamaMessages: ChatMessage[] = [];
    const recentHistory = history.slice(-10);
    for (const msg of recentHistory) {
      ollamaMessages.push({ role: msg.role as "user" | "assistant", content: msg.content });
    }
    ollamaMessages.push({ role: "user", content: message });

    const herbIds = detectHerbsInMessage(message);
    let numPredict = getResponseLength(message, herbIds.length, false);
    if (voiceMode) numPredict = Math.min(numPredict, 256);

    if (useStream) {
      const sys = voiceMode ? enrichedSystem + "\n\nVOICE MODE: Keep response under 100 words. Be conversational. No markdown formatting. Spell out abbreviations." : enrichedSystem;
      return createStreamResponse(sys, ollamaMessages, state, session_id, ctx.toolsCalled, numPredict);
    }

    let responseText = await callOllama(enrichedSystem, ollamaMessages, numPredict);
    const enforcement = enforceResponse(responseText, state, ctx.toolsCalled);
    responseText = enforcement.sanitized_response;

    if (enforcement.violations.length > 0) {
      await logAudit(session_id, "ORCHESTRATOR_ENFORCEMENT", {
        violations: enforcement.violations,
        actions: enforcement.actions_taken,
      });
    }

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
