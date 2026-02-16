import { z } from "zod";

// ============================================
// ENUM DEFINITIONS
// ============================================

const sexEnum = z.enum(["male", "female", "other"]);

const pregnancyStatusEnum = z.enum([
  "not_pregnant",
  "pregnant_trimester_1",
  "pregnant_trimester_2",
  "pregnant_trimester_3",
  "trying_to_conceive",
  "lactating",
  "not_applicable",
]);

const chronicConditionEnum = z.enum([
  "none",
  "hypertension",
  "diabetes_type_1",
  "diabetes_type_2",
  "hypothyroid",
  "hyperthyroid",
  "heart_failure",
  "coronary_artery_disease",
  "arrhythmia",
  "asthma",
  "copd",
  "kidney_disease_mild",
  "kidney_disease_moderate_severe",
  "liver_disease",
  "peptic_ulcer",
  "gerd",
  "ibs_constipation",
  "ibs_diarrhea",
  "ibd",
  "autoimmune_lupus",
  "autoimmune_ra",
  "autoimmune_ms",
  "autoimmune_hashimotos",
  "autoimmune_graves",
  "autoimmune_other",
  "bleeding_disorder",
  "iron_overload",
  "kidney_stones",
  "epilepsy",
  "depression",
  "anxiety_disorder",
  "bipolar_disorder",
  "breast_cancer_history",
  "endometriosis",
  "uterine_fibroids",
  "pcos",
  "obesity",
  "underweight",
  "scheduled_surgery_within_4_weeks",
  "organ_transplant",
  "other",
]);

const medicationEnum = z.enum([
  "none",
  "antidiabetic_oral",
  "insulin",
  "antihypertensive_ace_arb",
  "antihypertensive_beta_blocker",
  "antihypertensive_ccb",
  "antihypertensive_diuretic_loop",
  "antihypertensive_diuretic_thiazide",
  "diuretic_potassium_sparing",
  "digoxin",
  "warfarin",
  "aspirin_antiplatelet",
  "clopidogrel",
  "doac_anticoagulant",
  "statin",
  "ssri",
  "snri",
  "benzodiazepine",
  "antiepileptic",
  "lithium",
  "antipsychotic",
  "thyroid_levothyroxine",
  "antithyroid_medication",
  "corticosteroid_oral",
  "immunosuppressant",
  "methotrexate",
  "anti_tb_drugs",
  "chemotherapy",
  "tamoxifen",
  "aromatase_inhibitor",
  "oral_contraceptive",
  "hrt",
  "iron_supplement",
  "nsaid_regular",
  "ppi_antacid",
  "other",
]);

const symptomPrimaryEnum = z.enum([
  "general_wellness",
  "stress_anxiety",
  "sleep_issues",
  "digestive_issues",
  "constipation",
  "acidity_reflux",
  "joint_pain",
  "skin_issues",
  "hair_issues",
  "respiratory_cold_cough",
  "low_energy_fatigue",
  "memory_concentration",
  "weight_management",
  "immunity_general",
  "reproductive_health",
  "menstrual_issues",
  "menopausal_symptoms",
  "blood_sugar_concern",
  "cholesterol_concern",
  "heart_health",
  "other",
]);

const symptomDurationEnum = z.enum([
  "less_than_1_week",
  "1_4_weeks",
  "1_3_months",
  "3_6_months",
  "over_6_months",
  "chronic_ongoing",
]);

const symptomSeverityEnum = z.enum(["mild", "moderate", "severe"]);

const userGoalEnum = z.enum([
  "learn_about_specific_herb",
  "find_herb_for_concern",
  "check_safety_of_current_herb",
  "check_drug_herb_interaction",
  "general_ayurvedic_guidance",
  "understand_dosage",
]);

// ============================================
// RED FLAG SCREEN
// ============================================

const redFlagScreenSchema = z.object({
  chest_pain: z.boolean(),
  blood_in_stool_vomit: z.boolean(),
  high_fever_over_103: z.boolean(),
  sudden_weakness_paralysis: z.boolean(),
  suicidal_thoughts: z.boolean(),
  difficulty_breathing: z.boolean(),
  severe_allergic_reaction: z.boolean(),
  yellowing_skin_eyes: z.boolean(),
});

// ============================================
// FULL INTAKE SCHEMA
// ============================================

export const intakeSchema = z
  .object({
    age: z.number().int().min(1).max(120),
    sex: sexEnum,
    pregnancy_status: pregnancyStatusEnum,
    chronic_conditions: z.array(chronicConditionEnum).min(1),
    medications: z.array(medicationEnum).min(1),
    current_herbs: z.array(z.string().max(100)).default([]),
    symptom_primary: symptomPrimaryEnum,
    symptom_duration: symptomDurationEnum,
    symptom_severity: symptomSeverityEnum,
    user_goal: userGoalEnum,
    red_flag_screen: redFlagScreenSchema,
    disclaimer_accepted: z.literal(true, {
      errorMap: () => ({ message: "You must accept the disclaimer to proceed." }),
    }),
  })
  .refine(
    (data) => {
      if (data.sex === "male" && data.pregnancy_status !== "not_applicable") {
        return false;
      }
      return true;
    },
    { message: "Pregnancy status must be 'not_applicable' for male users.", path: ["pregnancy_status"] }
  );

export type IntakeFormData = z.infer<typeof intakeSchema>;

