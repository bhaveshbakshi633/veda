"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { HERB_LIST } from "@/components/intake/constants";
import { getPregnancySafety } from "@/lib/pregnancySafety";
import { HERB_DOSHA_AFFINITY } from "@/lib/doshaProfile";
import { getFoodInteractions } from "@/lib/foodInteractions";
import { getSynergiesForHerb } from "@/lib/herbSynergies";

// slug map for linking
const SLUG_MAP: Record<string, string> = {
  herb_ashwagandha: "ashwagandha",
  herb_tulsi: "tulsi",
  herb_haridra: "turmeric",
  herb_brahmi: "brahmi",
  herb_triphala: "triphala",
  herb_amalaki: "amla",
  herb_shatavari: "shatavari",
  herb_guduchi: "guduchi",
  herb_arjuna: "arjuna",
  herb_yashtimadhu: "mulethi",
  herb_neem: "neem",
  herb_moringa: "moringa",
  herb_shunthi: "ginger",
  herb_dalchini: "cinnamon",
  herb_methi: "fenugreek",
  herb_kumari: "aloe-vera",
  herb_shilajit: "shilajit",
  herb_guggulu: "guggulu",
  herb_gokshura: "gokshura",
  herb_punarnava: "punarnava",
  herb_kutki: "kutki",
  herb_bhringaraj: "bhringaraj",
  herb_shankhapushpi: "shankhapushpi",
  herb_isabgol: "isabgol",
  herb_ajwain: "ajwain",
  herb_manjistha: "manjistha",
  herb_jatamansi: "jatamansi",
};

