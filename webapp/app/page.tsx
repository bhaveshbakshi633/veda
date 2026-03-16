"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateUid, hasAcceptedDisclaimer, saveDisclaimerAccepted } from "@/lib/storage";
import { createInitialFormState, type IntakeFormState } from "@/components/intake/constants";
import StepAbout from "@/components/intake/StepAbout";
import StepHealth from "@/components/intake/StepHealth";
import StepConcern from "@/components/intake/StepConcern";
import { trackEvent } from "@/lib/track";
import type { RiskAssessment } from "@/lib/types";
import {
  RecommendedHerbCard,
  CautionHerbCard,
  AvoidHerbCard,
} from "@/components/HerbCard";
import EvidenceDrawer from "@/components/EvidenceDrawer";
import WarningBanner from "@/components/WarningBanner";
import DoctorCard from "@/components/DoctorCard";

// ─── phases — linear, no going back to separate pages ───
type Phase =
  | "welcome"      // hero + disclaimer
  | "about"        // step 1: age, sex, pregnancy, red flags
  | "health"       // step 2: conditions, medications, herbs
  | "concern"      // step 3: pick concern
  | "submitting"   // API call in progress
  | "results";     // assessment results inline

const PHASE_ORDER: Phase[] = ["welcome", "about", "health", "concern", "submitting", "results"];

function phaseIndex(phase: Phase): number {
  return PHASE_ORDER.indexOf(phase);
}

// progress percentage for the top bar
function getProgress(phase: Phase): number {
  const map: Record<Phase, number> = {
    welcome: 0,
    about: 25,
    health: 50,
    concern: 75,
    submitting: 90,
    results: 100,
  };
  return map[phase];
}

// ─── result summary ───
function getSummary(result: RiskAssessment): string {
  const { recommended_herbs, caution_herbs, avoid_herbs } = result;
  const total = recommended_herbs.length + caution_herbs.length + avoid_herbs.length;
  if (total === 0) return `No herbs with clinical evidence found for ${result.concern_label}.`;
  if (avoid_herbs.length === 0 && caution_herbs.length === 0) {
    return `${recommended_herbs.length} herb${recommended_herbs.length > 1 ? "s" : ""} found safe for your profile for ${result.concern_label}.`;
  }
  const parts: string[] = [];
  if (recommended_herbs.length > 0) parts.push(`${recommended_herbs.length} recommended`);
  if (caution_herbs.length > 0) parts.push(`${caution_herbs.length} with caution`);
  if (avoid_herbs.length > 0) parts.push(`${avoid_herbs.length} to avoid`);
  return `For ${result.concern_label}: ${parts.join(", ")}.`;
}

// ─── JSON-LD for SEO ───
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Ayurv",
      url: "https://webapp-self-rho.vercel.app",
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      description: "Check if an Ayurvedic herb is safe for you — based on your conditions, medications, and clinical evidence.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
      featureList: "50 herb safety profiles, Drug interaction checks, Evidence-graded claims, Personalized risk assessment",
    },
    {
      "@type": "HowTo",
      name: "How to Check Ayurvedic Herb Safety",
      description: "Check if an Ayurvedic herb is safe for you in under 2 minutes.",
      step: [
        { "@type": "HowToStep", position: 1, name: "Tell us about you", text: "Age, conditions, medications." },
        { "@type": "HowToStep", position: 2, name: "We check safety", text: "Cross-reference herbs against your profile." },
        { "@type": "HowToStep", position: 3, name: "Get your report", text: "Personalized safety recommendations." },
      ],
    },
  ],
};

