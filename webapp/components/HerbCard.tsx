"use client";

import { useState } from "react";
import type {
  BlockedHerb,
  CautionHerb,
  SafeHerb,
  EvidenceGrade,
  InteractionSeverity,
} from "@/lib/types";
import { GRADE_COLORS, GRADE_LABELS } from "@/lib/constants";

// ============================================
// EVIDENCE GRADE BADGE (clickable + keyboard accessible)
// ============================================

function EvidenceBadge({
  grade,
  onClick,
}: {
  grade: EvidenceGrade | null;
  onClick?: () => void;
}) {
  if (!grade) {
    return (
      <span className="evidence-badge bg-gray-100 text-gray-400">
        No match
      </span>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        className={`evidence-badge ${GRADE_COLORS[grade] || "bg-gray-100 text-gray-600"} cursor-pointer hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-ayurv-primary focus:ring-offset-1`}
        title={GRADE_LABELS[grade] || grade}
        onClick={onClick}
        aria-label={`View evidence details: ${GRADE_LABELS[grade] || `Grade ${grade}`}`}
      >
        Grade {grade}
      </button>
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
  prefix,
}: {
  dosage: SafeHerb["dosage"] | CautionHerb["dosage"];
  prefix?: string;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-black/5">
      <p className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
        {prefix || "Educational Dosage Information"}
      </p>
      <p className="text-xs text-gray-400 italic mb-2.5">{dosage.disclaimer}</p>
      <div className="space-y-2">
        {dosage.forms.map((form, i) => (
          <div key={i} className="flex items-baseline gap-2 text-xs flex-wrap bg-white/60 rounded-lg px-3 py-2">
            <span className="font-semibold text-gray-700 min-w-0 shrink-0">
              {form.form}:
            </span>
            <span className="text-gray-600">
              {form.range_min}–{form.range_max} {form.unit}
            </span>
            {form.notes && (
              <span className="text-gray-400" title={form.notes}>
                ({form.notes})
              </span>
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
  const [expanded, setExpanded] = useState(false);

  // 1-line summary for collapsed state
  const triggerLabel =
    herb.trigger_type === "pregnancy"
      ? "Pregnancy/Reproductive status"
      : herb.trigger_type === "medication"
        ? "Drug interaction"
        : "Health condition";

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-risk-red/20 overflow-hidden card-hover">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-risk-red rounded-l-2xl" />

      {/* collapsed header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left pl-5 pr-5 py-4 sm:pl-6 sm:pr-6 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {herb.herb_name}
          </h3>
          <span className="risk-badge-red shrink-0 shadow-sm shadow-risk-red/20 text-[10px]">AVOID</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 hidden sm:inline">{triggerLabel}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* expanded details */}
      {expanded && (
        <div className="pl-5 pr-5 pb-5 sm:pl-6 sm:pr-6 animate-fade-in">
          <div className="bg-risk-red-light rounded-xl p-3.5 mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-risk-red">Why: </span>
              {herb.reason}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Trigger: {triggerLabel}
            </span>
          </div>

          <p className="text-xs text-risk-red font-semibold mt-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Discuss alternatives with your doctor
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// CAUTION HERB CARD (YELLOW)
// ============================================

export function CautionHerbCard({
  herb,
  onEvidenceClick,
}: {
  herb: CautionHerb;
  onEvidenceClick?: (herbId: string, herbName: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-risk-amber/20 overflow-hidden card-hover">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-risk-amber rounded-l-2xl" />

      {/* collapsed header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left pl-5 pr-5 py-4 sm:pl-6 sm:pr-6 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {herb.herb_name}
          </h3>
          <span className="risk-badge-yellow shrink-0 shadow-sm shadow-risk-amber/20 text-[10px]">CAUTION</span>
          <span className="text-xs text-risk-amber font-medium">
            {herb.cautions.length} warning{herb.cautions.length > 1 ? "s" : ""}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* expanded details */}
      {expanded && (
        <div className="pl-5 pr-5 pb-5 sm:pl-6 sm:pr-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <EvidenceBadge
              grade={herb.evidence_grade}
              onClick={
                onEvidenceClick
                  ? () => onEvidenceClick(herb.herb_id, herb.herb_name)
                  : undefined
              }
            />
          </div>

          <div className="space-y-2.5 mb-3">
            {herb.cautions.map((caution, i) => (
              <div
                key={i}
                className="bg-risk-amber-light/60 rounded-xl p-3.5 text-sm border border-amber-200/50"
              >
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {(caution.type === "medication_interaction" ||
                    caution.type === "herb_herb_interaction") &&
                    caution.severity && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${SEVERITY_COLORS[caution.severity]}`}
                      >
                        {SEVERITY_LABELS[caution.severity]}
                      </span>
                    )}
                  <span className="text-xs text-gray-500 capitalize font-medium">
                    {caution.type.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{caution.explanation}</p>
                {caution.clinical_action && (
                  <p className="text-xs text-risk-amber font-semibold mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {caution.clinical_action}
                  </p>
                )}
              </div>
            ))}
          </div>

          <DosageInfo
            dosage={herb.dosage}
            prefix="Dosage (discuss with doctor first)"
          />
        </div>
      )}
    </div>
  );
}

// ============================================
// SAFE HERB CARD (GREEN)
// ============================================

export function SafeHerbCard({
  herb,
  onEvidenceClick,
}: {
  herb: SafeHerb;
  onEvidenceClick?: (herbId: string, herbName: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-risk-green/20 overflow-hidden card-hover">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-risk-green rounded-l-2xl" />

      {/* collapsed header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left pl-5 pr-5 py-4 sm:pl-6 sm:pr-6 flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          <h3 className="text-base font-bold text-gray-900 truncate">
            {herb.herb_name}
          </h3>
          <span className="risk-badge-green shrink-0 shadow-sm shadow-risk-green/20 text-[10px]">LOWER RISK</span>
          {herb.evidence_grade && (
            <span className="text-xs text-gray-400">Grade {herb.evidence_grade}</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* expanded details */}
      {expanded && (
        <div className="pl-5 pr-5 pb-5 sm:pl-6 sm:pr-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 font-medium">Evidence:</span>
            <EvidenceBadge
              grade={herb.evidence_grade}
              onClick={
                onEvidenceClick
                  ? () => onEvidenceClick(herb.herb_id, herb.herb_name)
                  : undefined
              }
            />
          </div>

          {herb.evidence_grade && (
            <p className="text-xs text-gray-500 leading-relaxed">
              {GRADE_LABELS[herb.evidence_grade] ||
                `Grade ${herb.evidence_grade}`}
            </p>
          )}
          {!herb.evidence_grade && (
            <p className="text-xs text-gray-400 leading-relaxed">
              No safety concerns identified for your profile. Tap the grade badge above for evidence details.
            </p>
          )}

          <DosageInfo dosage={herb.dosage} prefix="Standard dosage range" />
        </div>
      )}
    </div>
  );
}
