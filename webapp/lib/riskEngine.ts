// ============================================
// AYURV RECOMMENDATION ENGINE — DETERMINISTIC PIPELINE
// ============================================
// Pipeline: Validate → Red Flags → Filter by Concern → Safety Pipeline → Build Recommendations
// No AI reasoning. Pure deterministic logic.

import { getServiceClient } from "@/lib/supabase";
import { intakeSchema, deriveAgeGroup } from "@/lib/validation/intakeSchema";
import { mapConditionToDbId, mapMedicationToDbId } from "@/lib/mappings";
import { CONCERN_LABELS } from "@/lib/constants";
import type {
  IntakeData,
  RiskAssessment,
  RecommendedHerb,
  CautionRecommendation,
  AvoidRecommendation,
  BlockedHerb,
  CautionHerb,
  CautionEntry,
  AuditEntry,
  HerbRow,
  HerbConditionRiskRow,
  HerbMedicationInteractionRow,
  HerbHerbInteractionRow,
  HerbAgeRestrictionRow,
  EvidenceClaimRow,
  EvidenceGrade,
  InteractionSeverity,
  AgeGroup,
  SymptomPrimary,
} from "@/lib/types";

// ============================================
// INTAKE → DB ID MAPPING (shared module)
// ============================================

function mapConditionsToDbIds(
  conditions: string[],
  pregnancyStatus: string
): string[] {
  const ids: string[] = conditions
    .map(mapConditionToDbId)
    .filter((id): id is string => id !== null);

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
  return medications
    .map(mapMedicationToDbId)
    .filter((id): id is string => id !== null);
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
    "Please contact a crisis helpline immediately. Emergency: 112. India: iCall 9152987821, Vandrevala Foundation 1860-2662-345, AASRA 9820466726.",
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
// STEP 3B: AGE-BASED RESTRICTIONS
// ============================================

export function applyAgeRestrictions(
  herbs: HerbRow[],
  ageRestrictions: HerbAgeRestrictionRow[],
  userAgeGroup: AgeGroup
): {
  blocked: BlockedHerb[];
  remaining: HerbRow[];
  cautions: { herbId: string; entry: CautionEntry }[];
  auditEntries: AuditEntry[];
} {
  const blocked: BlockedHerb[] = [];
  const remaining: HerbRow[] = [];
  const cautions: { herbId: string; entry: CautionEntry }[] = [];
  const auditEntries: AuditEntry[] = [];

  // restrictions matching this user's age group
  const matching = ageRestrictions.filter((r) => r.age_group === userAgeGroup);
  const restrictionMap = new Map(matching.map((r) => [r.herb_id, r]));

  for (const herb of herbs) {
    const restriction = restrictionMap.get(herb.id);

    if (restriction?.restriction === "blocked") {
      blocked.push({
        herb_id: herb.id,
        herb_name: herb.names.english,
        reason: restriction.explanation,
        trigger: `age_${userAgeGroup}`,
        trigger_type: "condition",
        risk_code: "red",
      });
      auditEntries.push({
        event_type: "HERB_BLOCKED_AGE",
        event_data: {
          herb_id: herb.id,
          herb_name: herb.names.english,
          age_group: userAgeGroup,
          explanation: restriction.explanation,
        },
        herb_id: herb.id,
        risk_code: "red",
        trigger_type: "condition",
        trigger_value: `age_${userAgeGroup}`,
      });
    } else {
      remaining.push(herb);

      // caution or dose_reduce — these get added as caution entries later
      if (restriction) {
        cautions.push({
          herbId: herb.id,
          entry: {
            type: "condition",
            trigger: `age_${userAgeGroup}`,
            risk_code: "yellow",
            explanation: restriction.explanation,
          },
        });
        auditEntries.push({
          event_type: "HERB_AGE_CAUTION",
          event_data: {
            herb_id: herb.id,
            herb_name: herb.names.english,
            age_group: userAgeGroup,
            restriction: restriction.restriction,
            explanation: restriction.explanation,
          },
          herb_id: herb.id,
          risk_code: "yellow",
          trigger_type: "condition",
          trigger_value: `age_${userAgeGroup}`,
        });
      }
    }
  }

  return { blocked, remaining, cautions, auditEntries };
}

// ============================================
// STEP 3C: HERB-HERB INTERACTION CHECK
// ============================================

export function checkHerbHerbInteractions(
  herbs: HerbRow[],
  herbHerbInteractions: HerbHerbInteractionRow[],
  userCurrentHerbs: string[]
): {
  blocked: BlockedHerb[];
  remaining: HerbRow[];
  cautions: { herbId: string; entry: CautionEntry }[];
  auditEntries: AuditEntry[];
} {
  const blocked: BlockedHerb[] = [];
  const remaining: HerbRow[] = [];
  const cautions: { herbId: string; entry: CautionEntry }[] = [];
  const auditEntries: AuditEntry[] = [];

  // no current herbs = no herb-herb interactions possible
  if (userCurrentHerbs.length === 0) {
    return { blocked, remaining: herbs, cautions, auditEntries };
  }

  for (const herb of herbs) {
    const interactions = herbHerbInteractions.filter((i) => {
      // check if this herb interacts with any of user's current herbs
      const pair = [i.herb_id_1, i.herb_id_2];
      return (
        pair.includes(herb.id) &&
        userCurrentHerbs.some((uh) => pair.includes(uh) && uh !== herb.id)
      );
    });

    // red herb-herb interaction = block
    const redInteractions = interactions.filter((i) => i.risk_code === "red");
    if (redInteractions.length > 0) {
      const interactingHerbId = redInteractions.map((i) =>
        i.herb_id_1 === herb.id ? i.herb_id_2 : i.herb_id_1
      );
      blocked.push({
        herb_id: herb.id,
        herb_name: herb.names.english,
        reason: redInteractions
          .map(
            (i) =>
              `Dangerous interaction with ${
                i.herb_id_1 === herb.id ? i.herb_id_2 : i.herb_id_1
              }: ${i.mechanism}`
          )
          .join(" | "),
        trigger: interactingHerbId[0],
        trigger_type: "condition",
        risk_code: "red",
      });
      auditEntries.push({
        event_type: "HERB_BLOCKED_HERB_INTERACTION",
        event_data: {
          herb_id: herb.id,
          herb_name: herb.names.english,
          interacting_herbs: interactingHerbId,
          mechanisms: redInteractions.map((i) => i.mechanism),
        },
        herb_id: herb.id,
        risk_code: "red",
        trigger_type: "condition",
      });
    } else {
      remaining.push(herb);

      // yellow interactions = caution
      for (const interaction of interactions.filter(
        (i) => i.risk_code === "yellow"
      )) {
        const otherHerb =
          interaction.herb_id_1 === herb.id
            ? interaction.herb_id_2
            : interaction.herb_id_1;
        cautions.push({
          herbId: herb.id,
          entry: {
            type: "herb_herb_interaction",
            trigger: otherHerb,
            severity: interaction.severity,
            explanation: interaction.mechanism,
            clinical_action: interaction.clinical_action,
          },
        });
        auditEntries.push({
          event_type: "HERB_HERB_CAUTION",
          event_data: {
            herb_id: herb.id,
            herb_name: herb.names.english,
            interacting_herb: otherHerb,
            category: interaction.interaction_category,
            severity: interaction.severity,
            mechanism: interaction.mechanism,
          },
          herb_id: herb.id,
          risk_code: "yellow",
          trigger_type: "condition",
          trigger_value: otherHerb,
        });
      }
    }
  }

  return { blocked, remaining, cautions, auditEntries };
}

// ============================================
// STEP 3D: DURATION RESTRICTION CHECK
// ============================================

// symptom_duration values mapped to approximate weeks
const DURATION_TO_WEEKS: Record<string, number> = {
  less_than_1_week: 1,
  "1_4_weeks": 4,
  "1_3_months": 12,
  "3_6_months": 24,
  over_6_months: 36,
  chronic_ongoing: 52,
};

export function checkDurationRestrictions(
  herbs: HerbRow[],
  symptomDuration: string
): {
  cautions: { herbId: string; entry: CautionEntry }[];
  auditEntries: AuditEntry[];
} {
  const cautions: { herbId: string; entry: CautionEntry }[] = [];
  const auditEntries: AuditEntry[] = [];

  const userDurationWeeks = DURATION_TO_WEEKS[symptomDuration] ?? 0;

  // only flag if user's condition duration suggests long-term use
  if (userDurationWeeks < 12) {
    return { cautions, auditEntries };
  }

  for (const herb of herbs) {
    const maxStudied = herb.dosage_ranges.max_studied_duration_weeks;
    const hasLongTermData = herb.dosage_ranges.long_term_safety_data;

    // flag if: herb has a known max studied duration AND user's condition suggests
    // they'd use it beyond that duration AND no long-term safety data exists
    if (maxStudied && maxStudied < userDurationWeeks && !hasLongTermData) {
      cautions.push({
        herbId: herb.id,
        entry: {
          type: "condition",
          trigger: "duration_exceeds_study",
          risk_code: "yellow",
          explanation: `Clinical studies only cover ${maxStudied} weeks of use. Your condition (${symptomDuration.replace(/_/g, " ")}) suggests longer use. Long-term safety data is not available.`,
        },
      });
      auditEntries.push({
        event_type: "DURATION_CAUTION",
        event_data: {
          herb_id: herb.id,
          herb_name: herb.names.english,
          max_studied_weeks: maxStudied,
          user_duration: symptomDuration,
          user_duration_weeks: userDurationWeeks,
        },
        herb_id: herb.id,
        risk_code: "yellow",
        trigger_type: "condition",
        trigger_value: "duration_exceeds_study",
      });
    }
  }

  return { cautions, auditEntries };
}

// ============================================
// STEP 4: CALCULATE CAUTION SCORE (YELLOW)
// ============================================

export function calculateCautionScore(
  herbs: HerbRow[],
  conditionRisks: HerbConditionRiskRow[],
  medicationInteractions: HerbMedicationInteractionRow[],
  userConditionIds: string[],
  userMedicationIds: string[],
  extraCautions?: { herbId: string; entry: CautionEntry }[]
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

    // merge extra cautions (from age restrictions, herb-herb interactions, duration checks)
    const extras = (extraCautions ?? []).filter((ec) => ec.herbId === herb.id);
    for (const extra of extras) {
      score += extra.entry.severity
        ? INTERACTION_SEVERITY_SCORE[extra.entry.severity]
        : 5;
      cautions.push(extra.entry);
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
// STEP 5: BUILD PERSONALIZED RECOMMENDATIONS
// ============================================

function getBestEvidenceGrade(
  claims: EvidenceClaimRow[]
): EvidenceGrade | null {
  if (claims.length === 0) return null;
  const sorted = [...claims].sort(
    (a, b) =>
      (EVIDENCE_GRADE_RANK[b.evidence_grade] ?? 0) -
      (EVIDENCE_GRADE_RANK[a.evidence_grade] ?? 0)
  );
  return sorted[0].evidence_grade;
}

function buildRelevanceSummary(claims: EvidenceClaimRow[]): string {
  if (claims.length === 0) return "No specific evidence for this concern.";
  const best = [...claims].sort(
    (a, b) =>
      (EVIDENCE_GRADE_RANK[b.evidence_grade] ?? 0) -
      (EVIDENCE_GRADE_RANK[a.evidence_grade] ?? 0)
  )[0];
  return `${best.claim} (Grade ${best.evidence_grade})`;
}

export function buildRecommendations(
  intake: IntakeData,
  allBlocked: BlockedHerb[],
  cautionHerbs: CautionHerb[],
  safeHerbIds: string[],
  allHerbs: HerbRow[],
  claimsPerHerb: Map<string, EvidenceClaimRow[]>,
  allAuditEntries: AuditEntry[]
): RiskAssessment {
  const concern = intake.symptom_primary;
  const concernLabel = CONCERN_LABELS[concern as SymptomPrimary] || concern.replace(/_/g, " ");

  // build recommended herbs (safe + have evidence for concern)
  const recommended: RecommendedHerb[] = safeHerbIds
    .map((id) => {
      const herb = allHerbs.find((h) => h.id === id)!;
      const claims = claimsPerHerb.get(id) ?? [];
      return {
        herb_id: id,
        herb_name: herb.names.english,
        evidence_grade: getBestEvidenceGrade(claims),
        matching_claims: claims,
        relevance_summary: buildRelevanceSummary(claims),
        safety_note: "No known contraindications for your health profile.",
        dosage: herb.dosage_ranges,
      };
    })
    .sort((a, b) => {
      const ga = a.evidence_grade ? (EVIDENCE_GRADE_RANK[a.evidence_grade] ?? 0) : 0;
      const gb = b.evidence_grade ? (EVIDENCE_GRADE_RANK[b.evidence_grade] ?? 0) : 0;
      return gb - ga;
    });

  // build caution recommendations
  const caution: CautionRecommendation[] = cautionHerbs
    .map((ch) => {
      const claims = claimsPerHerb.get(ch.herb_id) ?? [];
      const cautionTypes = ch.cautions.map((c) => c.explanation).join("; ");
      return {
        ...ch,
        evidence_grade: getBestEvidenceGrade(claims),
        matching_claims: claims,
        relevance_summary: buildRelevanceSummary(claims),
        safety_note: `Requires caution: ${cautionTypes}`,
      };
    })
    .sort((a, b) => a.caution_score - b.caution_score);

  // build avoid list (blocked herbs that had evidence for this concern)
  const avoid: AvoidRecommendation[] = allBlocked.map((b) => {
    const claims = claimsPerHerb.get(b.herb_id) ?? [];
    return {
      herb_id: b.herb_id,
      herb_name: b.herb_name,
      reason: b.reason,
      trigger: b.trigger,
      trigger_type: b.trigger_type,
      matching_claims: claims,
      relevance_summary: claims.length > 0
        ? `Has ${buildRelevanceSummary(claims)} — but not safe for you.`
        : "Not safe for your health profile.",
    };
  });

  const totalRelevant = recommended.length + caution.length + avoid.length;

  // doctor referral
  const doctorSuggested =
    avoid.length > 0 ||
    caution.some((h) => h.caution_score >= 15) ||
    intake.symptom_severity === "severe" ||
    ["chronic_ongoing", "over_6_months"].includes(intake.symptom_duration);

  return {
    status: "COMPLETE",
    session_id: intake.session_id,
    disclaimer: DISCLAIMER,
    concern,
    concern_label: concernLabel,
    recommended_herbs: recommended,
    caution_herbs: caution,
    avoid_herbs: avoid,
    total_relevant: totalRelevant,
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
      concern: "",
      concern_label: "",
      recommended_herbs: [],
      caution_herbs: [],
      avoid_herbs: [],
      total_relevant: 0,
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
  const concern = intake.symptom_primary;
  const concernLabel = CONCERN_LABELS[concern as SymptomPrimary] || concern.replace(/_/g, " ");
  const allAudit: AuditEntry[] = [
    {
      event_type: "ASSESSMENT_STARTED",
      event_data: {
        session_id: intake.session_id,
        age_group: intake.age_group,
        sex: intake.sex,
        pregnancy_status: intake.pregnancy_status,
        conditions_count: intake.chronic_conditions.filter((c) => c !== "none").length,
        medications_count: intake.medications.filter((m) => m !== "none").length,
        symptom_primary: concern,
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
      event_data: { flags: redFlagResult.flags, message_count: redFlagResult.messages.length },
    });
    return {
      status: "EMERGENCY_ESCALATION",
      session_id: intake.session_id,
      disclaimer: DISCLAIMER,
      concern,
      concern_label: concernLabel,
      emergency_message: redFlagResult.messages.join(" "),
      red_flags_triggered: redFlagResult.flags,
      recommended_herbs: [],
      caution_herbs: [],
      avoid_herbs: [],
      total_relevant: 0,
      doctor_referral_suggested: true,
      audit_trail: allAudit,
    };
  }

  // Map intake values to DB IDs
  const conditionIds = mapConditionsToDbIds(intake.chronic_conditions, intake.pregnancy_status);
  const medicationIds = mapMedicationsToDbIds(intake.medications);

  allAudit.push({
    event_type: "ID_MAPPING_COMPLETE",
    event_data: { condition_ids: conditionIds, medication_ids: medicationIds },
  });

  // Query database (parallel)
  const db = getServiceClient();

  // Step 3: Filter by concern — only fetch herbs with evidence for user's concern
  // For "other" or "general_wellness", fetch ALL herbs (fallback to full evaluation)
  const isGenericConcern = concern === "other" || concern === "general_wellness";

  const [evidenceRes, condRisksRes, medInteractionsRes, herbHerbRes, ageRestrictionsRes] =
    await Promise.all([
      isGenericConcern
        ? db.from("evidence_claims").select("*")
        : db.from("evidence_claims").select("*").contains("symptom_tags", [concern]),
      conditionIds.length > 0
        ? db.from("herb_condition_risks").select("*").in("condition_id", conditionIds)
        : Promise.resolve({ data: [] as HerbConditionRiskRow[], error: null }),
      medicationIds.length > 0
        ? db.from("herb_medication_interactions").select("*").in("medication_id", medicationIds)
        : Promise.resolve({ data: [] as HerbMedicationInteractionRow[], error: null }),
      intake.current_herbs.length > 0
        ? db.from("herb_herb_interactions").select("*")
        : Promise.resolve({ data: [] as HerbHerbInteractionRow[], error: null }),
      db.from("herb_age_restrictions").select("*").eq("age_group", intake.age_group),
    ]);

  if (evidenceRes.error) throw new Error(`DB error (evidence): ${evidenceRes.error.message}`);
  if (condRisksRes.error) throw new Error(`DB error (condition_risks): ${condRisksRes.error.message}`);
  if (medInteractionsRes.error) throw new Error(`DB error (medication_interactions): ${medInteractionsRes.error.message}`);
  if (herbHerbRes.error) throw new Error(`DB error (herb_herb_interactions): ${herbHerbRes.error.message}`);
  if (ageRestrictionsRes.error) throw new Error(`DB error (herb_age_restrictions): ${ageRestrictionsRes.error.message}`);

  const matchingEvidence = (evidenceRes.data ?? []) as EvidenceClaimRow[];
  const condRisks = (condRisksRes.data ?? []) as HerbConditionRiskRow[];
  const medInteractions = (medInteractionsRes.data ?? []) as HerbMedicationInteractionRow[];
  const herbHerbInteractions = (herbHerbRes.data ?? []) as HerbHerbInteractionRow[];
  const ageRestrictions = (ageRestrictionsRes.data ?? []) as HerbAgeRestrictionRow[];

  // get distinct herb IDs that have evidence for this concern
  const relevantHerbIds = [...new Set(matchingEvidence.map((e) => e.herb_id))];

  // build claims-per-herb map
  const claimsPerHerb = new Map<string, EvidenceClaimRow[]>();
  for (const claim of matchingEvidence) {
    const existing = claimsPerHerb.get(claim.herb_id) ?? [];
    existing.push(claim);
    claimsPerHerb.set(claim.herb_id, existing);
  }

  // NO_MATCHES: no herbs have evidence for this concern
  if (relevantHerbIds.length === 0) {
    allAudit.push({
      event_type: "NO_EVIDENCE_MATCH",
      event_data: { concern, herbs_checked: 0 },
    });
    return {
      status: "NO_MATCHES",
      session_id: intake.session_id,
      disclaimer: DISCLAIMER,
      concern,
      concern_label: concernLabel,
      recommended_herbs: [],
      caution_herbs: [],
      avoid_herbs: [],
      total_relevant: 0,
      doctor_referral_suggested: false,
      audit_trail: allAudit,
    };
  }

  // fetch only the relevant herbs
  const herbsRes = await db.from("herbs").select("*").in("id", relevantHerbIds);
  if (herbsRes.error) throw new Error(`DB error (herbs): ${herbsRes.error.message}`);
  const herbs = herbsRes.data as HerbRow[];

  allAudit.push({
    event_type: "CONCERN_FILTER_COMPLETE",
    event_data: {
      concern,
      relevant_herbs: relevantHerbIds.length,
      evidence_claims: matchingEvidence.length,
    },
  });

  // Step 4: Safety pipeline on relevant herbs only
  const blockResult = filterBlockedHerbs(herbs, condRisks, medInteractions, conditionIds, medicationIds);
  allAudit.push(...blockResult.auditEntries);

  const ageResult = applyAgeRestrictions(blockResult.remaining, ageRestrictions, intake.age_group);
  allAudit.push(...ageResult.auditEntries);

  const herbHerbResult = checkHerbHerbInteractions(ageResult.remaining, herbHerbInteractions, intake.current_herbs);
  allAudit.push(...herbHerbResult.auditEntries);

  const durationResult = checkDurationRestrictions(herbHerbResult.remaining, intake.symptom_duration);
  allAudit.push(...durationResult.auditEntries);

  const allBlocked = [...blockResult.blocked, ...ageResult.blocked, ...herbHerbResult.blocked];
  const allExtraCautions = [...ageResult.cautions, ...herbHerbResult.cautions, ...durationResult.cautions];

  const cautionResult = calculateCautionScore(
    herbHerbResult.remaining,
    condRisks,
    medInteractions,
    conditionIds,
    medicationIds,
    allExtraCautions
  );
  allAudit.push(...cautionResult.auditEntries);

  // Step 5: Build personalized recommendations
  const result = buildRecommendations(
    intake,
    allBlocked,
    cautionResult.cautionHerbs,
    cautionResult.safeHerbIds,
    herbs,
    claimsPerHerb,
    allAudit
  );

  allAudit.push({
    event_type: "ASSESSMENT_COMPLETE",
    event_data: {
      concern,
      recommended_count: result.recommended_herbs.length,
      caution_count: result.caution_herbs.length,
      avoid_count: result.avoid_herbs.length,
      total_relevant: result.total_relevant,
      doctor_referral: result.doctor_referral_suggested,
    },
  });

  return result;
}
