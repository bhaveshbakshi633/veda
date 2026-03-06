// ============================================
// AYURV AGENT — TOOL HANDLERS
// ============================================
// These execute against the live Supabase database.
// Called by the chat API route when Claude invokes tools.

import { getServiceClient } from "@/lib/supabase";
import type {
  HerbRow,
  HerbConditionRiskRow,
  HerbMedicationInteractionRow,
  EvidenceClaimRow,
} from "@/lib/types";

// ============================================
// MAPPING — shared single source of truth
// ============================================

import { mapConditionToDbId, mapMedicationToDbId } from "@/lib/mappings";

// ============================================
// TOOL: getUserProfile
// ============================================

export interface UserProfile {
  age: number;
  age_group: string;
  sex: string;
  pregnancy_status: string;
  chronic_conditions: string[];
  medications: string[];
  current_herbs: string[];
  condition_db_ids: string[];
  medication_db_ids: string[];
}

export async function getUserProfile(sessionId: string): Promise<UserProfile | null> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("intake_sessions")
    .select("intake_data")
    .eq("id", sessionId)
    .single();

  if (error || !data) return null;

  const intake = data.intake_data as Record<string, unknown>;

  const conditions = (intake.chronic_conditions as string[]) || [];
  const medications = (intake.medications as string[]) || [];
  const pregnancyStatus = (intake.pregnancy_status as string) || "not_applicable";

  // Map to DB IDs
  const conditionDbIds = conditions
    .map(mapConditionToDbId)
    .filter((id): id is string => id !== null);

  // Add pregnancy-derived conditions
  if (pregnancyStatus.startsWith("pregnant_")) conditionDbIds.push("cond_pregnancy");
  else if (pregnancyStatus === "lactating") conditionDbIds.push("cond_lactation");
  else if (pregnancyStatus === "trying_to_conceive") conditionDbIds.push("cond_trying_to_conceive");

  const medicationDbIds = medications
    .map(mapMedicationToDbId)
    .filter((id): id is string => id !== null);

  return {
    age: (intake.age as number) || 0,
    age_group: (intake.age_group as string) || "adult_18_45",
    sex: (intake.sex as string) || "other",
    pregnancy_status: pregnancyStatus,
    chronic_conditions: conditions.filter((c) => c !== "none"),
    medications: medications.filter((m) => m !== "none"),
    current_herbs: (intake.current_herbs as string[]) || [],
    condition_db_ids: [...new Set(conditionDbIds)],
    medication_db_ids: medicationDbIds,
  };
}

// ============================================
// TOOL: runSafetyCheck
// ============================================

export interface SafetyCheckResult {
  herb_id: string;
  herb_name: string;
  overall_risk: "red" | "yellow" | "green";
  blocked: boolean;
  block_reasons: string[];
  cautions: {
    type: "condition" | "medication_interaction";
    trigger: string;
    severity?: string;
    explanation: string;
    clinical_action?: string;
  }[];
  evidence_grade: string | null;
  evidence_summary: string | null;
}

export async function runSafetyCheck(
  herbId: string,
  profile: UserProfile,
  concern?: string
): Promise<SafetyCheckResult> {
  const db = getServiceClient();

  // Parallel queries
  const [herbRes, condRisksRes, medIntRes, evidenceRes] = await Promise.all([
    db.from("herbs").select("*").eq("id", herbId).single(),
    profile.condition_db_ids.length > 0
      ? db.from("herb_condition_risks").select("*")
          .eq("herb_id", herbId)
          .in("condition_id", profile.condition_db_ids)
      : Promise.resolve({ data: [], error: null }),
    profile.medication_db_ids.length > 0
      ? db.from("herb_medication_interactions").select("*")
          .eq("herb_id", herbId)
          .in("medication_id", profile.medication_db_ids)
      : Promise.resolve({ data: [], error: null }),
    concern
      ? db.from("evidence_claims").select("*")
          .eq("herb_id", herbId)
          .contains("symptom_tags", [concern])
      : Promise.resolve({ data: [], error: null }),
  ]);

  const herb = herbRes.data as HerbRow | null;
  if (!herb) throw new Error(`Herb not found: ${herbId}`);

  const condRisks = (condRisksRes.data || []) as HerbConditionRiskRow[];
  const medInteractions = (medIntRes.data || []) as HerbMedicationInteractionRow[];
  const evidenceClaims = (evidenceRes.data || []) as EvidenceClaimRow[];

  // Determine blocking
  const redConditions = condRisks.filter((r) => r.risk_code === "red");
  const criticalInteractions = medInteractions.filter((i) => i.severity === "critical");
  const blocked = redConditions.length > 0 || criticalInteractions.length > 0;

  const blockReasons: string[] = [
    ...redConditions.map((r) => r.explanation),
    ...criticalInteractions.map((i) => `Critical interaction: ${i.mechanism}`),
  ];

  // Cautions (yellow conditions + non-critical interactions)
  const cautions: SafetyCheckResult["cautions"] = [];

  for (const risk of condRisks.filter((r) => r.risk_code === "yellow")) {
    cautions.push({
      type: "condition",
      trigger: risk.condition_id,
      explanation: risk.explanation,
    });
  }

  for (const interaction of medInteractions.filter((i) => i.severity !== "critical")) {
    cautions.push({
      type: "medication_interaction",
      trigger: interaction.medication_id,
      severity: interaction.severity,
      explanation: interaction.mechanism,
      clinical_action: interaction.clinical_action,
    });
  }

  // Evidence
  let evidenceGrade: string | null = null;
  let evidenceSummary: string | null = null;
  if (evidenceClaims.length > 0) {
    const gradeRank: Record<string, number> = { A: 6, B: 5, "B-C": 4, C: 3, "C-D": 2, D: 1 };
    evidenceClaims.sort((a, b) => (gradeRank[b.evidence_grade] ?? 0) - (gradeRank[a.evidence_grade] ?? 0));
    evidenceGrade = evidenceClaims[0].evidence_grade;
    evidenceSummary = evidenceClaims[0].summary;
  }

  // Overall risk
  let overallRisk: "red" | "yellow" | "green" = "green";
  if (blocked) overallRisk = "red";
  else if (cautions.length > 0) overallRisk = "yellow";

  return {
    herb_id: herbId,
    herb_name: herb.names.english,
    overall_risk: overallRisk,
    blocked,
    block_reasons: blockReasons,
    cautions,
    evidence_grade: evidenceGrade,
    evidence_summary: evidenceSummary,
  };
}

