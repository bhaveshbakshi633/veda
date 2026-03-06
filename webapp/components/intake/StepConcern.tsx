"use client";

import { CONCERN_OPTIONS, GOAL_OPTIONS, type IntakeFormState } from "./constants";

interface StepConcernProps {
  form: IntakeFormState;
  setForm: React.Dispatch<React.SetStateAction<IntakeFormState>>;
  error: string | null;
}

export default function StepConcern({ form, setForm, error }: StepConcernProps) {
  const visibleConcerns = CONCERN_OPTIONS.filter(
    (opt) => opt.sex === "all" || form.sex !== "male"
  );

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-bold text-gray-900 mb-1">What Brings You Here?</h2>
      <p className="text-sm text-ayurv-muted mb-6">
        Pick your main concern and we&apos;ll find the right herbs for you.
      </p>

      <div className="space-y-6">
        {/* concern grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Main concern
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {visibleConcerns.map((opt) => (
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
                <span className="font-medium text-xs leading-tight text-center">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* duration + severity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration-select" className="block text-sm font-medium text-gray-700 mb-1.5">
              How long?
            </label>
            <select
              id="duration-select"
              value={form.symptom_duration}
              onChange={(e) => setForm((p) => ({ ...p, symptom_duration: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-ayurv-primary/20 outline-none transition-all"
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Severity
            </label>
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

        {/* goal */}
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
                <span
                  className={`block text-xs mt-0.5 ${
                    form.user_goal === opt.value ? "text-white/80" : "text-gray-400"
                  }`}
                >
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* error */}
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
  );
}
