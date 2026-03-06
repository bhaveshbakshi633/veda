// ============================================
// All intake form static data — single source of truth
// ============================================

// --- Types ---

export interface ConditionGroup {
  label: string;
  items: { value: string; label: string }[];
}

export interface MedGroup {
  label: string;
  items: { value: string; label: string }[];
}

export interface ConcernOption {
  value: string;
  label: string;
  icon: string;
  sex: "all" | "female";
}

export interface GoalOption {
  value: string;
  label: string;
  desc: string;
}

export interface HerbOption {
  id: string;
  name: string;
  hindi?: string;
}

export interface RedFlagItem {
  key: string;
  label: string;
}

// --- Form State ---

export interface IntakeFormState {
  // step 1
  age: string;
  sex: string;
  pregnancy_status: string;
  has_red_flags: boolean | null;
  red_flags: Record<string, boolean>;
  // step 2
  has_conditions: boolean | null;
  chronic_conditions: string[];
  expanded_condition_group: string | null;
  has_medications: boolean | null;
  medications: string[];
  expanded_med_group: string | null;
  current_herbs: string[];
  herb_search: string;
  show_all_herbs: boolean;
  // step 3
  symptom_primary: string;
  symptom_duration: string;
  symptom_severity: string;
  user_goal: string;
}

// --- Constants ---

