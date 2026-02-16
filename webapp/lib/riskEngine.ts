// ============================================
// AYURV RISK ENGINE — DETERMINISTIC PIPELINE
// ============================================
// Pipeline: Validate → Red Flags → Block → Caution Score → Evidence Rank → Output
// No AI reasoning. Pure deterministic logic.

import { getServiceClient } from "@/lib/supabase";
import { intakeSchema, deriveAgeGroup } from "@/lib/validation/intakeSchema";
import type {
  IntakeData,
  RiskAssessment,
  BlockedHerb,
  CautionHerb,
  CautionEntry,
  SafeHerb,
  AuditEntry,
  HerbRow,
  HerbConditionRiskRow,
  HerbMedicationInteractionRow,
  EvidenceClaimRow,
  EvidenceGrade,
  InteractionSeverity,
  AgeGroup,
} from "@/lib/types";

// ============================================
// INTAKE → DB ID MAPPING
// ============================================

const AUTOIMMUNE_CONDITIONS = [
  "autoimmune_lupus",
  "autoimmune_ra",
  "autoimmune_ms",
  "autoimmune_hashimotos",
  "autoimmune_graves",
  "autoimmune_other",
];

const CONDITION_OVERRIDES: Record<string, string> = {
  scheduled_surgery_within_4_weeks: "cond_scheduled_surgery",
};

const MEDICATION_OVERRIDES: Record<string, string> = {
  antihypertensive_ace_arb: "med_ace_arb",
  antihypertensive_beta_blocker: "med_beta_blocker",
  antihypertensive_ccb: "med_ccb",
  antihypertensive_diuretic_loop: "med_diuretic_loop",
  antihypertensive_diuretic_thiazide: "med_diuretic_thiazide",
  thyroid_levothyroxine: "med_levothyroxine",
  antithyroid_medication: "med_antithyroid",
  diuretic_potassium_sparing: "med_diuretic_potassium_sparing",
};

function mapConditionsToDbIds(
  conditions: string[],
  pregnancyStatus: string
): string[] {
  const ids: string[] = [];

  for (const cond of conditions) {
    if (cond === "none" || cond === "other") continue;

    if (AUTOIMMUNE_CONDITIONS.includes(cond)) {
      ids.push("cond_autoimmune");
      continue;
    }

    if (CONDITION_OVERRIDES[cond]) {
      ids.push(CONDITION_OVERRIDES[cond]);
      continue;
    }

    ids.push(`cond_${cond}`);
  }

  // Derive reproductive conditions from pregnancy status
  if (pregnancyStatus.startsWith("pregnant_")) {
    ids.push("cond_pregnancy");
  } else if (pregnancyStatus === "lactating") {
    ids.push("cond_lactation");
  } else if (pregnancyStatus === "trying_to_conceive") {
    ids.push("cond_trying_to_conceive");
  }

  return [...new Set(ids)];
}

function mapMedicationsToDbIds(medications: string[]): string[] {
  const ids: string[] = [];

  for (const med of medications) {
    if (med === "none" || med === "other") continue;

    if (MEDICATION_OVERRIDES[med]) {
      ids.push(MEDICATION_OVERRIDES[med]);
    } else {
      ids.push(`med_${med}`);
    }
  }

  return ids;
}

// ============================================
// SCORING CONSTANTS
// ============================================

const INTERACTION_SEVERITY_SCORE: Record<InteractionSeverity, number> = {
  low: 3,
  low_moderate: 5,
  moderate: 8,
  moderate_high: 12,
  high: 15,
  critical: 999, // blocked, not scored
};

const EVIDENCE_GRADE_RANK: Record<string, number> = {
  A: 6,
  B: 5,
  "B-C": 4,
  C: 3,
  "C-D": 2,
  D: 1,
};

const DISCLAIMER =
  "This is educational information only. Not a prescription. Not medical advice. Consult a qualified healthcare professional before acting on any information.";

// ============================================
// STEP 1: VALIDATE INTAKE
// ============================================

export function validateIntake(
  raw: unknown
): { success: true; data: IntakeData } | { success: false; error: string } {
  const parsed = intakeSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    };
  }

  const d = parsed.data;
  const sessionId = crypto.randomUUID();

  const intake: IntakeData = {
    session_id: sessionId,
    timestamp: new Date().toISOString(),
    disclaimer_accepted: true,
    age: d.age,
    age_group: deriveAgeGroup(d.age) as AgeGroup,
    sex: d.sex,
    pregnancy_status: d.pregnancy_status,
    chronic_conditions: d.chronic_conditions,
    medications: d.medications,
    current_herbs: d.current_herbs,
    symptom_primary: d.symptom_primary,
    symptom_duration: d.symptom_duration,
    symptom_severity: d.symptom_severity,
    user_goal: d.user_goal,
    red_flag_screen: d.red_flag_screen,
  };

  return { success: true, data: intake };
}

