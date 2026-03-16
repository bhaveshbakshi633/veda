// ============================================
// Herb-Food Interaction Data
// Which foods to avoid/prefer when taking specific herbs
// Based on Ayurvedic pathya-apathya + clinical evidence
// ============================================

export interface FoodInteraction {
  food: string;
  type: "avoid" | "enhance" | "timing";
  reason: string;
}

const FOOD_INTERACTIONS: Record<string, FoodInteraction[]> = {
  herb_ashwagandha: [
    { food: "Warm milk", type: "enhance", reason: "Traditional anupana (carrier). Fat-soluble withanolides absorb better with dairy fat." },
    { food: "Caffeine", type: "avoid", reason: "Both affect cortisol — combined may cause jitteriness or negate calming effects." },
    { food: "Heavy meals", type: "timing", reason: "Take on empty stomach or with light meal for better absorption." },
  ],
  herb_haridra: [
    { food: "Black pepper", type: "enhance", reason: "Piperine increases curcumin bioavailability by 2000% (Shoba et al., 1998)." },
    { food: "Healthy fats", type: "enhance", reason: "Curcumin is fat-soluble — take with ghee, coconut oil, or olive oil." },
    { food: "Iron-rich foods", type: "avoid", reason: "Curcumin chelates iron — take 2 hours apart from iron supplements or red meat." },
  ],
  herb_brahmi: [
    { food: "Ghee", type: "enhance", reason: "Classical Brahmi Ghrita preparation — fat enhances CNS delivery." },
    { food: "Alcohol", type: "avoid", reason: "Both affect CNS — combined sedation risk." },
  ],
  herb_triphala: [
    { food: "Warm water", type: "enhance", reason: "Traditional method — dissolve powder in warm water before bed." },
    { food: "Dairy", type: "avoid", reason: "Tannins in Triphala may reduce protein absorption from dairy." },
    { food: "Meals", type: "timing", reason: "Best taken 30 min before meals or at bedtime for optimal gut action." },
  ],
  herb_tulsi: [
    { food: "Honey", type: "enhance", reason: "Traditional anupana for Kapha. Enhances respiratory benefits." },
    { food: "Blood-thinning foods", type: "avoid", reason: "Tulsi has mild anticoagulant properties — avoid garlic/ginger combo at high doses." },
  ],
  herb_shatavari: [
    { food: "Warm milk", type: "enhance", reason: "Classical anupana. Cooling + nourishing combination." },
    { food: "Very spicy food", type: "avoid", reason: "Defeats Pitta-calming purpose. Keep meals mild while using." },
  ],
  herb_amalaki: [
    { food: "Honey", type: "enhance", reason: "Traditional Chyawanprash base. Honey + Amla = classical Rasayana." },
    { food: "Calcium supplements", type: "timing", reason: "Vitamin C enhances calcium absorption — good timing to combine." },
    { food: "Iron supplements", type: "enhance", reason: "Amla's Vitamin C dramatically improves non-heme iron absorption." },
  ],
  herb_yashtimadhu: [
    { food: "Salt", type: "avoid", reason: "Licorice causes sodium retention — high-salt diet amplifies water retention." },
    { food: "Potassium-rich foods", type: "enhance", reason: "Licorice depletes potassium — eat bananas, coconut water alongside." },
  ],
  herb_shunthi: [
    { food: "Lemon/lime", type: "enhance", reason: "Traditional combination — aids digestive fire (Agni)." },
    { food: "Blood-thinning meds/foods", type: "avoid", reason: "Ginger has mild antiplatelet activity." },
  ],
  herb_guduchi: [
    { food: "Jaggery", type: "enhance", reason: "Traditional anupana for Guduchi (Amrita). Improves palatability." },
    { food: "Meals", type: "timing", reason: "Best on empty stomach for immune-modulating effects." },
  ],
  herb_neem: [
    { food: "Sweet foods", type: "enhance", reason: "Balances Neem's extreme bitterness. Jaggery or honey recommended." },
    { food: "Dairy", type: "timing", reason: "Take at least 1 hour apart — Neem's bitterness may curdle milk." },
  ],
  herb_arjuna: [
    { food: "Milk", type: "enhance", reason: "Arjuna Kshirapaka (boiled with milk) is classical preparation." },
    { food: "High-fat meals", type: "timing", reason: "Bark tannins absorb better on empty stomach." },
  ],
  herb_isabgol: [
    { food: "Water (plenty)", type: "enhance", reason: "MUST drink 1-2 glasses of water — without water, isabgol can cause blockage." },
    { food: "Meals", type: "timing", reason: "Take 30 min before or after meals, not during." },
  ],
};

export function getFoodInteractions(herbId: string): FoodInteraction[] {
  return FOOD_INTERACTIONS[herbId] || [];
}

export function hasFoodInteractions(herbId: string): boolean {
  return herbId in FOOD_INTERACTIONS;
}
