import type { EvidenceGrade, SymptomPrimary } from "./types";

export const GRADE_COLORS: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-blue-100 text-blue-800",
  "B-C": "bg-sky-100 text-sky-800",
  C: "bg-amber-100 text-amber-800",
  "C-D": "bg-orange-100 text-orange-800",
  D: "bg-gray-100 text-gray-600",
};

export const GRADE_LABELS: Record<string, string> = {
  A: "Strong Evidence (RCTs/Meta-analysis)",
  B: "Moderate Evidence (Small Trials)",
  "B-C": "Moderate-Limited Evidence",
  C: "Limited Evidence (Animal/In-vitro)",
  "C-D": "Very Limited Evidence",
  D: "Traditional Use Only",
};

export const GRADE_EXPLANATIONS: Record<string, string> = {
  A: "Strong evidence from multiple large clinical trials or meta-analyses.",
  B: "Moderate evidence from smaller clinical studies. Promising but needs larger trials.",
  "B-C":
    "Moderate to limited evidence. Some clinical data supplemented by preclinical studies.",
  C: "Limited evidence. Mainly laboratory or animal studies. Human data is sparse.",
  "C-D":
    "Very limited evidence. Mostly preclinical with anecdotal clinical reports.",
  D: "Based on traditional Ayurvedic texts only. No clinical studies available.",
};

// human-readable labels for symptom/concern values
export const CONCERN_LABELS: Record<SymptomPrimary, string> = {
  general_wellness: "General Wellness",
  stress_anxiety: "Stress & Anxiety",
  sleep_issues: "Sleep Issues",
  digestive_issues: "Digestive Health",
  constipation: "Constipation",
  acidity_reflux: "Acidity & Reflux",
  joint_pain: "Joint Pain",
  skin_issues: "Skin Health",
  hair_issues: "Hair Health",
  respiratory_cold_cough: "Respiratory Health",
  low_energy_fatigue: "Energy & Fatigue",
  memory_concentration: "Memory & Focus",
  weight_management: "Weight Management",
  immunity_general: "Immunity Support",
  reproductive_health: "Reproductive Health",
  menstrual_issues: "Menstrual Health",
  menopausal_symptoms: "Menopausal Symptoms",
  blood_sugar_concern: "Blood Sugar Management",
  cholesterol_concern: "Cholesterol Management",
  heart_health: "Heart Health",
  other: "General Health",
};