// ============================================
// STEP 2: CHECK RED FLAGS
// ============================================

const RED_FLAG_MESSAGES: Record<string, string> = {
  chest_pain:
    "Chest pain requires immediate medical evaluation. Call emergency services.",
  blood_in_stool_vomit:
    "Blood in stool or vomit requires immediate medical evaluation.",
  high_fever_over_103:
    "High fever (>103°F / 39.4°C) requires urgent medical attention.",
  sudden_weakness_paralysis:
    "Sudden weakness or paralysis may indicate stroke. Call emergency services immediately.",
  suicidal_thoughts:
    "Please contact a crisis helpline immediately. India: iCall 9152987821, Vandrevala Foundation 1860-2662-345, AASRA 9820466726.",
  difficulty_breathing:
    "Breathing difficulty requires immediate medical evaluation. Call emergency services.",
  severe_allergic_reaction:
    "Severe allergic reaction (anaphylaxis) requires immediate emergency care. Call emergency services.",
  yellowing_skin_eyes:
    "Jaundice (yellowing of skin/eyes) requires urgent liver function evaluation.",
};

export function checkRedFlags(intake: IntakeData): {
  triggered: boolean;
  flags: string[];
  messages: string[];
  auditEntries: AuditEntry[];
} {
  const flags: string[] = [];
  const messages: string[] = [];
  const auditEntries: AuditEntry[] = [];

  for (const [key, value] of Object.entries(intake.red_flag_screen)) {
    if (value) {
      flags.push(key);
      messages.push(RED_FLAG_MESSAGES[key] || `Red flag triggered: ${key}`);
      auditEntries.push({
        event_type: "RED_FLAG_TRIGGERED",
        event_data: { flag: key, message: RED_FLAG_MESSAGES[key] },
        trigger_type: "red_flag",
        trigger_value: key,
        risk_code: "red",
      });
    }
  }

  return { triggered: flags.length > 0, flags, messages, auditEntries };
}

// ============================================
// STEP 3: FILTER BLOCKED HERBS (RED)
// ============================================

export function filterBlockedHerbs(
  herbs: HerbRow[],
  conditionRisks: HerbConditionRiskRow[],
  medicationInteractions: HerbMedicationInteractionRow[],
  userConditionIds: string[],
  userMedicationIds: string[]
): {
  blocked: BlockedHerb[];
  remaining: HerbRow[];
  auditEntries: AuditEntry[];
} {
  const blocked: BlockedHerb[] = [];
  const remaining: HerbRow[] = [];
  const auditEntries: AuditEntry[] = [];
  const blockedHerbIds = new Set<string>();

  for (const herb of herbs) {
    const blockReasons: { reason: string; trigger: string; trigger_type: "condition" | "medication" | "pregnancy" }[] = [];

    // Check RED condition risks
    const redCondRisks = conditionRisks.filter(
      (r) =>
        r.herb_id === herb.id &&
        userConditionIds.includes(r.condition_id) &&
        r.risk_code === "red"
    );

    for (const risk of redCondRisks) {
      const triggerType: "condition" | "pregnancy" =
        risk.condition_id === "cond_pregnancy" ||
        risk.condition_id === "cond_lactation" ||
        risk.condition_id === "cond_trying_to_conceive"
          ? "pregnancy"
          : "condition";

      blockReasons.push({
        reason: risk.explanation,
        trigger: risk.condition_id,
        trigger_type: triggerType,
      });

      auditEntries.push({
        event_type: "HERB_BLOCKED_CONDITION",
        event_data: {
          herb_id: herb.id,
          herb_name: herb.names.english,
          condition_id: risk.condition_id,
          risk_label: risk.risk_label,
          explanation: risk.explanation,
        },
        herb_id: herb.id,
        risk_code: "red",
        trigger_type: triggerType,
        trigger_value: risk.condition_id,
      });
    }

    // Check CRITICAL medication interactions
    const criticalMedInteractions = medicationInteractions.filter(
      (i) =>
        i.herb_id === herb.id &&
        userMedicationIds.includes(i.medication_id) &&
        i.severity === "critical"
    );

    for (const interaction of criticalMedInteractions) {
      blockReasons.push({
        reason: `Critical drug interaction: ${interaction.mechanism}`,
        trigger: interaction.medication_id,
        trigger_type: "medication",
      });

      auditEntries.push({
        event_type: "HERB_BLOCKED_INTERACTION",
        event_data: {
          herb_id: herb.id,
          herb_name: herb.names.english,
          medication_id: interaction.medication_id,
          severity: interaction.severity,
          mechanism: interaction.mechanism,
          clinical_action: interaction.clinical_action,
        },
        herb_id: herb.id,
        risk_code: "red",
        trigger_type: "medication",
        trigger_value: interaction.medication_id,
      });
    }

    if (blockReasons.length > 0) {
      // Use the first (most relevant) block reason for the primary entry
      blocked.push({
        herb_id: herb.id,
        herb_name: herb.names.english,
        reason: blockReasons.map((r) => r.reason).join(" | "),
        trigger: blockReasons[0].trigger,
        trigger_type: blockReasons[0].trigger_type,
        risk_code: "red",
      });
      blockedHerbIds.add(herb.id);
    } else {
      remaining.push(herb);
    }
  }

  return { blocked, remaining, auditEntries };
}

