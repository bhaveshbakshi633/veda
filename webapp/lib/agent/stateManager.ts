// ============================================
// CONVERSATION STATE MANAGER
// ============================================
// Database-backed state that replaces in-memory Map.
// All reads/writes go through this module.
//
// Anti-hallucination rules:
//   1. Only DETERMINISTIC tool results are stored (safety_checks_cache)
//   2. Only FACTS ACTUALLY SHOWN are tracked (herb_facts_cited)
//   3. LLM-generated text is NEVER stored in state
//   4. red_flag_escalated is TERMINAL (DB trigger prevents reversal)
//   5. State expires with intake_session (24h TTL)

import { getServiceClient } from "@/lib/supabase";

// ============================================
// TYPES
// ============================================

export interface ConversationStateRow {
  id: string;
  session_id: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  turn_count: number;
  profile_loaded: boolean;
  herbs_discussed: string[];
  herbs_recommended: string[];
  herbs_blocked: string[];
  recommendation_count: number;
  safety_checks_cache: Record<string, SafetyCheckCacheEntry>;
  herb_facts_cited: HerbFactCitation[];
  current_concern: ConcernData | null;
  red_flag_escalated: boolean;
  red_flag_triggers: string[];
  escalated_at: string | null;
  doctor_referral_given: boolean;
  lifestyle_advice_given: boolean;
  stacking_discouraged: boolean;
  orchestrator_violations: OrchestratorViolation[];
}

export interface SafetyCheckCacheEntry {
  herb_id: string;
  risk_code: "red" | "yellow" | "green";
  cautions: string[];
  interactions: string[];
  evidence_grade: string | null;
  checked_at: string;
}

export interface HerbFactCitation {
  herb_id: string;
  fact_type: "safety_check" | "dosage" | "evidence_claim" | "side_effect" | "interaction";
  fact_value: string;
  cited_at: string;
}

export interface ConcernData {
  symptom_primary: string | null;
  symptom_severity: string | null;
  symptom_duration: string | null;
  user_goal: string | null;
  established_at_turn: number;
}

export interface OrchestratorViolation {
  turn: number;
  violations: string[];
  actions_taken: string[];
  timestamp: string;
}

// ============================================
// LOAD STATE (create if not exists)
// ============================================

export async function loadOrCreateState(sessionId: string): Promise<ConversationStateRow> {
  const db = getServiceClient();

  // Try to load existing
  const { data, error } = await db
    .from("conversation_state")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (data && !error) {
    return data as ConversationStateRow;
  }

  // Create new
  const { data: created, error: createError } = await db
    .from("conversation_state")
    .insert({ session_id: sessionId })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to create conversation state: ${createError.message}`);
  }

  return created as ConversationStateRow;
}

// ============================================
// UPDATE STATE (partial update)
// ============================================

export interface StateUpdate {
  turn_count?: number;
  profile_loaded?: boolean;
  herbs_discussed?: string[];
  herbs_recommended?: string[];
  herbs_blocked?: string[];
  recommendation_count?: number;
  safety_checks_cache?: Record<string, SafetyCheckCacheEntry>;
  herb_facts_cited?: HerbFactCitation[];
  current_concern?: ConcernData | null;
  red_flag_escalated?: boolean;
  red_flag_triggers?: string[];
  escalated_at?: string | null;
  doctor_referral_given?: boolean;
  lifestyle_advice_given?: boolean;
  stacking_discouraged?: boolean;
  orchestrator_violations?: OrchestratorViolation[];
}

export async function updateState(
  sessionId: string,
  updates: StateUpdate
): Promise<ConversationStateRow> {
  const db = getServiceClient();

  const { data, error } = await db
    .from("conversation_state")
    .update(updates)
    .eq("session_id", sessionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update conversation state: ${error.message}`);
  }

  return data as ConversationStateRow;
}

// ============================================
// ESCALATE (terminal — DB trigger prevents reversal)
// ============================================

export async function escalateRedFlag(
  sessionId: string,
  triggers: string[]
): Promise<void> {
  const db = getServiceClient();

  await db
    .from("conversation_state")
    .update({
      red_flag_escalated: true,
      red_flag_triggers: triggers,
      escalated_at: new Date().toISOString(),
    })
    .eq("session_id", sessionId);
}

// ============================================
// RECORD SAFETY CHECK (deterministic cache)
// ============================================

export async function cacheSafetyCheck(
  sessionId: string,
  herbId: string,
  entry: SafetyCheckCacheEntry
): Promise<void> {
  const state = await loadOrCreateState(sessionId);
  const cache = { ...state.safety_checks_cache, [herbId]: entry };

  const herbs_discussed = [...new Set([...state.herbs_discussed, herbId])];
  const herbs_blocked = entry.risk_code === "red"
    ? [...new Set([...state.herbs_blocked, herbId])]
    : state.herbs_blocked;

  await updateState(sessionId, {
    safety_checks_cache: cache,
    herbs_discussed,
    herbs_blocked,
  });
}

// ============================================
// RECORD FACT CITATION (anti-hallucination)
// ============================================

export async function recordFactCitation(
  sessionId: string,
  citation: Omit<HerbFactCitation, "cited_at">
): Promise<void> {
  const state = await loadOrCreateState(sessionId);
  const updated = [
    ...state.herb_facts_cited,
    { ...citation, cited_at: new Date().toISOString() },
  ];

  await updateState(sessionId, { herb_facts_cited: updated });
}

// ============================================
// RECORD ORCHESTRATOR VIOLATION
// ============================================

export async function recordViolation(
  sessionId: string,
  turn: number,
  violations: string[],
  actions_taken: string[]
): Promise<void> {
  const state = await loadOrCreateState(sessionId);
  const updated = [
    ...state.orchestrator_violations,
    { turn, violations, actions_taken, timestamp: new Date().toISOString() },
  ];

  await updateState(sessionId, { orchestrator_violations: updated });
}

// ============================================
// CHECK IF ESCALATED (fast path)
// ============================================

export async function isEscalated(sessionId: string): Promise<boolean> {
  const db = getServiceClient();
  const { data } = await db
    .from("conversation_state")
    .select("red_flag_escalated")
    .eq("session_id", sessionId)
    .single();

  return data?.red_flag_escalated ?? false;
}

// ============================================
// PERSIST VS EXPIRE RULES
// ============================================
//
// PERSIST (stored in DB, survives restart):
//   - turn_count
//   - profile_loaded
//   - herbs_discussed, herbs_recommended, herbs_blocked
//   - recommendation_count
//   - safety_checks_cache (deterministic tool results)
//   - herb_facts_cited (anti-hallucination audit)
//   - red_flag_escalated (TERMINAL, IMMUTABLE)
//   - doctor_referral_given, lifestyle_advice_given
//   - orchestrator_violations
//
// EXPIRE (auto-deleted after 24h via expires_at):
//   - Entire row deleted when intake_session expires
//   - cleanup_expired_states() function available for cron
//
// NEVER STORED:
//   - LLM-generated text (responses, reasoning)
//   - Raw user messages (only structured extractions)
//   - Conversation history (kept client-side only)
//   - Model name or inference metadata
//
// WHY:
//   - If it's not in safety_checks_cache, the LLM cannot claim it was checked
//   - If it's not in herb_facts_cited, the LLM cannot claim it was discussed
//   - If red_flag_escalated is true, DB trigger prevents reversal
//   - 24h TTL ensures no long-term health data retention
