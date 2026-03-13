"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateUid } from "@/lib/storage";
import { createInitialFormState, RED_FLAG_ITEMS, type IntakeFormState } from "@/components/intake/constants";
import StepAbout from "@/components/intake/StepAbout";
import StepHealth from "@/components/intake/StepHealth";
import StepConcern from "@/components/intake/StepConcern";
import { trackEvent } from "@/lib/track";

type Step = 1 | 2 | 3;

const STEP_LABELS = ["About You", "Health", "Concern"];

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(() => {
    // restore saved step from sessionStorage
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("ayurv_intake_step");
      if (saved && [1, 2, 3].includes(Number(saved))) return Number(saved) as Step;
    }
    return 1;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<IntakeFormState>(() => {
    // restore saved form from sessionStorage
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("ayurv_intake_form");
      if (saved) {
        try { return JSON.parse(saved); } catch { /* corrupt — use default */ }
      }
    }
    return createInitialFormState();
  });
  const [profileLoaded, setProfileLoaded] = useState(false);

  // persist step + form to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem("ayurv_intake_step", String(step));
  }, [step]);

  useEffect(() => {
    sessionStorage.setItem("ayurv_intake_form", JSON.stringify(form));
  }, [form]);

  // load saved profile from backend
  useEffect(() => {
    const disc = sessionStorage.getItem("ayurv_disclaimer");
    if (!disc) {
      router.replace("/");
      return;
    }

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
          current_herbs: saved.current_herbs
            ? typeof saved.current_herbs === "string"
              ? saved.current_herbs.split(",").map((h: string) => h.trim()).filter(Boolean)
              : saved.current_herbs
            : prev.current_herbs,
        }));
        setProfileLoaded(true);
      })
      .catch(() => {});
  }, [router]);

  // --- Validation ---

  const hasActiveRedFlags = Object.values(form.red_flags).some((v) => v);

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return (
          form.age !== "" &&
          Number(form.age) >= 1 &&
          Number(form.age) <= 120 &&
          form.sex !== "" &&
          form.pregnancy_status !== "" &&
          form.has_red_flags !== null &&
          !hasActiveRedFlags // SAFETY GATE: block if red flags checked
        );
      case 2:
        return (
          form.has_conditions !== null &&
          form.has_medications !== null &&
          (form.has_conditions === false || form.chronic_conditions.length > 0) &&
          (form.has_medications === false || form.medications.length > 0)
        );
      case 3:
        return form.symptom_primary !== "";
      default:
        return false;
    }
  }

  // --- Submit ---

  async function handleSubmit() {
    setSubmitting(true);
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
      symptom_duration: form.symptom_duration || "chronic_ongoing",
      symptom_severity: form.symptom_severity || "moderate",
      user_goal: form.user_goal || "find_herb_for_concern",
      red_flag_screen: form.red_flags,
      disclaimer_accepted: true as const,
      anonymous_uid: uid,
    };

    try {
      // 30s timeout — network issues pe user stuck nahi rahega
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

      const result = await res.json();
      sessionStorage.setItem("ayurv_result", JSON.stringify(result));
      trackEvent("intake_completed", { concern: form.symptom_primary });
      // intake done — clean up saved progress
      sessionStorage.removeItem("ayurv_intake_step");
      sessionStorage.removeItem("ayurv_intake_form");

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

      router.push("/chat");
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

  function handleClearProfile() {
    setForm((prev) => ({
      ...prev,
      age: "", sex: "", pregnancy_status: "",
      has_conditions: null, chronic_conditions: [],
      has_medications: null, medications: [],
      current_herbs: [],
    }));
    setProfileLoaded(false);
  }

  // --- Render ---

  return (
    <div className="max-w-2xl mx-auto">
      {/* progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEP_LABELS.map((label, idx) => {
            const num = (idx + 1) as Step;
            const isComplete = num < step;
            const isCurrent = num === step;

            return (
              <div key={label} className="flex items-center flex-1">
                <div className="flex flex-col items-center" aria-current={isCurrent ? "step" : undefined} aria-label={`Step ${num}: ${label}${isComplete ? " (complete)" : isCurrent ? " (current)" : ""}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isComplete
                        ? "bg-risk-green text-white shadow-sm"
                        : isCurrent
                          ? "bg-ayurv-primary text-white shadow-md shadow-ayurv-primary/25"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      num
                    )}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium transition-colors ${
                    num <= step ? "text-ayurv-primary" : "text-gray-400"
                  }`}>
                    {label}
                  </span>
                </div>
                {idx < STEP_LABELS.length - 1 && (
                  <div className="flex-1 mx-3 mb-5">
                    <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          isComplete ? "bg-risk-green w-full" : "bg-gray-200 w-0"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* form card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {step === 1 && (
          <StepAbout
            form={form}
            setForm={setForm}
            profileLoaded={profileLoaded}
            onClearProfile={handleClearProfile}
          />
        )}
        {step === 2 && <StepHealth form={form} setForm={setForm} />}
        {step === 3 && <StepConcern form={form} setForm={setForm} error={error} />}

        {/* navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          {step === 1 ? (
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Home
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                const nextStep = step + 1;
                trackEvent("intake_step_changed", { from: step, to: nextStep });
                // red flag check — track if user triggered any
                if (step === 1 && hasActiveRedFlags) {
                  trackEvent("red_flag_triggered", {
                    flags: Object.entries(form.red_flags).filter(([, v]) => v).map(([k]) => k).join(","),
                  });
                }
                setStep((s) => Math.min(3, s + 1) as Step);
              }}
              disabled={!canAdvance()}
              aria-disabled={!canAdvance()}
              aria-label={canAdvance() ? `Continue to step ${step + 1}` : "Complete all required fields to continue"}
              className={`flex items-center gap-1.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                canAdvance()
                  ? "bg-ayurv-primary text-white hover:bg-ayurv-secondary shadow-md shadow-ayurv-primary/15 hover:shadow-lg hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !canAdvance()}
              className={`px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                canAdvance() && !submitting
                  ? "bg-ayurv-primary text-white hover:bg-ayurv-secondary shadow-lg shadow-ayurv-primary/25 hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {submitting ? (
                <span className="flex items-center gap-2" role="status" aria-label="Analysing your health profile">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Analysing your profile...
                </span>
              ) : (
                "Get My Safety Report"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