// ============================================
// STEP 4: CALCULATE CAUTION SCORE (YELLOW)
// ============================================

export function calculateCautionScore(
  herbs: HerbRow[],
  conditionRisks: HerbConditionRiskRow[],
  medicationInteractions: HerbMedicationInteractionRow[],
  userConditionIds: string[],
  userMedicationIds: string[]
): {
  cautionHerbs: CautionHerb[];
  safeHerbIds: string[];
  auditEntries: AuditEntry[];
} {
  const cautionHerbs: CautionHerb[] = [];
  const safeHerbIds: string[] = [];
  const auditEntries: AuditEntry[] = [];

  for (const herb of herbs) {
    const cautions: CautionEntry[] = [];
    let score = 0;

    // Yellow condition risks
    const yellowRisks = conditionRisks.filter(
      (r) =>
        r.herb_id === herb.id &&
        userConditionIds.includes(r.condition_id) &&
        r.risk_code === "yellow"
    );

    for (const risk of yellowRisks) {
      score += 10;
      cautions.push({
        type: "condition",
        trigger: risk.condition_id,
        risk_code: "yellow",
        explanation: risk.explanation,
      });
    }

    // Non-critical medication interactions (all severities except critical — those are blocked)
    const medInteractions = medicationInteractions.filter(
      (i) =>
        i.herb_id === herb.id &&
        userMedicationIds.includes(i.medication_id) &&
        i.severity !== "critical"
    );

    for (const interaction of medInteractions) {
      score += INTERACTION_SEVERITY_SCORE[interaction.severity];
      cautions.push({
        type: "medication_interaction",
        trigger: interaction.medication_id,
        severity: interaction.severity,
        explanation: interaction.mechanism,
        clinical_action: interaction.clinical_action,
      });
    }

    if (cautions.length > 0) {
      cautionHerbs.push({
        herb_id: herb.id,
        herb_name: herb.names.english,
        evidence_grade: null, // Set in rankByEvidence
        caution_score: score,
        cautions,
        dosage: herb.dosage_ranges,
      });
      auditEntries.push({
        event_type: "HERB_CAUTION",
        event_data: {
          herb_id: herb.id,
          herb_name: herb.names.english,
          caution_score: score,
          caution_count: cautions.length,
        },
        herb_id: herb.id,
        risk_code: "yellow",
      });
    } else {
      safeHerbIds.push(herb.id);
    }
  }

  // Sort: lowest caution score first (safest-within-caution first)
  cautionHerbs.sort((a, b) => a.caution_score - b.caution_score);

  return { cautionHerbs, safeHerbIds, auditEntries };
}

// ============================================
// STEP 5: RANK BY EVIDENCE
// ============================================

function getBestEvidenceGrade(
  herbId: string,
  evidenceClaims: EvidenceClaimRow[],
  symptomPrimary: string
): EvidenceGrade | null {
  const matching = evidenceClaims.filter(
    (c) => c.herb_id === herbId && c.symptom_tags.includes(symptomPrimary)
  );

  if (matching.length === 0) return null;

  // Return highest grade
  matching.sort(
    (a, b) =>
      (EVIDENCE_GRADE_RANK[b.evidence_grade] ?? 0) -
      (EVIDENCE_GRADE_RANK[a.evidence_grade] ?? 0)
  );

  return matching[0].evidence_grade;
}

