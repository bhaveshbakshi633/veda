"use client";

import type {
  BlockedHerb,
  CautionHerb,
  SafeHerb,
  EvidenceGrade,
  InteractionSeverity,
} from "@/lib/types";

// ============================================
// EVIDENCE GRADE BADGE
// ============================================

const GRADE_COLORS: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-blue-100 text-blue-800",
  "B-C": "bg-sky-100 text-sky-800",
  C: "bg-amber-100 text-amber-800",
  "C-D": "bg-orange-100 text-orange-800",
  D: "bg-gray-100 text-gray-600",
};

const GRADE_LABELS: Record<string, string> = {
  A: "Strong Evidence (RCTs/Meta-analysis)",
  B: "Moderate Evidence (Small Trials)",
  "B-C": "Moderate-Limited Evidence",
  C: "Limited Evidence (Animal/In-vitro)",
  "C-D": "Very Limited Evidence",
  D: "Traditional Use Only",
};

function EvidenceBadge({ grade }: { grade: EvidenceGrade | null }) {
  if (!grade) {
    return (
      <span className="evidence-badge bg-gray-100 text-gray-400">
        No match
      </span>
    );
  }
  return (
    <span
      className={`evidence-badge ${GRADE_COLORS[grade] || "bg-gray-100 text-gray-600"}`}
      title={GRADE_LABELS[grade] || grade}
    >
      Grade {grade}
    </span>
  );
}

// ============================================
// SEVERITY LABELS
// ============================================

const SEVERITY_LABELS: Record<InteractionSeverity, string> = {
  low: "Low",
  low_moderate: "Low-Moderate",
  moderate: "Moderate",
  moderate_high: "Moderate-High",
  high: "High",
  critical: "Critical",
};

const SEVERITY_COLORS: Record<InteractionSeverity, string> = {
  low: "text-green-700 bg-green-50",
  low_moderate: "text-yellow-700 bg-yellow-50",
  moderate: "text-amber-700 bg-amber-50",
  moderate_high: "text-orange-700 bg-orange-50",
  high: "text-red-700 bg-red-50",
  critical: "text-red-900 bg-red-100",
};

// ============================================
// DOSAGE DISPLAY
// ============================================

function DosageInfo({
  dosage,
}: {
  dosage: SafeHerb["dosage"] | CautionHerb["dosage"];
}) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
        Educational Dosage Information
      </p>
      <p className="text-xs text-gray-400 italic mb-2">{dosage.disclaimer}</p>
      <div className="space-y-1.5">
        {dosage.forms.map((form, i) => (
          <div key={i} className="flex items-baseline gap-2 text-xs">
            <span className="font-medium text-gray-700 min-w-0 shrink-0">
              {form.form}:
            </span>
            <span className="text-gray-600">
              {form.range_min}–{form.range_max} {form.unit}
            </span>
            {form.notes && (
              <span className="text-gray-400 truncate">({form.notes})</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// BLOCKED HERB CARD (RED)
// ============================================

export function BlockedHerbCard({ herb }: { herb: BlockedHerb }) {
  return (
    <div className="border-2 border-risk-red bg-risk-red-light rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{herb.herb_name}</h3>
        <span className="risk-badge-red">AVOID</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{herb.reason}</p>
      <p className="text-xs text-gray-500 mt-2">
        Trigger: {herb.trigger_type === "pregnancy" ? "Pregnancy/Reproductive status" : herb.trigger_type === "medication" ? "Drug interaction" : "Health condition"}
      </p>
      {/* NO DOSAGE INFORMATION FOR BLOCKED HERBS — by design */}
    </div>
  );
}

// ============================================
// CAUTION HERB CARD (YELLOW)
// ============================================

export function CautionHerbCard({ herb }: { herb: CautionHerb }) {
  return (
    <div className="border-2 border-risk-amber bg-risk-amber-light rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{herb.herb_name}</h3>
          <EvidenceBadge grade={herb.evidence_grade} />
        </div>
        <span className="risk-badge-yellow">CAUTION</span>
      </div>

      <div className="space-y-2 mb-3">
        {herb.cautions.map((caution, i) => (
          <div
            key={i}
            className="bg-white/60 rounded p-2.5 text-sm border border-amber-200"
          >
            <div className="flex items-center gap-2 mb-1">
              {caution.type === "medication_interaction" && caution.severity && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-medium ${SEVERITY_COLORS[caution.severity]}`}
                >
                  {SEVERITY_LABELS[caution.severity]}
                </span>
              )}
              <span className="text-xs text-gray-500 capitalize">
                {caution.type.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-gray-700 text-sm">{caution.explanation}</p>
            {caution.clinical_action && (
              <p className="text-xs text-risk-amber font-medium mt-1">
                Action: {caution.clinical_action}
              </p>
            )}
          </div>
        ))}
      </div>

      <DosageInfo dosage={herb.dosage} />
    </div>
  );
}

// ============================================
// SAFE HERB CARD (GREEN)
// ============================================

export function SafeHerbCard({ herb }: { herb: SafeHerb }) {
  return (
    <div className="border-2 border-risk-green bg-risk-green-light rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{herb.herb_name}</h3>
          <EvidenceBadge grade={herb.evidence_grade} />
        </div>
        <span className="risk-badge-green">SAFE</span>
      </div>

      {herb.evidence_grade && (
        <p className="text-xs text-gray-500 mb-1">
          {GRADE_LABELS[herb.evidence_grade] || `Grade ${herb.evidence_grade}`}{" "}
          for your concern
        </p>
      )}
      {!herb.evidence_grade && (
        <p className="text-xs text-gray-400 mb-1">
          No specific evidence match for your concern, but no safety concerns
          identified.
        </p>
      )}

      <DosageInfo dosage={herb.dosage} />
    </div>
  );
}