// ============================================
// DERIVED HELPERS
// ============================================

export function deriveAgeGroup(age: number): string {
  if (age < 6) return "child_under_6";
  if (age <= 12) return "child_6_12";
  if (age <= 17) return "adolescent_13_17";
  if (age <= 45) return "adult_18_45";
  if (age <= 65) return "adult_46_65";
  return "elderly_over_65";
}

// ============================================
// CONDITION DISPLAY LABELS
// ============================================

export const conditionLabels: Record<string, string> = {
  none: "None",
  hypertension: "Hypertension (High BP)",
  diabetes_type_1: "Diabetes Type 1",
  diabetes_type_2: "Diabetes Type 2",
  hypothyroid: "Hypothyroidism",
  hyperthyroid: "Hyperthyroidism / Graves'",
  heart_failure: "Heart Failure",
  coronary_artery_disease: "Coronary Artery Disease",
  arrhythmia: "Heart Arrhythmia",
  asthma: "Asthma",
  copd: "COPD",
  kidney_disease_mild: "Kidney Disease (Mild)",
  kidney_disease_moderate_severe: "Kidney Disease (Moderate-Severe)",
  liver_disease: "Liver Disease",
  peptic_ulcer: "Peptic Ulcer (Active)",
  gerd: "GERD / Acid Reflux",
  ibs_constipation: "IBS (Constipation-predominant)",
  ibs_diarrhea: "IBS (Diarrhea-predominant)",
  ibd: "IBD (Crohn's / Ulcerative Colitis)",
  autoimmune_lupus: "Lupus (SLE)",
  autoimmune_ra: "Rheumatoid Arthritis",
  autoimmune_ms: "Multiple Sclerosis",
  autoimmune_hashimotos: "Hashimoto's Thyroiditis",
  autoimmune_graves: "Graves' Disease",
  autoimmune_other: "Autoimmune (Other)",
  bleeding_disorder: "Bleeding Disorder",
  iron_overload: "Iron Overload / Hemochromatosis",
  kidney_stones: "Kidney Stones (History)",
  epilepsy: "Epilepsy",
  depression: "Depression",
  anxiety_disorder: "Anxiety Disorder",
  bipolar_disorder: "Bipolar Disorder",
  breast_cancer_history: "Breast Cancer (History)",
  endometriosis: "Endometriosis",
  uterine_fibroids: "Uterine Fibroids",
  pcos: "PCOS",
  obesity: "Obesity",
  underweight: "Underweight / Emaciated",
  scheduled_surgery_within_4_weeks: "Surgery Scheduled (Within 4 Weeks)",
  organ_transplant: "Organ Transplant Recipient",
  other: "Other",
};

export const medicationLabels: Record<string, string> = {
  none: "None",
  antidiabetic_oral: "Antidiabetic (Oral — Metformin, Glimepiride, etc.)",
  insulin: "Insulin",
  antihypertensive_ace_arb: "ACE Inhibitor / ARB (Enalapril, Losartan, etc.)",
  antihypertensive_beta_blocker: "Beta-blocker (Metoprolol, Atenolol, etc.)",
  antihypertensive_ccb: "Calcium Channel Blocker (Amlodipine, etc.)",
  antihypertensive_diuretic_loop: "Loop Diuretic (Furosemide)",
  antihypertensive_diuretic_thiazide: "Thiazide Diuretic (HCTZ)",
  diuretic_potassium_sparing: "Potassium-Sparing Diuretic (Spironolactone)",
  digoxin: "Digoxin (Lanoxin)",
  warfarin: "Warfarin",
  aspirin_antiplatelet: "Aspirin (Antiplatelet dose)",
  clopidogrel: "Clopidogrel (Plavix)",
  doac_anticoagulant: "DOAC (Rivaroxaban, Apixaban, etc.)",
  statin: "Statin (Atorvastatin, Rosuvastatin, etc.)",
  ssri: "SSRI (Fluoxetine, Sertraline, Escitalopram, etc.)",
  snri: "SNRI (Venlafaxine, Duloxetine)",
  benzodiazepine: "Benzodiazepine (Alprazolam, Diazepam, etc.)",
  antiepileptic: "Antiepileptic (Valproate, Carbamazepine, etc.)",
  lithium: "Lithium",
  antipsychotic: "Antipsychotic",
  thyroid_levothyroxine: "Levothyroxine (Thyroid hormone)",
  antithyroid_medication: "Anti-thyroid (Methimazole, Carbimazole)",
  corticosteroid_oral: "Corticosteroid — Oral (Prednisolone, etc.)",
  immunosuppressant: "Immunosuppressant (Cyclosporine, Tacrolimus, etc.)",
  methotrexate: "Methotrexate",
  anti_tb_drugs: "Anti-TB drugs (INH, Rifampicin)",
  chemotherapy: "Chemotherapy",
  tamoxifen: "Tamoxifen",
  aromatase_inhibitor: "Aromatase Inhibitor",
  oral_contraceptive: "Oral Contraceptive Pill",
  hrt: "Hormone Replacement Therapy (HRT)",
  iron_supplement: "Iron Supplement",
  nsaid_regular: "NSAID — Regular use (Ibuprofen, Diclofenac)",
  ppi_antacid: "PPI / Antacid (Omeprazole, Pantoprazole)",
  other: "Other",
};