export function rankByEvidence(
  allHerbs: HerbRow[],
  safeHerbIds: string[],
  cautionHerbs: CautionHerb[],
  evidenceClaims: EvidenceClaimRow[],
  symptomPrimary: string
): {
  safeHerbs: SafeHerb[];
  rankedCautionHerbs: CautionHerb[];
  auditEntries: AuditEntry[];
} {
  const auditEntries: AuditEntry[] = [];

  // Build safe herbs list ranked by evidence
  const safeHerbs: SafeHerb[] = safeHerbIds
    .map((id) => {
      const herb = allHerbs.find((h) => h.id === id)!;
      const grade = getBestEvidenceGrade(id, evidenceClaims, symptomPrimary);
      return {
        herb_id: id,
        herb_name: herb.names.english,
        evidence_grade: grade,
        dosage: herb.dosage_ranges,
      };
    })
    .sort((a, b) => {
      const gradeA = a.evidence_grade
        ? (EVIDENCE_GRADE_RANK[a.evidence_grade] ?? 0)
        : 0;
      const gradeB = b.evidence_grade
        ? (EVIDENCE_GRADE_RANK[b.evidence_grade] ?? 0)
        : 0;
      return gradeB - gradeA; // Best evidence first
    });

  // Enrich caution herbs with evidence grade
  const rankedCautionHerbs = cautionHerbs.map((ch) => ({
    ...ch,
    evidence_grade: getBestEvidenceGrade(
      ch.herb_id,
      evidenceClaims,
      symptomPrimary
    ),
  }));

  auditEntries.push({
    event_type: "EVIDENCE_RANKING",
    event_data: {
      symptom_primary: symptomPrimary,
      safe_count: safeHerbs.length,
      safe_with_evidence: safeHerbs.filter((h) => h.evidence_grade !== null)
        .length,
      caution_count: rankedCautionHerbs.length,
      caution_with_evidence: rankedCautionHerbs.filter(
        (h) => h.evidence_grade !== null
      ).length,
    },
  });

  return { safeHerbs, rankedCautionHerbs, auditEntries };
}

// ============================================
// STEP 6: GENERATE OUTPUT
// ============================================

export function generateOutput(
  intake: IntakeData,
  blocked: BlockedHerb[],
  cautionHerbs: CautionHerb[],
  safeHerbs: SafeHerb[],
  allAuditEntries: AuditEntry[]
): RiskAssessment {
  // Doctor referral suggested if:
  // - Any herbs are blocked
  // - Any caution herb has a high combined score (>=15)
  // - User reports severe symptoms
  // - Chronic/long-duration symptoms
  const doctorSuggested =
    blocked.length > 0 ||
    cautionHerbs.some((h) => h.caution_score >= 15) ||
    intake.symptom_severity === "severe" ||
    ["chronic_ongoing", "over_6_months"].includes(intake.symptom_duration);

  return {
    status: "COMPLETE",
    session_id: intake.session_id,
    disclaimer: DISCLAIMER,
    blocked_herbs: blocked,
    caution_herbs: cautionHerbs,
    safe_herbs: safeHerbs,
    doctor_referral_suggested: doctorSuggested,
    audit_trail: allAuditEntries,
  };
}

// ============================================
// MAIN ENTRY POINT
// ============================================