// ============================================
// TOOL: getHerbData
// ============================================

export interface HerbData {
  id: string;
  botanical_name: string;
  names: HerbRow["names"];
  parts_used: string[];
  ayurvedic_profile: HerbRow["ayurvedic_profile"];
  dosage_ranges: HerbRow["dosage_ranges"];
  side_effects: HerbRow["side_effects"];
  misuse_patterns: HerbRow["misuse_patterns"];
  red_flags: HerbRow["red_flags"];
}

export async function getHerbData(herbId: string): Promise<HerbData | null> {
  const db = getServiceClient();
  const { data, error } = await db
    .from("herbs")
    .select("*")
    .eq("id", herbId)
    .single();

  if (error || !data) return null;

  const herb = data as HerbRow;
  return {
    id: herb.id,
    botanical_name: herb.botanical_name,
    names: herb.names,
    parts_used: herb.parts_used,
    ayurvedic_profile: herb.ayurvedic_profile,
    dosage_ranges: herb.dosage_ranges,
    side_effects: herb.side_effects,
    misuse_patterns: herb.misuse_patterns,
    red_flags: herb.red_flags,
  };
}

// ============================================
// TOOL: getEvidenceClaims
// ============================================

export interface EvidenceClaimResult {
  claim: string;
  evidence_grade: string;
  summary: string;
  mechanism: string | null;
  active_compounds: string[] | null;
}

export async function getEvidenceClaims(
  herbId: string,
  symptomTag?: string
): Promise<EvidenceClaimResult[]> {
  const db = getServiceClient();

  let query = db.from("evidence_claims").select("*").eq("herb_id", herbId);
  if (symptomTag) {
    query = query.contains("symptom_tags", [symptomTag]);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as EvidenceClaimRow[]).map((c) => ({
    claim: c.claim,
    evidence_grade: c.evidence_grade,
    summary: c.summary,
    mechanism: c.mechanism,
    active_compounds: c.active_compounds,
  }));
}

// ============================================
// TOOL: logAudit
// ============================================

export async function logAudit(
  sessionId: string,
  eventType: string,
  eventData: Record<string, unknown>
): Promise<void> {
  const db = getServiceClient();
  await db.from("audit_log").insert({
    session_id: sessionId,
    event_type: eventType,
    event_data: eventData,
    herb_id: (eventData.herb_id as string) || null,
    risk_code: (eventData.risk_code as string) || null,
    trigger_type: (eventData.trigger_type as string) || null,
    trigger_value: (eventData.trigger_value as string) || null,
  });
}

// ============================================
// HERB ID RESOLVER (name → id)
// ============================================

const HERB_NAME_TO_ID: Record<string, string> = {
  ashwagandha: "herb_ashwagandha",
  triphala: "herb_triphala",
  tulsi: "herb_tulsi",
  "holy basil": "herb_tulsi",
  brahmi: "herb_brahmi",
  bacopa: "herb_brahmi",
  shatavari: "herb_shatavari",
  guduchi: "herb_guduchi",
  giloy: "herb_guduchi",
  haridra: "herb_haridra",
  haldi: "herb_haridra",
  turmeric: "herb_haridra",
  arjuna: "herb_arjuna",
  amalaki: "herb_amalaki",
  amla: "herb_amalaki",
  yashtimadhu: "herb_yashtimadhu",
  mulethi: "herb_yashtimadhu",
  licorice: "herb_yashtimadhu",
  liquorice: "herb_yashtimadhu",
};

export function resolveHerbId(name: string): string | null {
  const lower = name.toLowerCase().trim();
  return HERB_NAME_TO_ID[lower] || null;
}
