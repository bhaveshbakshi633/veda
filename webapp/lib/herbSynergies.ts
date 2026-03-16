// ============================================
// Herb Synergy Data — evidence-based pairing suggestions
// Classical + modern clinical evidence for herb combinations
// ============================================

export interface HerbSynergy {
  herbs: [string, string]; // herb_id pair
  reason: string;
  evidence: string; // clinical backing
  benefit: string; // one-line user benefit
}

// curated synergies — only pairs with documented evidence or strong classical basis
export const HERB_SYNERGIES: HerbSynergy[] = [
  {
    herbs: ["herb_haridra", "herb_maricha"],
    reason: "Piperine from black pepper increases curcumin bioavailability by 2000%",
    evidence: "Shoba et al., 1998 — Planta Medica",
    benefit: "Dramatically better turmeric absorption",
  },
  {
    herbs: ["herb_ashwagandha", "herb_brahmi"],
    reason: "Ashwagandha reduces stress hormones while Brahmi enhances cognitive function",
    evidence: "Traditional Rasayana combination; both individually RCT-validated",
    benefit: "Stress relief + mental clarity together",
  },
  {
    herbs: ["herb_triphala", "herb_haridra"],
    reason: "Triphala aids gut health + curcumin absorption through improved GI transit",
    evidence: "Traditional Panchakarma prep; Triphala improves bioavailability of co-administered herbs",
    benefit: "Better anti-inflammatory action with gut support",
  },
  {
    herbs: ["herb_shatavari", "herb_ashwagandha"],
    reason: "Shatavari (cooling) balances Ashwagandha (heating) — complete adaptogenic profile",
    evidence: "Classical Rasayana pair; complementary dosha actions (Vata+Pitta balance)",
    benefit: "Balanced stress response for women's health",
  },
  {
    herbs: ["herb_tulsi", "herb_shunthi"],
    reason: "Tulsi (anti-viral) + Ginger (anti-inflammatory) — synergistic immune response",
    evidence: "Common Kadha formulation; both individually evidence-graded B+",
    benefit: "Stronger immunity and respiratory support",
  },
  {
    herbs: ["herb_arjuna", "herb_amalaki"],
    reason: "Arjuna strengthens cardiac muscle while Amla provides antioxidant protection",
    evidence: "Hridaya Rasayana concept; both Grade B for cardiovascular benefit",
    benefit: "Heart health from two complementary angles",
  },
  {
    herbs: ["herb_guduchi", "herb_amalaki"],
    reason: "Guduchi (immunomodulator) + Amla (Vitamin C rich) — dual immune support",
    evidence: "Amritadi combination in Charaka Samhita; both individually studied",
    benefit: "Strong natural immune defense",
  },
  {
    herbs: ["herb_brahmi", "herb_shankhapushpi"],
    reason: "Both are Medhya Rasayanas — complementary nootropic mechanisms",
    evidence: "Charaka Samhita Medhya chapter; Brahmi (saponins) + Shankhapushpi (flavonoids)",
    benefit: "Enhanced memory and learning support",
  },
  {
    herbs: ["herb_shunthi", "herb_pippali"],
    reason: "Trikatu component pair — bioavailability enhancers for other herbs",
    evidence: "Trikatu formulation validated in multiple absorption studies",
    benefit: "Boosts effectiveness of other herbs you take",
  },
  {
    herbs: ["herb_yashtimadhu", "herb_haridra"],
    reason: "Licorice soothes GI mucosa while Turmeric reduces inflammation",
    evidence: "Traditional combination for gut inflammation; complementary mechanisms",
    benefit: "Stomach-friendly anti-inflammatory combo",
  },
  {
    herbs: ["herb_gokshura", "herb_ashwagandha"],
    reason: "Gokshura supports testosterone + urinary health; Ashwagandha for vitality",
    evidence: "Common men's health formulation; both individually RCT-supported",
    benefit: "Men's vitality and reproductive health",
  },
  {
    herbs: ["herb_kutki", "herb_haridra"],
    reason: "Kutki (hepatoprotective) + Turmeric (cholagogue) — comprehensive liver support",
    evidence: "Arogyavardhini Vati concept; both Grade B for liver protection",
    benefit: "Liver detox and protection",
  },
  {
    herbs: ["herb_neem", "herb_haridra"],
    reason: "Neem (antibacterial) + Turmeric (anti-inflammatory) — synergistic skin healing",
    evidence: "Classical Nimbadi combination; topical + internal use documented",
    benefit: "Clearer skin from inside out",
  },
  {
    herbs: ["herb_jatamansi", "herb_brahmi"],
    reason: "Jatamansi (anxiolytic) + Brahmi (cognitive) — calm focus without drowsiness",
    evidence: "Medhya + Nidrajanana combination; complementary CNS actions",
    benefit: "Calm mind with sharp focus",
  },
  {
    herbs: ["herb_isabgol", "herb_triphala"],
    reason: "Isabgol (bulk laxative) + Triphala (gentle digestive tonic) — comprehensive bowel health",
    evidence: "Both Grade B for constipation; different mechanisms complement well",
    benefit: "Gentle, effective digestive regularity",
  },
];

// find synergies for a given herb
export function getSynergiesForHerb(herbId: string): HerbSynergy[] {
  return HERB_SYNERGIES.filter(
    (s) => s.herbs[0] === herbId || s.herbs[1] === herbId
  );
}

// find synergies for a list of herbs (e.g., recommended herbs from assessment)
export function getSynergiesForHerbList(herbIds: string[]): (HerbSynergy & { matchCount: number })[] {
  const idSet = new Set(herbIds);
  return HERB_SYNERGIES
    .map((s) => ({
      ...s,
      matchCount: (idSet.has(s.herbs[0]) ? 1 : 0) + (idSet.has(s.herbs[1]) ? 1 : 0),
    }))
    .filter((s) => s.matchCount >= 1)
    .sort((a, b) => b.matchCount - a.matchCount);
}