export default function HomePage() {
  const router = useRouter();

  // ─── core state ───
  const [phase, setPhase] = useState<Phase>("welcome");
  const [form, setForm] = useState<IntakeFormState>(createInitialFormState);
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [drawerHerb, setDrawerHerb] = useState<{ id: string; name: string } | null>(null);

  // section refs for auto-scroll
  const sectionRef = useRef<HTMLDivElement>(null);

  // ─── auto-scroll jab phase change ho ───
  useEffect(() => {
    if (phase !== "welcome") {
      // thoda delay do render settle hone ke liye
      setTimeout(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [phase]);

  // ─── init: check returning user, load profile ───
  useEffect(() => {
    // agar pehle se disclaimer accept kiya hai toh skip welcome
    if (hasAcceptedDisclaimer()) {
      setDisclaimerChecked(true);
    }

    // agar sessionStorage mein result hai (e.g. back from chat), direct results dikhao
    const storedResult = sessionStorage.getItem("ayurv_result");
    if (storedResult) {
      try {
        const parsed = JSON.parse(storedResult) as RiskAssessment;
        if (parsed.session_id && Array.isArray(parsed.recommended_herbs)) {
          setResult(parsed);
          setPhase("results");
          return;
        }
      } catch { /* corrupt — ignore */ }
    }

    const uid = getOrCreateUid();

    // register user + load saved profile
    Promise.all([
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "" }),
      }).catch(() => null),
      fetch(`/api/profile?uid=${uid}`).then(r => r.json()).catch(() => null),
    ]).then(([, profileRes]) => {
      const saved = profileRes?.profile;
      if (!saved) return;
      setForm(prev => ({
        ...prev,
        age: saved.age || prev.age,
        sex: saved.sex || prev.sex,
        pregnancy_status: saved.pregnancy_status || prev.pregnancy_status,
        has_conditions: saved.chronic_conditions?.length > 0 ? true : prev.has_conditions,
        chronic_conditions: saved.chronic_conditions?.length > 0 ? saved.chronic_conditions : prev.chronic_conditions,
        has_medications: saved.medications?.length > 0 ? true : prev.has_medications,
        medications: saved.medications?.length > 0 ? saved.medications : prev.medications,
        current_herbs: saved.current_herbs
          ? typeof saved.current_herbs === "string"
            ? saved.current_herbs.split(",").map((h: string) => h.trim()).filter(Boolean)
            : saved.current_herbs
          : prev.current_herbs,
      }));
      setProfileLoaded(true);
    });
  }, []);

  // ─── validation ───
  const hasActiveRedFlags = Object.values(form.red_flags).some(v => v);

  const aboutComplete =
    form.age !== "" &&
    Number(form.age) >= 1 && Number(form.age) <= 120 &&
    form.sex !== "" &&
    form.pregnancy_status !== "" &&
    form.has_red_flags !== null &&
    !hasActiveRedFlags;

  const healthComplete =
    form.has_conditions !== null &&
    form.has_medications !== null &&
    (form.has_conditions === false || form.chronic_conditions.length > 0) &&
    (form.has_medications === false || form.medications.length > 0);

  const concernComplete = form.symptom_primary !== "";

  // ─── submit assessment ───
  const handleSubmit = useCallback(async () => {
    setPhase("submitting");
    setError(null);

    const uid = getOrCreateUid();
    const payload = {
      age: Number(form.age),
      sex: form.sex,
      pregnancy_status: form.pregnancy_status,
      chronic_conditions: form.has_conditions ? form.chronic_conditions : ["none"],
      medications: form.has_medications ? form.medications : ["none"],
      current_herbs: form.current_herbs,
      symptom_primary: form.symptom_primary,
      symptom_duration: "chronic_ongoing",
      symptom_severity: "moderate",
      user_goal: "find_herb_for_concern",
      red_flag_screen: form.red_flags,
      disclaimer_accepted: true as const,
      anonymous_uid: uid,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Assessment failed");
      }

      const assessmentResult = await res.json();
      sessionStorage.setItem("ayurv_result", JSON.stringify(assessmentResult));
      sessionStorage.setItem("ayurv_disclaimer", JSON.stringify({ accepted: true, timestamp: new Date().toISOString(), version: "v1.0" }));
      saveDisclaimerAccepted();
      trackEvent("intake_completed", { concern: form.symptom_primary });

      // auto-save profile (fire-and-forget)
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          age: form.age,
          sex: form.sex,
          pregnancy_status: form.pregnancy_status,
          chronic_conditions: form.has_conditions ? form.chronic_conditions : [],
          medications: form.has_medications ? form.medications : [],
          current_herbs: form.current_herbs.join(", "),
        }),
      }).catch(() => {});

      setResult(assessmentResult);
      setPhase("results");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please check your connection and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setPhase("concern"); // wapas concern step pe le jao
    }
  }, [form]);

  // ─── phase navigation ───
  function goNext() {
    switch (phase) {
      case "welcome":
        if (!disclaimerChecked) return;
        trackEvent("disclaimer_accepted");
        setPhase("about");
        break;
      case "about":
        if (!aboutComplete) return;
        trackEvent("intake_step_changed", { from: 1, to: 2 });
        setPhase("health");
        break;
      case "health":
        if (!healthComplete) return;
        trackEvent("intake_step_changed", { from: 2, to: 3 });
        setPhase("concern");
        break;
      case "concern":
        if (!concernComplete) return;
        handleSubmit();
        break;
    }
  }

  function goBack() {
    switch (phase) {
      case "about": setPhase("welcome"); break;
      case "health": setPhase("about"); break;
      case "concern": setPhase("health"); break;
    }
  }

  function handleClearProfile() {
    setForm(prev => ({
      ...prev,
      age: "", sex: "", pregnancy_status: "",
      has_conditions: null, chronic_conditions: [],
      has_medications: null, medications: [],
      current_herbs: [],
    }));
    setProfileLoaded(false);
  }

  function startNewAssessment() {
    setResult(null);
    setForm(createInitialFormState());
    setError(null);
    setPhase("welcome");
    sessionStorage.removeItem("ayurv_result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // can the user proceed?
  const canProceed =
    (phase === "welcome" && disclaimerChecked) ||
    (phase === "about" && aboutComplete) ||
    (phase === "health" && healthComplete) ||
    (phase === "concern" && concernComplete);

  // step label for progress
  const stepLabel = phase === "welcome" ? "Welcome"
    : phase === "about" ? "Step 1 of 3 — About You"
    : phase === "health" ? "Step 2 of 3 — Health Profile"
    : phase === "concern" ? "Step 3 of 3 — Your Concern"
    : phase === "submitting" ? "Analysing..."
    : "Your Results";

  return (
    <div className="max-w-3xl mx-auto pb-8">
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ─── Fixed progress bar ─── */}
      {phase !== "results" && (
        <div className="sticky top-1 z-30 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">{stepLabel}</span>
              <span className="text-xs text-gray-400">{getProgress(phase)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-ayurv-primary to-ayurv-accent rounded-full transition-all duration-700 ease-out"
                style={{ width: `${getProgress(phase)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Phase content ─── */}
      <div ref={sectionRef}>

        {/* ════════════ WELCOME + DISCLAIMER ════════════ */}
        {phase === "welcome" && (
          <div className="animate-fade-in">
            {/* compact hero */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-ayurv-primary mb-3 tracking-tight leading-tight">
                Is that herb
                <span className="bg-gradient-to-r from-ayurv-primary to-ayurv-accent bg-clip-text text-transparent"> safe for you?</span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                Check Ayurvedic herbs against your conditions, medications, and clinical evidence — all on this page.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-risk-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  50 herbs verified
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-risk-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Drug interactions checked
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-risk-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Free, no account needed
                </span>
              </div>
            </div>

            {/* disclaimer card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-ayurv-primary to-ayurv-secondary px-6 py-4">
                <h2 className="text-base font-semibold text-white">Before You Begin</h2>
                <p className="text-sm text-green-200/80 mt-0.5">Please read and accept to continue</p>
              </div>
              <div className="p-6">
                <div className="bg-amber-50/80 border border-risk-amber/20 rounded-xl p-4 mb-6">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-risk-amber shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Ayurv checks Ayurvedic herbs against your health profile using clinical evidence
                      and known drug interactions. It does <strong>NOT</strong> diagnose, prescribe, or
                      replace your doctor.
                    </p>
                  </div>
                </div>

                {/* single checkbox — simple for elderly */}
                <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  disclaimerChecked
                    ? "bg-risk-green-light border-risk-green/30 shadow-sm"
                    : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}>
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={disclaimerChecked}
                      onChange={() => setDisclaimerChecked(!disclaimerChecked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      disclaimerChecked ? "bg-risk-green border-risk-green" : "border-gray-300 bg-white"
                    }`}>
                      {disclaimerChecked && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    I understand this is <strong>educational information only</strong>, not medical advice.
                    I will consult a healthcare professional before acting on any information provided.
                  </p>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ════════════ ABOUT YOU ════════════ */}
        {phase === "about" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in">
            <StepAbout
              form={form}
              setForm={setForm}
              profileLoaded={profileLoaded}
              onClearProfile={handleClearProfile}
            />
          </div>
        )}

        {/* ════════════ HEALTH PROFILE ════════════ */}
        {phase === "health" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in">
            <StepHealth form={form} setForm={setForm} />
          </div>
        )}

        {/* ════════════ CONCERN ════════════ */}
        {phase === "concern" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm animate-fade-in">
            <StepConcern form={form} setForm={setForm} error={error} />
          </div>
        )}

        {/* ════════════ SUBMITTING ════════════ */}
        {phase === "submitting" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 shadow-sm animate-fade-in text-center">
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <svg className="w-16 h-16 animate-spin text-ayurv-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analysing your health profile</h2>
            <p className="text-sm text-gray-500">
              Checking 50 herbs against your conditions, medications, and clinical evidence...
            </p>
          </div>
        )}

        {/* ════════════ RESULTS ════════════ */}
        {phase === "results" && result && (
          <div className="animate-fade-in">
            {/* header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-risk-green/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-risk-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-sm text-risk-green font-semibold">Assessment Complete</p>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Herbs for {result.concern_label}
              </h1>
              <p className="text-sm text-gray-500">
                {result.total_relevant} herb{result.total_relevant !== 1 ? "s" : ""} checked against your profile
              </p>
            </div>

            {/* quick summary */}
            <div className="bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-800">{getSummary(result)}</p>
            </div>

            {/* safety score gauge */}
            {(() => {
              const safe = result.recommended_herbs.length;
              const caution = result.caution_herbs.length;
              const avoid = result.avoid_herbs.length;
              const total = safe + caution + avoid;
              if (total === 0) return null;
              const score = Math.round(((safe * 1.0 + caution * 0.4) / total) * 100);
              const color = score >= 70 ? "text-green-600" : score >= 40 ? "text-amber-600" : "text-red-600";
              const label = score >= 70 ? "Good" : score >= 40 ? "Moderate" : "Low";
              return (
                <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${score}, 100`} className={color} />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${color}`}>{score}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Safety Score: <span className={color}>{label}</span></p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {safe} safe, {caution} with cautions, {avoid} to avoid
                    </p>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full flex">
                        {safe > 0 && <div className="bg-green-500 h-full" style={{ width: `${(safe / total) * 100}%` }} />}
                        {caution > 0 && <div className="bg-amber-500 h-full" style={{ width: `${(caution / total) * 100}%` }} />}
                        {avoid > 0 && <div className="bg-red-500 h-full" style={{ width: `${(avoid / total) * 100}%` }} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* breakdown chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {result.recommended_herbs.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {result.recommended_herbs.length} recommended
                </span>
              )}
              {result.caution_herbs.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {result.caution_herbs.length} with cautions
                </span>
              )}
              {result.avoid_herbs.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 border border-red-200 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {result.avoid_herbs.length} to avoid
                </span>
              )}
            </div>

            {/* doctor referral banner */}
            {result.doctor_referral_suggested && (
              <WarningBanner
                blockedCount={result.avoid_herbs.length}
                cautionCount={result.caution_herbs.length}
              />
            )}

            {/* recommended herbs */}
            {result.recommended_herbs.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-risk-green mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  Recommended For You
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  No known contraindications for your profile. Ranked by evidence strength.
                </p>
                <div className="space-y-3">
                  {result.recommended_herbs.map((herb, i) => (
                    <RecommendedHerbCard key={herb.herb_id} herb={herb} rank={i + 1} onEvidenceClick={(id, name) => setDrawerHerb({ id, name })} />
                  ))}
                </div>
              </section>
            )}

            {/* caution herbs */}
            {result.caution_herbs.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-risk-amber mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Use With Doctor Guidance
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  These herbs have warnings for your profile. Discuss with your doctor.
                </p>
                <div className="space-y-3">
                  {result.caution_herbs.map(herb => (
                    <CautionHerbCard key={herb.herb_id} herb={herb} onEvidenceClick={(id, name) => setDrawerHerb({ id, name })} />
                  ))}
                </div>
              </section>
            )}

            {/* avoid herbs */}
            {result.avoid_herbs.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg font-semibold text-risk-red mb-1 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                  Not Safe For You
                </h2>
                <p className="text-xs text-gray-500 mb-3">
                  Do not use without consulting your doctor.
                </p>
                <div className="space-y-3">
                  {result.avoid_herbs.map(herb => (
                    <AvoidHerbCard key={herb.herb_id} herb={herb} />
                  ))}
                </div>
              </section>
            )}

            {/* doctor card */}
            {(result.doctor_referral_suggested || result.caution_herbs.some(h => h.cautions.some(c => c.type === "medication_interaction"))) && (
              <DoctorCard result={result} />
            )}

            {/* action buttons */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <p className="text-xs text-gray-400 mb-4">{result.disclaimer}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    // chat pe jaane se pehle disclaimer + result sessionStorage mein hona chahiye
                    sessionStorage.setItem("ayurv_disclaimer", JSON.stringify({ accepted: true }));
                    router.push("/chat");
                  }}
                  className="flex flex-col items-center gap-1.5 px-4 py-4 bg-ayurv-primary text-white rounded-xl font-semibold text-sm hover:bg-ayurv-secondary transition-colors shadow-md"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                  Ask Questions
                </button>
                <button
                  onClick={() => {
                    sessionStorage.setItem("ayurv_disclaimer", JSON.stringify({ accepted: true }));
                    router.push("/results");
                  }}
                  className="flex flex-col items-center gap-1.5 px-4 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Full Report
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex flex-col items-center gap-1.5 px-4 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors no-print"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={startNewAssessment}
                  className="flex flex-col items-center gap-1.5 px-4 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  New Check
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom navigation bar — back + next ─── */}
      {phase !== "results" && phase !== "submitting" && (
        <div className="sticky bottom-0 z-30 mt-6 no-print">
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-3 -mx-4 sm:mx-0 sm:rounded-2xl sm:border sm:shadow-lg">
            <div className="flex items-center justify-between gap-3 max-w-3xl mx-auto">
              {/* back button */}
              {phase !== "welcome" ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all min-h-[52px]"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Back
                </button>
              ) : (
                <div /> // spacer
              )}

              {/* next button */}
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 min-h-[52px] ${
                  canProceed
                    ? "bg-ayurv-primary text-white hover:bg-ayurv-secondary shadow-lg shadow-ayurv-primary/20 hover:shadow-xl hover:-translate-y-0.5"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {phase === "concern" ? "Get My Safety Report" : "Continue"}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* evidence drawer */}
      <EvidenceDrawer
        open={!!drawerHerb}
        onClose={() => setDrawerHerb(null)}
        herbId={drawerHerb?.id || ""}
        herbName={drawerHerb?.name || ""}
      />
    </div>
  );
}
