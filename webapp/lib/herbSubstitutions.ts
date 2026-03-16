// ============================================
// Herb Substitution Map — similar-action alternatives
// When a user can't find a herb, suggest alternatives with similar benefits
// Based on shared dosha action, evidence claims, and classical Ayurvedic groupings
// ============================================

export interface HerbSubstitution {
  herbId: string;
  alternatives: {
    id: string;
    name: string;
    reason: string; // why it's a good substitute
  }[];
}

const SUBSTITUTION_MAP: Record<string, { id: string; name: string; reason: string }[]> = {
  // adaptogenic / stress — Ashwagandha alternatives
  herb_ashwagandha: [
    { id: "herb_shatavari", name: "Shatavari", reason: "Cooling adaptogen, better for Pitta types" },
    { id: "herb_brahmi", name: "Brahmi", reason: "Nootropic + adaptogenic, calmer energy" },
    { id: "herb_guduchi", name: "Guduchi", reason: "Immunomodulator with adaptogenic properties" },
  ],
  // cognitive — Brahmi alternatives
  herb_brahmi: [
    { id: "herb_shankhapushpi", name: "Shankhapushpi", reason: "Medhya Rasayana with calming properties" },
    { id: "herb_jatamansi", name: "Jatamansi", reason: "Memory + anxiety support, stronger sedation" },
    { id: "herb_ashwagandha", name: "Ashwagandha", reason: "Cognitive support via stress reduction" },
  ],
  // anti-inflammatory — Turmeric alternatives
  herb_haridra: [
    { id: "herb_shunthi", name: "Ginger", reason: "Anti-inflammatory via different pathway (COX inhibition)" },
    { id: "herb_guggulu", name: "Guggulu", reason: "Classical anti-inflammatory, joint-specific" },
    { id: "herb_manjistha", name: "Manjistha", reason: "Blood purifier with anti-inflammatory action" },
  ],
  // digestive — Triphala alternatives
  herb_triphala: [
    { id: "herb_isabgol", name: "Isabgol", reason: "Bulk laxative, gentler for sensitive GI" },
    { id: "herb_haritaki", name: "Haritaki", reason: "Main Triphala component, milder solo" },
    { id: "herb_ajwain", name: "Ajwain", reason: "Carminative digestive, works faster" },
  ],
  // immunity — Tulsi alternatives
  herb_tulsi: [
    { id: "herb_guduchi", name: "Guduchi", reason: "Stronger immunomodulator, better for fevers" },
    { id: "herb_kalmegh", name: "Kalmegh", reason: "Andrographis — potent anti-infective" },
    { id: "herb_amalaki", name: "Amla", reason: "Vitamin C rich, general immunity support" },
  ],
  // women's health — Shatavari alternatives
  herb_shatavari: [
    { id: "herb_lodhra", name: "Lodhra", reason: "Uterine tonic, menstrual support" },
    { id: "herb_ashwagandha", name: "Ashwagandha", reason: "Adaptogenic, hormonal balance support" },
    { id: "herb_nagkesar", name: "Nagkesar", reason: "Hemostatic, menstrual flow regulator" },
  ],
  // liver — Kutki alternatives
  herb_kutki: [
    { id: "herb_kalmegh", name: "Kalmegh", reason: "Hepatoprotective, more widely available" },
    { id: "herb_haridra", name: "Turmeric", reason: "Cholagogue, supports bile flow" },
    { id: "herb_bibhitaki", name: "Bibhitaki", reason: "Mild liver tonic, safer profile" },
  ],
  // men's vitality — Shilajit alternatives
  herb_shilajit: [
    { id: "herb_safed_musli", name: "Safed Musli", reason: "Traditional vitality herb, plant-based" },
    { id: "herb_gokshura", name: "Gokshura", reason: "Testosterone support, kidney tonic" },
    { id: "herb_kapikacchu", name: "Kapikacchu", reason: "L-DOPA source, fertility support" },
  ],
  // sleep — Jatamansi alternatives
  herb_jatamansi: [
    { id: "herb_tagar", name: "Tagar", reason: "Indian Valerian, strong sleep aid" },
    { id: "herb_brahmi", name: "Brahmi", reason: "Calming nootropic, mild sleep support" },
    { id: "herb_ashwagandha", name: "Ashwagandha", reason: "Reduces cortisol for better sleep" },
  ],
  // heart — Arjuna alternatives
  herb_arjuna: [
    { id: "herb_amalaki", name: "Amla", reason: "Cardioprotective antioxidant" },
    { id: "herb_guggulu", name: "Guggulu", reason: "Lipid-lowering, cardiovascular support" },
    { id: "herb_dalchini", name: "Cinnamon", reason: "Supports healthy blood pressure" },
  ],
  // skin — Neem alternatives
  herb_neem: [
    { id: "herb_manjistha", name: "Manjistha", reason: "Blood purifier, clears skin from inside" },
    { id: "herb_sariva", name: "Sariva", reason: "Cooling blood purifier, gentle on skin" },
    { id: "herb_haridra", name: "Turmeric", reason: "Anti-inflammatory, wound healing" },
  ],
};

export function getSubstitutions(herbId: string): { id: string; name: string; reason: string }[] {
  return SUBSTITUTION_MAP[herbId] || [];
}

export function hasSubstitutions(herbId: string): boolean {
  return herbId in SUBSTITUTION_MAP;
}
