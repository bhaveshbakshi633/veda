"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HERB_LIST } from "@/components/intake/constants";

const SLUG_MAP: Record<string, string> = {
  herb_ashwagandha: "ashwagandha", herb_tulsi: "tulsi", herb_haridra: "turmeric",
  herb_brahmi: "brahmi", herb_triphala: "triphala", herb_amalaki: "amla",
  herb_shatavari: "shatavari", herb_guduchi: "guduchi", herb_arjuna: "arjuna",
  herb_yashtimadhu: "mulethi", herb_neem: "neem", herb_moringa: "moringa",
  herb_shunthi: "ginger", herb_dalchini: "cinnamon", herb_methi: "fenugreek",
  herb_kumari: "aloe-vera", herb_shilajit: "shilajit", herb_guggulu: "guggulu",
  herb_gokshura: "gokshura", herb_punarnava: "punarnava", herb_kutki: "kutki",
  herb_bhringaraj: "bhringaraj", herb_shankhapushpi: "shankhapushpi",
  herb_isabgol: "isabgol", herb_ajwain: "ajwain", herb_manjistha: "manjistha",
  herb_jatamansi: "jatamansi", herb_vidanga: "vidanga", herb_vacha: "vacha",
  herb_pippali: "pippali", herb_maricha: "black-pepper", herb_elaichi: "cardamom",
  herb_lavanga: "clove", herb_kalmegh: "kalmegh", herb_chitrak: "chitrak",
  herb_bala: "bala", herb_tagar: "tagar", herb_musta: "musta",
  herb_haritaki: "haritaki", herb_bibhitaki: "bibhitaki", herb_sariva: "sariva",
  herb_chirata: "chirata", herb_jeera: "cumin", herb_kalonji: "kalonji",
  herb_senna: "senna", herb_safed_musli: "safed-musli",
  herb_kapikacchu: "kapikacchu", herb_rasna: "rasna", herb_lodhra: "lodhra",
  herb_nagkesar: "nagkesar",
};

export default function QuickHerbSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return HERB_LIST.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.hindi && h.hindi.includes(q)) ||
        h.id.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  // close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function navigateToHerb(herbId: string) {
    const slug = SLUG_MAP[herbId];
    if (slug) {
      router.push(`/herbs/${slug}`);
      setOpen(false);
      setQuery("");
    }
  }

  return (
    <div ref={wrapperRef} className="relative max-w-md mx-auto mt-6">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search any herb — Ashwagandha, Tulsi, Haldi..."
          className="w-full pl-12 pr-4 py-3.5 text-sm border-2 border-gray-200 rounded-2xl bg-white focus:ring-2 focus:ring-ayurv-primary/20 focus:border-ayurv-primary/30 outline-none transition-all shadow-sm"
        />
      </div>

      {/* dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
          {results.map((herb) => (
            <button
              key={herb.id}
              type="button"
              onClick={() => navigateToHerb(herb.id)}
              className="w-full text-left px-4 py-3 hover:bg-ayurv-primary/5 transition-colors flex items-center justify-between gap-3 border-b border-gray-50 last:border-0"
            >
              <div>
                <span className="text-sm font-semibold text-gray-800">{herb.name}</span>
                {herb.hindi && <span className="text-xs text-gray-400 ml-2">{herb.hindi}</span>}
              </div>
              <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {open && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 px-4 py-3">
          <p className="text-sm text-gray-500">No herbs found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}
