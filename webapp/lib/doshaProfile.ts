// ============================================
// Dosha Profile Detection — Simple Prakriti Questionnaire
// Maps user-reported symptoms/body type to dominant dosha
// Used to personalize herb ranking on results page
// ============================================

export type Dosha = "vata" | "pitta" | "kapha";

export interface DoshaScore {
  vata: number;
  pitta: number;
  kapha: number;
  dominant: Dosha;
  secondary: Dosha | null;
}

// map intake data to approximate dosha inference
// not a real Prakriti test — just a quick inference from available data
export function inferDoshaFromProfile(data: {
  age: number;
  sex: string;
  symptom_primary: string;
  chronic_conditions: string[];
}): DoshaScore {
  const scores = { vata: 0, pitta: 0, kapha: 0 };

  // age tendencies
  if (data.age > 55) scores.vata += 2;
  else if (data.age > 35) scores.pitta += 1;
  else scores.kapha += 1;

  // symptom → dosha mapping
  const symptomDosha: Record<string, Dosha> = {
    stress_anxiety: "vata",
    sleep_issues: "vata",
    joint_pain: "vata",
    digestive_issues: "pitta",
    acidity_reflux: "pitta",
    skin_issues: "pitta",
    constipation: "vata",
    hair_issues: "pitta",
    respiratory_cold_cough: "kapha",
    low_energy_fatigue: "kapha",
    memory_concentration: "vata",
    weight_management: "kapha",
    immunity_general: "kapha",
    reproductive_health: "kapha",
    menstrual_issues: "vata",
    menopausal_symptoms: "vata",
    blood_sugar_concern: "kapha",
    cholesterol_concern: "kapha",
    heart_health: "pitta",
    general_wellness: "kapha",
  };

  const primaryDosha = symptomDosha[data.symptom_primary];
  if (primaryDosha) scores[primaryDosha] += 3;

  // condition → dosha tendencies
  const conditionDosha: Record<string, Dosha> = {
    hypertension: "pitta",
    diabetes_type_1: "vata",
    diabetes_type_2: "kapha",
    hypothyroid: "kapha",
    hyperthyroid: "pitta",
    heart_failure: "kapha",
    coronary_artery_disease: "kapha",
    asthma: "kapha",
    copd: "vata",
    kidney_disease_mild: "vata",
    liver_disease: "pitta",
    peptic_ulcer: "pitta",
    gerd: "pitta",
    ibs_constipation: "vata",
    ibs_diarrhea: "pitta",
    depression: "kapha",
    anxiety_disorder: "vata",
    obesity: "kapha",
    underweight: "vata",
    pcos: "kapha",
  };

  for (const cond of data.chronic_conditions) {
    const dosha = conditionDosha[cond];
    if (dosha) scores[dosha] += 1;
  }

  // determine dominant
  const sorted = (Object.entries(scores) as [Dosha, number][])
    .sort((a, b) => b[1] - a[1]);

  const dominant = sorted[0][0];
  const secondary = sorted[1][1] > 0 && sorted[1][1] >= sorted[0][1] * 0.6
    ? sorted[1][0]
    : null;

  return { ...scores, dominant, secondary };
}

// dosha descriptions for display
export const DOSHA_INFO: Record<Dosha, { name: string; qualities: string; color: string }> = {
  vata: {
    name: "Vata",
    qualities: "Air + Space — light, dry, mobile, cold",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  pitta: {
    name: "Pitta",
    qualities: "Fire + Water — hot, sharp, intense, fluid",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  kapha: {
    name: "Kapha",
    qualities: "Earth + Water — heavy, stable, moist, cool",
    color: "bg-green-50 text-green-700 border-green-200",
  },
};

// herb → dosha affinity (which dosha benefits most from this herb)
// pacifies = reduces excess dosha
export const HERB_DOSHA_AFFINITY: Record<string, { pacifies: Dosha[]; aggravates?: Dosha[] }> = {
  herb_ashwagandha: { pacifies: ["vata", "kapha"] },
  herb_brahmi: { pacifies: ["vata", "pitta"] },
  herb_shatavari: { pacifies: ["vata", "pitta"] },
  herb_triphala: { pacifies: ["vata", "pitta", "kapha"] }, // tridoshic
  herb_tulsi: { pacifies: ["vata", "kapha"] },
  herb_guduchi: { pacifies: ["vata", "pitta", "kapha"] }, // tridoshic
  herb_haridra: { pacifies: ["kapha", "pitta"] },
  herb_arjuna: { pacifies: ["pitta", "kapha"] },
  herb_amalaki: { pacifies: ["vata", "pitta", "kapha"] }, // tridoshic
  herb_yashtimadhu: { pacifies: ["vata", "pitta"] },
  herb_neem: { pacifies: ["pitta", "kapha"] },
  herb_moringa: { pacifies: ["vata", "kapha"] },
  herb_shunthi: { pacifies: ["vata", "kapha"], aggravates: ["pitta"] },
  herb_dalchini: { pacifies: ["vata", "kapha"] },
  herb_methi: { pacifies: ["vata", "kapha"] },
  herb_kumari: { pacifies: ["pitta", "kapha"] },
  herb_shilajit: { pacifies: ["vata", "kapha"] },
  herb_guggulu: { pacifies: ["vata", "kapha"] },
  herb_gokshura: { pacifies: ["vata", "pitta"] },
  herb_punarnava: { pacifies: ["kapha", "vata"] },
  herb_kutki: { pacifies: ["pitta", "kapha"] },
  herb_bhringaraj: { pacifies: ["pitta", "kapha"] },
  herb_shankhapushpi: { pacifies: ["vata", "pitta"] },
  herb_jatamansi: { pacifies: ["vata", "pitta"] },
  herb_manjistha: { pacifies: ["pitta", "kapha"] },
  herb_isabgol: { pacifies: ["pitta", "vata"] },
  herb_ajwain: { pacifies: ["vata", "kapha"], aggravates: ["pitta"] },
};

// get dosha compatibility score for a herb
export function getDoshaCompatibility(herbId: string, dominantDosha: Dosha): number {
  const affinity = HERB_DOSHA_AFFINITY[herbId];
  if (!affinity) return 0; // unknown herb
  if (affinity.pacifies.includes(dominantDosha)) return 2; // great match
  if (affinity.aggravates?.includes(dominantDosha)) return -1; // may aggravate
  return 0; // neutral
}
