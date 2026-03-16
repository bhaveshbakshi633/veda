"use client";

import { useState } from "react";
import Link from "next/link";
import { STARTER_KITS, StarterKit } from "@/lib/starterKits";

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
  herb_guggulu: "guggulu",
  herb_punarnava: "punarnava",
  herb_manjistha: "manjistha",
  herb_jatamansi: "jatamansi",
  herb_ajwain: "ajwain",
  herb_shilajit: "shilajit",
  herb_lodhra: "lodhra",
};

const KIT_ICONS: Record<string, string> = {
  kit_stress: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  kit_digestion: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z",
  kit_immunity: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
  kit_skin: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  kit_energy: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
  kit_joint: "M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z",
  kit_heart: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  kit_women: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
};

const KIT_COLORS: Record<string, { bg: string; border: string; accent: string }> = {
  kit_stress: { bg: "bg-indigo-50/50", border: "border-indigo-200/50", accent: "text-indigo-700" },
  kit_digestion: { bg: "bg-orange-50/50", border: "border-orange-200/50", accent: "text-orange-700" },
  kit_immunity: { bg: "bg-green-50/50", border: "border-green-200/50", accent: "text-green-700" },
  kit_skin: { bg: "bg-pink-50/50", border: "border-pink-200/50", accent: "text-pink-700" },
  kit_energy: { bg: "bg-yellow-50/50", border: "border-yellow-200/50", accent: "text-yellow-700" },
  kit_joint: { bg: "bg-cyan-50/50", border: "border-cyan-200/50", accent: "text-cyan-700" },
  kit_heart: { bg: "bg-red-50/50", border: "border-red-200/50", accent: "text-red-700" },
  kit_women: { bg: "bg-purple-50/50", border: "border-purple-200/50", accent: "text-purple-700" },
};

function KitCard({ kit }: { kit: StarterKit }) {
  const [expanded, setExpanded] = useState(false);
  const colors = KIT_COLORS[kit.id] || KIT_COLORS.kit_stress;
  const icon = KIT_ICONS[kit.id] || KIT_ICONS.kit_immunity;

  return (
    <div className={`rounded-2xl border ${colors.bg} ${colors.border} shadow-sm overflow-hidden transition-all`}>
      {/* header */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center shrink-0`}>
            <svg className={`w-5 h-5 ${colors.accent}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{kit.name}</h3>
            <p className={`text-xs font-medium ${colors.accent}`}>{kit.tagline}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3">{kit.description}</p>

        {/* herbs in this kit */}
        <div className="space-y-2 mb-3">
          {kit.herbs.map((herb) => {
            const slug = SLUG_MAP[herb.id];
            return (
              <div key={herb.id} className="flex items-start gap-2 bg-white/70 rounded-lg px-3 py-2 border border-white">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${colors.accent.replace("text-", "bg-")}`} />
                <div className="min-w-0">
                  {slug ? (
                    <Link href={`/herbs/${slug}`} className="text-sm font-semibold text-ayurv-primary hover:underline">
                      {herb.name}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-gray-800">{herb.name}</span>
                  )}
                  <p className="text-xs text-gray-500">{herb.role}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* best for tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {kit.bestFor.map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-white text-gray-600 rounded-full border border-gray-200">
              {tag}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-gray-500 hover:text-ayurv-primary transition-colors"
        >
          {expanded ? "Show less" : "How to use & timing"}
        </button>
      </div>

      {/* expanded details */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/50 pt-3 space-y-2">
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-0.5">Duration</p>
            <p className="text-xs text-gray-600">{kit.duration}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-0.5">Timing & Schedule</p>
            <p className="text-xs text-gray-600">{kit.note}</p>
          </div>
          <div className="pt-2">
            <Link
              href={`/compare?herbs=${kit.herbs.map(h => h.id).join(",")}`}
              className="text-xs font-medium text-ayurv-primary hover:underline"
            >
              Compare these herbs side by side
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KitsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ayurv-primary">Herb Starter Kits</h1>
          <p className="text-sm text-gray-500 mt-1">
            Curated bundles for common health goals — pick a kit, check safety, start your journey.
          </p>
        </div>
        <Link
          href="/herbs"
          className="px-3.5 py-2 text-xs font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary hover:text-white transition-all"
        >
          Browse All Herbs
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs text-blue-700">
          <span className="font-semibold">How kits work:</span> Each kit combines 3 herbs that complement each other for a specific goal.
          Always check each herb against your health profile before starting.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {STARTER_KITS.map((kit) => (
          <KitCard key={kit.id} kit={kit} />
        ))}
      </div>

      <div className="mt-6 bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold text-gray-800 mb-1">Ready to check safety?</p>
        <p className="text-xs text-gray-500 mb-3">
          Run a safety check on any kit&apos;s herbs against your conditions and medications.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ayurv-primary text-white text-sm font-semibold rounded-xl hover:bg-ayurv-secondary transition-colors shadow-sm"
        >
          Start Safety Assessment
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      <p className="text-xs text-gray-400 text-center mt-4 mb-4">
        Kits are for educational guidance only. Consult a practitioner before starting any herbal regimen.
      </p>
    </div>
  );
}
