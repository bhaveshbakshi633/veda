import type { EvidenceGrade } from "./types";

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