export async function runAssessment(
  rawInput: unknown
): Promise<RiskAssessment> {
  // Step 1: Validate
  const validation = validateIntake(rawInput);
  if (!validation.success) {
    return {
      status: "ERROR",
      session_id: "",
      disclaimer: DISCLAIMER,
      blocked_herbs: [],
      caution_herbs: [],
      safe_herbs: [],
      doctor_referral_suggested: false,
      audit_trail: [
        {
          event_type: "VALIDATION_ERROR",
          event_data: { error: validation.error },
        },
      ],
    };
  }

  const intake = validation.data;
  const allAudit: AuditEntry[] = [
    {
      event_type: "ASSESSMENT_STARTED",
      event_data: {
        session_id: intake.session_id,
        age_group: intake.age_group,
        sex: intake.sex,
        pregnancy_status: intake.pregnancy_status,
        conditions_count: intake.chronic_conditions.filter((c) => c !== "none")
          .length,
        medications_count: intake.medications.filter((m) => m !== "none").length,
        symptom_primary: intake.symptom_primary,
        symptom_severity: intake.symptom_severity,
      },
    },
  ];

  // Step 2: Red flags
  const redFlagResult = checkRedFlags(intake);
  allAudit.push(...redFlagResult.auditEntries);

  if (redFlagResult.triggered) {
    allAudit.push({
      event_type: "EMERGENCY_ESCALATION",
      event_data: {
        flags: redFlagResult.flags,
        message_count: redFlagResult.messages.length,
      },
    });

    return {
      status: "EMERGENCY_ESCALATION",
      session_id: intake.session_id,
      disclaimer: DISCLAIMER,
      emergency_message: redFlagResult.messages.join(" "),
      red_flags_triggered: redFlagResult.flags,
      blocked_herbs: [],
      caution_herbs: [],
      safe_herbs: [],
      doctor_referral_suggested: true,
      audit_trail: allAudit,
    };
  }

  // Map intake values to DB IDs
  const conditionIds = mapConditionsToDbIds(
    intake.chronic_conditions,
    intake.pregnancy_status
  );
  const medicationIds = mapMedicationsToDbIds(intake.medications);

  allAudit.push({
    event_type: "ID_MAPPING_COMPLETE",
    event_data: {
      condition_ids: conditionIds,
      medication_ids: medicationIds,
    },
  });

  // Query database (parallel)
  const db = getServiceClient();

  const [herbsRes, condRisksRes, medInteractionsRes, evidenceRes] =
    await Promise.all([
      db.from("herbs").select("*"),
      conditionIds.length > 0
        ? db
            .from("herb_condition_risks")
            .select("*")
            .in("condition_id", conditionIds)
        : Promise.resolve({ data: [] as HerbConditionRiskRow[], error: null }),
      medicationIds.length > 0
        ? db
            .from("herb_medication_interactions")
            .select("*")
            .in("medication_id", medicationIds)
        : Promise.resolve({
            data: [] as HerbMedicationInteractionRow[],
            error: null,
          }),
      db.from("evidence_claims").select("*"),
    ]);

  if (herbsRes.error)
    throw new Error(`DB error (herbs): ${herbsRes.error.message}`);
  if (condRisksRes.error)
    throw new Error(
      `DB error (condition_risks): ${condRisksRes.error.message}`
    );
  if (medInteractionsRes.error)
    throw new Error(
      `DB error (medication_interactions): ${medInteractionsRes.error.message}`
    );
  if (evidenceRes.error)
    throw new Error(`DB error (evidence): ${evidenceRes.error.message}`);

  const herbs = herbsRes.data as HerbRow[];
  const condRisks = (condRisksRes.data ?? []) as HerbConditionRiskRow[];
  const medInteractions = (medInteractionsRes.data ??
    []) as HerbMedicationInteractionRow[];
  const evidence = (evidenceRes.data ?? []) as EvidenceClaimRow[];

  allAudit.push({
    event_type: "DB_QUERY_COMPLETE",
    event_data: {
      herbs_count: herbs.length,
      condition_risks_count: condRisks.length,
      medication_interactions_count: medInteractions.length,
      evidence_claims_count: evidence.length,
    },
  });

  // Step 3: Filter blocked herbs
  const blockResult = filterBlockedHerbs(
    herbs,
    condRisks,
    medInteractions,
    conditionIds,
    medicationIds
  );
  allAudit.push(...blockResult.auditEntries);

  // Step 4: Calculate caution scores on remaining herbs
  const cautionResult = calculateCautionScore(
    blockResult.remaining,
    condRisks,
    medInteractions,
    conditionIds,
    medicationIds
  );
  allAudit.push(...cautionResult.auditEntries);

  // Step 5: Rank by evidence
  const evidenceResult = rankByEvidence(
    herbs,
    cautionResult.safeHerbIds,
    cautionResult.cautionHerbs,
    evidence,
    intake.symptom_primary
  );
  allAudit.push(...evidenceResult.auditEntries);

  // Step 6: Generate output
  const result = generateOutput(
    intake,
    blockResult.blocked,
    evidenceResult.rankedCautionHerbs,
    evidenceResult.safeHerbs,
    allAudit
  );

  allAudit.push({
    event_type: "ASSESSMENT_COMPLETE",
    event_data: {
      blocked_count: result.blocked_herbs.length,
      caution_count: result.caution_herbs.length,
      safe_count: result.safe_herbs.length,
      doctor_referral: result.doctor_referral_suggested,
    },
  });

  return result;
}
