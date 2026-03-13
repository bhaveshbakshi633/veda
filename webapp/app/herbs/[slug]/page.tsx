import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { HERB_LIST } from "@/components/intake/constants";

// slug → herb_id mapping
const SLUG_MAP: Record<string, string> = {
  "ashwagandha": "herb_ashwagandha",
  "tulsi": "herb_tulsi",
  "turmeric": "herb_haridra",
  "brahmi": "herb_brahmi",
  "triphala": "herb_triphala",
  "amla": "herb_amalaki",
  "shatavari": "herb_shatavari",
  "guduchi": "herb_guduchi",
  "arjuna": "herb_arjuna",
  "mulethi": "herb_yashtimadhu",
  "neem": "herb_neem",
  "moringa": "herb_moringa",
  "ginger": "herb_shunthi",
  "cinnamon": "herb_dalchini",
  "fenugreek": "herb_methi",
  "aloe-vera": "herb_kumari",
  "shilajit": "herb_shilajit",
  "guggulu": "herb_guggulu",
  "gokshura": "herb_gokshura",
  "punarnava": "herb_punarnava",
  "kutki": "herb_kutki",
  "bhringaraj": "herb_bhringaraj",
  "shankhapushpi": "herb_shankhapushpi",
  "vidanga": "herb_vidanga",
  "vacha": "herb_vacha",
  "pippali": "herb_pippali",
  "black-pepper": "herb_maricha",
  "cardamom": "herb_elaichi",
  "clove": "herb_lavanga",
  "kalmegh": "herb_kalmegh",
  "manjistha": "herb_manjistha",
  "chitrak": "herb_chitrak",
  "bala": "herb_bala",
  "jatamansi": "herb_jatamansi",
  "tagar": "herb_tagar",
  "musta": "herb_musta",
  "haritaki": "herb_haritaki",
  "bibhitaki": "herb_bibhitaki",
  "sariva": "herb_sariva",
  "chirata": "herb_chirata",
  "ajwain": "herb_ajwain",
  "cumin": "herb_jeera",
  "kalonji": "herb_kalonji",
  "isabgol": "herb_isabgol",
  "senna": "herb_senna",
  "safed-musli": "herb_safed_musli",
  "kapikacchu": "herb_kapikacchu",
  "rasna": "herb_rasna",
  "lodhra": "herb_lodhra",
  "nagkesar": "herb_nagkesar",
};

// on-demand rendering with ISR — cached for 24h after first visit
export const dynamic = "force-dynamic";
export const revalidate = 86400;

// types for herb data
interface HerbNames {
  english: string;
  hindi: string;
  sanskrit: string;
  tamil?: string;
  botanical_synonyms?: string[];
}

interface DosageForm {
  form: string;
  range_min: string;
  range_max: string;
  unit: string;
  frequency?: string;
  notes?: string;
}

interface DosageRanges {
  forms: DosageForm[];
  disclaimer: string;
  time_to_effect?: string;
  max_studied_duration_weeks?: number;
}

interface AyurvedicProfile {
  rasa?: string[];
  guna?: string[];
  virya?: string;
  vipaka?: string;
  dosha_action?: string | Record<string, { effect: string; strength: string }>;
}

interface SideEffects {
  common?: string[];
  uncommon?: string[];
  rare?: string[];
}

interface EvidenceClaim {
  claim: string;
  evidence_grade: string;
  summary: string;
  mechanism?: string;
  active_compounds?: string[];
  symptom_tags?: string[];
}

interface HerbData {
  id: string;
  botanical_name: string;
  names: HerbNames;
  parts_used: string[];
  ayurvedic_profile: AyurvedicProfile;
  dosage_ranges: DosageRanges;
  side_effects: SideEffects;
}

async function getHerbPage(herbId: string) {
  const db = getServiceClient();

  const [herbResult, evidenceResult] = await Promise.all([
    db.from("herbs").select("*").eq("id", herbId).single(),
    db.from("evidence_claims").select("*").eq("herb_id", herbId).order("evidence_grade"),
  ]);

  return {
    herb: herbResult.data as HerbData | null,
    claims: (evidenceResult.data || []) as EvidenceClaim[],
  };
}

// dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const herbId = SLUG_MAP[slug];
  if (!herbId) return { title: "Herb Not Found" };

  const { herb } = await getHerbPage(herbId);
  if (!herb) return { title: "Herb Not Found" };

  const title = `${herb.names.english} (${herb.names.hindi}) — Safety, Dosage & Evidence | Ayurv`;
  const description = `Is ${herb.names.english} safe for you? Evidence-graded safety info, dosage, drug interactions, and Ayurvedic profile for ${herb.botanical_name}. Check against your health profile.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale: "en_IN",
      siteName: "Ayurv",
    },
    twitter: { card: "summary", title, description },
  };
}

const GRADE_INFO: Record<string, { label: string; color: string; desc: string }> = {
  A: { label: "Strong", color: "bg-green-100 text-green-800 border-green-200", desc: "Multiple high-quality human trials" },
  B: { label: "Good", color: "bg-blue-100 text-blue-800 border-blue-200", desc: "1-2 well-designed human trials" },
  "B-C": { label: "Moderate", color: "bg-sky-100 text-sky-800 border-sky-200", desc: "Limited human data, strong preclinical" },
  C: { label: "Preliminary", color: "bg-yellow-100 text-yellow-800 border-yellow-200", desc: "Animal/cell studies or traditional use" },
  "C-D": { label: "Weak", color: "bg-orange-100 text-orange-800 border-orange-200", desc: "Very limited evidence" },
  D: { label: "Traditional", color: "bg-gray-100 text-gray-700 border-gray-200", desc: "Traditional use only, no clinical data" },
};

export default async function HerbPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const herbId = SLUG_MAP[slug];
  if (!herbId) notFound();

  const { herb, claims } = await getHerbPage(herbId);
  if (!herb) notFound();

  const { names, botanical_name, parts_used, ayurvedic_profile, dosage_ranges, side_effects } = herb;

  // structured data for Google
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: `${names.english} — Safety & Evidence`,
    description: `Evidence-based safety information for ${names.english} (${botanical_name})`,
    about: {
      "@type": "Drug",
      name: names.english,
      alternateName: [names.hindi, names.sanskrit, botanical_name],
    },
    lastReviewed: new Date().toISOString().split("T")[0],
    medicalAudience: { "@type": "MedicalAudience", audienceType: "Patient" },
  };

  // find related herbs from HERB_LIST (exclude current)
  const relatedHerbs = HERB_LIST.filter(h => h.id !== herbId).slice(0, 6);
  const slugFromId = (id: string) => Object.entries(SLUG_MAP).find(([, v]) => v === id)?.[0];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        {/* breadcrumb */}
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-ayurv-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/herbs" className="hover:text-ayurv-primary transition-colors">Herbs</Link>
          <span>/</span>
          <span className="text-gray-600">{names.english}</span>
        </nav>

        {/* header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            {names.english}
          </h1>
          <p className="text-lg text-ayurv-muted mb-3">
            {names.hindi} &middot; {names.sanskrit} &middot; <em className="text-gray-400">{botanical_name}</em>
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {(parts_used || []).map((part) => (
              <span key={part} className="px-2.5 py-1 text-xs font-medium bg-ayurv-primary/5 text-ayurv-primary rounded-full border border-ayurv-primary/10">
                {part}
              </span>
            ))}
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-ayurv-primary text-white text-sm font-semibold rounded-xl hover:bg-ayurv-secondary transition-colors shadow-sm"
          >
            Check if {names.english} is safe for you
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* evidence claims */}
        {claims.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Clinical Evidence</h2>
            <div className="space-y-4">
              {claims.map((claim, i) => {
                const grade = GRADE_INFO[claim.evidence_grade] || GRADE_INFO.D;
                return (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 px-2 py-0.5 text-xs font-bold rounded border ${grade.color}`}>
                        {claim.evidence_grade}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{claim.claim}</h3>
                        <p className="text-sm text-gray-600 mt-1">{claim.summary}</p>
                        {claim.mechanism && (
                          <p className="text-xs text-gray-400 mt-1.5">Mechanism: {claim.mechanism}</p>
                        )}
                        {claim.active_compounds && claim.active_compounds.length > 0 && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Active compounds: {claim.active_compounds.join(", ")}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-300 mt-1">{grade.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {/* dosage */}
          {dosage_ranges?.forms?.length > 0 && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Standard Dosage</h2>
              <div className="space-y-2.5">
                {dosage_ranges.forms.map((form, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-medium text-gray-700 capitalize">{form.form}</span>
                    <span className="text-sm text-ayurv-primary font-semibold">
                      {form.range_min}–{form.range_max} {form.unit}
                    </span>
                  </div>
                ))}
              </div>
              {dosage_ranges.time_to_effect && (
                <p className="text-xs text-gray-400 mt-3">Time to effect: {dosage_ranges.time_to_effect}</p>
              )}
              <p className="text-xs text-gray-400 mt-1 italic">{dosage_ranges.disclaimer}</p>
            </section>
          )}

          {/* ayurvedic profile */}
          {ayurvedic_profile && (
            <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Ayurvedic Profile</h2>
              <div className="space-y-2">
                {ayurvedic_profile.rasa && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Rasa (Taste)</span>
                    <span className="text-gray-800 font-medium">{ayurvedic_profile.rasa.join(", ")}</span>
                  </div>
                )}
                {ayurvedic_profile.guna && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Guna (Quality)</span>
                    <span className="text-gray-800 font-medium">{ayurvedic_profile.guna.join(", ")}</span>
                  </div>
                )}
                {ayurvedic_profile.virya && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Virya (Potency)</span>
                    <span className="text-gray-800 font-medium">{ayurvedic_profile.virya}</span>
                  </div>
                )}
                {ayurvedic_profile.vipaka && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Vipaka (Post-digestive)</span>
                    <span className="text-gray-800 font-medium">{ayurvedic_profile.vipaka}</span>
                  </div>
                )}
                {ayurvedic_profile.dosha_action && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dosha Action</span>
                    <span className="text-gray-800 font-medium">
                      {typeof ayurvedic_profile.dosha_action === "string"
                        ? ayurvedic_profile.dosha_action
                        : Object.entries(ayurvedic_profile.dosha_action as Record<string, { effect: string; strength: string }>)
                            .map(([dosha, info]) => `${dosha}: ${info.effect}`)
                            .join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* side effects */}
        {side_effects && (side_effects.common?.length || side_effects.rare?.length) && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Known Side Effects</h2>
            {side_effects.common && side_effects.common.length > 0 && (
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-600 mb-1.5">Common</h3>
                <div className="flex flex-wrap gap-2">
                  {side_effects.common.map((se) => (
                    <span key={se} className="px-2.5 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">{se}</span>
                  ))}
                </div>
              </div>
            )}
            {side_effects.uncommon && side_effects.uncommon.length > 0 && (
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-gray-600 mb-1.5">Uncommon</h3>
                <div className="flex flex-wrap gap-2">
                  {side_effects.uncommon.map((se) => (
                    <span key={se} className="px-2.5 py-1 text-xs bg-orange-50 text-orange-700 rounded-full border border-orange-100">{se}</span>
                  ))}
                </div>
              </div>
            )}
            {side_effects.rare && side_effects.rare.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-1.5">Rare</h3>
                <div className="flex flex-wrap gap-2">
                  {side_effects.rare.map((se) => (
                    <span key={se} className="px-2.5 py-1 text-xs bg-red-50 text-red-700 rounded-full border border-red-100">{se}</span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* CTA */}
        <div className="bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-2xl p-6 text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Is {names.english} safe for you?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Check {names.english} against your conditions, medications, and health profile in 2 minutes.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ayurv-primary text-white font-semibold rounded-xl hover:bg-ayurv-secondary transition-colors shadow-md"
          >
            Check My Safety Profile
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* related herbs */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Explore More Herbs</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {relatedHerbs.map((h) => {
              const s = slugFromId(h.id);
              if (!s) return null;
              return (
                <Link
                  key={h.id}
                  href={`/herbs/${s}`}
                  className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-ayurv-primary/30 hover:text-ayurv-primary hover:bg-ayurv-primary/5 transition-all text-center"
                >
                  {h.name}
                  {h.hindi && <span className="block text-xs text-gray-400 mt-0.5">{h.hindi}</span>}
                </Link>
              );
            })}
          </div>
        </section>

        <p className="text-xs text-gray-400 text-center mb-4">
          Educational information only. Not medical advice. Consult a healthcare professional before using any herb.
        </p>
      </div>
    </>
  );
}
