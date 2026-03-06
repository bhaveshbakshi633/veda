"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { EvidenceClaimRow } from "@/lib/types";
import { GRADE_COLORS, GRADE_EXPLANATIONS } from "@/lib/constants";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedHerbId, setLastFetchedHerbId] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // fetch evidence data (cache by herbId — only refetch if herb changes)
  useEffect(() => {
    if (!open || herbId === lastFetchedHerbId) return;

    setLoading(true);
    setError(null);

    fetch(`/api/evidence?herb_id=${encodeURIComponent(herbId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch evidence");
        return res.json();
      })
      .then((data: EvidenceClaimRow[]) => {
        setClaims(data);
        setLastFetchedHerbId(herbId);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [open, herbId, lastFetchedHerbId]);

  // body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // auto-focus close button when drawer opens
  useEffect(() => {
    if (open) {
      // small delay to allow transition to start
      const timer = setTimeout(() => closeButtonRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // escape key handler
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // focus trap
  const handleFocusTrap = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleFocusTrap);
    return () => document.removeEventListener("keydown", handleFocusTrap);
  }, [open, handleFocusTrap]);

  // grade-to-border-color for visual hierarchy (P2-9)
  const gradeBorderColor = (grade: string): string => {
    const map: Record<string, string> = {
      A: "border-l-emerald-500",
      B: "border-l-blue-500",
      "B-C": "border-l-sky-500",
      C: "border-l-amber-500",
      "C-D": "border-l-orange-500",
      D: "border-l-gray-400",
    };
    return map[grade] || "border-l-gray-300";
  };

  return (
    <>
      {/* backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* drawer panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-drawer-title"
        aria-hidden={!open}
        className={`fixed inset-x-0 bottom-0 sm:inset-auto sm:right-0 sm:top-0 sm:bottom-0 z-50 bg-white w-full sm:max-w-lg sm:shadow-xl max-h-[85vh] sm:max-h-full overflow-y-auto rounded-t-2xl sm:rounded-none transition-transform duration-300 ease-out ${
          open
            ? "translate-y-0 sm:translate-x-0"
            : "translate-y-full sm:translate-y-0 sm:translate-x-full"
        }`}
        // prevent interaction when hidden
        {...(!open && { tabIndex: -1 })}
      >
        {/* header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-none z-10">
          <h2
            id="evidence-drawer-title"
            className="text-lg font-semibold text-gray-900"
          >
            Evidence: {herbName}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded focus:outline-none focus:ring-2 focus:ring-ayurv-primary"
            aria-label="Close evidence drawer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* content — aria-live for dynamic updates */}
        <div className="px-5 py-4 space-y-5" aria-live="polite">
          {loading && (
            <div
              className="flex items-center justify-center py-8"
              role="status"
            >
              <div className="animate-pulse text-gray-400 text-sm">
                Loading evidence...
              </div>
            </div>
          )}

          {error && (
            <div
              className="text-sm text-red-600 bg-red-50 rounded-lg p-3"
              role="alert"
            >
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
                className={`border border-gray-200 border-l-4 ${gradeBorderColor(claim.evidence_grade)} rounded-lg p-4 space-y-2`}
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
            className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-ayurv-primary"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
