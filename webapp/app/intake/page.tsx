"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  conditionLabels,
  medicationLabels,
} from "@/lib/validation/intakeSchema";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const SYMPTOM_OPTIONS: { value: string; label: string }[] = [
  { value: "general_wellness", label: "General Wellness" },
  { value: "stress_anxiety", label: "Stress / Anxiety" },
  { value: "sleep_issues", label: "Sleep Issues" },
  { value: "digestive_issues", label: "Digestive Issues" },
  { value: "constipation", label: "Constipation" },
  { value: "acidity_reflux", label: "Acidity / Reflux" },
  { value: "joint_pain", label: "Joint Pain" },
  { value: "skin_issues", label: "Skin Issues" },
  { value: "hair_issues", label: "Hair / Scalp Issues" },
  { value: "respiratory_cold_cough", label: "Cold / Cough / Respiratory" },
  { value: "low_energy_fatigue", label: "Low Energy / Fatigue" },
  { value: "memory_concentration", label: "Memory / Concentration" },
  { value: "weight_management", label: "Weight Management" },
  { value: "immunity_general", label: "General Immunity" },
  { value: "reproductive_health", label: "Reproductive Health" },
  { value: "menstrual_issues", label: "Menstrual Issues" },
  { value: "menopausal_symptoms", label: "Menopausal Symptoms" },
  { value: "blood_sugar_concern", label: "Blood Sugar Concern" },
  { value: "cholesterol_concern", label: "Cholesterol Concern" },
  { value: "heart_health", label: "Heart Health" },
  { value: "other", label: "Other" },
];

const GOAL_OPTIONS: { value: string; label: string }[] = [
  { value: "find_herb_for_concern", label: "Find herbs for my concern" },
  { value: "check_safety_of_current_herb", label: "Check safety of a herb I take" },
  { value: "check_drug_herb_interaction", label: "Check drug-herb interactions" },
  { value: "learn_about_specific_herb", label: "Learn about a specific herb" },
  { value: "general_ayurvedic_guidance", label: "General Ayurvedic guidance" },
  { value: "understand_dosage", label: "Understand dosage info" },
];

const RED_FLAG_QUESTIONS: { key: string; label: string }[] = [
  { key: "chest_pain", label: "Are you experiencing chest pain, tightness, or pressure right now?" },
  { key: "blood_in_stool_vomit", label: "Have you noticed blood in your stool or vomit?" },
  { key: "high_fever_over_103", label: "Do you have a high fever (over 103°F / 39.4°C)?" },
  { key: "sudden_weakness_paralysis", label: "Have you experienced sudden weakness or paralysis?" },
  { key: "suicidal_thoughts", label: "Are you having thoughts of self-harm or suicide?" },
  { key: "difficulty_breathing", label: "Are you having difficulty breathing right now?" },
  { key: "severe_allergic_reaction", label: "Are you experiencing a severe allergic reaction (swelling, hives, throat closing)?" },
  { key: "yellowing_skin_eyes", label: "Have you noticed yellowing of your skin or eyes?" },
];

interface FormState {
  age: string;
  sex: string;
  pregnancy_status: string;
  chronic_conditions: string[];
  medications: string[];
  current_herbs: string;
  symptom_primary: string;
  symptom_duration: string;
  symptom_severity: string;
  user_goal: string;
  red_flags: Record<string, boolean>;
}

