"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateUid, hasAcceptedDisclaimer, saveDisclaimerAccepted } from "@/lib/storage";
import { createInitialFormState, RED_FLAG_ITEMS, CONCERN_OPTIONS, type IntakeFormState } from "@/components/intake/constants";
import StepHealth from "@/components/intake/StepHealth";
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

// result summary
function getSummary(result: RiskAssessment): string {
  const { recommended_herbs, caution_herbs, avoid_herbs } = result;
  const total = recommended_herbs.length + caution_herbs.length + avoid_herbs.length;
  if (total === 0) return `No herbs with clinical evidence found for ${result.concern_label}.`;
  if (avoid_herbs.length === 0 && caution_herbs.length === 0)
    return `${recommended_herbs.length} herb${recommended_herbs.length > 1 ? "s" : ""} found safe for your profile.`;
  const parts: string[] = [];
  if (recommended_herbs.length > 0) parts.push(`${recommended_herbs.length} recommended`);
  if (caution_herbs.length > 0) parts.push(`${caution_herbs.length} with caution`);
  if (avoid_herbs.length > 0) parts.push(`${avoid_herbs.length} to avoid`);
  return `For ${result.concern_label}: ${parts.join(", ")}.`;
}

export default function HomePage() {
  const router = useRouter();

  // ─── state ───
  const [form, setForm] = useState<IntakeFormState>(createInitialFormState);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskAssessment | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [drawerHerb, setDrawerHerb] = useState<{ id: string; name: string } | null>(null);

  const [showValidation, setShowValidation] = useState(false); // inline validation dikhana hai ya nahi
  const resultsRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  // ─── init ───
  useEffect(() => {
    if (hasAcceptedDisclaimer()) setDisclaimerChecked(true);

    // agar pehle se result hai (back from chat) toh dikhao
    const stored = sessionStorage.getItem("ayurv_result");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RiskAssessment;
        if (parsed.session_id && Array.isArray(parsed.recommended_herbs)) {
          setResult(parsed);
          setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
        }
      } catch { /* ignore */ }
    }

    // load saved profile
    const uid = getOrCreateUid();
    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, user_agent: navigator.userAgent }),
    }).catch(() => null);

    fetch(`/api/profile?uid=${uid}`).then(r => r.json()).then(res => {
      const saved = res?.profile;
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
    }).catch(() => {});
  }, []);

  // ─── validation ───
  const hasActiveRedFlags = Object.values(form.red_flags).some(v => v);
  const visibleConcerns = CONCERN_OPTIONS.filter(opt => opt.sex === "all" || form.sex !== "male");

  const isFormComplete =
    disclaimerChecked &&
    form.age !== "" && Number(form.age) >= 1 && Number(form.age) <= 120 &&
    form.sex !== "" &&
    form.pregnancy_status !== "" &&
    form.has_red_flags !== null && !hasActiveRedFlags &&
    form.has_conditions !== null &&
    form.has_medications !== null &&
    (form.has_conditions === false || form.chronic_conditions.length > 0) &&
    (form.has_medications === false || form.medications.length > 0) &&
    form.symptom_primary !== "";

  // ─── submit ───
  async function handleSubmit() {
    if (!isFormComplete) {
      setShowValidation(true);
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setResult(null);

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

      // auto-save profile
      fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid, age: form.age, sex: form.sex, pregnancy_status: form.pregnancy_status,
          chronic_conditions: form.has_conditions ? form.chronic_conditions : [],
          medications: form.has_medications ? form.medications : [],
          current_herbs: form.current_herbs.join(", "),
        }),
      }).catch(() => {});

      setResult(assessmentResult);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please check your connection and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    if (!confirm("Start a new assessment? This will clear your current results.")) return;
    setResult(null);
    setForm(createInitialFormState());
    setError(null);
    setDisclaimerChecked(false);
    setShowValidation(false);
    sessionStorage.removeItem("ayurv_result");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleClearProfile() {
    setForm(prev => ({
      ...prev, age: "", sex: "", pregnancy_status: "",
      has_conditions: null, chronic_conditions: [],
      has_medications: null, medications: [],
      current_herbs: [],
    }));
    setProfileLoaded(false);
  }

  // ─── sab ek page pe, scroll karo, fill karo ───
  return (
    <div className="max-w-2xl mx-auto pb-12">

      {/* ═══════ SECTION 1: INTRO + DISCLAIMER ═══════ */}
      <section className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-ayurv-primary mb-2 leading-tight">
          Check if an Ayurvedic herb is safe for you
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Fill the form below. Your safety report will appear at the bottom of this page.
        </p>

        {/* disclaimer — ek checkbox, simple */}
        <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
          disclaimerChecked
            ? "bg-green-50 border-green-300"
            : "bg-amber-50 border-amber-200"
        }`}>
          <div className="mt-0.5 shrink-0">
            <input type="checkbox" checked={disclaimerChecked} onChange={() => setDisclaimerChecked(!disclaimerChecked)} className="sr-only" />
            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
              disclaimerChecked ? "bg-green-600 border-green-600" : "border-gray-400 bg-white"
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
            I will consult a doctor before acting on anything here. This tool does NOT diagnose or prescribe.
          </p>
        </label>
      </section>

      {/* ═══════ SECTION 2: ABOUT YOU ═══════ */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 mb-1">1. About You</h2>
          {showValidation && form.age && form.sex && form.pregnancy_status && form.has_red_flags !== null && !hasActiveRedFlags && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              Done
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-5">Basic info so we can check herb safety for your profile.</p>

        {/* returning user */}
        {profileLoaded && (
          <div className="flex items-center justify-between bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-xl px-4 py-3 mb-5">
            <span className="text-xs text-ayurv-primary font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Profile loaded from last visit
            </span>
            <button type="button" onClick={handleClearProfile} className="text-xs text-gray-500 underline">Clear</button>
          </div>
        )}

        <div className="space-y-5">
          {/* age */}
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1.5">
              Age
              {showValidation && (!form.age || Number(form.age) < 1 || Number(form.age) > 120) && (
                <span className="text-red-500 text-xs ml-2 font-normal">Required (1-120)</span>
              )}
            </label>
            <input
              id="age" type="number" inputMode="numeric" min={1} max={120}
              value={form.age}
              onChange={e => setForm(p => ({ ...p, age: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ayurv-primary/20 focus:border-ayurv-primary/30 outline-none transition-all"
              placeholder="Your age"
            />
          </div>

          {/* sex */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Biological Sex
              {showValidation && !form.sex && (
                <span className="text-red-500 text-xs ml-2 font-normal">Please select</span>
              )}
            </label>
            <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Biological Sex"
              onKeyDown={e => {
                const opts = ["male", "female", "other"];
                const idx = opts.indexOf(form.sex);
                if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                  e.preventDefault();
                  const next = opts[(idx + 1) % opts.length];
                  setForm(p => ({ ...p, sex: next, pregnancy_status: next === "male" ? "not_applicable" : p.pregnancy_status === "not_applicable" ? "" : p.pregnancy_status }));
                } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                  e.preventDefault();
                  const prev = opts[(idx - 1 + opts.length) % opts.length];
                  setForm(p => ({ ...p, sex: prev, pregnancy_status: prev === "male" ? "not_applicable" : p.pregnancy_status === "not_applicable" ? "" : p.pregnancy_status }));
                }
              }}
            >
              {[{ v: "male", l: "Male" }, { v: "female", l: "Female" }, { v: "other", l: "Other" }].map(opt => (
                <button key={opt.v} type="button"
                  role="radio" aria-checked={form.sex === opt.v}
                  tabIndex={form.sex === opt.v || (!form.sex && opt.v === "male") ? 0 : -1}
                  onClick={() => setForm(p => ({
                    ...p, sex: opt.v,
                    pregnancy_status: opt.v === "male" ? "not_applicable" : p.pregnancy_status === "not_applicable" ? "" : p.pregnancy_status,
                  }))}
                  className={`py-3.5 rounded-xl border-2 text-sm font-semibold transition-all focus:ring-2 focus:ring-ayurv-primary/40 focus:outline-none ${
                    form.sex === opt.v
                      ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md"
                      : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-primary/30"
                  }`}
                >{opt.l}</button>
              ))}
            </div>
          </div>

          {/* pregnancy */}
          {form.sex && form.sex !== "male" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pregnancy / Breastfeeding</label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { v: "not_pregnant", l: "Not pregnant" },
                  { v: "pregnant", l: "Pregnant" },
                  { v: "breastfeeding", l: "Breastfeeding" },
                  { v: "trying_to_conceive", l: "Trying to conceive" },
                ].map(opt => (
                  <button key={opt.v} type="button"
                    onClick={() => setForm(p => ({ ...p, pregnancy_status: opt.v }))}
                    className={`py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                      form.pregnancy_status === opt.v
                        ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-primary/30"
                    }`}
                  >{opt.l}</button>
                ))}
              </div>
            </div>
          )}

          {/* red flags */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Any <span className="text-red-600 font-semibold">urgent symptoms</span> right now?
            </p>
            <div className="flex gap-3 mb-3">
              <button type="button"
                onClick={() => setForm(p => ({ ...p, has_red_flags: false, red_flags: Object.fromEntries(RED_FLAG_ITEMS.map(q => [q.key, false])) }))}
                className={`flex-1 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.has_red_flags === false ? "bg-green-600 text-white border-green-600 shadow-md" : "bg-white text-gray-600 border-gray-200"
                }`}
              >No, I&apos;m fine</button>
              <button type="button"
                onClick={() => setForm(p => ({ ...p, has_red_flags: true }))}
                className={`flex-1 py-3.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.has_red_flags === true ? "bg-red-600 text-white border-red-600 shadow-md" : "bg-white text-gray-600 border-gray-200"
                }`}
              >Yes, I have some</button>
            </div>

            {form.has_red_flags === true && (
              <div className="space-y-2">
                {RED_FLAG_ITEMS.map(item => (
                  <label key={item.key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                    form.red_flags[item.key] ? "bg-red-50 border-red-300" : "bg-gray-50 border-gray-200"
                  }`}>
                    <input type="checkbox" checked={form.red_flags[item.key]}
                      onChange={() => setForm(p => ({ ...p, red_flags: { ...p.red_flags, [item.key]: !p.red_flags[item.key] } }))}
                      className="sr-only" />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      form.red_flags[item.key] ? "bg-red-600 border-red-600" : "border-gray-300 bg-white"
                    }`}>
                      {form.red_flags[item.key] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            )}

            {hasActiveRedFlags && (
              <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-2xl p-5">
                <h3 className="font-bold text-red-700 text-sm mb-1">Please Seek Medical Help First</h3>
                <p className="text-sm text-gray-700 mb-3">These symptoms may need immediate medical attention.</p>
                <div className="text-sm space-y-1">
                  <p>Ambulance: <strong>108 / 112</strong></p>
                  <p>iCall: <strong>9152987821</strong></p>
                  <p>NIMHANS: <strong>080-46110007</strong></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════ SECTION 3: HEALTH PROFILE ═══════ */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 mb-1">2. Your Health Profile</h2>
          {showValidation && form.has_conditions !== null && form.has_medications !== null &&
            (form.has_conditions === false || form.chronic_conditions.length > 0) &&
            (form.has_medications === false || form.medications.length > 0) && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              Done
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-5">Conditions and medications — so we can check for interactions.</p>
        <StepHealth form={form} setForm={setForm} />
      </section>

      {/* ═══════ SECTION 4: YOUR CONCERN ═══════ */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 mb-1">3. What Do You Need Help With?</h2>
          {showValidation && form.symptom_primary && (
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              Done
            </span>
          )}
          {showValidation && !form.symptom_primary && (
            <span className="text-xs text-red-500 font-medium">Please select one</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-5">Pick your main health concern.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="radiogroup" aria-label="Health concern">
          {visibleConcerns.map(opt => (
            <button key={opt.value} type="button"
              role="radio" aria-checked={form.symptom_primary === opt.value}
              onClick={() => setForm(p => ({ ...p, symptom_primary: opt.value }))}
              className={`px-3 py-3.5 rounded-xl border-2 text-sm font-medium transition-all focus:ring-2 focus:ring-ayurv-primary/40 focus:outline-none ${
                form.symptom_primary === opt.value
                  ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md scale-[1.02]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-primary/30"
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </section>

      {/* ═══════ SUBMIT BUTTON ═══════ */}
      {!result && (
        <div className="mb-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl mb-4 flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            ref={submitRef}
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-300 ${
              isFormComplete && !submitting
                ? "bg-ayurv-primary text-white hover:bg-ayurv-secondary shadow-lg shadow-ayurv-primary/25 hover:shadow-xl active:scale-[0.98]"
                : submitting
                  ? "bg-gray-200 text-gray-400 cursor-wait"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Checking 50 herbs against your profile...
              </span>
            ) : isFormComplete ? (
              "Get My Safety Report"
            ) : (
              "Fill all sections above to continue"
            )}
          </button>

          {!isFormComplete && !submitting && (
            <p className="text-xs text-gray-400 text-center mt-2">
              {!disclaimerChecked ? "Accept the disclaimer above" :
               !form.age || Number(form.age) < 1 || Number(form.age) > 120 ? "Enter your age" :
               !form.sex ? "Select your biological sex" :
               !form.pregnancy_status ? "Select pregnancy status" :
               form.has_red_flags === null ? "Answer the urgent symptoms question" :
               hasActiveRedFlags ? "Cannot proceed with active urgent symptoms" :
               form.has_conditions === null ? "Answer the conditions question" :
               form.has_medications === null ? "Answer the medications question" :
               (form.has_conditions && form.chronic_conditions.length === 0) ? "Select at least one condition" :
               (form.has_medications && form.medications.length === 0) ? "Select at least one medication" :
               !form.symptom_primary ? "Pick your main concern" :
               "Complete all sections"}
            </p>
          )}
        </div>
      )}

      {/* ═══════ RESULTS — same page ke neeche ═══════ */}
      {result && (
        <div ref={resultsRef} className="scroll-mt-4">
          {/* success marker */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Safety Report</h2>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mb-1">Herbs for {result.concern_label}</h3>
          <p className="text-sm text-gray-500 mb-4">{result.total_relevant} herbs checked against your profile</p>

          {/* summary */}
          <div className="bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-800">{getSummary(result)}</p>
          </div>

          {/* safety score */}
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
                  <p className="text-xs text-gray-500 mt-0.5">{safe} safe, {caution} caution, {avoid} avoid</p>
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

          {/* doctor referral */}
          {result.doctor_referral_suggested && (
            <WarningBanner blockedCount={result.avoid_herbs.length} cautionCount={result.caution_herbs.length} />
          )}

          {/* recommended */}
          {result.recommended_herbs.length > 0 && (
            <section className="mb-6">
              <h3 className="text-base font-semibold text-green-700 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                Recommended ({result.recommended_herbs.length})
              </h3>
              <div className="space-y-3">
                {result.recommended_herbs.map((herb, i) => (
                  <RecommendedHerbCard key={herb.herb_id} herb={herb} rank={i + 1} onEvidenceClick={(id, name) => setDrawerHerb({ id, name })} />
                ))}
              </div>
            </section>
          )}

          {/* caution */}
          {result.caution_herbs.length > 0 && (
            <section className="mb-6">
              <h3 className="text-base font-semibold text-amber-700 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Use With Caution ({result.caution_herbs.length})
              </h3>
              <div className="space-y-3">
                {result.caution_herbs.map(herb => (
                  <CautionHerbCard key={herb.herb_id} herb={herb} onEvidenceClick={(id, name) => setDrawerHerb({ id, name })} />
                ))}
              </div>
            </section>
          )}

          {/* avoid */}
          {result.avoid_herbs.length > 0 && (
            <section className="mb-6">
              <h3 className="text-base font-semibold text-red-700 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Not Safe ({result.avoid_herbs.length})
              </h3>
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

          {/* disclaimer + actions */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <p className="text-xs text-gray-400 mb-4">{result.disclaimer}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  sessionStorage.setItem("ayurv_disclaimer", JSON.stringify({ accepted: true }));
                  router.push("/chat");
                }}
                className="flex items-center justify-center gap-2 py-4 bg-ayurv-primary text-white rounded-xl font-bold text-sm hover:bg-ayurv-secondary transition-colors shadow-md"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
                Ask Questions
              </button>
              <button onClick={startOver}
                className="flex items-center justify-center gap-2 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
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

      {/* evidence drawer */}
      <EvidenceDrawer open={!!drawerHerb} onClose={() => setDrawerHerb(null)} herbId={drawerHerb?.id || ""} herbName={drawerHerb?.name || ""} />
    </div>
  );
}
