"use client";

import {
  CONDITION_GROUPS,
  MEDICATION_GROUPS,
  FEMALE_ONLY_MEDS,
  type IntakeFormState,
} from "./constants";
import GroupPicker from "./GroupPicker";
import HerbPicker from "./HerbPicker";

interface StepHealthProps {
  form: IntakeFormState;
  setForm: React.Dispatch<React.SetStateAction<IntakeFormState>>;
}

export default function StepHealth({ form, setForm }: StepHealthProps) {
  function toggleCondition(value: string) {
    setForm((prev) => {
      const arr = prev.chronic_conditions;
      return {
        ...prev,
        chronic_conditions: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  function toggleMedication(value: string) {
    setForm((prev) => {
      const arr = prev.medications;
      return {
        ...prev,
        medications: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  }

  function toggleHerb(herbName: string) {
    setForm((prev) => {
      const arr = prev.current_herbs;
      return {
        ...prev,
        current_herbs: arr.includes(herbName)
          ? arr.filter((v) => v !== herbName)
          : [...arr, herbName],
      };
    });
  }

  return (
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
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  has_conditions: false,
                  chronic_conditions: [],
                }))
              }
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
            <GroupPicker
              groups={CONDITION_GROUPS}
              selected={form.chronic_conditions}
              onToggle={toggleCondition}
              expandedGroup={form.expanded_condition_group}
              onExpandGroup={(label) =>
                setForm((p) => ({ ...p, expanded_condition_group: label }))
              }
              filterGroup={(g) =>
                form.sex !== "male" || g.label !== "Women's Health"
              }
            />
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
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  has_medications: false,
                  medications: [],
                }))
              }
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
            <GroupPicker
              groups={MEDICATION_GROUPS}
              selected={form.medications}
              onToggle={toggleMedication}
              expandedGroup={form.expanded_med_group}
              onExpandGroup={(label) =>
                setForm((p) => ({ ...p, expanded_med_group: label }))
              }
              filterItems={(items) =>
                form.sex === "male"
                  ? items.filter((i) => !FEMALE_ONLY_MEDS.includes(i.value))
                  : items
              }
            />
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
          <HerbPicker
            selected={form.current_herbs}
            onToggle={toggleHerb}
            search={form.herb_search}
            onSearchChange={(q) => setForm((p) => ({ ...p, herb_search: q }))}
            showAll={form.show_all_herbs}
            onShowAllChange={(show) => setForm((p) => ({ ...p, show_all_herbs: show }))}
          />
        </div>
      </div>
    </div>
  );
}
