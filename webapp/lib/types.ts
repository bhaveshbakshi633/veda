// ============================================
// CORE DOMAIN TYPES
// ============================================

export type RiskCode = "green" | "yellow" | "red";
export type EvidenceGrade = "A" | "B" | "B-C" | "C" | "C-D" | "D";
export type InteractionSeverity = "low" | "low_moderate" | "moderate" | "moderate_high" | "high" | "critical";
export type InteractionType = "proven" | "pharmacological" | "theoretical";

export type AgeGroup =
  | "child_under_6"
  | "child_6_12"
  | "adolescent_13_17"
  | "adult_18_45"
  | "adult_46_65"
  | "elderly_over_65";

export type PregnancyStatus =
  | "not_pregnant"
  | "pregnant_trimester_1"
  | "pregnant_trimester_2"
  | "pregnant_trimester_3"
  | "trying_to_conceive"
  | "lactating"
  | "not_applicable";

export type Sex = "male" | "female" | "other";

export type SymptomSeverity = "mild" | "moderate" | "severe";

export type SymptomDuration =
  | "less_than_1_week"
  | "1_4_weeks"
  | "1_3_months"
  | "3_6_months"
  | "over_6_months"
  | "chronic_ongoing";

export type UserGoal =
  | "learn_about_specific_herb"
  | "find_herb_for_concern"
  | "check_safety_of_current_herb"
  | "check_drug_herb_interaction"
  | "general_ayurvedic_guidance"
  | "understand_dosage";

export type SymptomPrimary =
  | "general_wellness"
  | "stress_anxiety"
  | "sleep_issues"
  | "digestive_issues"
  | "constipation"
  | "acidity_reflux"
  | "joint_pain"
  | "skin_issues"
  | "hair_issues"
  | "respiratory_cold_cough"
  | "low_energy_fatigue"
  | "memory_concentration"
  | "weight_management"
  | "immunity_general"
  | "reproductive_health"
  | "menstrual_issues"
  | "menopausal_symptoms"
  | "blood_sugar_concern"
  | "cholesterol_concern"
  | "heart_health"
  | "other";

// ============================================
// DATABASE ROW TYPES
// ============================================

export interface HerbRow {
  id: string;
  botanical_name: string;
  family: string;
  names: {
    sanskrit: string;
    hindi?: string;
    english: string;
    tamil?: string;
    botanical_synonyms?: string[];
  };
  parts_used: string[];
  classification: {
    rasayana: boolean;
    medhya: boolean;
    hridya: boolean;
    classical_groups: string[];
  };
  ayurvedic_profile: {
    rasa: string[];
    guna: string[];
    virya: string;
    vipaka: string;
    dosha_action: Record<string, { effect: string; strength: string; note?: string }>;
  };
  dosage_ranges: {
    disclaimer: string;
    forms: {
      form: string;
      range_min: string;
      range_max: string;
      unit: string;
      notes: string;
    }[];
    time_to_effect?: Record<string, string>;
    max_studied_duration_weeks?: number;
    long_term_safety_data: boolean;
  };
  side_effects: {
    common: string[];
    uncommon: string[];
    rare: string[];
  };
  misuse_patterns: {
    pattern_id: string;
    title: string;
    description: string;
    why_harmful: string;
    prevalence: string;
  }[];
  red_flags: {
    symptom: string;
    severity: "urgent" | "emergency";
    action: string;
    rationale: string;
  }[];
  framework_version: string;
  review_status: string;
  created_at: string;
  updated_at: string;
}

export interface HerbConditionRiskRow {
  id: string;
  herb_id: string;
  condition_id: string;
  risk_code: RiskCode;
  risk_label: string;
  explanation: string;
  overrides_all: boolean;
}

export interface HerbMedicationInteractionRow {
  id: string;
  herb_id: string;
  medication_id: string;
  severity: InteractionSeverity;
  interaction_type: InteractionType;
  mechanism: string;
  clinical_action: string;
}

export interface EvidenceClaimRow {
  id: string;
  herb_id: string;
  claim_id: string;
  claim: string;
  evidence_grade: EvidenceGrade;
  summary: string;
  mechanism: string | null;
  active_compounds: string[] | null;
  key_references: { author: string; year: number; journal: string; title: string }[] | null;
  symptom_tags: string[];
}

// ============================================
// INTAKE TYPES
// ============================================

export interface RedFlagScreen {
  chest_pain: boolean;
  blood_in_stool_vomit: boolean;
  high_fever_over_103: boolean;
  sudden_weakness_paralysis: boolean;
  suicidal_thoughts: boolean;
  difficulty_breathing: boolean;
  severe_allergic_reaction: boolean;
  yellowing_skin_eyes: boolean;
}

export interface IntakeData {
  session_id: string;
  timestamp: string;
  disclaimer_accepted: true;
  age: number;
  age_group: AgeGroup;
  sex: Sex;
  pregnancy_status: PregnancyStatus;
  chronic_conditions: string[];
  medications: string[];
  current_herbs: string[];
  symptom_primary: SymptomPrimary;
  symptom_duration: SymptomDuration;
  symptom_severity: SymptomSeverity;
  user_goal: UserGoal;
  red_flag_screen: RedFlagScreen;
}

// ============================================
// RISK ENGINE OUTPUT TYPES
// ============================================

export interface BlockedHerb {
  herb_id: string;
  herb_name: string;
  reason: string;
  trigger: string;
  trigger_type: "condition" | "medication" | "pregnancy";
  risk_code: "red";
}

export interface CautionEntry {
  type: "condition" | "medication_interaction" | "herb_herb_interaction" | "fertility_concern";
  trigger: string;
  risk_code?: RiskCode;
  severity?: InteractionSeverity;
  explanation: string;
  clinical_action?: string;
}

export interface CautionHerb {
  herb_id: string;
  herb_name: string;
  evidence_grade: EvidenceGrade | null;
  caution_score: number;
  cautions: CautionEntry[];
  dosage: HerbRow["dosage_ranges"];
}

export interface SafeHerb {
  herb_id: string;
  herb_name: string;
  evidence_grade: EvidenceGrade | null;
  dosage: HerbRow["dosage_ranges"];
}

export interface AuditEntry {
  event_type: string;
  event_data: Record<string, unknown>;
  herb_id?: string;
  risk_code?: RiskCode;
  trigger_type?: string;
  trigger_value?: string;
}

export interface RiskAssessment {
  status: "COMPLETE" | "EMERGENCY_ESCALATION" | "ERROR";
  session_id: string;
  disclaimer: string;
  emergency_message?: string;
  red_flags_triggered?: string[];
  blocked_herbs: BlockedHerb[];
  caution_herbs: CautionHerb[];
  safe_herbs: SafeHerb[];
  doctor_referral_suggested: boolean;
  audit_trail: AuditEntry[];
}
