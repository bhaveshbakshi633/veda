"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3;

// ============================================
// GROUPED CONDITIONS (instead of flat list)
// ============================================

interface ConditionGroup {
  label: string;
  items: { value: string; label: string }[];
}

const CONDITION_GROUPS: ConditionGroup[] = [
  {
    label: "Heart & Blood Pressure",
    items: [
      { value: "hypertension", label: "High BP" },
      { value: "heart_failure", label: "Heart Failure" },
      { value: "coronary_artery_disease", label: "Heart Disease" },
      { value: "arrhythmia", label: "Irregular Heartbeat" },
    ],
  },
  {
    label: "Diabetes & Thyroid",
    items: [
      { value: "diabetes_type_1", label: "Type 1 Diabetes" },
      { value: "diabetes_type_2", label: "Type 2 Diabetes" },
      { value: "hypothyroid", label: "Low Thyroid" },
      { value: "hyperthyroid", label: "Overactive Thyroid" },
    ],
  },
  {
    label: "Digestive",
    items: [
      { value: "peptic_ulcer", label: "Stomach Ulcer" },
      { value: "gerd", label: "Acid Reflux / GERD" },
      { value: "ibs_constipation", label: "IBS (Constipation)" },
      { value: "ibs_diarrhea", label: "IBS (Diarrhea)" },
      { value: "ibd", label: "IBD / Crohn's" },
    ],
  },
  {
    label: "Kidney & Liver",
    items: [
      { value: "kidney_disease_mild", label: "Mild Kidney Issue" },
      { value: "kidney_disease_moderate_severe", label: "Serious Kidney Issue" },
      { value: "liver_disease", label: "Liver Disease" },
      { value: "kidney_stones", label: "Kidney Stones" },
    ],
  },
  {
    label: "Mental Health",
    items: [
      { value: "depression", label: "Depression" },
      { value: "anxiety_disorder", label: "Anxiety" },
      { value: "bipolar_disorder", label: "Bipolar" },
      { value: "epilepsy", label: "Epilepsy" },
    ],
  },
  {
    label: "Autoimmune",
    items: [
      { value: "autoimmune_ra", label: "Rheumatoid Arthritis" },
      { value: "autoimmune_lupus", label: "Lupus" },
      { value: "autoimmune_hashimotos", label: "Hashimoto's" },
      { value: "autoimmune_ms", label: "Multiple Sclerosis" },
      { value: "autoimmune_other", label: "Other Autoimmune" },
    ],
  },
  {
    label: "Women's Health",
    items: [
      { value: "pcos", label: "PCOS" },
      { value: "endometriosis", label: "Endometriosis" },
      { value: "uterine_fibroids", label: "Fibroids" },
      { value: "breast_cancer_history", label: "Breast Cancer History" },
    ],
  },
  {
    label: "Other",
    items: [
      { value: "asthma", label: "Asthma" },
      { value: "copd", label: "COPD" },
      { value: "bleeding_disorder", label: "Bleeding Disorder" },
      { value: "iron_overload", label: "Iron Overload" },
      { value: "obesity", label: "Obesity" },
      { value: "underweight", label: "Underweight" },
      { value: "scheduled_surgery_within_4_weeks", label: "Surgery Soon" },
      { value: "organ_transplant", label: "Organ Transplant" },
      { value: "other", label: "Something Else" },
    ],
  },
];

// ============================================
// GROUPED MEDICATIONS
// ============================================

interface MedGroup {
  label: string;
  items: { value: string; label: string }[];
}

