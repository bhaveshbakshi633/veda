"use client";

import React, { useState, useEffect, useRef } from "react";
import type { RecommendedHerb, CautionRecommendation } from "@/lib/types";

type ComparableHerb = RecommendedHerb | CautionRecommendation;

interface HerbCompareProps {
  herbs: ComparableHerb[];
}

const GRADE_ORDER: Record<string, number> = { A: 1, B: 2, "B-C": 3, C: 4, "C-D": 5, D: 6 };

function gradeColor(grade: string | null): string {
  if (!grade) return "bg-gray-100 text-gray-500";
  if (grade === "A") return "bg-green-100 text-green-800";
  if (grade === "B") return "bg-blue-100 text-blue-800";
  return "bg-yellow-100 text-yellow-800";
}

function isCaution(herb: ComparableHerb): herb is CautionRecommendation {
  return "cautions" in herb;
}

export default function HerbCompare({ herbs }: HerbCompareProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(() =>
    herbs.slice(0, Math.min(3, herbs.length)).map(h => h.herb_id)
  );

  if (herbs.length < 2) return null;

  const compared = herbs.filter(h => selected.includes(h.herb_id));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-lg hover:bg-ayurv-primary/5 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
        Compare Herbs
      </button>

      {/* comparison modal */}
      {open && (
        <CompareModal
          herbs={herbs}
          compared={compared}
          selected={selected}
          setSelected={setSelected}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// extracted modal for proper hooks usage
function CompareModal({
  herbs,
  compared,
  selected,
  setSelected,
  onClose,
}: {
  herbs: ComparableHerb[];
  compared: ComparableHerb[];
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // body scroll lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // auto-focus close button
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="herb-compare-title">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
            {/* header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 id="herb-compare-title" className="text-lg font-bold text-gray-900">Compare Herbs</h2>
              <button
                ref={closeRef}
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                aria-label="Close comparison"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* herb selector */}
            <div className="px-5 py-3 border-b border-gray-50">
              <p className="text-xs text-gray-500 mb-2">Select herbs to compare (max 3):</p>
              <div className="flex flex-wrap gap-2">
                {herbs.map(h => (
                  <button
                    key={h.herb_id}
                    onClick={() => {
                      setSelected(prev =>
                        prev.includes(h.herb_id)
                          ? prev.filter(id => id !== h.herb_id)
                          : prev.length < 3
                            ? [...prev, h.herb_id]
                            : prev
                      );
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                      selected.includes(h.herb_id)
                        ? "bg-ayurv-primary text-white border-ayurv-primary"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-ayurv-primary/30"
                    }`}
                  >
                    {h.herb_name}
                  </button>
                ))}
              </div>
            </div>

            {/* comparison table */}
            {compared.length >= 2 ? (
              <div className="p-5">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">Property</th>
                        {compared.map(h => (
                          <th key={h.herb_id} className="text-left py-2 px-2">
                            <span className="font-bold text-gray-900">{h.herb_name}</span>
                            {isCaution(h) && (
                              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded">CAUTION</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {/* evidence grade */}
                      <tr>
                        <td className="py-3 pr-4 text-xs font-semibold text-gray-500">Evidence</td>
                        {compared.map(h => (
                          <td key={h.herb_id} className="py-3 px-2">
                            {h.evidence_grade ? (
                              <span className={`px-2 py-0.5 text-xs font-bold rounded ${gradeColor(h.evidence_grade)}`}>
                                Grade {h.evidence_grade}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">N/A</span>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* matching claims */}
                      <tr>
                        <td className="py-3 pr-4 text-xs font-semibold text-gray-500">Benefits</td>
                        {compared.map(h => (
                          <td key={h.herb_id} className="py-3 px-2">
                            <ul className="space-y-1">
                              {h.matching_claims.slice(0, 3).map((c, i) => (
                                <li key={i} className="text-xs text-gray-700 flex items-start gap-1">
                                  <span className="text-risk-green mt-0.5 shrink-0">+</span>
                                  {c.claim}
                                </li>
                              ))}
                            </ul>
                          </td>
                        ))}
                      </tr>

                      {/* safety */}
                      <tr>
                        <td className="py-3 pr-4 text-xs font-semibold text-gray-500">Safety</td>
                        {compared.map(h => (
                          <td key={h.herb_id} className="py-3 px-2">
                            {isCaution(h) ? (
                              <div className="space-y-1">
                                {h.cautions.slice(0, 2).map((c, i) => (
                                  <p key={i} className="text-xs text-amber-700 flex items-start gap-1">
                                    <span className="shrink-0">!</span>
                                    {c.explanation.slice(0, 80)}{c.explanation.length > 80 ? "..." : ""}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-risk-green font-medium">{h.safety_note || "No known concerns"}</p>
                            )}
                          </td>
                        ))}
                      </tr>

                      {/* dosage */}
                      <tr>
                        <td className="py-3 pr-4 text-xs font-semibold text-gray-500">Dosage</td>
                        {compared.map(h => (
                          <td key={h.herb_id} className="py-3 px-2">
                            {h.dosage?.forms?.slice(0, 2).map((f, i) => (
                              <p key={i} className="text-xs text-gray-600">
                                <span className="font-medium capitalize">{f.form}:</span> {f.range_min}–{f.range_max} {f.unit}
                              </p>
                            )) || <span className="text-xs text-gray-400">Not available</span>}
                          </td>
                        ))}
                      </tr>

                      {/* relevance */}
                      <tr>
                        <td className="py-3 pr-4 text-xs font-semibold text-gray-500">Relevance</td>
                        {compared.map(h => (
                          <td key={h.herb_id} className="py-3 px-2">
                            <p className="text-xs text-gray-600">{h.relevance_summary}</p>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* verdict */}
                <div className="mt-4 bg-ayurv-primary/5 border border-ayurv-primary/10 rounded-xl p-4">
                  <p className="text-xs font-semibold text-ayurv-primary mb-1">Quick Take</p>
                  <p className="text-sm text-gray-700">
                    {(() => {
                      const sorted = [...compared].sort((a, b) => {
                        const aGrade = GRADE_ORDER[a.evidence_grade || "D"] || 6;
                        const bGrade = GRADE_ORDER[b.evidence_grade || "D"] || 6;
                        if (aGrade !== bGrade) return aGrade - bGrade;
                        // caution herbs rank lower
                        return (isCaution(a) ? 1 : 0) - (isCaution(b) ? 1 : 0);
                      });
                      const best = sorted[0];
                      const hasCautions = compared.some(isCaution);
                      return `${best.herb_name} has the strongest evidence (Grade ${best.evidence_grade || "N/A"})${
                        hasCautions ? ". Some herbs need doctor guidance — check warnings." : " with no known concerns for your profile."
                      }`;
                    })()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-500">
                Select at least 2 herbs to compare.
              </div>
            )}
          </div>
        </div>
  );
}
