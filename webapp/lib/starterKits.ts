// ============================================
// Herb Starter Kits — Curated bundles for common health goals
// Each kit = 3-4 herbs that work well together for a specific concern
// ============================================

export interface StarterKit {
  id: string;
  name: string;
  tagline: string;
  description: string;
  herbs: { id: string; name: string; role: string }[];
  bestFor: string[];
  duration: string;
  note: string;
}

export const STARTER_KITS: StarterKit[] = [
  {
    id: "kit_stress",
    name: "Calm Mind Kit",
    tagline: "For stress, anxiety & better sleep",
    description: "Classical Ayurvedic adaptogens that calm Vata without sedation. Ashwagandha anchors cortisol, Brahmi sharpens focus, Jatamansi aids sleep.",
    herbs: [
      { id: "herb_ashwagandha", name: "Ashwagandha", role: "Adaptogen — lowers cortisol, builds resilience" },
      { id: "herb_brahmi", name: "Brahmi", role: "Medhya Rasayana — calms mind, improves focus" },
      { id: "herb_jatamansi", name: "Jatamansi", role: "Natural sedative — promotes deep sleep" },
    ],
    bestFor: ["Chronic stress", "Anxiety", "Sleep issues", "Mental fatigue"],
    duration: "4-8 weeks for noticeable effects",
    note: "Take Ashwagandha morning, Brahmi afternoon, Jatamansi at bedtime.",
  },
  {
    id: "kit_digestion",
    name: "Agni Boost Kit",
    tagline: "For digestion, bloating & gut health",
    description: "Strengthens digestive fire (Agni) and cleans the gut. Triphala regulates bowel, Ginger kindles Agni, Ajwain relieves gas.",
    herbs: [
      { id: "herb_triphala", name: "Triphala", role: "Gentle cleanser — regulates bowel, detoxifies" },
      { id: "herb_shunthi", name: "Ginger (Shunthi)", role: "Agni deepana — kindles digestive fire" },
      { id: "herb_ajwain", name: "Ajwain", role: "Carminative — relieves gas, bloating, cramping" },
    ],
    bestFor: ["Bloating", "Irregular digestion", "Constipation", "Low appetite"],
    duration: "2-4 weeks for gut reset",
    note: "Triphala at bedtime, Ginger before meals, Ajwain after meals.",
  },
  {
    id: "kit_immunity",
    name: "Shield Kit",
    tagline: "For immunity, seasonal protection & vitality",
    description: "Triple immune defense — Guduchi modulates immunity, Tulsi fights infections, Amla provides Vitamin C and Rasayana.",
    herbs: [
      { id: "herb_guduchi", name: "Guduchi (Giloy)", role: "Immunomodulator — balances immune response" },
      { id: "herb_tulsi", name: "Tulsi", role: "Anti-infective — respiratory protection" },
      { id: "herb_amalaki", name: "Amla", role: "Rasayana — antioxidant, Vitamin C powerhouse" },
    ],
    bestFor: ["Frequent colds", "Seasonal changes", "Low immunity", "Recovery after illness"],
    duration: "Ongoing — safe for long-term use",
    note: "Can be taken together as morning tea or in capsule form.",
  },
  {
    id: "kit_skin",
    name: "Glow Kit",
    tagline: "For clear skin, blood purification & Pitta balance",
    description: "Pitta-pacifying herbs that purify blood (Rakta Shodhana) and reduce inflammation. Manjistha clears, Neem detoxes, Turmeric heals.",
    herbs: [
      { id: "herb_manjistha", name: "Manjistha", role: "Rakta Shodhana — purifies blood, clears skin" },
      { id: "herb_neem", name: "Neem", role: "Detoxifier — antibacterial, anti-acne" },
      { id: "herb_haridra", name: "Turmeric (Haldi)", role: "Anti-inflammatory — heals and brightens skin" },
    ],
    bestFor: ["Acne", "Skin rashes", "Pigmentation", "Blood impurities"],
    duration: "6-8 weeks for visible skin improvement",
    note: "Take Turmeric with black pepper for absorption. Neem on empty stomach.",
  },
  {
    id: "kit_energy",
    name: "Vitality Kit",
    tagline: "For energy, stamina & rejuvenation",
    description: "Kapha-balancing energizers that build Ojas without stimulant crashes. Shilajit provides minerals, Moringa nourishes, Ashwagandha sustains.",
    herbs: [
      { id: "herb_shilajit", name: "Shilajit", role: "Mineral pitch — boosts mitochondrial energy" },
      { id: "herb_ashwagandha", name: "Ashwagandha", role: "Balya — builds sustained strength and endurance" },
      { id: "herb_moringa", name: "Moringa", role: "Superfood — iron, protein, 90+ nutrients" },
    ],
    bestFor: ["Chronic fatigue", "Low stamina", "Post-illness weakness", "Athletic recovery"],
    duration: "4-6 weeks for energy improvement",
    note: "Shilajit morning with warm milk. Moringa with meals. Ashwagandha evening.",
  },
  {
    id: "kit_joint",
    name: "Joint Ease Kit",
    tagline: "For joint pain, inflammation & mobility",
    description: "Vata-pacifying anti-inflammatories that reduce pain and rebuild joint tissue. Classical combination for Sandhivata (arthritis).",
    herbs: [
      { id: "herb_guggulu", name: "Guggulu", role: "Anti-inflammatory — reduces joint swelling" },
      { id: "herb_shunthi", name: "Ginger (Shunthi)", role: "Analgesic — reduces pain, improves circulation" },
      { id: "herb_haridra", name: "Turmeric (Haldi)", role: "COX-2 inhibitor — curcumin blocks inflammation" },
    ],
    bestFor: ["Joint pain", "Arthritis", "Stiffness", "Sports injuries"],
    duration: "4-8 weeks for pain reduction",
    note: "Guggulu after meals. Turmeric with black pepper and fat.",
  },
  {
    id: "kit_heart",
    name: "Heart Guard Kit",
    tagline: "For heart health, cholesterol & blood pressure",
    description: "Hridya (cardiotonic) herbs that strengthen the heart muscle, reduce cholesterol, and improve circulation.",
    herbs: [
      { id: "herb_arjuna", name: "Arjuna", role: "Hridya — strengthens heart muscle, reduces LDL" },
      { id: "herb_haridra", name: "Turmeric (Haldi)", role: "Cardioprotective — reduces arterial inflammation" },
      { id: "herb_punarnava", name: "Punarnava", role: "Diuretic — reduces fluid retention, supports circulation" },
    ],
    bestFor: ["High cholesterol", "Mild hypertension", "Heart health", "Fluid retention"],
    duration: "8-12 weeks with regular monitoring",
    note: "IMPORTANT: Do not replace heart medications. Use alongside, with doctor awareness.",
  },
  {
    id: "kit_women",
    name: "Stree Shakti Kit",
    tagline: "For hormonal balance, periods & reproductive health",
    description: "Traditional Stree Rasayana (women's rejuvenation) herbs. Shatavari nourishes, Lodhra regulates, Ashoka supports uterine health.",
    herbs: [
      { id: "herb_shatavari", name: "Shatavari", role: "Stree Rasayana — nourishes female reproductive system" },
      { id: "herb_lodhra", name: "Lodhra", role: "Yoni Shodhana — regulates menstrual cycle" },
      { id: "herb_ashwagandha", name: "Ashwagandha", role: "Hormonal balance — supports thyroid and adrenals" },
    ],
    bestFor: ["Irregular periods", "PCOS symptoms", "Hormonal imbalance", "Menopausal discomfort"],
    duration: "2-3 menstrual cycles for hormonal shift",
    note: "Shatavari with warm milk. NOT for use during pregnancy without guidance.",
  },
];

export function getStarterKit(id: string): StarterKit | undefined {
  return STARTER_KITS.find((k) => k.id === id);
}

export function getKitsForHerb(herbId: string): StarterKit[] {
  return STARTER_KITS.filter((k) => k.herbs.some((h) => h.id === herbId));
}
