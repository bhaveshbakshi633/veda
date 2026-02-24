"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RiskAssessment } from "@/lib/types";
import EmergencyOverlay from "@/components/EmergencyOverlay";
import WarningBanner from "@/components/WarningBanner";
import EvidenceDrawer from "@/components/EvidenceDrawer";
import {
  BlockedHerbCard,
  CautionHerbCard,
  SafeHerbCard,
} from "@/components/HerbCard";

// 1-line plain English summary based on assessment counts
function getSummary(result: RiskAssessment): string {
  const { blocked_herbs, caution_herbs, safe_herbs } = result;

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
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

  function handleEvidenceClick(herbId: string, herbName: string) {
    setDrawerHerb({ id: herbId, name: herbName });
  }

  return (
    <div className="max-w-3xl mx-auto">
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
            <span className="w-3 h-3 bg-risk-red rounded-full" />
            <span className="text-sm font-medium text-gray-800">
              {result.blocked_herbs.length} Blocked
            </span>
          </div>
        )}
        {result.caution_herbs.length > 0 && (
          <div className="flex items-center gap-2 bg-risk-amber-light border border-risk-amber/20 rounded-lg px-3 py-2">
            <span className="w-3 h-3 bg-risk-amber rounded-full" />
            <span className="text-sm font-medium text-gray-800">
              {result.caution_herbs.length} Caution
            </span>
          </div>
        )}
        {result.safe_herbs.length > 0 && (
          <div className="flex items-center gap-2 bg-risk-green-light border border-risk-green/20 rounded-lg px-3 py-2">
            <span className="w-3 h-3 bg-risk-green rounded-full" />
            <span className="text-sm font-medium text-gray-800">
              {result.safe_herbs.length} Safe
            </span>
          </div>
        )}
      </div>

      {/* 5. Chat CTA — moved up, directly after chips */}
      <div className="bg-ayurv-primary/5 border border-ayurv-primary/20 rounded-lg p-5 mb-8">
        <h3 className="font-semibold text-ayurv-primary mb-1">
          Want to understand your results?
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          Ask the Ayurv consultant about specific herbs, dosages, or
          interactions — it knows your health profile.
        </p>
        <button
          onClick={() => router.push("/chat")}
          className="px-5 py-2.5 bg-ayurv-primary text-white rounded-lg text-sm font-medium hover:bg-ayurv-secondary transition-colors"
        >
          Ask About My Results
        </button>
      </div>

      {/* 6. BLOCKED HERBS (RED) */}
      {result.blocked_herbs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-risk-red mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-risk-red rounded-full" />
            Not Safe For You
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            These herbs have known risks with your conditions or medications. We
            do not show dosage for blocked herbs.
          </p>
          <div className="space-y-3">
            {result.blocked_herbs.map((herb) => (
              <BlockedHerbCard key={herb.herb_id} herb={herb} />
            ))}
          </div>
        </section>
      )}

      {/* 7. CAUTION HERBS (YELLOW) */}
      {result.caution_herbs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-risk-amber mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-risk-amber rounded-full" />
            Use With Doctor Guidance
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            These herbs may interact with your profile. Read each warning.
            Discuss with your doctor before use.
          </p>
          <div className="space-y-3">
            {result.caution_herbs.map((herb) => (
              <CautionHerbCard
                key={herb.herb_id}
                herb={herb}
                onEvidenceClick={handleEvidenceClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* 8. SAFE HERBS (GREEN) */}
      {result.safe_herbs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-risk-green mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-risk-green rounded-full" />
            Lower Risk For Your Profile
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            No known contraindications for your profile. Sorted by strength of
            clinical evidence.
          </p>
          <div className="space-y-3">
            {result.safe_herbs.map((herb) => (
              <SafeHerbCard
                key={herb.herb_id}
                herb={herb}
                onEvidenceClick={handleEvidenceClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* 9. Disclaimer + New Assessment */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <p className="text-xs text-gray-400 mb-4">{result.disclaimer}</p>
        <div className="flex gap-3">
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

      {/* Floating Chat Button */}
      <button
        onClick={() => router.push("/chat")}
        className="fixed bottom-6 right-6 bg-ayurv-primary text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:bg-ayurv-secondary transition-colors z-50"
        aria-label="Chat with consultant"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          />
        </svg>
      </button>

      {/* Evidence Drawer */}
      {drawerHerb && (
        <EvidenceDrawer
          open={!!drawerHerb}
          onClose={() => setDrawerHerb(null)}
          herbId={drawerHerb.id}
          herbName={drawerHerb.name}
        />
      )}
    </div>
  );
}
