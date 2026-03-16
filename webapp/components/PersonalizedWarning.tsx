"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getUid } from "@/lib/storage";
import { getPregnancySafety } from "@/lib/pregnancySafety";

// kya herb kisi bhi known condition ke saath risky hai
// ye simplified check hai — full risk engine results page pe chalti hai
const HERB_CONDITION_ALERTS: Record<string, { condition: string; warning: string }[]> = {
  herb_ashwagandha: [
    { condition: "hyperthyroid", warning: "Ashwagandha may increase thyroid hormone levels" },
    { condition: "hypothyroid", warning: "Ashwagandha affects thyroid — discuss dosage with your doctor" },
  ],
  herb_haridra: [
    { condition: "liver_disease", warning: "High-dose curcumin may stress the liver" },
    { condition: "gerd", warning: "Turmeric can aggravate acid reflux at high doses" },
  ],
  herb_brahmi: [
    { condition: "hypothyroid", warning: "Brahmi may affect thyroid hormone levels" },
  ],
  herb_yashtimadhu: [
    { condition: "hypertension", warning: "Mulethi can raise blood pressure — monitor closely" },
    { condition: "heart_failure", warning: "Licorice causes fluid retention — risky with heart conditions" },
    { condition: "kidney_disease_mild", warning: "Licorice affects potassium — avoid with kidney issues" },
  ],
  herb_shunthi: [
    { condition: "peptic_ulcer", warning: "Ginger may irritate stomach ulcers" },
  ],
  herb_guduchi: [
    { condition: "diabetes_type_1", warning: "Giloy may lower blood sugar — monitor levels" },
    { condition: "diabetes_type_2", warning: "Giloy may lower blood sugar — adjust medication timing" },
  ],
  herb_neem: [
    { condition: "diabetes_type_1", warning: "Neem lowers blood sugar — risk of hypoglycemia" },
    { condition: "diabetes_type_2", warning: "Neem lowers blood sugar — monitor carefully" },
    { condition: "liver_disease", warning: "Neem is hepatotoxic at high doses" },
  ],
  herb_guggulu: [
    { condition: "hypothyroid", warning: "Guggulu affects thyroid function — may alter medication needs" },
    { condition: "hyperthyroid", warning: "Guggulu stimulates thyroid — not recommended" },
    { condition: "liver_disease", warning: "Guggulu may stress the liver at high doses" },
  ],
  herb_arjuna: [
    { condition: "hypertension", warning: "Arjuna lowers blood pressure — monitor if on BP medications" },
  ],
  herb_shilajit: [
    { condition: "kidney_disease_mild", warning: "Shilajit contains minerals that may burden kidneys" },
  ],
  herb_tulsi: [
    { condition: "diabetes_type_1", warning: "Tulsi may lower blood sugar — monitor levels" },
    { condition: "diabetes_type_2", warning: "Tulsi has hypoglycemic effect — adjust medication timing" },
  ],
};

// medication class alerts
const HERB_MED_ALERTS: Record<string, { medication: string; warning: string }[]> = {
  herb_ashwagandha: [
    { medication: "thyroid_levothyroxine", warning: "May interact with levothyroxine — separate by 4 hours" },
    { medication: "benzodiazepines", warning: "Combined sedation risk with anxiety medications" },
    { medication: "immunosuppressants", warning: "Ashwagandha stimulates immunity — may counteract immunosuppressants" },
  ],
  herb_haridra: [
    { medication: "blood_thinners_warfarin", warning: "Curcumin has antiplatelet activity — bleeding risk with warfarin" },
    { medication: "blood_thinners_aspirin", warning: "Curcumin + aspirin increases bleeding risk" },
    { medication: "diabetes_metformin", warning: "Turmeric may enhance metformin's blood sugar lowering effect" },
  ],
  herb_yashtimadhu: [
    { medication: "antihypertensives_general", warning: "Licorice can raise blood pressure — counteracts BP medications" },
    { medication: "diuretics", warning: "Both cause potassium loss — risk of hypokalemia" },
    { medication: "blood_thinners_warfarin", warning: "Licorice may interact with warfarin metabolism" },
  ],
  herb_shunthi: [
    { medication: "blood_thinners_warfarin", warning: "Ginger has mild antiplatelet activity — monitor INR" },
    { medication: "blood_thinners_aspirin", warning: "Ginger + aspirin may increase bleeding risk" },
  ],
  herb_guduchi: [
    { medication: "diabetes_metformin", warning: "Giloy lowers blood sugar — may amplify metformin effect" },
    { medication: "immunosuppressants", warning: "Giloy is an immunomodulator — may interfere with immunosuppression" },
  ],
  herb_tulsi: [
    { medication: "blood_thinners_warfarin", warning: "Tulsi has mild anticoagulant properties" },
  ],
};

interface ProfileData {
  chronic_conditions: string[];
  medications: string[];
  pregnancy_status: string | null;
}

export default function PersonalizedWarning({ herbId, herbName }: { herbId: string; herbName: string }) {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getUid();
    if (!uid) {
      setLoading(false);
      return;
    }

    fetch(`/api/profile?uid=${uid}`)
      .then((r) => r.json())
      .then((data) => {
        const profile: ProfileData | null = data.profile;
        if (!profile) {
          setLoading(false);
          return;
        }

        const alerts: string[] = [];

        // pregnancy check
        if (profile.pregnancy_status && profile.pregnancy_status !== "not_applicable" && profile.pregnancy_status !== "none") {
          const ps = getPregnancySafety(herbId);
          if (ps.level === "avoid") {
            alerts.push(`Pregnancy warning: ${ps.note}`);
          } else if (ps.level === "caution") {
            alerts.push(`Pregnancy caution: ${ps.note}`);
          }
        }

        // condition alerts
        const condAlerts = HERB_CONDITION_ALERTS[herbId] || [];
        for (const alert of condAlerts) {
          if (profile.chronic_conditions.includes(alert.condition)) {
            alerts.push(alert.warning);
          }
        }

        // medication alerts
        const medAlerts = HERB_MED_ALERTS[herbId] || [];
        for (const alert of medAlerts) {
          if (profile.medications.includes(alert.medication)) {
            alerts.push(alert.warning);
          }
        }

        setWarnings(alerts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [herbId]);

  if (loading || warnings.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6" role="alert">
      <div className="flex items-start gap-3">
        <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <h3 className="text-sm font-bold text-red-800 mb-1">
            {warnings.length === 1 ? "Warning" : `${warnings.length} Warnings`} for Your Profile
          </h3>
          <p className="text-xs text-red-600 mb-2">
            Based on your saved health profile, {herbName} may need extra caution:
          </p>
          <ul className="space-y-1.5">
            {warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0" />
                <span className="text-xs text-red-700">{w}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 mt-3">
            <Link
              href="/"
              className="text-xs font-semibold text-red-700 hover:text-red-900 underline"
            >
              Run full safety check
            </Link>
            <Link
              href="/history"
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              View my profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
