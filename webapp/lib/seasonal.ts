// ============================================
// Ayurvedic Seasonal Recommendations (Ritucharya)
// Season detection + herb suggestions based on classical texts
// ============================================

export type AyurvedicSeason =
  | "vasant"    // spring (Mar-Apr) — Kapha season
  | "grishma"   // summer (May-Jun) — Pitta onset
  | "varsha"    // monsoon (Jul-Aug) — Vata aggravation
  | "sharad"    // autumn (Sep-Oct) — Pitta season
  | "hemant"    // early winter (Nov-Dec) — strong Agni
  | "shishir";  // late winter (Jan-Feb) — Kapha buildup

export interface SeasonInfo {
  id: AyurvedicSeason;
  name: string;
  english: string;
  months: string;
  dosha: string;
  description: string;
  herbs: { id: string; name: string; reason: string }[];
  diet_tips: string[];
}

const SEASONS: SeasonInfo[] = [
  {
    id: "shishir",
    name: "Shishir Ritu",
    english: "Late Winter",
    months: "Jan–Feb",
    dosha: "Kapha buildup, strong Agni",
    description: "Cold, dry season. Digestive fire (Agni) is strong. Body builds reserves.",
    herbs: [
      { id: "herb_shunthi", name: "Ginger", reason: "Warming, supports digestion, prevents congestion" },
      { id: "herb_pippali", name: "Pippali", reason: "Trikatu component, bioavailability enhancer, warming" },
      { id: "herb_ashwagandha", name: "Ashwagandha", reason: "Strength-building Rasayana, ideal in cold months" },
      { id: "herb_dalchini", name: "Cinnamon", reason: "Warming spice, supports circulation" },
    ],
    diet_tips: ["Warm, heavy, oily foods preferred", "Sesame oil for cooking and massage", "Avoid cold beverages"],
  },
  {
    id: "vasant",
    name: "Vasant Ritu",
    english: "Spring",
    months: "Mar–Apr",
    dosha: "Kapha dominance — congestion, allergies, heaviness",
    description: "Accumulated winter Kapha melts. Ideal season for detox and lightening.",
    herbs: [
      { id: "herb_haridra", name: "Turmeric", reason: "Anti-inflammatory, supports liver detox" },
      { id: "herb_triphala", name: "Triphala", reason: "Gentle colon cleanse, removes winter Ama (toxins)" },
      { id: "herb_tulsi", name: "Tulsi", reason: "Anti-allergic, respiratory support for spring allergies" },
      { id: "herb_neem", name: "Neem", reason: "Blood purifier, clears spring skin issues" },
    ],
    diet_tips: ["Light, warm, dry foods", "Honey (old) is recommended", "Reduce dairy and sweets"],
  },
  {
    id: "grishma",
    name: "Grishma Ritu",
    english: "Summer",
    months: "May–Jun",
    dosha: "Pitta aggravation — heat, acidity, irritability",
    description: "Hot season depletes body fluids. Cooling herbs and diet essential.",
    herbs: [
      { id: "herb_amalaki", name: "Amla", reason: "Cooling Rasayana, Vitamin C rich, counters heat" },
      { id: "herb_shatavari", name: "Shatavari", reason: "Cooling, hydrating, Pitta-pacifying adaptogen" },
      { id: "herb_yashtimadhu", name: "Mulethi", reason: "Soothes heat-aggravated GI mucosa" },
      { id: "herb_sariva", name: "Sariva", reason: "Classical cooling herb for blood purification" },
    ],
    diet_tips: ["Cool, sweet, liquid foods", "Buttermilk and fruit juices", "Avoid hot spices and fried foods"],
  },
  {
    id: "varsha",
    name: "Varsha Ritu",
    english: "Monsoon",
    months: "Jul–Aug",
    dosha: "Vata aggravation — weak digestion, joint pain, infections",
    description: "Digestion weakens. Water-borne infections common. Vata imbalance peaks.",
    herbs: [
      { id: "herb_guduchi", name: "Guduchi", reason: "Immunomodulator, fever prevention, monsoon immunity" },
      { id: "herb_shunthi", name: "Ginger", reason: "Strengthens weakened Agni during rains" },
      { id: "herb_haridra", name: "Turmeric", reason: "Anti-infective, protects against monsoon infections" },
      { id: "herb_ajwain", name: "Ajwain", reason: "Digestive, carminative, prevents monsoon bloating" },
    ],
    diet_tips: ["Light, easily digestible foods", "Use asafoetida and cumin in cooking", "Boil drinking water"],
  },
  {
    id: "sharad",
    name: "Sharad Ritu",
    english: "Autumn",
    months: "Sep–Oct",
    dosha: "Pitta at peak — acidity, skin rashes, inflammation",
    description: "Accumulated monsoon Pitta surfaces. Cooling and calming herbs needed.",
    herbs: [
      { id: "herb_amalaki", name: "Amla", reason: "Best Pitta-pacifier, skin health support" },
      { id: "herb_brahmi", name: "Brahmi", reason: "Cooling nervine, calms Pitta-aggravated mind" },
      { id: "herb_manjistha", name: "Manjistha", reason: "Blood purifier, clears Pitta-driven skin issues" },
      { id: "herb_kumari", name: "Aloe Vera", reason: "Cooling, soothes GI inflammation" },
    ],
    diet_tips: ["Bitter and sweet foods preferred", "Ghee is beneficial", "Avoid fermented and sour foods"],
  },
  {
    id: "hemant",
    name: "Hemant Ritu",
    english: "Early Winter",
    months: "Nov–Dec",
    dosha: "Agni strengthens — nourishing season",
    description: "Digestive fire peaks. Best time for Rasayana (rejuvenation) therapy.",
    herbs: [
      { id: "herb_ashwagandha", name: "Ashwagandha", reason: "Premier winter Rasayana, builds ojas" },
      { id: "herb_shilajit", name: "Shilajit", reason: "Mineral-rich rejuvenator, energy support" },
      { id: "herb_maricha", name: "Black Pepper", reason: "Warming, enhances bioavailability of other herbs" },
      { id: "herb_lavanga", name: "Clove", reason: "Warming, antimicrobial, respiratory support" },
    ],
    diet_tips: ["Heavy, warm, nourishing foods", "Milk with turmeric and saffron", "Sesame and jaggery"],
  },
];

// detect current Ayurvedic season from month
export function getCurrentSeason(): SeasonInfo {
  const month = new Date().getMonth() + 1; // 1-12
  if (month <= 2) return SEASONS.find(s => s.id === "shishir")!;
  if (month <= 4) return SEASONS.find(s => s.id === "vasant")!;
  if (month <= 6) return SEASONS.find(s => s.id === "grishma")!;
  if (month <= 8) return SEASONS.find(s => s.id === "varsha")!;
  if (month <= 10) return SEASONS.find(s => s.id === "sharad")!;
  return SEASONS.find(s => s.id === "hemant")!;
}

export function getAllSeasons(): SeasonInfo[] {
  return SEASONS;
}
