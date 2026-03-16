"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { HERB_LIST } from "@/components/intake/constants";
import { trackEvent } from "@/lib/track";
import { getPregnancySafety, type PregnancySafetyLevel } from "@/lib/pregnancySafety";
import RecentHerbs from "@/components/RecentHerbs";

// herb_id → URL slug mapping — isko touch mat karna
const ID_TO_SLUG: Record<string, string> = {
  herb_ashwagandha: "ashwagandha", herb_tulsi: "tulsi", herb_haridra: "turmeric",
  herb_brahmi: "brahmi", herb_triphala: "triphala", herb_amalaki: "amla",
  herb_shatavari: "shatavari", herb_guduchi: "guduchi", herb_arjuna: "arjuna",
  herb_yashtimadhu: "mulethi", herb_neem: "neem", herb_moringa: "moringa",
  herb_shunthi: "ginger", herb_dalchini: "cinnamon", herb_methi: "fenugreek",
  herb_kumari: "aloe-vera", herb_shilajit: "shilajit", herb_guggulu: "guggulu",
  herb_gokshura: "gokshura", herb_punarnava: "punarnava", herb_kutki: "kutki",
  herb_bhringaraj: "bhringaraj", herb_shankhapushpi: "shankhapushpi",
  herb_vidanga: "vidanga", herb_vacha: "vacha", herb_pippali: "pippali",
  herb_maricha: "black-pepper", herb_elaichi: "cardamom", herb_lavanga: "clove",
  herb_kalmegh: "kalmegh", herb_manjistha: "manjistha", herb_chitrak: "chitrak",
  herb_bala: "bala", herb_jatamansi: "jatamansi", herb_tagar: "tagar",
  herb_musta: "musta", herb_haritaki: "haritaki", herb_bibhitaki: "bibhitaki",
  herb_sariva: "sariva", herb_chirata: "chirata", herb_ajwain: "ajwain",
  herb_jeera: "cumin", herb_kalonji: "kalonji", herb_isabgol: "isabgol",
  herb_senna: "senna", herb_safed_musli: "safed-musli",
  herb_kapikacchu: "kapikacchu", herb_rasna: "rasna", herb_lodhra: "lodhra",
  herb_nagkesar: "nagkesar",
};

// category → herb slugs mapping — ek herb multiple categories mein aa sakta hai
const CATEGORY_HERBS: Record<string, string[]> = {
  "Stress & Sleep": ["ashwagandha", "brahmi", "jatamansi", "shankhapushpi", "tagar", "vacha"],
  "Digestion": ["triphala", "ginger", "ajwain", "cumin", "isabgol", "chitrak", "musta", "pippali", "senna"],
  "Immunity": ["tulsi", "amla", "guduchi", "moringa", "kalmegh", "chirata"],
  "Skin & Hair": ["neem", "bhringaraj", "manjistha", "aloe-vera", "sariva", "lodhra"],
  "Joint & Pain": ["turmeric", "guggulu", "rasna", "bala", "punarnava"],
  "Men's Health": ["shilajit", "safed-musli", "gokshura", "kapikacchu", "ashwagandha"],
  "Women's Health": ["shatavari", "lodhra", "nagkesar", "mulethi"],
  "Heart & Blood": ["arjuna", "guggulu", "kutki", "cinnamon"],
  "Energy & Vitality": ["shilajit", "moringa", "pippali", "black-pepper", "amla"],
};

const CATEGORY_NAMES = ["All", ...Object.keys(CATEGORY_HERBS)] as const;

// debounce timer ref ke liye type
type TimerRef = ReturnType<typeof setTimeout> | null;