const MEDICATION_GROUPS: MedGroup[] = [
  {
    label: "Diabetes",
    items: [
      { value: "antidiabetic_oral", label: "Diabetes pills (Metformin, etc.)" },
      { value: "insulin", label: "Insulin" },
    ],
  },
  {
    label: "Blood Pressure & Heart",
    items: [
      { value: "antihypertensive_ace_arb", label: "BP pills (Enalapril, Losartan)" },
      { value: "antihypertensive_beta_blocker", label: "Beta-blocker (Metoprolol)" },
      { value: "antihypertensive_ccb", label: "Amlodipine / similar" },
      { value: "antihypertensive_diuretic_loop", label: "Water pill (Furosemide)" },
      { value: "antihypertensive_diuretic_thiazide", label: "Water pill (HCTZ)" },
      { value: "diuretic_potassium_sparing", label: "Spironolactone" },
      { value: "digoxin", label: "Digoxin" },
      { value: "statin", label: "Cholesterol pill (Atorvastatin)" },
    ],
  },
  {
    label: "Blood Thinners",
    items: [
      { value: "warfarin", label: "Warfarin" },
      { value: "aspirin_antiplatelet", label: "Aspirin (daily)" },
      { value: "clopidogrel", label: "Clopidogrel (Plavix)" },
      { value: "doac_anticoagulant", label: "Newer blood thinner" },
    ],
  },
  {
    label: "Mental Health & Brain",
    items: [
      { value: "ssri", label: "Antidepressant (SSRI)" },
      { value: "snri", label: "Antidepressant (SNRI)" },
      { value: "benzodiazepine", label: "Anxiety/sleep pill (Alprazolam)" },
      { value: "antiepileptic", label: "Anti-seizure medication" },
      { value: "lithium", label: "Lithium" },
      { value: "antipsychotic", label: "Antipsychotic" },
    ],
  },
  {
    label: "Thyroid",
    items: [
      { value: "thyroid_levothyroxine", label: "Thyroid pill (Thyronorm)" },
      { value: "antithyroid_medication", label: "Anti-thyroid (Neomercazole)" },
    ],
  },
  {
    label: "Immune & Cancer",
    items: [
      { value: "corticosteroid_oral", label: "Steroid pills (Prednisolone)" },
      { value: "immunosuppressant", label: "Immunosuppressant" },
      { value: "methotrexate", label: "Methotrexate" },
      { value: "chemotherapy", label: "Chemotherapy" },
      { value: "tamoxifen", label: "Tamoxifen" },
      { value: "aromatase_inhibitor", label: "Aromatase Inhibitor" },
    ],
  },
  {
    label: "Other Common",
    items: [
      { value: "oral_contraceptive", label: "Birth control pill" },
      { value: "hrt", label: "Hormone therapy (HRT)" },
      { value: "iron_supplement", label: "Iron supplement" },
      { value: "nsaid_regular", label: "Painkiller (Ibuprofen, Diclofenac)" },
      { value: "ppi_antacid", label: "Antacid (Omeprazole, Pantoprazole)" },
      { value: "anti_tb_drugs", label: "TB medication" },
      { value: "other", label: "Something else" },
    ],
  },
];

// ============================================
// SIMPLIFIED CONCERNS
// ============================================

const CONCERN_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: "stress_anxiety", label: "Stress / Anxiety", icon: "😰" },
  { value: "sleep_issues", label: "Sleep Issues", icon: "😴" },
  { value: "digestive_issues", label: "Digestion", icon: "🫄" },
  { value: "low_energy_fatigue", label: "Low Energy", icon: "🔋" },
  { value: "joint_pain", label: "Joint Pain", icon: "🦴" },
  { value: "immunity_general", label: "Immunity", icon: "🛡️" },
  { value: "memory_concentration", label: "Focus / Memory", icon: "🧠" },
  { value: "skin_issues", label: "Skin / Hair", icon: "✨" },
  { value: "heart_health", label: "Heart Health", icon: "❤️" },
  { value: "blood_sugar_concern", label: "Blood Sugar", icon: "🩸" },
  { value: "menstrual_issues", label: "Period Issues", icon: "🌸" },
  { value: "weight_management", label: "Weight", icon: "⚖️" },
  { value: "general_wellness", label: "General Wellness", icon: "🌿" },
  { value: "other", label: "Something Else", icon: "💬" },
];

const GOAL_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: "find_herb_for_concern", label: "Find herbs for my concern", desc: "Get personalized herb recommendations" },
  { value: "check_safety_of_current_herb", label: "Check if a herb is safe for me", desc: "Verify safety of something you already take" },
  { value: "learn_about_specific_herb", label: "Learn about a specific herb", desc: "Get evidence-based information" },
  { value: "general_ayurvedic_guidance", label: "General guidance", desc: "General Ayurvedic wellness advice" },
];

// ============================================
// RED FLAGS (inline, single toggle)
// ============================================

const RED_FLAG_ITEMS = [
  { key: "chest_pain", label: "Chest pain or tightness" },
  { key: "difficulty_breathing", label: "Difficulty breathing" },
  { key: "blood_in_stool_vomit", label: "Blood in stool or vomit" },
  { key: "high_fever_over_103", label: "High fever (>103°F)" },
  { key: "sudden_weakness_paralysis", label: "Sudden weakness or paralysis" },
  { key: "severe_allergic_reaction", label: "Severe allergic reaction" },
  { key: "yellowing_skin_eyes", label: "Yellow skin or eyes" },
  { key: "suicidal_thoughts", label: "Thoughts of self-harm" },
];

// ============================================
// STEP CONFIG for progress bar
// ============================================

const STEP_CONFIG = [
  {
    num: 1 as Step,
    label: "About You",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    num: 2 as Step,
    label: "Health",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    num: 3 as Step,
    label: "Concern",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
  },
];

