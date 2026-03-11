"use client";

import { RED_FLAG_ITEMS, type IntakeFormState } from "./constants";

interface StepAboutProps {
  form: IntakeFormState;
  setForm: React.Dispatch<React.SetStateAction<IntakeFormState>>;
  profileLoaded: boolean;
  onClearProfile: () => void;
}

export default function StepAbout({ form, setForm, profileLoaded, onClearProfile }: StepAboutProps) {
  const hasActiveRedFlags = Object.values(form.red_flags).some((v) => v);

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-1">About You</h2>
      <p className="text-sm text-ayurv-muted mb-4">
        Quick basics so we can check herb safety for you.
      </p>

      {/* returning user banner */}
      {profileLoaded && (
        <div className="flex items-center justify-between gap-3 bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-xl px-4 py-3 mb-6 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <svg className="w-4 h-4 text-ayurv-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-ayurv-primary font-medium">Profile loaded from last visit</span>
          </div>
          <button
            type="button"
            onClick={onClearProfile}
            className="text-xs text-ayurv-muted hover:text-gray-700 whitespace-nowrap underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* age */}
        <div>
          <label htmlFor="age-input" className="block text-sm font-medium text-gray-700 mb-1.5">
            Age
          </label>
          <input
            id="age-input"
            type="number"
            inputMode="numeric"
            min={1}
            max={120}
            value={form.age}
            onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
            className={`w-full border rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-ayurv-primary/20 outline-none transition-all ${
              form.age && (Number(form.age) < 1 || Number(form.age) > 120)
                ? "border-risk-red focus:border-risk-red"
                : "border-gray-200 focus:border-ayurv-primary/30"
            }`}
            placeholder="Your age"
          />
          {form.age && (Number(form.age) < 1 || Number(form.age) > 120) && (
            <p className="text-xs text-risk-red mt-1">Please enter a valid age (1-120)</p>
          )}
        </div>

        {/* sex */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Biological Sex</label>
          <div className="grid grid-cols-3 gap-2.5">
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
                className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                  form.sex === opt.value
                    ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md shadow-ayurv-primary/15"
                    : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-accent/30 hover:bg-ayurv-primary/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* pregnancy — conditional */}
        {form.sex && form.sex !== "male" && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pregnancy / Breastfeeding Status
            </label>
            <div className="grid grid-cols-2 gap-2.5">
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
                  className={`py-3 rounded-xl border-2 text-xs font-semibold transition-all duration-200 ${
                    form.pregnancy_status === opt.value
                      ? "bg-ayurv-primary text-white border-ayurv-primary shadow-md shadow-ayurv-primary/15"
                      : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-accent/30 hover:bg-ayurv-primary/5"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* red flags — SAFETY GATE */}
        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Do you have any <span className="text-risk-red font-semibold">urgent symptoms</span> right now?
            <span className="text-xs text-gray-400 block mt-0.5">e.g. chest pain, breathing difficulty, high fever</span>
          </p>
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  has_red_flags: false,
                  red_flags: Object.fromEntries(RED_FLAG_ITEMS.map((q) => [q.key, false])),
                }))
              }
              className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                form.has_red_flags === false
                  ? "bg-risk-green text-white border-risk-green shadow-md shadow-risk-green/15"
                  : "bg-white text-gray-600 border-gray-200 hover:border-risk-green/30 hover:bg-risk-green/5"
              }`}
            >
              No, I&apos;m fine
            </button>
            <button
              type="button"
              onClick={() => setForm((p) => ({ ...p, has_red_flags: true }))}
              className={`flex-1 py-3 px-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                form.has_red_flags === true
                  ? "bg-risk-red text-white border-risk-red shadow-md shadow-risk-red/15"
                  : "bg-white text-gray-600 border-gray-200 hover:border-risk-red/30 hover:bg-risk-red/5"
              }`}
            >
              Yes, I have some
            </button>
          </div>

          {form.has_red_flags === true && (
            <div className="space-y-2 animate-fade-in">
              {RED_FLAG_ITEMS.map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    form.red_flags[item.key]
                      ? "bg-risk-red-light border-risk-red/30"
                      : "bg-gray-50/50 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.red_flags[item.key]}
                    onChange={() =>
                      setForm((p) => ({
                        ...p,
                        red_flags: { ...p.red_flags, [item.key]: !p.red_flags[item.key] },
                      }))
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      form.red_flags[item.key]
                        ? "bg-risk-red border-risk-red"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {form.red_flags[item.key] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${form.red_flags[item.key] ? "text-risk-red font-medium" : "text-gray-700"}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* RED FLAG GATE — blocks progression if emergency symptoms detected */}
          {hasActiveRedFlags && (
            <div className="mt-4 bg-risk-red-light border-2 border-risk-red/30 rounded-2xl p-5 animate-fade-in">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-risk-red shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="font-bold text-risk-red text-sm mb-1">Please Seek Medical Help First</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    The symptoms you&apos;ve selected may require immediate medical attention.
                    This tool is for educational herb safety checking — it cannot help with acute medical emergencies.
                  </p>
                  <div className="space-y-1.5 text-sm">
                    <p className="font-semibold text-gray-800">Emergency Helplines:</p>
                    <p className="text-gray-700">Ambulance: <strong>108</strong> / <strong>112</strong></p>
                    <p className="text-gray-700">NIMHANS Helpline: <strong>080-46110007</strong></p>
                    <p className="text-gray-700">iCall: <strong>9152987821</strong></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
