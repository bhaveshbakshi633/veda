"use client";

import { useState, memo } from "react";
import type {
  RecommendedHerb,
  CautionRecommendation,
  AvoidRecommendation,
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
  if (!grade) return null;

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
  dosage: RecommendedHerb["dosage"];
  prefix?: string;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-black/5">
      <p className="text-[11px] font-semibold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
        {prefix || "Dosage Information"}
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
// RECOMMENDED HERB CARD (GREEN — top picks)
// ============================================

export const RecommendedHerbCard = memo(function RecommendedHerbCard({
  herb,
  rank,
  onEvidenceClick,
}: {
  herb: RecommendedHerb;
  rank: number;
  onEvidenceClick?: (herbId: string, herbName: string) => void;
}) {
  const [expanded, setExpanded] = useState(rank === 1); // auto-expand #1

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-risk-green/20 overflow-hidden card-hover">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-risk-green rounded-l-2xl" />

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left pl-5 pr-5 py-4 sm:pl-6 sm:pr-6 flex items-center justify-between gap-3"
        aria-expanded={expanded}
        aria-label={`${herb.herb_name} — recommended, evidence grade ${herb.evidence_grade || "not rated"}. ${expanded ? "Collapse" : "Expand"} details.`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-wrap">
          {rank <= 3 && (
            <span className="w-7 h-7 rounded-full bg-risk-green text-white text-xs font-bold flex items-center justify-center shrink-0" aria-label={`Rank ${rank}`}>
              {rank}
            </span>
          )}
          <h3 className="text-base font-bold text-gray-900 truncate">
            {herb.herb_name}
          </h3>
          <EvidenceBadge grade={herb.evidence_grade} />
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="pl-5 pr-5 pb-5 sm:pl-6 sm:pr-6 animate-fade-in">
          {/* why this herb */}
          <div className="bg-risk-green-light rounded-xl p-4 mb-3">
            <p className="text-[11px] font-semibold text-risk-green uppercase tracking-wider mb-2">
              Why This Herb
            </p>
            {herb.matching_claims.length > 0 ? (
              <div className="space-y-2">
                {herb.matching_claims.slice(0, 3).map((claim, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    <span className="font-medium">{claim.claim}</span>
                    <span className="text-gray-500"> — Grade {claim.evidence_grade}</span>
                    {claim.summary && (
                      <p className="text-xs text-gray-500 mt-0.5">{claim.summary}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">{herb.relevance_summary}</p>
            )}
          </div>

          {/* safety */}
          <div className="flex items-center gap-2 mb-3 text-xs">
            <svg className="w-4 h-4 text-risk-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <span className="text-risk-green font-medium">&#10003; {herb.safety_note}</span>
          </div>

          {/* evidence details button */}
          {onEvidenceClick && herb.evidence_grade && (
            <button
              type="button"
              onClick={() => onEvidenceClick(herb.herb_id, herb.herb_name)}
              className="text-xs text-ayurv-primary font-medium hover:underline mb-3 flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              View all evidence & references
            </button>
          )}

          <DosageInfo dosage={herb.dosage} prefix="Recommended dosage range" />
        </div>
      )}
    </div>
  );
});

// ============================================
// CAUTION HERB CARD (YELLOW — usable with care)
// ============================================

export const CautionHerbCard = memo(function CautionHerbCard({
  herb,
  onEvidenceClick,
}: {
  herb: CautionRecommendation;
  onEvidenceClick?: (herbId: string, herbName: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-risk-amber/20 overflow-hidden card-hover">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-risk-amber rounded-l-2xl" />

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left pl-5 pr-5 py-4 sm:pl-6 sm:pr-6 flex items-center justify-between gap-3"
        aria-expanded={expanded}
        aria-label={`${herb.herb_name} — caution, ${herb.cautions.length} warning${herb.cautions.length > 1 ? "s" : ""}. ${expanded ? "Collapse" : "Expand"} details.`}
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
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="pl-5 pr-5 pb-5 sm:pl-6 sm:pr-6 animate-fade-in">
          {/* why this herb — evidence for concern */}
          {herb.matching_claims.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-3.5 mb-3 border border-blue-100">
              <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider mb-1.5">
                Why This Herb
              </p>
              <p className="text-sm text-gray-700">{herb.relevance_summary}</p>
            </div>
          )}

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

          {/* warnings */}
          <div className="space-y-2.5 mb-3" role="list" aria-label="Safety warnings">
            {herb.cautions.map((caution, i) => (
              <div
                key={i}
                role="listitem"
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
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                    {caution.clinical_action}
                  </p>
                )}
              </div>
            ))}
          </div>

          <DosageInfo dosage={herb.dosage} prefix="Dosage (discuss with doctor first)" />
        </div>
      )}
    </div>
  );
});

// ============================================
// AVOID HERB CARD (RED — blocked)
// ============================================

export const AvoidHerbCard = memo(function AvoidHerbCard({ herb }: { herb: AvoidRecommendation }) {
  const [expanded, setExpanded] = useState(false);

  const triggerLabel =
    herb.trigger_type === "pregnancy"
      ? "Pregnancy/Reproductive status"
      : herb.trigger_type === "medication"
        ? "Drug interaction"
        : "Health condition";

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-risk-red/20 overflow-hidden card-hover">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-risk-red rounded-l-2xl" />

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left pl-5 pr-5 py-4 sm:pl-6 sm:pr-6 flex items-center justify-between gap-3"
        aria-expanded={expanded}
        aria-label={`${herb.herb_name} — avoid. ${triggerLabel}. ${expanded ? "Collapse" : "Expand"} details.`}
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
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="pl-5 pr-5 pb-5 sm:pl-6 sm:pr-6 animate-fade-in">
          {/* what user is missing */}
          {herb.matching_claims.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-3.5 mb-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">
                This herb has evidence for your concern:
              </p>
              <p className="text-sm text-gray-600 italic">{herb.relevance_summary}</p>
            </div>
          )}

          <div className="bg-risk-red-light rounded-xl p-3.5 mb-3">
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-risk-red">Why not safe: </span>
              {herb.reason}
            </p>
          </div>

          <p className="text-xs text-risk-red font-semibold mt-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Ask your doctor about safe alternatives for your concern
          </p>
        </div>
      )}
    </div>
  );
});
