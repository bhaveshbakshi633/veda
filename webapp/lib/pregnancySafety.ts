// ============================================
// Pregnancy safety data — derived from herb_condition_risks seed
// Static map for client-side badge rendering
// ============================================

export type PregnancySafetyLevel = "safe" | "caution" | "avoid" | "unknown";

export interface PregnancySafetyInfo {
  level: PregnancySafetyLevel;
  label: string;
  note: string;
}

// pregnancy risk_code mapping from seed data (cond_pregnancy)
const PREGNANCY_DATA: Record<string, { level: PregnancySafetyLevel; note: string }> = {
  // Original 10
  herb_ashwagandha: { level: "avoid", note: "Uterine stimulant properties" },
  herb_brahmi: { level: "avoid", note: "Insufficient safety data" },
  herb_shatavari: { level: "caution", note: "Classical safe, modern data absent" },
  herb_triphala: { level: "avoid", note: "Contains uterine stimulant herbs" },
  herb_tulsi: { level: "avoid", note: "Anti-implantation effects" },
  herb_guduchi: { level: "avoid", note: "Insufficient safety data" },
  herb_haridra: { level: "caution", note: "Safe at culinary doses only" },
  herb_arjuna: { level: "avoid", note: "Cardiac-active herb" },
  herb_amalaki: { level: "safe", note: "Dietary Amla safe in pregnancy" },
  herb_yashtimadhu: { level: "avoid", note: "Adverse fetal outcomes at high doses" },
  // 40 new herbs
  herb_neem: { level: "avoid", note: "Abortifacient in animal studies" },
  herb_guggulu: { level: "avoid", note: "Uterine stimulant" },
  herb_moringa: { level: "avoid", note: "Root/bark abortifacient" },
  herb_gokshura: { level: "avoid", note: "Steroidal saponins" },
  herb_punarnava: { level: "caution", note: "Limited safety data" },
  herb_shilajit: { level: "avoid", note: "Heavy metal risk, no safety data" },
  herb_kutki: { level: "avoid", note: "Insufficient safety data" },
  herb_bhringaraj: { level: "avoid", note: "Insufficient safety data" },
  herb_shankhapushpi: { level: "avoid", note: "Uterine stimulant" },
  herb_vidanga: { level: "avoid", note: "Anti-fertility effects" },
  herb_vacha: { level: "avoid", note: "Potential teratogen" },
  herb_pippali: { level: "avoid", note: "Uterine stimulation risk" },
  herb_maricha: { level: "safe", note: "Safe at culinary doses" },
  herb_shunthi: { level: "safe", note: "Safe up to 1g/day for nausea" },
  herb_dalchini: { level: "safe", note: "Safe at culinary doses" },
  herb_elaichi: { level: "safe", note: "Safe at culinary doses" },
  herb_lavanga: { level: "safe", note: "Safe at culinary doses" },
  herb_methi: { level: "avoid", note: "Uterine stimulant at supplement doses" },
  herb_kalmegh: { level: "avoid", note: "Abortifacient properties" },
  herb_manjistha: { level: "avoid", note: "Uterine stimulant" },
  herb_chitrak: { level: "avoid", note: "Strong abortifacient" },
  herb_bala: { level: "avoid", note: "Contains ephedrine alkaloids" },
  herb_jatamansi: { level: "avoid", note: "CNS depressant" },
  herb_kumari: { level: "avoid", note: "Oral latex may trigger contractions" },
  herb_tagar: { level: "avoid", note: "CNS depressant, no safety data" },
  herb_musta: { level: "caution", note: "Limited safety data" },
  herb_haritaki: { level: "avoid", note: "Uterine stimulant" },
  herb_bibhitaki: { level: "caution", note: "Limited safety data" },
  herb_sariva: { level: "safe", note: "Traditional use considered safe" },
  herb_chirata: { level: "avoid", note: "May cause uterine contractions" },
  herb_ajwain: { level: "safe", note: "Safe at culinary doses" },
  herb_jeera: { level: "safe", note: "Very safe at normal amounts" },
  herb_kalonji: { level: "caution", note: "Uterine effects at high doses" },
  herb_isabgol: { level: "safe", note: "Bulk laxative, safe with water" },
  herb_senna: { level: "avoid", note: "Stimulant laxative, contraction risk" },
  herb_safed_musli: { level: "caution", note: "Limited data" },
  herb_kapikacchu: { level: "avoid", note: "L-DOPA content" },
  herb_rasna: { level: "caution", note: "Limited safety data" },
  herb_lodhra: { level: "caution", note: "Limited safety data" },
  herb_nagkesar: { level: "caution", note: "Limited safety data" },
};

const LEVEL_LABELS: Record<PregnancySafetyLevel, string> = {
  safe: "Pregnancy Safe",
  caution: "Pregnancy Caution",
  avoid: "Avoid in Pregnancy",
  unknown: "Pregnancy Data Unavailable",
};

export function getPregnancySafety(herbId: string): PregnancySafetyInfo {
  const data = PREGNANCY_DATA[herbId];
  if (!data) return { level: "unknown", label: LEVEL_LABELS.unknown, note: "No pregnancy safety data available" };
  return {
    level: data.level,
    label: LEVEL_LABELS[data.level],
    note: data.note,
  };
}

// counts for herb library stats
export function getPregnancySafetyCounts(): Record<PregnancySafetyLevel, number> {
  const counts: Record<PregnancySafetyLevel, number> = { safe: 0, caution: 0, avoid: 0, unknown: 0 };
  for (const data of Object.values(PREGNANCY_DATA)) {
    counts[data.level]++;
  }
  return counts;
}
