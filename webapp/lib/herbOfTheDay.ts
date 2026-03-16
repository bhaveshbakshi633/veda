// ============================================
// Herb of the Day — rotates daily based on date
// deterministic: same herb for everyone on the same day
// ============================================

import { HERB_LIST } from "@/components/intake/constants";

interface HerbOfTheDay {
  id: string;
  name: string;
  hindi: string;
  slug: string;
  tip: string;
}

// curated daily tips — one per popular herb
const DAILY_TIPS: Record<string, string> = {
  herb_ashwagandha: "Take Ashwagandha with warm milk at bedtime for best stress relief and sleep support.",
  herb_tulsi: "Brew 5-6 fresh Tulsi leaves in hot water for a simple immunity-boosting morning tea.",
  herb_haridra: "Always combine Turmeric with black pepper — piperine increases absorption by 2000%.",
  herb_brahmi: "Brahmi works best when taken consistently for 4-6 weeks. Pair with ghee for CNS delivery.",
  herb_triphala: "Take Triphala with warm water 30 minutes before bed for gentle overnight detox.",
  herb_amalaki: "One Amla per day provides more Vitamin C than 3 oranges — nature's richest source.",
  herb_shatavari: "Shatavari with warm milk is the classical Stree Rasayana — nourishing for all ages.",
  herb_guduchi: "Guduchi (Giloy) is called Amrita — the 'herb of immortality'. Best on empty stomach.",
  herb_arjuna: "Arjuna bark boiled in milk (Kshirapaka) is the classical cardiotonic preparation.",
  herb_yashtimadhu: "Mulethi soothes the throat naturally. Avoid if you have high BP — it retains sodium.",
  herb_neem: "Neem is extremely bitter — mix with honey or jaggery. Best for skin and blood purification.",
  herb_moringa: "Moringa leaves have 7x more Vitamin C than oranges and 4x more calcium than milk.",
  herb_shunthi: "Dry ginger (Shunthi) is more potent than fresh ginger for digestive issues.",
  herb_shilajit: "Authentic Shilajit dissolves completely in warm water. If it doesn't — it's fake.",
  herb_guggulu: "Guggulu is most effective for joint pain when taken after meals with warm water.",
  herb_manjistha: "Manjistha is the #1 blood purifier in Ayurveda — helps clear stubborn skin issues.",
  herb_jatamansi: "Jatamansi is Ayurveda's natural melatonin — calms the mind without morning grogginess.",
  herb_punarnava: "Punarnava literally means 'that which renews' — excellent for kidney and liver support.",
  herb_gokshura: "Gokshura supports both kidney function and reproductive health — a rare dual benefit.",
  herb_kutki: "Kutki is the strongest liver protector in Ayurveda — even used alongside conventional hepatoprotectants.",
};

const SLUG_MAP: Record<string, string> = {
  herb_ashwagandha: "ashwagandha", herb_tulsi: "tulsi", herb_haridra: "turmeric",
  herb_brahmi: "brahmi", herb_triphala: "triphala", herb_amalaki: "amla",
  herb_shatavari: "shatavari", herb_guduchi: "guduchi", herb_arjuna: "arjuna",
  herb_yashtimadhu: "mulethi", herb_neem: "neem", herb_moringa: "moringa",
  herb_shunthi: "ginger", herb_shilajit: "shilajit", herb_guggulu: "guggulu",
  herb_manjistha: "manjistha", herb_jatamansi: "jatamansi",
  herb_punarnava: "punarnava", herb_gokshura: "gokshura", herb_kutki: "kutki",
};

// featured herbs — only those with curated tips
const FEATURED_IDS = Object.keys(DAILY_TIPS);

export function getHerbOfTheDay(): HerbOfTheDay {
  // deterministic daily rotation — day number since epoch modulo featured count
  const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const index = dayNumber % FEATURED_IDS.length;
  const herbId = FEATURED_IDS[index];

  const herb = HERB_LIST.find((h) => h.id === herbId);

  return {
    id: herbId,
    name: herb?.name || herbId,
    hindi: herb?.hindi || "",
    slug: SLUG_MAP[herbId] || "",
    tip: DAILY_TIPS[herbId] || "",
  };
}
