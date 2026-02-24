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
      {/* Progress bar — 3 steps */}
      <div className="flex gap-1.5 mb-6">
        {([1, 2, 3] as Step[]).map((s) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`h-1.5 w-full rounded-full transition-colors ${
                s <= step ? "bg-ayurv-primary" : "bg-gray-200"
              }`}
            />
            <span className={`text-[10px] ${s <= step ? "text-ayurv-primary font-medium" : "text-gray-400"}`}>
              {s === 1 ? "About You" : s === 2 ? "Health" : "Concern"}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* ──────── STEP 1: About You ──────── */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold mb-1">About You</h2>
            <p className="text-sm text-gray-500 mb-5">Quick basics so we can check herb safety for you.</p>

            <div className="space-y-5">
              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ayurv-accent focus:border-transparent"
                  placeholder="Your age"
                />
              </div>

              {/* Sex */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Biological Sex</label>
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

              {/* Pregnancy — only for non-male */}
              {form.sex !== "male" && form.sex !== "" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pregnancy / Reproductive Status
                  </label>
                  <select
                    value={form.pregnancy_status}
                    onChange={(e) => setForm((p) => ({ ...p, pregnancy_status: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ayurv-accent"
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
              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
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
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.has_red_flags === false
                        ? "bg-risk-green-light text-risk-green border-risk-green/30"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    No, I'm fine
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_red_flags: true }))}
                    className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.has_red_flags === true
                        ? "bg-risk-red-light text-risk-red border-risk-red/30"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Yes, I have some
                  </button>
                </div>

                {form.has_red_flags === true && (
                  <div className="space-y-2 bg-risk-red-light/50 rounded-lg p-3">
                    {RED_FLAG_ITEMS.map((q) => (
                      <label key={q.key} className="flex items-center gap-2 cursor-pointer">
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

        {/* ──────── STEP 2: Health Profile ──────── */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold mb-1">Your Health Profile</h2>
            <p className="text-sm text-gray-500 mb-5">
              This helps us check which herbs are safe for you.
            </p>

            <div className="space-y-6">
              {/* Conditions */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Do you have any health conditions?
                </p>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_conditions: false, chronic_conditions: [] }))}
                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.has_conditions === false
                        ? "bg-ayurv-primary text-white border-ayurv-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    No conditions
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_conditions: true }))}
                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.has_conditions === true
                        ? "bg-ayurv-primary text-white border-ayurv-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Yes, I have some
                  </button>
                </div>

                {form.has_conditions === true && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {CONDITION_GROUPS.map((group) => (
                      <div key={group.label} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              expanded_condition_group:
                                p.expanded_condition_group === group.label ? null : group.label,
                            }))
                          }
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <span className="flex items-center gap-2">
                            {group.label}
                            {group.items.some((i) => form.chronic_conditions.includes(i.value)) && (
                              <span className="w-2 h-2 bg-ayurv-primary rounded-full" />
                            )}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {form.expanded_condition_group === group.label ? "▲" : "▼"}
                          </span>
                        </button>
                        {form.expanded_condition_group === group.label && (
                          <div className="px-3 pb-2.5 flex flex-wrap gap-1.5">
                            {group.items.map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => toggleCondition(item.value)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                  form.chronic_conditions.includes(item.value)
                                    ? "bg-ayurv-primary text-white border-ayurv-primary"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {form.has_conditions === true && form.chronic_conditions.length > 0 && (
                  <div className="mt-2 text-xs text-ayurv-primary">
                    Selected: {form.chronic_conditions.length} condition{form.chronic_conditions.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Medications */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Are you taking any medications?
                </p>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_medications: false, medications: [] }))}
                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.has_medications === false
                        ? "bg-ayurv-primary text-white border-ayurv-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    No medications
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, has_medications: true }))}
                    className={`flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      form.has_medications === true
                        ? "bg-ayurv-primary text-white border-ayurv-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    Yes, I take some
                  </button>
                </div>

                {form.has_medications === true && (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {MEDICATION_GROUPS.map((group) => (
                      <div key={group.label} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              expanded_med_group:
                                p.expanded_med_group === group.label ? null : group.label,
                            }))
                          }
                          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <span className="flex items-center gap-2">
                            {group.label}
                            {group.items.some((i) => form.medications.includes(i.value)) && (
                              <span className="w-2 h-2 bg-ayurv-primary rounded-full" />
                            )}
                          </span>
                          <span className="text-gray-400 text-xs">
                            {form.expanded_med_group === group.label ? "▲" : "▼"}
                          </span>
                        </button>
                        {form.expanded_med_group === group.label && (
                          <div className="px-3 pb-2.5 flex flex-wrap gap-1.5">
                            {group.items.map((item) => (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => toggleMedication(item.value)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                  form.medications.includes(item.value)
                                    ? "bg-ayurv-primary text-white border-ayurv-primary"
                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                }`}
                              >
                                {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {form.has_medications === true && form.medications.length > 0 && (
                  <div className="mt-2 text-xs text-ayurv-primary">
                    Selected: {form.medications.length} medication{form.medications.length > 1 ? "s" : ""}
                  </div>
                )}
              </div>

              {/* Current herbs */}
              <div className="border-t border-gray-100 pt-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Any Ayurvedic herbs you already take? <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.current_herbs}
                  onChange={(e) => setForm((p) => ({ ...p, current_herbs: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ayurv-accent focus:border-transparent"
                  placeholder="e.g. Ashwagandha, Triphala"
                />
              </div>
            </div>
          </div>
        )}

        {/* ──────── STEP 3: Concern & Goal ──────── */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold mb-1">What Brings You Here?</h2>
            <p className="text-sm text-gray-500 mb-5">
              Pick your main concern and we will find the right herbs for you.
            </p>

            <div className="space-y-5">
              {/* Concern grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Main concern
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CONCERN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, symptom_primary: opt.value }))}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-colors text-left ${
                        form.symptom_primary === opt.value
                          ? "bg-ayurv-primary text-white border-ayurv-primary"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-base">{opt.icon}</span>
                      <span className="font-medium text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration & Severity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">How long?</label>
                  <select
                    value={form.symptom_duration}
                    onChange={(e) => setForm((p) => ({ ...p, symptom_duration: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ayurv-accent"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">How bad?</label>
                  <div className="flex gap-2">
                    {(["mild", "moderate", "severe"] as const).map((sev) => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, symptom_severity: sev }))}
                        className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                          form.symptom_severity === sev
                            ? sev === "severe"
                              ? "bg-risk-red text-white border-risk-red"
                              : sev === "moderate"
                                ? "bg-risk-amber text-white border-risk-amber"
                                : "bg-risk-green text-white border-risk-green"
                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to do?
                </label>
                <div className="space-y-2">
                  {GOAL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, user_goal: opt.value }))}
                      className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                        form.user_goal === opt.value
                          ? "bg-ayurv-primary text-white border-ayurv-primary"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">{opt.label}</span>
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
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
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

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
              disabled={!canAdvance()}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
              disabled={submitting || !canAdvance()}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-ayurv-primary text-white hover:bg-ayurv-secondary disabled:opacity-50"
            >
              {submitting ? "Assessing..." : "Get My Results"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
