"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getOrCreateUid } from "@/lib/storage";
import {
  CONCERN_OPTIONS,
  CONDITION_GROUPS,
  MEDICATION_GROUPS,
  RED_FLAG_ITEMS,
  type IntakeFormState,
  createInitialFormState,
} from "@/components/intake/constants";
import { trackEvent } from "@/lib/track";

// ============================================
// Easy Mode — single-page, elderly-friendly assessment
// badon ke liye — bade buttons, simple flow, no page hops
// ============================================

type Section = "disclaimer" | "about" | "health" | "concern" | "submitting" | "results";

// result types — matches API response
interface HerbResult {
  herb_id: string;
  herb_name: string;
  evidence_grade?: string;
  status: "blocked" | "caution" | "safe";
  reason?: string;
  caution_flags?: { flag: string; detail: string }[];
  dosage?: { form: string; range_min: string; range_max: string; unit: string }[];
}

interface AssessmentResult {
  blocked: HerbResult[];
  caution: HerbResult[];
  safe: HerbResult[];
  concern_label: string;
}

export default function EasyModePage() {
  const [section, setSection] = useState<Section>("disclaimer");
  const [form, setForm] = useState<IntakeFormState>(createInitialFormState);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // refs for auto-scrolling to next section
  const aboutRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);
  const concernRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // load saved profile
  useEffect(() => {
    const uid = getOrCreateUid();
    fetch(`/api/profile?uid=${uid}`)
      .then((r) => r.json())
      .then((res) => {
        const saved = res.profile;
        if (!saved) return;
        setForm((prev) => ({
          ...prev,
          age: saved.age || prev.age,
          sex: saved.sex || prev.sex,
          pregnancy_status: saved.pregnancy_status || prev.pregnancy_status,
          has_conditions: saved.chronic_conditions?.length > 0 ? true : prev.has_conditions,
          chronic_conditions: saved.chronic_conditions?.length > 0 ? saved.chronic_conditions : prev.chronic_conditions,
          has_medications: saved.medications?.length > 0 ? true : prev.has_medications,
          medications: saved.medications?.length > 0 ? saved.medications : prev.medications,
        }));
      })
      .catch(() => {});
  }, []);

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function goToAbout() {
    setSection("about");
    scrollTo(aboutRef);
  }

  function goToHealth() {
    setSection("health");
    scrollTo(healthRef);
  }

  function goToConcern() {
    setSection("concern");
    scrollTo(concernRef);
  }

  async function handleSubmit() {
    setSection("submitting");
    setError(null);

    const uid = getOrCreateUid();
    const hasActiveRedFlags = Object.values(form.red_flags).some((v) => v);
    if (hasActiveRedFlags) {
      setError("Please see a doctor for your urgent symptoms first.");
      setSection("about");
      return;
    }

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
        throw new Error(data.error || "Something went wrong");
      }

      const data = await res.json();
      sessionStorage.setItem("ayurv_result", JSON.stringify(data));
      setResult(data);
      setSection("results");
      trackEvent("intake_completed", { concern: form.symptom_primary, mode: "easy" });

      // auto-save profile
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

      scrollTo(resultRef);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError("Request timed out. Please check your internet and try again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
      setSection("concern");
    }
  }

  const hasActiveRedFlags = Object.values(form.red_flags).some((v) => v);

  // validation helpers
  const aboutComplete =
    form.age !== "" &&
    Number(form.age) >= 1 &&
    Number(form.age) <= 120 &&
    form.sex !== "" &&
    (form.sex === "male" || form.pregnancy_status !== "") &&
    form.has_red_flags !== null &&
    !hasActiveRedFlags;

  const healthComplete =
    form.has_conditions !== null &&
    form.has_medications !== null &&
    (form.has_conditions === false || form.chronic_conditions.length > 0) &&
    (form.has_medications === false || form.medications.length > 0);

  const concernComplete = form.symptom_primary !== "";

  const sectionOrder: Section[] = ["disclaimer", "about", "health", "concern", "submitting", "results"];
  const sectionIndex = sectionOrder.indexOf(section);

  // visible concerns filtered by sex
  const visibleConcerns = CONCERN_OPTIONS.filter(
    (opt) => opt.sex === "all" || form.sex !== "male"
  );

  return (
    <div className="max-w-2xl mx-auto px-2">
      {/* fixed top bar — progress */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 -mx-2 px-4 py-3 mb-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-ayurv-primary">Ayurv</Link>
          <span className="text-sm text-gray-500 font-medium">Easy Mode</span>
        </div>
        {/* progress dots */}
        <div className="flex gap-2 mt-2">
          {["Agree", "About You", "Health", "Concern", "Results"].map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-2 rounded-full transition-all duration-500 ${
                i < sectionIndex ? "bg-green-500" :
                i === sectionIndex ? "bg-ayurv-primary" :
                "bg-gray-200"
              }`} />
              <p className="text-[10px] text-gray-400 mt-1 text-center hidden sm:block">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ============ SECTION 1: DISCLAIMER ============ */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Herb Safety Check
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
            Check if an Ayurvedic herb is safe for you. Tell us about your health, and we&apos;ll check for risks.
          </p>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6">
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              This tool gives <strong>educational information only</strong>. It does not replace your doctor.
              Always talk to your doctor before starting any herb.
            </p>
            <label className="flex items-start gap-4 cursor-pointer">
              <div
                className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  disclaimerChecked
                    ? "bg-ayurv-primary border-ayurv-primary"
                    : "border-gray-300 bg-white"
                }`}
              >
                {disclaimerChecked && (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-base text-gray-700 font-medium">
                I understand this is educational, not medical advice
              </span>
            </label>
            <button
              type="button"
              onClick={() => setDisclaimerChecked(!disclaimerChecked)}
              className="sr-only"
            >
              Toggle disclaimer
            </button>
            {/* tap area is the label above */}
          </div>

          <button
            type="button"
            onClick={() => {
              if (!disclaimerChecked) return;
              sessionStorage.setItem(
                "ayurv_disclaimer",
                JSON.stringify({ accepted: true, timestamp: new Date().toISOString(), version: "v1.0" })
              );
              goToAbout();
            }}
            disabled={!disclaimerChecked}
            className={`w-full py-5 rounded-2xl text-lg font-bold transition-all ${
              disclaimerChecked
                ? "bg-ayurv-primary text-white shadow-lg hover:bg-ayurv-secondary"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Start Check
          </button>
        </div>
      </div>

      {/* ============ SECTION 2: ABOUT YOU ============ */}
      {sectionIndex >= 1 && (
        <div ref={aboutRef} className="mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Step 1: About You</h2>
            <p className="text-base text-gray-500 mb-6">Basic details for safety checking</p>

            <div className="space-y-8">
              {/* age */}
              <div>
                <label htmlFor="easy-age" className="block text-base font-semibold text-gray-700 mb-2">
                  Your Age
                </label>
                <input
                  id="easy-age"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 text-lg font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-ayurv-primary/20 focus:border-ayurv-primary outline-none transition-all"
                  placeholder="Enter your age"
                />
              </div>

              {/* sex */}
              <div>
                <p className="text-base font-semibold text-gray-700 mb-3">You are</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          sex: opt.value,
                          pregnancy_status: opt.value === "male" ? "not_applicable" : p.pregnancy_status === "not_applicable" ? "" : p.pregnancy_status,
                        }))
                      }
                      className={`py-5 rounded-xl border-2 text-base font-bold transition-all ${
                        form.sex === opt.value
                          ? "bg-ayurv-primary text-white border-ayurv-primary shadow-lg"
                          : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-primary/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* pregnancy */}
              {form.sex && form.sex !== "male" && (
                <div>
                  <p className="text-base font-semibold text-gray-700 mb-3">Pregnancy Status</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: "not_pregnant", label: "Not pregnant" },
                      { value: "pregnant", label: "Pregnant" },
                      { value: "breastfeeding", label: "Breastfeeding" },
                      { value: "trying_to_conceive", label: "Trying to conceive" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, pregnancy_status: opt.value }))}
                        className={`py-4 rounded-xl border-2 text-sm font-bold transition-all ${
                          form.pregnancy_status === opt.value
                            ? "bg-ayurv-primary text-white border-ayurv-primary shadow-lg"
                            : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-primary/30"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* red flags */}
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
                <p className="text-base font-semibold text-gray-800 mb-3">
                  Any urgent symptoms right now?
                </p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({
                        ...p,
                        has_red_flags: false,
                        red_flags: Object.fromEntries(RED_FLAG_ITEMS.map((q) => [q.key, false])),
                      }))
                    }
                    className={`py-4 rounded-xl border-2 text-base font-bold transition-all ${
                      form.has_red_flags === false
                        ? "bg-green-600 text-white border-green-600 shadow-lg"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    No, I&apos;m fine
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_red_flags: true }))}
                    className={`py-4 rounded-xl border-2 text-base font-bold transition-all ${
                      form.has_red_flags === true
                        ? "bg-red-600 text-white border-red-600 shadow-lg"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    Yes
                  </button>
                </div>
                {hasActiveRedFlags && (
                  <div className="bg-red-100 border-2 border-red-300 rounded-xl p-4 mt-3">
                    <p className="text-base font-bold text-red-800 mb-2">Please see a doctor first</p>
                    <p className="text-sm text-red-700">Call <strong>108</strong> or <strong>112</strong> for emergency</p>
                  </div>
                )}
                {form.has_red_flags === true && !hasActiveRedFlags && (
                  <div className="space-y-2 mt-3">
                    {RED_FLAG_ITEMS.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            red_flags: { ...p.red_flags, [item.key]: !p.red_flags[item.key] },
                          }))
                        }
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          form.red_flags[item.key]
                            ? "bg-red-100 border-red-300 text-red-800"
                            : "bg-white border-gray-200 text-gray-700"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* continue button */}
            <button
              type="button"
              onClick={goToHealth}
              disabled={!aboutComplete}
              className={`w-full mt-8 py-5 rounded-2xl text-lg font-bold transition-all ${
                aboutComplete
                  ? "bg-ayurv-primary text-white shadow-lg hover:bg-ayurv-secondary"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next: Health Details
            </button>
          </div>
        </div>
      )}

      {/* ============ SECTION 3: HEALTH ============ */}
      {sectionIndex >= 2 && (
        <div ref={healthRef} className="mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Step 2: Your Health</h2>
            <p className="text-base text-gray-500 mb-6">So we can check for herb-condition conflicts</p>

            <div className="space-y-8">
              {/* conditions */}
              <div>
                <p className="text-base font-semibold text-gray-700 mb-3">Any health conditions?</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_conditions: false, chronic_conditions: [] }))}
                    className={`py-4 rounded-xl border-2 text-base font-bold transition-all ${
                      form.has_conditions === false
                        ? "bg-ayurv-primary text-white border-ayurv-primary shadow-lg"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    No conditions
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_conditions: true }))}
                    className={`py-4 rounded-xl border-2 text-base font-bold transition-all ${
                      form.has_conditions === true
                        ? "bg-ayurv-primary text-white border-ayurv-primary shadow-lg"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    Yes, I have some
                  </button>
                </div>

                {form.has_conditions === true && (
                  <div className="space-y-3">
                    {CONDITION_GROUPS
                      .filter((g) => form.sex !== "male" || g.label !== "Women's Health")
                      .map((group) => (
                      <div key={group.label}>
                        <p className="text-sm font-semibold text-gray-600 mb-2">{group.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  chronic_conditions: prev.chronic_conditions.includes(item.value)
                                    ? prev.chronic_conditions.filter((v) => v !== item.value)
                                    : [...prev.chronic_conditions, item.value],
                                }));
                              }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                                form.chronic_conditions.includes(item.value)
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : "bg-white text-gray-600 border-gray-200"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {form.has_conditions === true && form.chronic_conditions.length > 0 && (
                  <p className="text-sm text-ayurv-primary font-semibold mt-3">
                    {form.chronic_conditions.length} condition{form.chronic_conditions.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>

              {/* medications */}
              <div className="border-t-2 border-gray-100 pt-6">
                <p className="text-base font-semibold text-gray-700 mb-3">Taking any medications?</p>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_medications: false, medications: [] }))}
                    className={`py-4 rounded-xl border-2 text-base font-bold transition-all ${
                      form.has_medications === false
                        ? "bg-ayurv-primary text-white border-ayurv-primary shadow-lg"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    No medications
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_medications: true }))}
                    className={`py-4 rounded-xl border-2 text-base font-bold transition-all ${
                      form.has_medications === true
                        ? "bg-ayurv-primary text-white border-ayurv-primary shadow-lg"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    Yes, I take some
                  </button>
                </div>

                {form.has_medications === true && (
                  <div className="space-y-3">
                    {MEDICATION_GROUPS.map((group) => (
                      <div key={group.label}>
                        <p className="text-sm font-semibold text-gray-600 mb-2">{group.label}</p>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map((item) => (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  medications: prev.medications.includes(item.value)
                                    ? prev.medications.filter((v) => v !== item.value)
                                    : [...prev.medications, item.value],
                                }));
                              }}
                              className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                                form.medications.includes(item.value)
                                  ? "bg-blue-100 text-blue-800 border-blue-300"
                                  : "bg-white text-gray-600 border-gray-200"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {form.has_medications === true && form.medications.length > 0 && (
                  <p className="text-sm text-ayurv-primary font-semibold mt-3">
                    {form.medications.length} medication{form.medications.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={goToConcern}
              disabled={!healthComplete}
              className={`w-full mt-8 py-5 rounded-2xl text-lg font-bold transition-all ${
                healthComplete
                  ? "bg-ayurv-primary text-white shadow-lg hover:bg-ayurv-secondary"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Next: Your Concern
            </button>
          </div>
        </div>
      )}

      {/* ============ SECTION 4: CONCERN ============ */}
      {sectionIndex >= 3 && (
        <div ref={concernRef} className="mb-8">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Step 3: Your Concern</h2>
            <p className="text-base text-gray-500 mb-6">What do you want help with?</p>

            <div className="grid grid-cols-2 gap-3">
              {visibleConcerns.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, symptom_primary: opt.value }))}
                  className={`py-5 px-4 rounded-xl border-2 text-sm font-bold transition-all text-center ${
                    form.symptom_primary === opt.value
                      ? "bg-ayurv-primary text-white border-ayurv-primary shadow-lg scale-[1.02]"
                      : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-primary/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {error && (
              <div role="alert" className="mt-4 bg-red-50 border-2 border-red-200 text-red-700 text-base p-4 rounded-xl font-medium">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!concernComplete || section === "submitting"}
              className={`w-full mt-8 py-5 rounded-2xl text-lg font-bold transition-all ${
                concernComplete && section !== "submitting"
                  ? "bg-green-600 text-white shadow-lg hover:bg-green-700"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {section === "submitting" ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Checking... Please wait
                </span>
              ) : (
                "Get My Safety Report"
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============ SECTION 5: RESULTS ============ */}
      {section === "results" && result && (
        <div ref={resultRef} className="mb-8">
          <div className="bg-white rounded-2xl border-2 border-green-200 p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Your Results</h2>
            <p className="text-base text-gray-500 mb-4">
              Herbs checked for: <strong>{result.concern_label}</strong>
            </p>

            {/* summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-red-700">{result.blocked?.length || 0}</p>
                <p className="text-sm font-semibold text-red-600">Avoid</p>
              </div>
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-amber-700">{result.caution?.length || 0}</p>
                <p className="text-sm font-semibold text-amber-600">Caution</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-700">{result.safe?.length || 0}</p>
                <p className="text-sm font-semibold text-green-600">Safe</p>
              </div>
            </div>

            {/* blocked herbs */}
            {result.blocked && result.blocked.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-red-700 mb-3">Not Safe For You</h3>
                <div className="space-y-3">
                  {result.blocked.map((herb) => (
                    <div key={herb.herb_id} className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <p className="text-base font-bold text-red-800">{herb.herb_name}</p>
                      <p className="text-sm text-red-600 mt-1">{herb.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* caution herbs */}
            {result.caution && result.caution.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-amber-700 mb-3">Use With Doctor Guidance</h3>
                <div className="space-y-3">
                  {result.caution.map((herb) => (
                    <div key={herb.herb_id} className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                      <p className="text-base font-bold text-amber-800">{herb.herb_name}</p>
                      {herb.caution_flags && herb.caution_flags.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {herb.caution_flags.map((flag, i) => (
                            <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                              <span>{flag.detail || flag.flag}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* safe herbs */}
            {result.safe && result.safe.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-green-700 mb-3">Lower Risk For You</h3>
                <div className="space-y-3">
                  {result.safe.map((herb) => (
                    <div key={herb.herb_id} className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold text-green-800">{herb.herb_name}</p>
                          {herb.evidence_grade && (
                            <p className="text-sm text-green-600 mt-0.5">Evidence: Grade {herb.evidence_grade}</p>
                          )}
                        </div>
                      </div>
                      {herb.dosage && herb.dosage.length > 0 && (
                        <div className="mt-2 text-sm text-green-700">
                          <p className="font-semibold">Dosage:</p>
                          {herb.dosage.map((d, i) => (
                            <p key={i}>{d.form}: {d.range_min}-{d.range_max} {d.unit}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* action buttons */}
            <div className="space-y-3 mt-6">
              <Link
                href="/chat"
                className="block w-full py-5 rounded-2xl text-lg font-bold text-center bg-ayurv-primary text-white shadow-lg hover:bg-ayurv-secondary transition-all"
              >
                Ask Questions About Results
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setSection("disclaimer");
                  setForm(createInitialFormState());
                  setDisclaimerChecked(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full py-4 rounded-2xl text-base font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Start New Check
              </button>
              <Link
                href="/results"
                className="block w-full py-4 rounded-2xl text-base font-bold text-center text-ayurv-primary bg-ayurv-primary/5 border-2 border-ayurv-primary/20 hover:bg-ayurv-primary/10 transition-all"
              >
                View Detailed Results
              </Link>
            </div>
          </div>

          <p className="text-sm text-gray-400 text-center mt-4 leading-relaxed">
            This is educational information only. Always consult your doctor before using any herb.
          </p>
        </div>
      )}
    </div>
  );
}
