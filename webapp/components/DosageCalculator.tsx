"use client";

import { useState, useMemo } from "react";

// dosage form data from herb detail page
interface DosageForm {
  form: string;
  range_min: string;
  range_max: string;
  unit: string;
  frequency?: string;
  notes?: string;
}

interface DosageCalculatorProps {
  herbName: string;
  forms: DosageForm[];
}

// age-based adjustment factors — conservative
function getAgeFactor(age: number): { factor: number; label: string; note: string } {
  if (age < 6) return { factor: 0, label: "Not recommended", note: "Consult a pediatric Ayurvedic practitioner" };
  if (age <= 12) return { factor: 0.5, label: "Half dose", note: "Children: use half the adult dose" };
  if (age <= 17) return { factor: 0.75, label: "75% dose", note: "Adolescents: use 75% of adult dose" };
  if (age <= 65) return { factor: 1.0, label: "Standard dose", note: "Standard adult dosage range" };
  return { factor: 0.75, label: "Reduced dose", note: "Elderly: start with 75% and increase if tolerated" };
}

export default function DosageCalculator({ herbName, forms }: DosageCalculatorProps) {
  const [selectedForm, setSelectedForm] = useState(forms[0]?.form || "");
  const [age, setAge] = useState("");

  const activeForm = forms.find(f => f.form === selectedForm) || forms[0];
  const ageNum = parseInt(age) || 0;
  const ageInfo = useMemo(() => getAgeFactor(ageNum), [ageNum]);

  // parse range numbers — handle non-numeric gracefully
  const minVal = parseFloat(activeForm?.range_min || "0");
  const maxVal = parseFloat(activeForm?.range_max || "0");

  // adjusted range
  const adjMin = ageInfo.factor > 0 ? (minVal * ageInfo.factor).toFixed(1).replace(/\.0$/, "") : "—";
  const adjMax = ageInfo.factor > 0 ? (maxVal * ageInfo.factor).toFixed(1).replace(/\.0$/, "") : "—";

  return (
    <div className="bg-gradient-to-br from-ayurv-primary/5 to-blue-50/50 border border-ayurv-primary/15 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-ayurv-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008H15.75v-.008zm0 2.25h.008v.008H15.75V13.5z" />
        </svg>
        Dosage Calculator
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* form selector */}
        <div>
          <label htmlFor="dose-form" className="text-[11px] font-medium text-gray-500 block mb-1">Form</label>
          <select
            id="dose-form"
            value={selectedForm}
            onChange={(e) => setSelectedForm(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 capitalize"
          >
            {forms.map((f) => (
              <option key={f.form} value={f.form}>{f.form}</option>
            ))}
          </select>
        </div>

        {/* age input */}
        <div>
          <label htmlFor="dose-age" className="text-[11px] font-medium text-gray-500 block mb-1">Your age</label>
          <input
            id="dose-age"
            type="number"
            min={1}
            max={120}
            placeholder="e.g. 35"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800"
          />
        </div>
      </div>

      {/* result */}
      {activeForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500">Standard range</span>
            <span className="text-sm font-bold text-gray-800">
              {activeForm.range_min}–{activeForm.range_max} {activeForm.unit}
            </span>
          </div>

          {ageNum > 0 && ageNum <= 120 && (
            <>
              <div className="border-t border-gray-100 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-ayurv-primary">
                    Adjusted for age {age}
                  </span>
                  <span className="text-sm font-bold text-ayurv-primary">
                    {ageInfo.factor > 0 ? `${adjMin}–${adjMax} ${activeForm.unit}` : "Not recommended"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  {ageInfo.note}
                </p>
              </div>

              {/* visual indicator */}
              {ageInfo.factor > 0 && ageInfo.factor < 1 && (
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-ayurv-primary/60 h-full rounded-full transition-all duration-300"
                      style={{ width: `${ageInfo.factor * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-ayurv-primary shrink-0">{Math.round(ageInfo.factor * 100)}%</span>
                </div>
              )}
            </>
          )}

          {activeForm.frequency && (
            <p className="text-xs text-gray-500 mt-2">
              Frequency: {activeForm.frequency}
            </p>
          )}
          {activeForm.notes && (
            <p className="text-xs text-gray-400 italic mt-1">{activeForm.notes}</p>
          )}
        </div>
      )}

      <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
        This calculator provides general guidance based on standard Ayurvedic dosing. Always discuss with your doctor before starting any herb, especially if you have existing conditions or take medications.
      </p>
    </div>
  );
}
