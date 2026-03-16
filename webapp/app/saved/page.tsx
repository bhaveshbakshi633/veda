"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getBookmarks, removeBookmark, clearBookmarks, BookmarkedHerb } from "@/lib/bookmarks";

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
  herb_jatamansi: "jatamansi",
};

export default function SavedPage() {
  const [herbs, setHerbs] = useState<BookmarkedHerb[]>([]);

  useEffect(() => {
    setHerbs(getBookmarks());
  }, []);

  function handleRemove(herbId: string) {
    removeBookmark(herbId);
    setHerbs(getBookmarks());
  }

  function handleClearAll() {
    if (!window.confirm("Remove all saved herbs?")) return;
    clearBookmarks();
    setHerbs([]);
  }

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch {
      return "";
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ayurv-primary">Saved Herbs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {herbs.length === 0 ? "No herbs saved yet" : `${herbs.length} herb${herbs.length > 1 ? "s" : ""} saved`}
          </p>
        </div>
        <Link
          href="/herbs"
          className="px-3.5 py-2 text-xs font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary hover:text-white transition-all"
        >
          Browse Herbs
        </Link>
      </div>

      {herbs.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-10 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          <p className="text-sm font-medium text-gray-600 mb-1">No saved herbs</p>
          <p className="text-xs text-gray-400 mb-4">
            Save herbs from the herb library by tapping the bookmark icon
          </p>
          <Link
            href="/herbs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ayurv-primary text-white text-sm font-semibold rounded-xl hover:bg-ayurv-secondary transition-colors shadow-sm"
          >
            Browse Herb Library
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {herbs.map((herb) => {
              const slug = SLUG_MAP[herb.id];
              return (
                <div key={herb.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    {slug ? (
                      <Link href={`/herbs/${slug}`} className="text-base font-semibold text-ayurv-primary hover:underline">
                        {herb.name}
                      </Link>
                    ) : (
                      <span className="text-base font-semibold text-gray-800">{herb.name}</span>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">Saved {formatDate(herb.savedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {slug && (
                      <Link
                        href={`/herbs/${slug}`}
                        className="px-3 py-1.5 text-xs font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-lg hover:bg-ayurv-primary hover:text-white transition-all"
                      >
                        View
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemove(herb.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${herb.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/compare"
              className="text-xs font-medium text-ayurv-primary hover:underline"
            >
              Compare saved herbs
            </Link>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear all
            </button>
          </div>
        </>
      )}
    </div>
  );
}