export const CONDITION_GROUPS: ConditionGroup[] = [
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

export const MEDICATION_GROUPS: MedGroup[] = [
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

export const FEMALE_ONLY_MEDS = [
  "oral_contraceptive",
  "hrt",
  "tamoxifen",
  "aromatase_inhibitor",
];

export const CONCERN_OPTIONS: ConcernOption[] = [
  { value: "stress_anxiety", label: "Stress / Anxiety", icon: "😰", sex: "all" },
  { value: "sleep_issues", label: "Sleep Issues", icon: "😴", sex: "all" },
  { value: "digestive_issues", label: "Digestion", icon: "🫄", sex: "all" },
  { value: "low_energy_fatigue", label: "Low Energy", icon: "🔋", sex: "all" },
  { value: "joint_pain", label: "Joint Pain", icon: "🦴", sex: "all" },
  { value: "immunity_general", label: "Immunity", icon: "🛡️", sex: "all" },
  { value: "memory_concentration", label: "Focus / Memory", icon: "🧠", sex: "all" },
  { value: "skin_issues", label: "Skin / Hair", icon: "✨", sex: "all" },
  { value: "heart_health", label: "Heart Health", icon: "❤️", sex: "all" },
  { value: "blood_sugar_concern", label: "Blood Sugar", icon: "🩸", sex: "all" },
  { value: "menstrual_issues", label: "Period Issues", icon: "🌸", sex: "female" },
  { value: "menopausal_symptoms", label: "Menopause", icon: "🌡️", sex: "female" },
  { value: "reproductive_health", label: "Reproductive Health", icon: "🌺", sex: "female" },
  { value: "weight_management", label: "Weight", icon: "⚖️", sex: "all" },
  { value: "general_wellness", label: "General Wellness", icon: "🌿", sex: "all" },
  { value: "other", label: "Something Else", icon: "💬", sex: "all" },
];

export const GOAL_OPTIONS: GoalOption[] = [
  { value: "find_herb_for_concern", label: "Find herbs for my concern", desc: "Get personalized herb recommendations" },
  { value: "check_safety_of_current_herb", label: "Check if a herb is safe for me", desc: "Verify safety of something you already take" },
  { value: "learn_about_specific_herb", label: "Learn about a specific herb", desc: "Get evidence-based information" },
  { value: "general_ayurvedic_guidance", label: "General guidance", desc: "General Ayurvedic wellness advice" },
];

export const HERB_LIST: HerbOption[] = [
  { id: "herb_ashwagandha", name: "Ashwagandha", hindi: "अश्वगंधा" },
  { id: "herb_tulsi", name: "Tulsi", hindi: "तुलसी" },
  { id: "herb_haridra", name: "Turmeric (Haldi)", hindi: "हल्दी" },
  { id: "herb_brahmi", name: "Brahmi", hindi: "ब्राह्मी" },
  { id: "herb_triphala", name: "Triphala", hindi: "त्रिफला" },
  { id: "herb_amalaki", name: "Amla", hindi: "आंवला" },
  { id: "herb_shatavari", name: "Shatavari", hindi: "शतावरी" },
  { id: "herb_guduchi", name: "Guduchi (Giloy)", hindi: "गिलोय" },
  { id: "herb_arjuna", name: "Arjuna", hindi: "अर्जुन" },
  { id: "herb_yashtimadhu", name: "Mulethi (Licorice)", hindi: "मुलेठी" },
  { id: "herb_neem", name: "Neem", hindi: "नीम" },
  { id: "herb_moringa", name: "Moringa (Sahjan)", hindi: "सहजन" },
  { id: "herb_shunthi", name: "Ginger (Sonth)", hindi: "सोंठ" },
  { id: "herb_dalchini", name: "Cinnamon (Dalchini)", hindi: "दालचीनी" },
  { id: "herb_methi", name: "Fenugreek (Methi)", hindi: "मेथी" },
  { id: "herb_kumari", name: "Aloe Vera", hindi: "घृतकुमारी" },
  { id: "herb_shilajit", name: "Shilajit", hindi: "शिलाजीत" },
  { id: "herb_guggulu", name: "Guggulu", hindi: "गुग्गुलु" },
  { id: "herb_gokshura", name: "Gokshura (Gokhru)", hindi: "गोखरू" },
  { id: "herb_punarnava", name: "Punarnava" },
  { id: "herb_kutki", name: "Kutki" },
  { id: "herb_bhringaraj", name: "Bhringaraj" },
  { id: "herb_shankhapushpi", name: "Shankhapushpi" },
  { id: "herb_vidanga", name: "Vidanga" },
  { id: "herb_vacha", name: "Vacha (Sweet Flag)" },
  { id: "herb_pippali", name: "Pippali (Long Pepper)" },
  { id: "herb_maricha", name: "Black Pepper (Kali Mirch)" },
  { id: "herb_elaichi", name: "Cardamom (Elaichi)" },
  { id: "herb_lavanga", name: "Clove (Laung)" },
  { id: "herb_kalmegh", name: "Kalmegh (Andrographis)" },
  { id: "herb_manjistha", name: "Manjistha" },
  { id: "herb_chitrak", name: "Chitrak" },
  { id: "herb_bala", name: "Bala" },
  { id: "herb_jatamansi", name: "Jatamansi" },
  { id: "herb_tagar", name: "Tagar (Valerian)" },
  { id: "herb_musta", name: "Musta (Nagarmotha)" },
  { id: "herb_haritaki", name: "Haritaki (Harad)" },
  { id: "herb_bibhitaki", name: "Bibhitaki (Baheda)" },
  { id: "herb_sariva", name: "Sariva (Anantamool)" },
  { id: "herb_chirata", name: "Chirata" },
  { id: "herb_ajwain", name: "Ajwain (Carom)" },
  { id: "herb_jeera", name: "Cumin (Jeera)" },
  { id: "herb_kalonji", name: "Kalonji (Black Seed)" },
  { id: "herb_isabgol", name: "Isabgol (Psyllium)" },
  { id: "herb_senna", name: "Senna" },
  { id: "herb_safed_musli", name: "Safed Musli" },
  { id: "herb_kapikacchu", name: "Kapikacchu (Mucuna)" },
  { id: "herb_rasna", name: "Rasna" },
  { id: "herb_lodhra", name: "Lodhra" },
  { id: "herb_nagkesar", name: "Nagkesar" },
];

export const POPULAR_HERB_COUNT = 6;

export const RED_FLAG_ITEMS: RedFlagItem[] = [
  { key: "chest_pain", label: "Chest pain or tightness" },
  { key: "difficulty_breathing", label: "Difficulty breathing" },
  { key: "blood_in_stool_vomit", label: "Blood in stool or vomit" },
  { key: "high_fever_over_103", label: "High fever (>103\u00b0F)" },
  { key: "sudden_weakness_paralysis", label: "Sudden weakness or paralysis" },
  { key: "severe_allergic_reaction", label: "Severe allergic reaction" },
  { key: "yellowing_skin_eyes", label: "Yellow skin or eyes" },
  { key: "suicidal_thoughts", label: "Thoughts of self-harm" },
];

// all 50 herb IDs for the chat agent tool enum
export const ALL_HERB_IDS = HERB_LIST.map((h) => h.id);

export function createInitialFormState(): IntakeFormState {
  return {
    age: "",
    sex: "",
    pregnancy_status: "",
    has_red_flags: null,
    red_flags: Object.fromEntries(RED_FLAG_ITEMS.map((q) => [q.key, false])),
    has_conditions: null,
    chronic_conditions: [],
    expanded_condition_group: null,
    has_medications: null,
    medications: [],
    expanded_med_group: null,
    current_herbs: [],
    herb_search: "",
    show_all_herbs: false,
    symptom_primary: "",
    symptom_duration: "",
    symptom_severity: "",
    user_goal: "",
  };
}