export default function HerbsIndexPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [pregnancyFilter, setPregnancyFilter] = useState<PregnancySafetyLevel | "all">("all");
  // search tracking ke liye debounce — har keystroke pe track nahi karna
  const debounceRef = useRef<TimerRef>(null);

  // category change handler — track bhi karo
  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    if (category !== "All") {
      trackEvent("herb_filter", { category });
    }
  }, []);

  // search input handler — debounced tracking
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    // 500ms debounce — user type karna band kare tab track karo
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        trackEvent("herb_search", { query: value.trim() });
      }, 500);
    }
  }, []);

  // filtered herbs — search + category dono apply hote hain
  const filteredHerbs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return HERB_LIST.filter((herb) => {
      const slug = ID_TO_SLUG[herb.id];
      if (!slug) return false;

      // pehle category filter check karo
      if (activeCategory !== "All") {
        const categorySlugs = CATEGORY_HERBS[activeCategory];
        if (!categorySlugs || !categorySlugs.includes(slug)) return false;
      }

      // fir search query match karo — name aur hindi dono mein
      if (query) {
        const nameMatch = herb.name.toLowerCase().includes(query);
        const hindiMatch = herb.hindi?.toLowerCase().includes(query) ?? false;
        // slug mein bhi search karo — "aloe" se "aloe-vera" mile
        const slugMatch = slug.toLowerCase().includes(query);
        if (!nameMatch && !hindiMatch && !slugMatch) return false;
      }

      // pregnancy safety filter
      if (pregnancyFilter !== "all") {
        const safety = getPregnancySafety(herb.id);
        if (safety.level !== pregnancyFilter) return false;
      }

      return true;
    });
  }, [searchQuery, activeCategory, pregnancyFilter]);

  // total herbs count — sirf valid slug waale
  const totalHerbs = HERB_LIST.filter((h) => ID_TO_SLUG[h.id]).length;

  return (
    <div className="max-w-4xl mx-auto">
      <RecentHerbs />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Ayurvedic Herb Database
      </h1>
      <p className="text-sm text-ayurv-muted mb-6">
        50 herbs with evidence-graded safety profiles, dosage information, and drug interaction data.
        Tap any herb to see its full profile.
      </p>

      {/* search bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search herbs by name or Hindi name..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ayurv-primary/20 focus:border-ayurv-primary/40 transition-all"
        />
        {/* clear button — sirf jab kuch likha ho tab dikhao */}
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* category filter chips — horizontally scrollable */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1 no-scrollbar">
        {CATEGORY_NAMES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isActive
                  ? "bg-ayurv-primary text-white border-ayurv-primary shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-ayurv-primary/30 hover:text-ayurv-primary"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* pregnancy safety filter */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500 font-medium shrink-0">Pregnancy:</span>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {([
            { key: "all" as const, label: "All", color: "bg-white text-gray-600 border-gray-200" },
            { key: "safe" as const, label: "Safe", color: "bg-green-50 text-green-700 border-green-200" },
            { key: "caution" as const, label: "Caution", color: "bg-amber-50 text-amber-700 border-amber-200" },
            { key: "avoid" as const, label: "Avoid", color: "bg-red-50 text-red-700 border-red-200" },
          ] as const).map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setPregnancyFilter(key);
                if (key !== "all") trackEvent("pregnancy_filter", { level: key });
              }}
              className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                pregnancyFilter === key
                  ? `${color} ring-1 ring-current shadow-sm`
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* result count */}
      <p className="text-xs text-ayurv-muted mb-3">
        Showing {filteredHerbs.length} of {totalHerbs} herbs
        {activeCategory !== "All" && <span className="text-ayurv-accent font-medium"> in {activeCategory}</span>}
        {searchQuery.trim() && <span> matching &ldquo;{searchQuery.trim()}&rdquo;</span>}
      </p>

      {/* herbs grid ya no results */}
      {filteredHerbs.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredHerbs.map((herb) => {
            const slug = ID_TO_SLUG[herb.id];
            return (
              <Link
                key={herb.id}
                href={`/herbs/${slug}`}
                className="group bg-white border border-gray-200 rounded-xl px-4 py-3.5 hover:border-ayurv-primary/30 hover:shadow-sm hover:bg-ayurv-primary/5 transition-all"
              >
                <span className="text-sm font-semibold text-gray-800 group-hover:text-ayurv-primary transition-colors">
                  {herb.name}
                </span>
                {herb.hindi && (
                  <span className="block text-xs text-gray-400 mt-0.5">{herb.hindi}</span>
                )}
                {/* pregnancy safety badge */}
                {(() => {
                  const ps = getPregnancySafety(herb.id);
                  if (ps.level === "unknown") return null;
                  const badgeStyle = ps.level === "safe"
                    ? "bg-green-50 text-green-600 border-green-200"
                    : ps.level === "caution"
                      ? "bg-amber-50 text-amber-600 border-amber-200"
                      : "bg-red-50 text-red-600 border-red-200";
                  const icon = ps.level === "safe" ? "\u2713" : ps.level === "caution" ? "!" : "\u2717";
                  return (
                    <span className={`inline-flex items-center gap-0.5 mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${badgeStyle}`}>
                      <span className="font-bold">{icon}</span> {ps.label}
                    </span>
                  );
                })()}
              </Link>
            );
          })}
        </div>
      ) : (
        // no results state — scope-aware messaging
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <div className="text-center mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              No herbs found
            </h3>
            <p className="text-xs text-gray-500">
              {activeCategory !== "All"
                ? `No herbs matched in "${activeCategory}". Try a different category.`
                : searchQuery.trim()
                  ? `No herbs match "${searchQuery.trim()}". Our database currently covers the most common Ayurvedic herbs with clinical evidence.`
                  : "Try a different search term or change the category filter."
              }
            </p>
          </div>

          {searchQuery.trim().length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 text-left">
              <p className="text-xs text-blue-700 font-medium mb-1">Search tips:</p>
              <ul className="text-xs text-blue-600 space-y-0.5">
                <li>Try the English or Hindi name (e.g. &quot;turmeric&quot; or &quot;haldi&quot;)</li>
                <li>Use the category filter to browse by use case</li>
              </ul>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-ayurv-primary bg-ayurv-primary/10 rounded-lg hover:bg-ayurv-primary/15 transition-colors"
            >
              View all herbs
            </button>
          </div>
        </div>
      )}

      {/* CTA section — wahi original waala */}
      <div className="mt-8 bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-2xl p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Check herb safety for your profile
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Get personalized safety checks based on your conditions, medications, and health profile.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ayurv-primary text-white font-semibold rounded-xl hover:bg-ayurv-secondary transition-colors shadow-md"
        >
          Start Safety Check
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        Educational information only. Not medical advice.
      </p>
    </div>
  );
}
