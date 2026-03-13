import { Metadata } from "next";
import Link from "next/link";
import { HERB_LIST } from "@/components/intake/constants";

export const metadata: Metadata = {
  title: "50 Ayurvedic Herbs — Safety, Dosage & Evidence | Ayurv",
  description: "Browse 50 evidence-graded Ayurvedic herbs. Check safety, dosage, drug interactions, and clinical evidence for each herb.",
  openGraph: {
    title: "50 Ayurvedic Herbs — Safety & Evidence Database",
    description: "Browse 50 evidence-graded Ayurvedic herbs with safety profiles, dosage info, and clinical evidence.",
    type: "website",
    locale: "en_IN",
    siteName: "Ayurv",
  },
};

// herb_id → URL slug
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

export default function HerbsIndexPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Ayurvedic Herb Database
      </h1>
      <p className="text-sm text-ayurv-muted mb-6">
        50 herbs with evidence-graded safety profiles, dosage information, and drug interaction data.
        Tap any herb to see its full profile.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {HERB_LIST.map((herb) => {
          const slug = ID_TO_SLUG[herb.id];
          if (!slug) return null;
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
            </Link>
          );
        })}
      </div>

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