// ============================================
// FORM STATE
// ============================================

interface FormState {
  age: string;
  sex: string;
  pregnancy_status: string;
  has_conditions: boolean | null;
  chronic_conditions: string[];
  expanded_condition_group: string | null;
  has_medications: boolean | null;
  medications: string[];
  expanded_med_group: string | null;
  current_herbs: string;
  symptom_primary: string;
  symptom_duration: string;
  symptom_severity: string;
  user_goal: string;
  has_red_flags: boolean | null;
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
    has_conditions: null,
    chronic_conditions: [],
    expanded_condition_group: null,
    has_medications: null,
    medications: [],
    expanded_med_group: null,
    current_herbs: "",
    symptom_primary: "",
    symptom_duration: "",
    symptom_severity: "",
    user_goal: "",
    has_red_flags: null,
    red_flags: Object.fromEntries(RED_FLAG_ITEMS.map((q) => [q.key, false])),
  });

  useEffect(() => {
    const disc = sessionStorage.getItem("ayurv_disclaimer");
    if (!disc) {
      router.replace("/");
    }
  }, [router]);

  function toggleCondition(value: string) {
    setForm((prev) => {
      const arr = prev.chronic_conditions;
      if (arr.includes(value)) {
        return { ...prev, chronic_conditions: arr.filter((v) => v !== value) };
      }
      return { ...prev, chronic_conditions: [...arr, value] };
    });
  }

  function toggleMedication(value: string) {
    setForm((prev) => {
      const arr = prev.medications;
      if (arr.includes(value)) {
        return { ...prev, medications: arr.filter((v) => v !== value) };
      }
      return { ...prev, medications: [...arr, value] };
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
          form.pregnancy_status !== "" &&
          form.has_red_flags !== null
        );
      case 2:
        return (
          form.has_conditions !== null &&
          form.has_medications !== null &&
          (form.has_conditions === false || form.chronic_conditions.length > 0) &&
          (form.has_medications === false || form.medications.length > 0)
        );
      case 3:
        return (
          form.symptom_primary !== "" &&
          form.symptom_duration !== "" &&
          form.symptom_severity !== "" &&
          form.user_goal !== ""
        );
      default:
        return false;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const conditions = form.has_conditions ? form.chronic_conditions : ["none"];
    const medications = form.has_medications ? form.medications : ["none"];

    const payload = {
      age: Number(form.age),
      sex: form.sex,
      pregnancy_status: form.pregnancy_status,
      chronic_conditions: conditions,
      medications: medications,
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
      {/* ---- Premium Progress Bar ---- */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEP_CONFIG.map((s, idx) => (
            <div key={s.num} className="flex items-center flex-1">
              {/* step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    s.num < step
                      ? "bg-risk-green text-white shadow-sm"
                      : s.num === step
                        ? "bg-ayurv-primary text-white shadow-md shadow-ayurv-primary/25"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {s.num < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.icon
                  )}
                </div>
                <span className={`text-xs mt-1.5 font-medium transition-colors ${
                  s.num <= step ? "text-ayurv-primary" : "text-gray-400"
                }`}>
                  {s.label}
                </span>
              </div>
              {/* connector line */}
              {idx < STEP_CONFIG.length - 1 && (
                <div className="flex-1 mx-3 mb-5">
                  <div className="h-0.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        s.num < step ? "bg-risk-green w-full" : "bg-gray-200 w-0"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ---- Form Card ---- */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* -------- STEP 1: About You -------- */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">About You</h2>
            <p className="text-sm text-ayurv-muted mb-6">Quick basics so we can check herb safety for you.</p>

            <div className="space-y-6">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:bg-white"
                  placeholder="Your age"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Biological Sex</label>
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
                      className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                        form.sex === s
                          ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md shadow-ayurv-primary/15"
                          : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-accent/30 hover:bg-ayurv-primary/5"
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pregnancy — only for non-male */}
              {form.sex !== "male" && form.sex !== "" && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pregnancy / Reproductive Status
                  </label>
                  <select
                    value={form.pregnancy_status}
                    onChange={(e) => setForm((p) => ({ ...p, pregnancy_status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="not_pregnant">Not pregnant</option>
                    <option value="pregnant_trimester_1">Pregnant — 1st trimester</option>
                    <option value="pregnant_trimester_2">Pregnant — 2nd trimester</option>
                    <option value="pregnant_trimester_3">Pregnant — 3rd trimester</option>
                    <option value="trying_to_conceive">Trying to conceive</option>
                    <option value="lactating">Breastfeeding</option>
                  </select>
                </div>
              )}

              {/* Red flags — inline quick check */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Are you experiencing any urgent symptoms right now?
                </p>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({
                      ...p,
                      has_red_flags: false,
                      red_flags: Object.fromEntries(RED_FLAG_ITEMS.map((q) => [q.key, false])),
                    }))}
                    className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      form.has_red_flags === false
                        ? "bg-risk-green-light text-risk-green border-risk-green/30 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-risk-green/20 hover:bg-risk-green-light/50"
                    }`}
                  >
                    No, I'm fine
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_red_flags: true }))}
                    className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      form.has_red_flags === true
                        ? "bg-risk-red-light text-risk-red border-risk-red/30 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-risk-red/20 hover:bg-risk-red-light/50"
                    }`}
                  >
                    Yes, I have some
                  </button>
                </div>

                {form.has_red_flags === true && (
                  <div className="space-y-2 bg-risk-red-light/50 rounded-xl p-4 animate-fade-in border border-risk-red/10">
                    {RED_FLAG_ITEMS.map((q) => (
                      <label key={q.key} className="flex items-center gap-3 cursor-pointer py-1 hover:bg-white/50 rounded-lg px-2 -mx-2 transition-colors">
                        <input
                          type="checkbox"
                          checked={form.red_flags[q.key]}
                          onChange={() =>
                            setForm((p) => ({
                              ...p,
                              red_flags: { ...p.red_flags, [q.key]: !p.red_flags[q.key] },
                            }))
                          }
                          className="h-4 w-4 rounded border-gray-300 text-risk-red focus:ring-risk-red"
                        />
                        <span className="text-sm text-gray-700">{q.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* -------- STEP 2: Health Profile -------- */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Your Health Profile</h2>
            <p className="text-sm text-ayurv-muted mb-6">
              This helps us check which herbs are safe for you.
            </p>

            <div className="space-y-6">
              {/* Conditions */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Do you have any health conditions?
                </p>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_conditions: false, chronic_conditions: [] }))}
                    className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      form.has_conditions === false
                        ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md shadow-ayurv-primary/15"
                        : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-accent/30 hover:bg-ayurv-primary/5"
                    }`}
                  >
                    No conditions
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_conditions: true }))}
                    className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      form.has_conditions === true
                        ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md shadow-ayurv-primary/15"
                        : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-accent/30 hover:bg-ayurv-primary/5"
                    }`}
                  >
                    Yes, I have some
                  </button>
                </div>

                {form.has_conditions === true && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 animate-fade-in">
                    {CONDITION_GROUPS.map((group) => {
                      const isExpanded = form.expanded_condition_group === group.label;
                      const hasSelected = group.items.some((i) => form.chronic_conditions.includes(i.value));
                      return (
                        <div key={group.label} className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                          hasSelected ? "border-ayurv-accent/30 bg-ayurv-primary/[0.02]" : "border-gray-200"
                        }`}>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((p) => ({
                                ...p,
                                expanded_condition_group:
                                  p.expanded_condition_group === group.label ? null : group.label,
                              }))
                            }
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50/80 transition-colors"
                          >
                            <span className="flex items-center gap-2.5">
                              {group.label}
                              {hasSelected && (
                                <span className="w-2 h-2 bg-ayurv-primary rounded-full" />
                              )}
                            </span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-3 flex flex-wrap gap-2 animate-fade-in">
                              {group.items.map((item) => (
                                <button
                                  key={item.value}
                                  type="button"
                                  onClick={() => toggleCondition(item.value)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                                    form.chronic_conditions.includes(item.value)
                                      ? "bg-ayurv-primary text-white border-ayurv-primary shadow-sm"
                                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-ayurv-primary/5 hover:border-ayurv-accent/30"
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {form.has_conditions === true && form.chronic_conditions.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-ayurv-primary font-medium bg-ayurv-primary/5 rounded-lg px-3 py-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {form.chronic_conditions.length} condition{form.chronic_conditions.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>

              {/* Medications */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Are you taking any medications?
                </p>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_medications: false, medications: [] }))}
                    className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      form.has_medications === false
                        ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md shadow-ayurv-primary/15"
                        : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-accent/30 hover:bg-ayurv-primary/5"
                    }`}
                  >
                    No medications
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_medications: true }))}
                    className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                      form.has_medications === true
                        ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md shadow-ayurv-primary/15"
                        : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-accent/30 hover:bg-ayurv-primary/5"
                    }`}
                  >
                    Yes, I take some
                  </button>
                </div>

                {form.has_medications === true && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 animate-fade-in">
                    {MEDICATION_GROUPS.map((group) => {
                      const isExpanded = form.expanded_med_group === group.label;
                      const hasSelected = group.items.some((i) => form.medications.includes(i.value));
                      return (
                        <div key={group.label} className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                          hasSelected ? "border-ayurv-accent/30 bg-ayurv-primary/[0.02]" : "border-gray-200"
                        }`}>
                          <button
                            type="button"
                            onClick={() =>
                              setForm((p) => ({
                                ...p,
                                expanded_med_group:
                                  p.expanded_med_group === group.label ? null : group.label,
                              }))
                            }
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50/80 transition-colors"
                          >
                            <span className="flex items-center gap-2.5">
                              {group.label}
                              {hasSelected && (
                                <span className="w-2 h-2 bg-ayurv-primary rounded-full" />
                              )}
                            </span>
                            <svg
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-3 flex flex-wrap gap-2 animate-fade-in">
                              {group.items.map((item) => (
                                <button
                                  key={item.value}
                                  type="button"
                                  onClick={() => toggleMedication(item.value)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                                    form.medications.includes(item.value)
                                      ? "bg-ayurv-primary text-white border-ayurv-primary shadow-sm"
                                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-ayurv-primary/5 hover:border-ayurv-accent/30"
                                  }`}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {form.has_medications === true && form.medications.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-ayurv-primary font-medium bg-ayurv-primary/5 rounded-lg px-3 py-2">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {form.medications.length} medication{form.medications.length > 1 ? "s" : ""} selected
                  </div>
                )}
              </div>

              {/* Current herbs */}
              <div className="border-t border-gray-100 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Any Ayurvedic herbs you already take? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.current_herbs}
                  onChange={(e) => setForm((p) => ({ ...p, current_herbs: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:bg-white"
                  placeholder="e.g. Ashwagandha, Triphala"
                />
              </div>
            </div>
          </div>
        )}

        {/* -------- STEP 3: Concern & Goal -------- */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold text-gray-900 mb-1">What Brings You Here?</h2>
            <p className="text-sm text-ayurv-muted mb-6">
              Pick your main concern and we will find the right herbs for you.
            </p>

            <div className="space-y-6">
              {/* Concern grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Main concern
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CONCERN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, symptom_primary: opt.value }))}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3.5 rounded-xl border-2 text-sm transition-all duration-200 ${
                        form.symptom_primary === opt.value
                          ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md shadow-ayurv-primary/15 scale-[1.02]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-accent/30 hover:bg-ayurv-primary/5 hover:shadow-sm"
                      }`}
                    >
                      <span className="text-xl">{opt.icon}</span>
                      <span className="font-medium text-xs leading-tight text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">How long?</label>
                  <select
                    value={form.symptom_duration}
                    onChange={(e) => setForm((p) => ({ ...p, symptom_duration: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:bg-white"
                  >
                    <option value="">Select...</option>
                    <option value="less_than_1_week">Less than a week</option>
                    <option value="1_4_weeks">A few weeks</option>
                    <option value="1_3_months">1-3 months</option>
                    <option value="3_6_months">3-6 months</option>
                    <option value="over_6_months">Over 6 months</option>
                    <option value="chronic_ongoing">Ongoing / chronic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">How bad?</label>
                  <div className="flex gap-2">
                    {(["mild", "moderate", "severe"] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, symptom_severity: sev }))}
                        className={`flex-1 py-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                          form.symptom_severity === sev
                            ? sev === "severe"
                              ? "bg-risk-red text-white border-risk-red shadow-md shadow-risk-red/15"
                              : sev === "moderate"
                                ? "bg-risk-amber text-white border-risk-amber shadow-md shadow-risk-amber/15"
                                : "bg-risk-green text-white border-risk-green shadow-md shadow-risk-green/15"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {sev.charAt(0).toUpperCase() + sev.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to do?
                </label>
                <div className="space-y-2.5">
                  {GOAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, user_goal: opt.value }))}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm transition-all duration-200 ${
                        form.user_goal === opt.value
                          ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md shadow-ayurv-primary/15"
                          : "bg-white text-gray-700 border-gray-200 hover:border-ayurv-accent/30 hover:bg-ayurv-primary/5"
                      }`}
                    >
                      <span className="font-semibold">{opt.label}</span>
                      <span className={`block text-xs mt-0.5 ${
                        form.user_goal === opt.value ? "text-white/80" : "text-gray-400"
                      }`}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl flex items-start gap-2.5">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---- Navigation ---- */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            disabled={step === 1}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-900 disabled:invisible transition-colors rounded-lg hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
              disabled={!canAdvance()}
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
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Assessing...
                </span>
              ) : (
                "Get My Results"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
