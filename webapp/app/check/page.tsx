"use client";

import { useState } from "react";
import Link from "next/link";
import { HERB_LIST } from "@/components/intake/constants";
import { trackEvent } from "@/lib/track";

// medication list for the checker (simplified from intake)
const MEDICATIONS = [
  { id: "med_warfarin", label: "Warfarin (blood thinner)" },
  { id: "med_aspirin_antiplatelet", label: "Aspirin / Antiplatelet" },
  { id: "med_clopidogrel", label: "Clopidogrel (Plavix)" },
  { id: "med_doac_anticoagulant", label: "DOACs (Rivaroxaban, Apixaban)" },
  { id: "med_antidiabetic_oral", label: "Oral Diabetes Meds (Metformin etc.)" },
  { id: "med_insulin", label: "Insulin" },
  { id: "med_levothyroxine", label: "Thyroid (Levothyroxine)" },
  { id: "med_antithyroid", label: "Anti-thyroid Medication" },
  { id: "med_ace_arb", label: "ACE Inhibitors / ARBs (BP)" },
  { id: "med_beta_blocker", label: "Beta Blockers (BP)" },
  { id: "med_ccb", label: "Calcium Channel Blockers (BP)" },
  { id: "med_ssri", label: "SSRIs (Antidepressant)" },
  { id: "med_snri", label: "SNRIs (Antidepressant)" },
  { id: "med_benzodiazepine", label: "Benzodiazepines (Anxiety)" },
  { id: "med_lithium", label: "Lithium" },
  { id: "med_antiepileptic", label: "Anti-epileptic Drugs" },
  { id: "med_immunosuppressant", label: "Immunosuppressants" },
  { id: "med_corticosteroid_oral", label: "Corticosteroids (oral)" },
  { id: "med_statin", label: "Statins (Cholesterol)" },
  { id: "med_digoxin", label: "Digoxin" },
  { id: "med_chemotherapy", label: "Chemotherapy" },
  { id: "med_nsaid_regular", label: "NSAIDs (Ibuprofen, Diclofenac)" },
  { id: "med_ppi_antacid", label: "PPIs / Antacids (Omeprazole)" },
  { id: "med_oral_contraceptive", label: "Oral Contraceptives" },
  { id: "med_iron_supplement", label: "Iron Supplements" },
];

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: "CRITICAL", color: "text-red-800", bg: "bg-red-50 border-red-200" },
  high: { label: "HIGH RISK", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  moderate_high: { label: "MODERATE-HIGH", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  moderate: { label: "MODERATE", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  low_moderate: { label: "LOW-MODERATE", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  low: { label: "LOW", color: "text-green-700", bg: "bg-green-50 border-green-200" },
};

interface InteractionResult {
  type: string;
  has_interaction: boolean;
  herb_name?: string;
  herb1?: { id: string; name: string };
  herb2?: { id: string; name: string };
  interaction?: {
    severity: string;
    mechanism: string;
    clinical_action: string;
    interaction_type?: string;
    risk_code?: string;
    evidence_basis?: string;
    interaction_category?: string;
  } | null;
}

export default function InteractionCheckerPage() {
  const [mode, setMode] = useState<"herb_med" | "herb_herb">("herb_med");
  const [herb, setHerb] = useState("");
  const [target, setTarget] = useState(""); // medication or second herb
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InteractionResult | null>(null);
  const [checked, setChecked] = useState(false);

  async function handleCheck() {
    if (!herb || !target) return;
    setLoading(true);
    setResult(null);
    setChecked(false);

    try {
      const params = new URLSearchParams({ herb });
      if (mode === "herb_med") {
        params.set("medication", target);
      } else {
        params.set("herb2", target);
      }

      const res = await fetch(`/api/interactions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        trackEvent("interaction_checked" as never, { mode, has_interaction: data.has_interaction });
      }
    } catch {
      // error handled by no result
    } finally {
      setLoading(false);
      setChecked(true);
    }
  }

  const severity = result?.interaction?.severity
    ? SEVERITY_CONFIG[result.interaction.severity] || SEVERITY_CONFIG.moderate
    : null;

  return (
    <div className="max-w-2xl mx-auto">
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-ayurv-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-600">Interaction Checker</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Interaction Checker
      </h1>
      <p className="text-sm text-ayurv-muted mb-6">
        Check if an Ayurvedic herb interacts with your medication or another herb.
      </p>

      {/* mode toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setMode("herb_med"); setTarget(""); setResult(null); setChecked(false); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === "herb_med"
              ? "bg-ayurv-primary text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Herb + Medication
        </button>
        <button
          onClick={() => { setMode("herb_herb"); setTarget(""); setResult(null); setChecked(false); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            mode === "herb_herb"
              ? "bg-ayurv-primary text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Herb + Herb
        </button>
      </div>

      {/* selectors */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              Herb
            </label>
            <select
              value={herb}
              onChange={(e) => { setHerb(e.target.value); setResult(null); setChecked(false); }}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white"
            >
              <option value="">Select herb...</option>
              {HERB_LIST.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name}{h.hindi ? ` (${h.hindi})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
              {mode === "herb_med" ? "Medication" : "Second Herb"}
            </label>
            {mode === "herb_med" ? (
              <select
                value={target}
                onChange={(e) => { setTarget(e.target.value); setResult(null); setChecked(false); }}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="">Select medication...</option>
                {MEDICATIONS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            ) : (
              <select
                value={target}
                onChange={(e) => { setTarget(e.target.value); setResult(null); setChecked(false); }}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white"
              >
                <option value="">Select herb...</option>
                {HERB_LIST.filter(h => h.id !== herb).map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name}{h.hindi ? ` (${h.hindi})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <button
          onClick={handleCheck}
          disabled={!herb || !target || loading}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
            herb && target && !loading
              ? "bg-ayurv-primary text-white hover:bg-ayurv-secondary shadow-md"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Checking...
            </span>
          ) : "Check Interaction"}
        </button>
      </div>

      {/* results */}
      {checked && result && (
        <div className="animate-fade-in">
          {result.has_interaction && result.interaction ? (
            <div className={`border rounded-2xl p-5 ${severity?.bg || "bg-amber-50 border-amber-200"}`}>
              <div className="flex items-start gap-3 mb-3">
                <svg className="w-6 h-6 text-risk-red shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <div>
                  <h2 className={`text-lg font-bold ${severity?.color || "text-amber-800"}`}>
                    Interaction Found — {severity?.label || "CAUTION"}
                  </h2>
                  <p className="text-sm text-gray-700 mt-2">
                    <span className="font-semibold">Mechanism:</span> {result.interaction.mechanism}
                  </p>
                  <p className="text-sm text-gray-700 mt-1.5">
                    <span className="font-semibold">What to do:</span> {result.interaction.clinical_action}
                  </p>
                  {result.interaction.interaction_type && (
                    <p className="text-xs text-gray-500 mt-2">
                      Evidence: {result.interaction.interaction_type}{result.interaction.evidence_basis ? ` (${result.interaction.evidence_basis})` : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-risk-green shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h2 className="text-lg font-bold text-green-800">No Known Interaction</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    No interaction found in our database between these two. This doesn&apos;t guarantee safety
                     — always consult your doctor before combining herbs with medications.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* full profile CTA */}
          <div className="mt-4 bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Want a complete safety check against your full health profile?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-ayurv-primary text-white text-sm font-semibold rounded-xl hover:bg-ayurv-secondary transition-colors shadow-sm"
            >
              Full Safety Assessment
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        Educational information only. Not a substitute for professional medical advice.
      </p>
    </div>
  );
}
