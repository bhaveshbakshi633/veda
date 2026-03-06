// ============================================
// SHARED CONDITION/MEDICATION MAPPING
// ============================================
// Single source of truth for mapping intake form values
// to database IDs. Used by riskEngine.ts and toolHandlers.ts.
// Divergence between these mappings = silent safety bug.

export const AUTOIMMUNE_CONDITIONS = [
  "autoimmune_lupus",
  "autoimmune_ra",
  "autoimmune_ms",
  "autoimmune_hashimotos",
  "autoimmune_graves",
  "autoimmune_other",
];

export const CONDITION_OVERRIDES: Record<string, string> = {
  scheduled_surgery_within_4_weeks: "cond_scheduled_surgery",
};

export const MEDICATION_OVERRIDES: Record<string, string> = {
  antihypertensive_ace_arb: "med_ace_arb",
  antihypertensive_beta_blocker: "med_beta_blocker",
  antihypertensive_ccb: "med_ccb",
  antihypertensive_diuretic_loop: "med_diuretic_loop",
  antihypertensive_diuretic_thiazide: "med_diuretic_thiazide",
  thyroid_levothyroxine: "med_levothyroxine",
  antithyroid_medication: "med_antithyroid",
  diuretic_potassium_sparing: "med_diuretic_potassium_sparing",
};

export function mapConditionToDbId(cond: string): string | null {
  if (cond === "none" || cond === "other") return null;
  if (AUTOIMMUNE_CONDITIONS.includes(cond)) return "cond_autoimmune";
  if (CONDITION_OVERRIDES[cond]) return CONDITION_OVERRIDES[cond];
  return `cond_${cond}`;
}

export function mapMedicationToDbId(med: string): string | null {
  if (med === "none" || med === "other") return null;
  if (MEDICATION_OVERRIDES[med]) return MEDICATION_OVERRIDES[med];
  return `med_${med}`;
}
