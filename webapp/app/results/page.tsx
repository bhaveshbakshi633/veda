"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RiskAssessment } from "@/lib/types";
import EmergencyOverlay from "@/components/EmergencyOverlay";
import WarningBanner from "@/components/WarningBanner";
import {
  BlockedHerbCard,
  CautionHerbCard,
  SafeHerbCard,
} from "@/components/HerbCard";

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ayurv-primary mb-1">
          Your Risk Assessment
        </h1>
        <p className="text-sm text-gray-500">
          {totalHerbs} herbs evaluated against your health profile
        </p>
      </div>

      {/* Doctor Referral Banner */}
      {result.doctor_referral_suggested && (
        <WarningBanner
          blockedCount={result.blocked_herbs.length}
          cautionCount={result.caution_herbs.length}
        />
      )}

      {/* Summary Chips */}
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

      {/* BLOCKED HERBS (RED) */}
      {result.blocked_herbs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-risk-red mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-risk-red rounded-full" />
            Not Recommended For You
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            These herbs have specific risks given your health profile. No dosage
            information is provided.
          </p>
          <div className="space-y-3">
            {result.blocked_herbs.map((herb) => (
              <BlockedHerbCard key={herb.herb_id} herb={herb} />
            ))}
          </div>
        </section>
      )}

      {/* CAUTION HERBS (YELLOW) */}
      {result.caution_herbs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-risk-amber mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-risk-amber rounded-full" />
            Use With Caution
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            These herbs have moderate concerns. Read each caution carefully.
            Professional guidance recommended.
          </p>
          <div className="space-y-3">
            {result.caution_herbs.map((herb) => (
              <CautionHerbCard key={herb.herb_id} herb={herb} />
            ))}
          </div>
        </section>
      )}

      {/* SAFE HERBS (GREEN) */}
      {result.safe_herbs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-risk-green mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-risk-green rounded-full" />
            Generally Safe For You
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            No specific contraindications found. Sorted by evidence relevance to
            your concern.
          </p>
          <div className="space-y-3">
            {result.safe_herbs.map((herb) => (
              <SafeHerbCard key={herb.herb_id} herb={herb} />
            ))}
          </div>
        </section>
      )}

      {/* Disclaimer + New Assessment */}
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
    </div>
  );
}