export default function ComparePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return HERB_LIST;
    const q = search.toLowerCase();
    return HERB_LIST.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        (h.hindi && h.hindi.includes(q)) ||
        h.id.toLowerCase().includes(q)
    );
  }, [search]);

  function toggleHerb(herbId: string) {
    setSelected((prev) => {
      if (prev.includes(herbId)) return prev.filter((id) => id !== herbId);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, herbId];
    });
  }

  function removeHerb(herbId: string) {
    setSelected((prev) => prev.filter((id) => id !== herbId));
  }

  // build comparison data for selected herbs
  const compData = useMemo(() => {
    return selected.map((herbId) => {
      const herb = HERB_LIST.find((h) => h.id === herbId);
      const pregnancy = getPregnancySafety(herbId);
      const dosha = HERB_DOSHA_AFFINITY[herbId];
      const foods = getFoodInteractions(herbId);
      const synergies = getSynergiesForHerb(herbId);
      return {
        id: herbId,
        name: herb?.name || herbId,
        hindi: herb?.hindi || "",
        pregnancy,
        dosha,
        foods,
        synergies,
        slug: SLUG_MAP[herbId],
      };
    });
  }, [selected]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ayurv-primary">Compare Herbs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Select up to 3 herbs to compare side by side
          </p>
        </div>
        <Link
          href="/herbs"
          className="px-3.5 py-2 text-xs font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary hover:text-white transition-all"
        >
          Herb Library
        </Link>
      </div>

      {/* herb selector */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm mb-6">
        <input
          type="text"
          placeholder="Search herbs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-ayurv-primary/20 focus:border-ayurv-primary outline-none mb-3"
        />
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {filtered.map((herb) => {
            const isSelected = selected.includes(herb.id);
            const isFull = selected.length >= 3 && !isSelected;
            return (
              <button
                key={herb.id}
                type="button"
                onClick={() => toggleHerb(herb.id)}
                disabled={isFull}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                  isSelected
                    ? "bg-ayurv-primary text-white border-ayurv-primary"
                    : isFull
                      ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                      : "bg-white text-gray-700 border-gray-200 hover:border-ayurv-primary/30 hover:text-ayurv-primary"
                }`}
              >
                {herb.name}
                {herb.hindi && <span className="ml-1 opacity-70">{herb.hindi}</span>}
              </button>
            );
          })}
        </div>
        {selected.length >= 3 && (
          <p className="text-[11px] text-amber-600 mt-2">Maximum 3 herbs selected. Remove one to add another.</p>
        )}
      </div>

      {/* selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {compData.map((h) => (
            <span
              key={h.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ayurv-primary/10 text-ayurv-primary text-sm font-medium rounded-full"
            >
              {h.name}
              <button
                type="button"
                onClick={() => removeHerb(h.id)}
                className="w-4 h-4 rounded-full bg-ayurv-primary/20 hover:bg-ayurv-primary hover:text-white flex items-center justify-center text-[10px] transition-colors"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {/* empty state */}
      {selected.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
          <p className="text-sm font-medium text-gray-600 mb-1">Select herbs to compare</p>
          <p className="text-xs text-gray-400">Pick 2-3 herbs above to see a side-by-side comparison</p>
        </div>
      )}

      {/* comparison table */}
      {selected.length >= 2 && (
        <div className="space-y-4">
          {/* pregnancy safety row */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Pregnancy Safety</h3>
            </div>
            <div className={`grid grid-cols-${selected.length} divide-x divide-gray-100`}>
              {compData.map((h) => {
                const ps = h.pregnancy;
                const color =
                  ps.level === "safe" ? "text-green-700 bg-green-50" :
                  ps.level === "caution" ? "text-amber-700 bg-amber-50" :
                  ps.level === "avoid" ? "text-red-700 bg-red-50" :
                  "text-gray-500 bg-gray-50";
                return (
                  <div key={h.id} className="p-4">
                    <p className="text-xs text-gray-400 font-medium mb-1">{h.name}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${color}`}>
                      {ps.label}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{ps.note}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* dosha affinity row */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Dosha Affinity</h3>
            </div>
            <div className={`grid grid-cols-${selected.length} divide-x divide-gray-100`}>
              {compData.map((h) => (
                <div key={h.id} className="p-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">{h.name}</p>
                  {h.dosha ? (
                    <>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {h.dosha.pacifies.map((d) => (
                          <span key={d} className="px-2 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 rounded-full border border-green-200">
                            Pacifies {d.charAt(0).toUpperCase() + d.slice(1)}
                          </span>
                        ))}
                      </div>
                      {h.dosha.aggravates && h.dosha.aggravates.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {h.dosha.aggravates.map((d) => (
                            <span key={d} className="px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-700 rounded-full border border-red-200">
                              Aggravates {d.charAt(0).toUpperCase() + d.slice(1)}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">No data</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* food interactions row */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Food Interactions</h3>
            </div>
            <div className={`grid grid-cols-${selected.length} divide-x divide-gray-100`}>
              {compData.map((h) => (
                <div key={h.id} className="p-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">{h.name}</p>
                  {h.foods.length > 0 ? (
                    <div className="space-y-1">
                      {h.foods.map((f, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                            f.type === "enhance" ? "bg-green-500" :
                            f.type === "avoid" ? "bg-red-500" :
                            "bg-blue-500"
                          }`} />
                          <span className="text-xs text-gray-600">{f.food}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No data</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* synergy count */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Known Synergies</h3>
            </div>
            <div className={`grid grid-cols-${selected.length} divide-x divide-gray-100`}>
              {compData.map((h) => (
                <div key={h.id} className="p-4">
                  <p className="text-xs text-gray-400 font-medium mb-2">{h.name}</p>
                  {h.synergies.length > 0 ? (
                    <div className="space-y-1">
                      {h.synergies.slice(0, 3).map((syn, i) => {
                        const partnerId = syn.herbs[0] === h.id ? syn.herbs[1] : syn.herbs[0];
                        const partnerName = HERB_LIST.find(x => x.id === partnerId)?.name || partnerId;
                        return (
                          <p key={i} className="text-xs text-gray-600">
                            <span className="font-medium text-ayurv-primary">+ {partnerName}</span> — {syn.benefit}
                          </p>
                        );
                      })}
                      {h.synergies.length > 3 && (
                        <p className="text-[10px] text-gray-400">+{h.synergies.length - 3} more</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No known synergies</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* links to detail pages */}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {compData.map((h) =>
              h.slug ? (
                <Link
                  key={h.id}
                  href={`/herbs/${h.slug}`}
                  className="px-4 py-2 text-xs font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary hover:text-white transition-all"
                >
                  Full details: {h.name}
                </Link>
              ) : null
            )}
          </div>
        </div>
      )}

      {/* single herb selected — prompt for more */}
      {selected.length === 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
          <p className="text-sm text-blue-700 font-medium">Select one more herb to start comparing</p>
          <p className="text-xs text-blue-500 mt-1">Choose from the list above — up to 3 total</p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6 mb-4">
        Comparison uses available data. Visit individual herb pages for full details and clinical evidence.
      </p>
    </div>
  );
}
