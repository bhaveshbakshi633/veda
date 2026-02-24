"use client";

import { useState, useEffect } from "react";
import type { EvidenceClaimRow, EvidenceGrade } from "@/lib/types";

// grade badge colors — reuse same palette as HerbCard
const GRADE_COLORS: Record<string, string> = {
  A: "bg-emerald-100 text-emerald-800",
  B: "bg-blue-100 text-blue-800",
  "B-C": "bg-sky-100 text-sky-800",
  C: "bg-amber-100 text-amber-800",
  "C-D": "bg-orange-100 text-orange-800",
  D: "bg-gray-100 text-gray-600",
};

// plain English explanations per grade
const GRADE_EXPLANATIONS: Record<string, string> = {
  A: "Strong evidence from multiple large clinical trials or meta-analyses.",
  B: "Moderate evidence from smaller clinical studies. Promising but needs larger trials.",
  "B-C":
    "Moderate to limited evidence. Some clinical data supplemented by preclinical studies.",
  C: "Limited evidence. Mainly laboratory or animal studies. Human data is sparse.",
  "C-D":
    "Very limited evidence. Mostly preclinical with anecdotal clinical reports.",
  D: "Based on traditional Ayurvedic texts only. No clinical studies available.",
};

interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  herbId: string;
  herbName: string;
}

export default function EvidenceDrawer({
  open,
  onClose,
  herbId,
  herbName,
}: EvidenceDrawerProps) {
  const [claims, setClaims] = useState<EvidenceClaimRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setError(null);

    fetch(`/api/evidence?herb_id=${encodeURIComponent(herbId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch evidence");
        return res.json();
      })
      .then((data: EvidenceClaimRow[]) => {
        setClaims(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [open, herbId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* drawer panel — slides up on mobile, centered on desktop */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-lg rounded-t-2xl max-h-[85vh] overflow-y-auto shadow-xl">
        {/* header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">
            Evidence: {herbName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* content */}
        <div className="px-5 py-4 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-gray-400 text-sm">
                Loading evidence...
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
              Could not load evidence data. Try again later.
            </div>
          )}

          {!loading && !error && claims.length === 0 && (
            <p className="text-sm text-gray-500 py-4">
              No evidence claims found for this herb.
            </p>
          )}

          {!loading &&
            !error &&
            claims.map((claim) => (
              <div
                key={claim.id}
                className="border border-gray-200 rounded-lg p-4 space-y-2"
              >
                {/* grade badge + claim */}
                <div className="flex items-start gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded shrink-0 ${GRADE_COLORS[claim.evidence_grade] || "bg-gray-100 text-gray-600"}`}
                  >
                    Grade {claim.evidence_grade}
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {claim.claim}
                  </p>
                </div>

                {/* summary */}
                <p className="text-sm text-gray-700">{claim.summary}</p>

                {/* mechanism */}
                {claim.mechanism && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Mechanism
                    </p>
                    <p className="text-xs text-gray-600">{claim.mechanism}</p>
                  </div>
                )}

                {/* active compounds */}
                {claim.active_compounds && claim.active_compounds.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Active Compounds
                    </p>
                    <p className="text-xs text-gray-600">
                      {claim.active_compounds.join(", ")}
                    </p>
                  </div>
                )}

                {/* key references */}
                {claim.key_references && claim.key_references.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500">
                      Key References
                    </p>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {claim.key_references.map((ref, i) => (
                        <li key={i}>
                          {ref.author} {ref.year}, {ref.journal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* grade explanation */}
                <div className="bg-gray-50 rounded p-2.5 mt-2">
                  <p className="text-xs font-medium text-gray-500">
                    What does Grade {claim.evidence_grade} mean?
                  </p>
                  <p className="text-xs text-gray-600">
                    {GRADE_EXPLANATIONS[claim.evidence_grade] ||
                      "Grade information not available."}
                  </p>
                </div>
              </div>
            ))}
        </div>

        {/* footer close button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-5 py-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
