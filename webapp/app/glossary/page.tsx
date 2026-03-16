"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface GlossaryEntry {
  term: string;
  sanskrit?: string;
  category: string;
  definition: string;
  example?: string;
}

const CATEGORIES = ["All", "Fundamentals", "Body & Mind", "Pharmacology", "Treatment", "Diet & Lifestyle"];

const GLOSSARY: GlossaryEntry[] = [
  // Fundamentals
  { term: "Dosha", sanskrit: "दोष", category: "Fundamentals", definition: "Three bio-energies (Vata, Pitta, Kapha) that govern all physiological and psychological functions. Health = balance of all three.", example: "Ashwagandha pacifies Vata dosha." },
  { term: "Vata", sanskrit: "वात", category: "Fundamentals", definition: "Air + Space dosha. Controls movement, breathing, nervous system. When imbalanced: anxiety, dry skin, constipation, insomnia.", example: "Vata increases with age, cold weather, and irregular routines." },
  { term: "Pitta", sanskrit: "पित्त", category: "Fundamentals", definition: "Fire + Water dosha. Controls digestion, metabolism, body temperature. When imbalanced: acidity, inflammation, anger, skin rashes.", example: "Turmeric pacifies excess Pitta." },
  { term: "Kapha", sanskrit: "कफ", category: "Fundamentals", definition: "Earth + Water dosha. Controls structure, lubrication, immunity. When imbalanced: weight gain, congestion, lethargy, attachment.", example: "Tulsi and Ginger reduce Kapha accumulation." },
  { term: "Prakriti", sanskrit: "प्रकृति", category: "Fundamentals", definition: "Your birth constitution — the unique ratio of Vata, Pitta, and Kapha you were born with. Doesn't change throughout life.", example: "A Pitta-dominant Prakriti person runs hot and has strong digestion." },
  { term: "Vikriti", sanskrit: "विकृति", category: "Fundamentals", definition: "Current imbalance — how your doshas have shifted from your natural Prakriti. This is what treatment targets.", example: "A Vata Prakriti person with excess Pitta Vikriti needs cooling herbs." },
  { term: "Panchamahabhuta", sanskrit: "पञ्चमहाभूत", category: "Fundamentals", definition: "Five great elements: Earth (Prithvi), Water (Jala), Fire (Agni), Air (Vayu), Space (Akasha). Everything is made of these.", example: "Ginger has Fire and Air elements — hence it's heating and drying." },

  // Body & Mind
  { term: "Agni", sanskrit: "अग्नि", category: "Body & Mind", definition: "Digestive fire — the metabolic force that digests food, thoughts, and experiences. Strong Agni = good health. Weak Agni = disease.", example: "Ginger (Shunthi) is the best Agni-deepana herb." },
  { term: "Ama", sanskrit: "आम", category: "Body & Mind", definition: "Toxic residue from undigested food or experiences. Coats tissues, blocks channels, causes disease. Opposite of Agni's work.", example: "Triphala helps clear accumulated Ama from the gut." },
  { term: "Ojas", sanskrit: "ओजस", category: "Body & Mind", definition: "Vital essence — the finest product of digestion. Gives immunity, radiance, strength, and contentment. The goal of Rasayana.", example: "Ashwagandha and Shatavari build Ojas." },
  { term: "Dhatu", sanskrit: "धातु", category: "Body & Mind", definition: "Seven body tissues: Rasa (plasma), Rakta (blood), Mamsa (muscle), Meda (fat), Asthi (bone), Majja (marrow), Shukra (reproductive).", example: "Shatavari nourishes Rasa and Shukra dhatus." },
  { term: "Srotas", sanskrit: "स्रोतस", category: "Body & Mind", definition: "Body channels — pathways through which dhatus, doshas, and waste products flow. Blocked srotas = disease.", example: "Punarnava clears fluid channels (Mutravaha Srotas)." },
  { term: "Manas", sanskrit: "मनस", category: "Body & Mind", definition: "The mind — in Ayurveda, mind has its own doshas (Sattva, Rajas, Tamas) that need balancing alongside physical doshas." },
  { term: "Prana", sanskrit: "प्राण", category: "Body & Mind", definition: "Vital life force — the breath energy that sustains all living functions. Sub-type of Vata that governs the mind and senses.", example: "Pranayama (breathing exercises) directly balances Prana Vayu." },

  // Pharmacology
  { term: "Rasa", sanskrit: "रस", category: "Pharmacology", definition: "Taste — 6 tastes in Ayurveda: Sweet (Madhura), Sour (Amla), Salty (Lavana), Pungent (Katu), Bitter (Tikta), Astringent (Kashaya). Each affects doshas differently.", example: "Neem has Bitter and Astringent rasa — pacifies Pitta and Kapha." },
  { term: "Guna", sanskrit: "गुण", category: "Pharmacology", definition: "Quality/property — 20 gunas in 10 opposite pairs: hot/cold, heavy/light, oily/dry, etc. Determines how a substance acts on the body.", example: "Ashwagandha has Guru (heavy) and Snigdha (oily) gunas." },
  { term: "Virya", sanskrit: "वीर्य", category: "Pharmacology", definition: "Potency — either Ushna (heating) or Sheeta (cooling). Determines the thermal effect of a herb on the body.", example: "Ginger has Ushna Virya — it heats the body." },
  { term: "Vipaka", sanskrit: "विपाक", category: "Pharmacology", definition: "Post-digestive effect — the taste that emerges after digestion. Can be Madhura (sweet), Amla (sour), or Katu (pungent).", example: "Ashwagandha has Madhura Vipaka — sweet post-digestive effect." },
  { term: "Prabhava", sanskrit: "प्रभाव", category: "Pharmacology", definition: "Special/unique action — effects that cannot be explained by Rasa, Guna, Virya, or Vipaka alone. The herb's 'special power'.", example: "Tulsi's anti-viral action is considered Prabhava." },
  { term: "Anupana", sanskrit: "अनुपान", category: "Pharmacology", definition: "Vehicle/carrier — the medium with which a herb is taken (milk, honey, water, ghee). Affects absorption and action.", example: "Ashwagandha with warm milk (Ksheera Anupana) is classical." },
  { term: "Dravya", sanskrit: "द्रव्य", category: "Pharmacology", definition: "Substance — any material (herb, mineral, food) used therapeutically. Every Dravya has Rasa, Guna, Virya, Vipaka, and Prabhava." },

  // Treatment
  { term: "Rasayana", sanskrit: "रसायन", category: "Treatment", definition: "Rejuvenation therapy — herbs and practices that rebuild tissues, boost immunity, and promote longevity. The highest goal of Ayurvedic herbalism.", example: "Chyawanprash is a classical Rasayana preparation." },
  { term: "Medhya Rasayana", sanskrit: "मेध्य रसायन", category: "Treatment", definition: "Brain rejuvenation — herbs specifically for improving memory, cognition, and mental clarity. Four classical Medhya herbs.", example: "Brahmi, Shankhapushpi, Jatamansi, and Guduchi are Medhya Rasayanas." },
  { term: "Panchakarma", sanskrit: "पञ्चकर्म", category: "Treatment", definition: "Five purification therapies: Vamana (emesis), Virechana (purgation), Basti (enema), Nasya (nasal), Raktamokshana (bloodletting). Deep detox.", example: "Panchakarma is always done under a practitioner's supervision." },
  { term: "Shamana", sanskrit: "शमन", category: "Treatment", definition: "Palliative therapy — gentle management of doshas using herbs, diet, and lifestyle. Less aggressive than Shodhana (purification).", example: "Taking Triphala daily is a Shamana approach to gut health." },
  { term: "Shodhana", sanskrit: "शोधन", category: "Treatment", definition: "Purification therapy — actively removing accumulated toxins and imbalanced doshas through Panchakarma procedures." },
  { term: "Chikitsa", sanskrit: "चिकित्सा", category: "Treatment", definition: "Treatment/therapy — the systematic approach to treating disease. Follows: Nidana (diagnosis) → Chikitsa (treatment) → Pathya (regimen)." },

  // Diet & Lifestyle
  { term: "Pathya", sanskrit: "पथ्य", category: "Diet & Lifestyle", definition: "Wholesome/suitable — foods and behaviors that support healing. The 'do' list. Every herb has specific pathya recommendations.", example: "Warm, easily digestible food is pathya when taking Triphala." },
  { term: "Apathya", sanskrit: "अपथ्य", category: "Diet & Lifestyle", definition: "Unwholesome/unsuitable — foods and behaviors that hinder healing. The 'don't' list. Equally important as pathya.", example: "Heavy, fried food is apathya when using digestive herbs." },
  { term: "Ritucharya", sanskrit: "ऋतुचर्या", category: "Diet & Lifestyle", definition: "Seasonal regimen — adapting diet, herbs, and lifestyle to the 6 Ayurvedic seasons. Prevents seasonal imbalances.", example: "Kapha-reducing herbs in spring (Vasant Ritu) prevent congestion." },
  { term: "Dinacharya", sanskrit: "दिनचर्या", category: "Diet & Lifestyle", definition: "Daily routine — the ideal daily schedule including waking, hygiene, exercise, meals, and sleep timing for optimal health." },
  { term: "Satmya", sanskrit: "सात्म्य", category: "Diet & Lifestyle", definition: "Habituation/tolerance — what your body has adapted to over time. Sudden changes in diet or herbs can cause problems even if they're 'good'.", example: "Start herbs at low doses and increase gradually — building Satmya." },
  { term: "Ahara", sanskrit: "आहार", category: "Diet & Lifestyle", definition: "Diet/food — considered the most important pillar of health in Ayurveda. 'You are what you digest' (not just what you eat)." },
  { term: "Vihara", sanskrit: "विहार", category: "Diet & Lifestyle", definition: "Lifestyle/activities — exercise, sleep, stress management, relationships. Second pillar of health after Ahara." },
];

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return GLOSSARY.filter((entry) => {
      const matchCategory = category === "All" || entry.category === category;
      const matchSearch = !q ||
        entry.term.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        (entry.sanskrit && entry.sanskrit.includes(q));
      return matchCategory && matchSearch;
    });
  }, [search, category]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ayurv-primary">Ayurvedic Glossary</h1>
          <p className="text-sm text-gray-500 mt-1">{GLOSSARY.length} key terms explained in plain English</p>
        </div>
        <Link
          href="/herbs"
          className="px-3.5 py-2 text-xs font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary hover:text-white transition-all"
        >
          Herb Library
        </Link>
      </div>

      {/* search */}
      <div className="relative mb-4">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms..."
          className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-ayurv-primary/20 focus:border-ayurv-primary outline-none transition-all"
        />
      </div>

      {/* category filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === cat
                ? "bg-ayurv-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* results count */}
      <p className="text-xs text-gray-400 mb-4">
        {filtered.length === GLOSSARY.length
          ? `${GLOSSARY.length} terms`
          : `${filtered.length} of ${GLOSSARY.length} terms`}
      </p>

      {/* term cards */}
      {filtered.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-sm text-gray-500">No terms match your search</p>
          <button
            type="button"
            onClick={() => { setSearch(""); setCategory("All"); }}
            className="text-xs text-ayurv-primary font-medium mt-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <div key={entry.term} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">{entry.term}</h3>
                  {entry.sanskrit && (
                    <span className="text-sm text-gray-400">{entry.sanskrit}</span>
                  )}
                </div>
                <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full whitespace-nowrap">
                  {entry.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{entry.definition}</p>
              {entry.example && (
                <p className="text-xs text-ayurv-primary mt-2 italic">{entry.example}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6 mb-4">
        Simplified for understanding. Consult Ayurvedic texts for complete definitions.
      </p>
    </div>
  );
}
