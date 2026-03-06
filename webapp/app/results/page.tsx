"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RiskAssessment } from "@/lib/types";
import EmergencyOverlay from "@/components/EmergencyOverlay";
import WarningBanner from "@/components/WarningBanner";
import EvidenceDrawer from "@/components/EvidenceDrawer";
import DoctorCard from "@/components/DoctorCard";
import DownloadReport from "@/components/DownloadReport";
// assessment auto-saved server-side in /api/assess — no client-side save needed
import {
  BlockedHerbCard,
  CautionHerbCard,
  SafeHerbCard,
} from "@/components/HerbCard";

// 1-line plain English summary based on assessment counts
function getSummary(result: RiskAssessment): string {
  const { blocked_herbs, caution_herbs, safe_herbs } = result;
  const total = blocked_herbs.length + caution_herbs.length + safe_herbs.length;

  // edge case: no herbs evaluated
  if (total === 0) {
    return "No herbs were evaluated. Please try a new assessment.";
  }

  if (blocked_herbs.length === 0 && caution_herbs.length === 0) {
    return `All ${safe_herbs.length} herbs appear safe for your profile. Tap any herb for details.`;
  }

  if (blocked_herbs.length > 0 && caution_herbs.length > 0) {
    return `${blocked_herbs.length} herb${blocked_herbs.length > 1 ? "s" : ""} not recommended for you, ${caution_herbs.length} need caution. ${safe_herbs.length} appear safe.`;
  }

  if (blocked_herbs.length > 0) {
    return `${blocked_herbs.length} herb${blocked_herbs.length > 1 ? "s" : ""} not recommended due to your health profile. ${safe_herbs.length} appear safe.`;
  }

  return `${caution_herbs.length} herb${caution_herbs.length > 1 ? "s" : ""} need caution with your profile. ${safe_herbs.length} appear safe.`;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerHerb, setDrawerHerb] = useState<{ id: string; name: string } | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAllBlocked, setShowAllBlocked] = useState(false);
  const [showAllCaution, setShowAllCaution] = useState(false);
  const [showAllSafe, setShowAllSafe] = useState(false);
  const INITIAL_SHOW = 3;

  useEffect(() => {
    const disc = sessionStorage.getItem("ayurv_disclaimer");
    if (!disc) {
      router.replace("/");
      return;
    }

    const stored = sessionStorage.getItem("ayurv_result");
    if (!stored) {
      router.replace("/intake");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as RiskAssessment;
      setResult(parsed);
    } catch {
      router.replace("/intake");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // scroll-to-top visibility (P2-3)
  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 600);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-[50vh]"
        role="status"
        aria-live="polite"
      >
        <div className="animate-pulse text-gray-400 text-sm">
          Loading results...
        </div>
      </div>
    );
  }

  if (!result) return null;

  // EMERGENCY ESCALATION — full-screen overlay, no herb info
  if (result.status === "EMERGENCY_ESCALATION") {
    return (
      <EmergencyOverlay
        message={result.emergency_message || ""}
        flags={result.red_flags_triggered || []}
      />
    );
  }

  const totalHerbs =
    result.blocked_herbs.length +
    result.caution_herbs.length +
    result.safe_herbs.length;

  // check if doctor card should show (medication interactions present)
  const hasMedInteractions = result.caution_herbs.some((h) =>
    h.cautions.some((c) => c.type === "medication_interaction")
  );
  const showDoctorCard =
    result.doctor_referral_suggested || hasMedInteractions;

  function handleEvidenceClick(herbId: string, herbName: string) {
    setDrawerHerb({ id: herbId, name: herbName });
  }

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* 1. Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ayurv-primary mb-1">
          Your Safety Report
        </h1>
        <p className="text-sm text-gray-500">
          {totalHerbs} herbs evaluated against your health profile
        </p>
      </div>

      {/* 2. Quick Summary Card */}
      <div className="bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-800">{getSummary(result)}</p>
      </div>

      {/* 3. Doctor Referral Banner */}
      {result.doctor_referral_suggested && (
        <WarningBanner
          blockedCount={result.blocked_herbs.length}
          cautionCount={result.caution_herbs.length}
        />
      )}

      {/* 4. Summary Chips */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {result.blocked_herbs.length > 0 && (
          <div className="flex items-center gap-2 bg-risk-red-light border border-risk-red/20 rounded-lg px-3 py-2">
            <span className="w-3 h-3 bg-risk-red rounded-full" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-800">
              {result.blocked_herbs.length} Not Safe
            </span>
          </div>
        )}
        {result.caution_herbs.length > 0 && (
          <div className="flex items-center gap-2 bg-risk-amber-light border border-risk-amber/20 rounded-lg px-3 py-2">
            <span className="w-3 h-3 bg-risk-amber rounded-full" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-800">
              {result.caution_herbs.length} Caution
            </span>
          </div>
        )}
        {result.safe_herbs.length > 0 && (
          <div className="flex items-center gap-2 bg-risk-green-light border border-risk-green/20 rounded-lg px-3 py-2">
            <span className="w-3 h-3 bg-risk-green rounded-full" aria-hidden="true" />
            <span className="text-sm font-medium text-gray-800">
              {result.safe_herbs.length} Safe
            </span>
          </div>
        )}
      </div>

      {/* 5. Doctor Interaction Summary Card */}
      {showDoctorCard && <DoctorCard result={result} />}

      {/* 6. BLOCKED HERBS (RED) */}
      {result.blocked_herbs.length > 0 && (
        <section className="mb-8" aria-labelledby="blocked-heading">
          <h2
            id="blocked-heading"
            className="text-lg font-semibold text-risk-red mb-3 flex items-center gap-2"
          >
            <span className="w-3 h-3 bg-risk-red rounded-full" aria-hidden="true" />
            Not Safe For You
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            These herbs have known risks with your conditions or medications. We
            do not show dosage for blocked herbs.
          </p>
          <div className="space-y-3">
            {(showAllBlocked ? result.blocked_herbs : result.blocked_herbs.slice(0, INITIAL_SHOW)).map((herb) => (
              <BlockedHerbCard key={herb.herb_id} herb={herb} />
            ))}
          </div>
          {!showAllBlocked && result.blocked_herbs.length > INITIAL_SHOW && (
            <button
              onClick={() => setShowAllBlocked(true)}
              className="mt-3 w-full py-2.5 text-sm font-medium text-risk-red border border-risk-red/20 rounded-xl hover:bg-risk-red-light transition-colors"
            >
              Show {result.blocked_herbs.length - INITIAL_SHOW} more blocked herb{result.blocked_herbs.length - INITIAL_SHOW > 1 ? "s" : ""}
            </button>
          )}
        </section>
      )}

      {/* 7. CAUTION HERBS (YELLOW) */}
      {result.caution_herbs.length > 0 && (
        <section className="mb-8" aria-labelledby="caution-heading">
          <h2
            id="caution-heading"
            className="text-lg font-semibold text-risk-amber mb-3 flex items-center gap-2"
          >
            <span className="w-3 h-3 bg-risk-amber rounded-full" aria-hidden="true" />
            Use With Doctor Guidance
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            These herbs may interact with your profile. Read each warning.
            Discuss with your doctor before use.
          </p>
          <div className="space-y-3">
            {(showAllCaution ? result.caution_herbs : result.caution_herbs.slice(0, INITIAL_SHOW)).map((herb) => (
              <CautionHerbCard
                key={herb.herb_id}
                herb={herb}
                onEvidenceClick={handleEvidenceClick}
              />
            ))}
          </div>
          {!showAllCaution && result.caution_herbs.length > INITIAL_SHOW && (
            <button
              onClick={() => setShowAllCaution(true)}
              className="mt-3 w-full py-2.5 text-sm font-medium text-risk-amber border border-risk-amber/20 rounded-xl hover:bg-risk-amber-light transition-colors"
            >
              Show {result.caution_herbs.length - INITIAL_SHOW} more caution herb{result.caution_herbs.length - INITIAL_SHOW > 1 ? "s" : ""}
            </button>
          )}
        </section>
      )}

      {/* 8. SAFE HERBS (GREEN) */}
      {result.safe_herbs.length > 0 && (
        <section className="mb-8" aria-labelledby="safe-heading">
          <h2
            id="safe-heading"
            className="text-lg font-semibold text-risk-green mb-3 flex items-center gap-2"
          >
            <span className="w-3 h-3 bg-risk-green rounded-full" aria-hidden="true" />
            Lower Risk For Your Profile
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            No known contraindications for your profile. Sorted by strength of
            clinical evidence.
          </p>
          <div className="space-y-3">
            {(showAllSafe ? result.safe_herbs : result.safe_herbs.slice(0, INITIAL_SHOW)).map((herb) => (
              <SafeHerbCard
                key={herb.herb_id}
                herb={herb}
                onEvidenceClick={handleEvidenceClick}
              />
            ))}
          </div>
          {!showAllSafe && result.safe_herbs.length > INITIAL_SHOW && (
            <button
              onClick={() => setShowAllSafe(true)}
              className="mt-3 w-full py-2.5 text-sm font-medium text-risk-green border border-risk-green/20 rounded-xl hover:bg-risk-green-light transition-colors"
            >
              Show {result.safe_herbs.length - INITIAL_SHOW} more safe herb{result.safe_herbs.length - INITIAL_SHOW > 1 ? "s" : ""}
            </button>
          )}
        </section>
      )}

      {/* 9. Disclaimer + New Assessment */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <p className="text-xs text-gray-400 mb-4">{result.disclaimer}</p>
        <div className="flex gap-3 flex-wrap">
          <DownloadReport result={result} />
          <button
            onClick={() => {
              sessionStorage.removeItem("ayurv_result");
              router.push("/intake");
            }}
            className="px-4 py-2 text-sm font-medium text-ayurv-primary border border-ayurv-primary rounded-lg hover:bg-ayurv-primary hover:text-white transition-colors"
          >
            New Assessment
          </button>
          <button
            onClick={() => {
              sessionStorage.clear();
              router.push("/");
            }}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Start Over
          </button>
        </div>
      </div>

      {/* Floating Chat Button — above footer */}
      <button
        onClick={() => router.push("/chat")}
        className="fixed bottom-16 right-4 sm:bottom-20 sm:right-6 bg-ayurv-primary text-white rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg flex items-center justify-center hover:bg-ayurv-secondary transition-colors z-40"
        aria-label="Chat with consultant"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          />
        </svg>
      </button>

      {/* Scroll-to-top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-16 left-4 sm:bottom-20 sm:left-6 bg-white text-gray-600 rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors z-40 border border-gray-200"
          aria-label="Scroll to top"
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
              d="M4.5 15.75l7.5-7.5 7.5 7.5"
            />
          </svg>
        </button>
      )}

      {/* Evidence Drawer — always mounted for animation support */}
      <EvidenceDrawer
        open={!!drawerHerb}
        onClose={() => setDrawerHerb(null)}
        herbId={drawerHerb?.id || ""}
        herbName={drawerHerb?.name || ""}
      />
    </div>
  );
}
