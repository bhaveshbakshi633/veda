"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { RiskAssessment } from "@/lib/types";
import EmergencyOverlay from "@/components/EmergencyOverlay";
import WarningBanner from "@/components/WarningBanner";
import EvidenceDrawer from "@/components/EvidenceDrawer";
import DoctorCard from "@/components/DoctorCard";
import DownloadReport from "@/components/DownloadReport";
import { trackEvent } from "@/lib/track";
import {
  RecommendedHerbCard,
  CautionHerbCard,
  AvoidHerbCard,
} from "@/components/HerbCard";

// plain English summary
function getSummary(result: RiskAssessment): string {
  const { recommended_herbs, caution_herbs, avoid_herbs } = result;
  const total = recommended_herbs.length + caution_herbs.length + avoid_herbs.length;

  if (total === 0) {
    return `No herbs in our database have clinical evidence for ${result.concern_label}. Try selecting a different concern.`;
  }

  if (avoid_herbs.length === 0 && caution_herbs.length === 0) {
    return `We found ${recommended_herbs.length} herb${recommended_herbs.length > 1 ? "s" : ""} with evidence for ${result.concern_label} that appear safe for your profile.`;
  }

  const parts: string[] = [];
  if (recommended_herbs.length > 0) {
    parts.push(`${recommended_herbs.length} recommended`);
  }
  if (caution_herbs.length > 0) {
    parts.push(`${caution_herbs.length} usable with caution`);
  }
  if (avoid_herbs.length > 0) {
    parts.push(`${avoid_herbs.length} to avoid`);
  }

  return `For ${result.concern_label}: ${parts.join(", ")}. Ranked by strength of clinical evidence.`;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerHerb, setDrawerHerb] = useState<{ id: string; name: string } | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
      trackEvent("assessment_viewed", {
        recommended: parsed.recommended_herbs.length,
        caution: parsed.caution_herbs.length,
        avoid: parsed.avoid_herbs.length,
      });
    } catch {
      router.replace("/intake");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 600);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-live="polite">
        <div className="animate-pulse text-gray-400 text-sm">Loading results...</div>
      </div>
    );
  }

  if (!result) return null;

  // EMERGENCY ESCALATION
  if (result.status === "EMERGENCY_ESCALATION") {
    return (
      <EmergencyOverlay
        message={result.emergency_message || ""}
        flags={result.red_flags_triggered || []}
      />
    );
  }

  // check if doctor card should show
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
      {/* 1. Header — concern-focused */}
      <div className="mb-6">
        <p className="text-sm text-ayurv-primary font-medium mb-1">
          Personalized for your health profile
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Herbs for {result.concern_label}
        </h1>
        <p className="text-sm text-gray-500">
          {result.total_relevant} herb{result.total_relevant !== 1 ? "s" : ""} with clinical evidence, checked against your conditions & medications
        </p>
      </div>

      {/* 2. Quick Summary Card */}
      <div className="bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-xl p-4 mb-6">
        <p className="text-sm text-gray-800">{getSummary(result)}</p>
      </div>

      {/* 3. Doctor Referral Banner */}
      {result.doctor_referral_suggested && (
        <WarningBanner
          blockedCount={result.avoid_herbs.length}
          cautionCount={result.caution_herbs.length}
        />
      )}

      {/* 4. NO MATCHES state */}
      {result.status === "NO_MATCHES" && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center mb-8">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            No herbs found for {result.concern_label}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Our database doesn&apos;t have clinical evidence linking herbs to this specific concern yet.
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem("ayurv_result");
              router.push("/intake");
            }}
            className="px-6 py-2.5 bg-ayurv-primary text-white rounded-xl text-sm font-semibold hover:bg-ayurv-secondary transition-colors"
          >
            Try a Different Concern
          </button>
        </div>
      )}

      {/* 5. RECOMMENDED HERBS (GREEN — top picks) */}
      {result.recommended_herbs.length > 0 && (
        <section className="mb-8" aria-labelledby="recommended-heading">
          <h2
            id="recommended-heading"
            className="text-lg font-semibold text-risk-green mb-1 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Recommended For You
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Safe for your profile, ranked by strength of clinical evidence for {result.concern_label.toLowerCase()}.
          </p>
          <div className="space-y-3">
            {result.recommended_herbs.map((herb, i) => (
              <RecommendedHerbCard
                key={herb.herb_id}
                herb={herb}
                rank={i + 1}
                onEvidenceClick={handleEvidenceClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. CAUTION HERBS (YELLOW) */}
      {result.caution_herbs.length > 0 && (
        <section className="mb-8" aria-labelledby="caution-heading">
          <h2
            id="caution-heading"
            className="text-lg font-semibold text-risk-amber mb-1 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            Use With Doctor Guidance
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Evidence exists for your concern, but these herbs have warnings for your profile. Discuss with your doctor.
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

      {/* 7. AVOID HERBS (RED) */}
      {result.avoid_herbs.length > 0 && (
        <section className="mb-8" aria-labelledby="avoid-heading">
          <h2
            id="avoid-heading"
            className="text-lg font-semibold text-risk-red mb-1 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Not Safe For You
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            These herbs could help with {result.concern_label.toLowerCase()} but conflict with your health profile.
          </p>
          <div className="space-y-3">
            {result.avoid_herbs.map((herb) => (
              <AvoidHerbCard key={herb.herb_id} herb={herb} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Doctor Interaction Summary Card */}
      {showDoctorCard && <DoctorCard result={result} />}

      {/* 9. Disclaimer + Actions */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <p className="text-xs text-gray-400 mb-4">{result.disclaimer}</p>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => router.push("/chat")}
            className="px-5 py-2.5 text-sm font-semibold bg-ayurv-primary text-white rounded-lg hover:bg-ayurv-secondary transition-colors shadow-sm"
          >
            Back to Chat
          </button>
          <DownloadReport result={result} />
          <button
            onClick={() => {
              const safe = result.recommended_herbs.map(h => h.herb_name).join(", ");
              const avoid = result.avoid_herbs.map(h => h.herb_name).join(", ");
              const text = `Ayurv Herb Safety Report\n\nConcern: ${result.concern_label}\nSafe herbs: ${safe || "none"}\nAvoid: ${avoid || "none"}\n\nCheck your herbs: https://webapp-self-rho.vercel.app`;
              const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
              window.open(url, "_blank");
              trackEvent("report_shared", { method: "whatsapp" });
            }}
            className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.75.75 0 00.917.918l4.462-1.496A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.347 0-4.522-.8-6.243-2.142l-.436-.364-3.03 1.015 1.015-3.03-.364-.436A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            Share
          </button>
          <button
            onClick={async () => {
              const safe = result.recommended_herbs.map(h => h.herb_name).join(", ");
              const avoid = result.avoid_herbs.map(h => h.herb_name).join(", ");
              const text = `Ayurv Herb Safety Report\n\nConcern: ${result.concern_label}\nSafe: ${safe || "none"}\nAvoid: ${avoid || "none"}\n\nCheck yours: https://webapp-self-rho.vercel.app`;
              if (navigator.share) {
                await navigator.share({ title: "Ayurv Safety Report", text });
                trackEvent("report_shared", { method: "native_share" });
              } else {
                await navigator.clipboard.writeText(text);
                trackEvent("report_shared", { method: "clipboard" });
                alert("Report copied to clipboard!");
              }
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
            Copy
          </button>
          <button
            onClick={() => {
              trackEvent("new_assessment_started", { from: "results" });
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

      {/* Scroll-to-top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-16 left-4 sm:bottom-20 sm:left-6 bg-white text-gray-600 rounded-full w-10 h-10 shadow-md flex items-center justify-center hover:bg-gray-100 transition-colors z-40 border border-gray-200"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Evidence Drawer */}
      <EvidenceDrawer
        open={!!drawerHerb}
        onClose={() => setDrawerHerb(null)}
        herbId={drawerHerb?.id || ""}
        herbName={drawerHerb?.name || ""}
      />
    </div>
  );
}