export default function IntakePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    age: "",
    sex: "",
    pregnancy_status: "",
    chronic_conditions: [],
    medications: [],
    current_herbs: "",
    symptom_primary: "",
    symptom_duration: "",
    symptom_severity: "",
    user_goal: "",
    red_flags: Object.fromEntries(RED_FLAG_QUESTIONS.map((q) => [q.key, false])),
  });

  useEffect(() => {
    const disc = sessionStorage.getItem("ayurv_disclaimer");
    if (!disc) {
      router.replace("/");
    }
  }, [router]);

  function toggleArrayField(field: "chronic_conditions" | "medications", value: string) {
    setForm((prev) => {
      const arr = prev[field];
      if (value === "none") return { ...prev, [field]: ["none"] };
      const filtered = arr.filter((v) => v !== "none");
      if (filtered.includes(value)) {
        return { ...prev, [field]: filtered.filter((v) => v !== value) };
      }
      return { ...prev, [field]: [...filtered, value] };
    });
  }

  function canAdvance(): boolean {
    switch (step) {
      case 1:
        return (
          form.age !== "" &&
          Number(form.age) >= 1 &&
          Number(form.age) <= 120 &&
          form.sex !== "" &&
          form.pregnancy_status !== ""
        );
      case 2:
        return true; // Red flags always answerable
      case 3:
        return form.chronic_conditions.length > 0;
      case 4:
        return form.medications.length > 0;
      case 5:
        return (
          form.symptom_primary !== "" &&
          form.symptom_duration !== "" &&
          form.symptom_severity !== "" &&
          form.user_goal !== ""
        );
      case 6:
        return true;
      default:
        return false;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const payload = {
      age: Number(form.age),
      sex: form.sex,
      pregnancy_status: form.pregnancy_status,
      chronic_conditions: form.chronic_conditions,
      medications: form.medications,
      current_herbs: form.current_herbs
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
      symptom_primary: form.symptom_primary,
      symptom_duration: form.symptom_duration,
      symptom_severity: form.symptom_severity,
      user_goal: form.user_goal,
      red_flag_screen: form.red_flags,
      disclaimer_accepted: true as const,
    };

    try {
      const res = await fetch("/api/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Assessment failed");
      }

      const result = await res.json();
      sessionStorage.setItem("ayurv_result", JSON.stringify(result));
      router.push("/results");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="flex gap-1 mb-8">
        {([1, 2, 3, 4, 5, 6] as Step[]).map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-ayurv-primary" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* STEP 1: Demographics */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ayurv-accent focus:border-transparent"
                  placeholder="Enter your age"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Biological Sex
                </label>
                <div className="flex gap-3">
                  {(["male", "female", "other"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({
                          ...p,
                          sex: s,
                          pregnancy_status: s === "male" ? "not_applicable" : p.pregnancy_status === "not_applicable" ? "" : p.pregnancy_status,
                        }))
                      }
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        form.sex === s
                          ? "bg-ayurv-primary text-white border-ayurv-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {form.sex !== "male" && form.sex !== "" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pregnancy / Reproductive Status
                  </label>
                  <select
                    value={form.pregnancy_status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, pregnancy_status: e.target.value }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ayurv-accent"
                  >
                    <option value="">Select...</option>
                    <option value="not_pregnant">Not pregnant</option>
                    <option value="pregnant_trimester_1">Pregnant — 1st trimester</option>
                    <option value="pregnant_trimester_2">Pregnant — 2nd trimester</option>
                    <option value="pregnant_trimester_3">Pregnant — 3rd trimester</option>
                    <option value="trying_to_conceive">Trying to conceive</option>
                    <option value="lactating">Breastfeeding / Lactating</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Red Flags */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Safety Screening</h2>
            <p className="text-sm text-gray-500 mb-4">
              Please answer honestly. If any apply, we will direct you to seek medical care
              immediately.
            </p>

            <div className="space-y-3">
              {RED_FLAG_QUESTIONS.map((q) => (
                <label
                  key={q.key}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.red_flags[q.key]}
                    onChange={() =>
                      setForm((p) => ({
                        ...p,
                        red_flags: { ...p.red_flags, [q.key]: !p.red_flags[q.key] },
                      }))
                    }
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-risk-red focus:ring-risk-red"
                  />
                  <span className="text-sm text-gray-700">{q.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Conditions */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Existing Health Conditions</h2>
            <p className="text-sm text-gray-500 mb-4">
              Select all that apply. This determines which herbs are safe for you.
            </p>

            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
              {Object.entries(conditionLabels).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleArrayField("chronic_conditions", value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.chronic_conditions.includes(value)
                      ? "bg-ayurv-primary text-white border-ayurv-primary"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Medications */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Current Medications</h2>
            <p className="text-sm text-gray-500 mb-4">
              Select all that you are currently taking. Critical for interaction checking.
            </p>

            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
              {Object.entries(medicationLabels).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleArrayField("medications", value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.medications.includes(value)
                      ? "bg-ayurv-primary text-white border-ayurv-primary"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Concern & Goal */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Concern</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary concern
                </label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, symptom_primary: opt.value }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        form.symptom_primary === opt.value
                          ? "bg-ayurv-primary text-white border-ayurv-primary"
                          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    value={form.symptom_duration}
                    onChange={(e) => setForm((p) => ({ ...p, symptom_duration: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="less_than_1_week">Less than 1 week</option>
                    <option value="1_4_weeks">1-4 weeks</option>
                    <option value="1_3_months">1-3 months</option>
                    <option value="3_6_months">3-6 months</option>
                    <option value="over_6_months">Over 6 months</option>
                    <option value="chronic_ongoing">Chronic / Ongoing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={form.symptom_severity}
                    onChange={(e) => setForm((p) => ({ ...p, symptom_severity: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select...</option>
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What do you want from this session?
                </label>
                <div className="space-y-2">
                  {GOAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, user_goal: opt.value }))}
                      className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors ${
                        form.user_goal === opt.value
                          ? "bg-ayurv-primary text-white border-ayurv-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Current Herbs + Review */}
        {step === 6 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Almost Done</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Herbs you currently take (optional, comma-separated)
              </label>
              <input
                type="text"
                value={form.current_herbs}
                onChange={(e) => setForm((p) => ({ ...p, current_herbs: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="e.g. Ashwagandha, Triphala"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1 mb-6">
              <p><strong>Age:</strong> {form.age}</p>
              <p><strong>Sex:</strong> {form.sex}</p>
              <p><strong>Pregnancy:</strong> {form.pregnancy_status.replace(/_/g, " ")}</p>
              <p><strong>Conditions:</strong> {form.chronic_conditions.join(", ") || "—"}</p>
              <p><strong>Medications:</strong> {form.medications.join(", ") || "—"}</p>
              <p><strong>Concern:</strong> {form.symptom_primary.replace(/_/g, " ")}</p>
              <p><strong>Severity:</strong> {form.symptom_severity}</p>
              <p><strong>Duration:</strong> {form.symptom_duration.replace(/_/g, " ")}</p>
              <p><strong>Goal:</strong> {form.user_goal.replace(/_/g, " ")}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            disabled={step === 1}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:invisible"
          >
            Back
          </button>

          {step < 6 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(6, s + 1) as Step)}
              disabled={!canAdvance()}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                canAdvance()
                  ? "bg-ayurv-primary text-white hover:bg-ayurv-secondary"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-ayurv-primary text-white hover:bg-ayurv-secondary disabled:opacity-50"
            >
              {submitting ? "Assessing..." : "Run Assessment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
