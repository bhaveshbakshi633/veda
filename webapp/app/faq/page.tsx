import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — Common Questions About Ayurvedic Herb Safety | Ayurv",
  description: "Frequently asked questions about Ayurv's herb safety checker — evidence grades, drug interactions, dosage, and how the safety assessment works.",
  openGraph: {
    title: "FAQ — Ayurvedic Herb Safety Questions",
    description: "Answers to common questions about evidence grades, drug interactions, and Ayurvedic herb safety.",
    type: "website",
    locale: "en_IN",
    siteName: "Ayurv",
  },
};

const FAQS = [
  {
    q: "What does Ayurv do?",
    a: "Ayurv checks if Ayurvedic herbs are safe for your specific health profile. You enter your age, conditions, and medications — we cross-reference against clinical evidence and known drug interactions to show which herbs are safe, which need caution, and which to avoid.",
  },
  {
    q: "Is Ayurv a replacement for my doctor?",
    a: "No. Ayurv is an educational tool only. It helps you understand potential interactions and evidence, but it does NOT diagnose, prescribe, or treat any condition. Always consult a qualified healthcare professional before starting any herbal supplement.",
  },
  {
    q: "What do the evidence grades (A, B, C, D) mean?",
    a: "Grade A means strong evidence from multiple high-quality human trials (RCTs or meta-analyses). Grade B means moderate evidence from 1-2 well-designed trials. Grade C means preliminary evidence from animal or cell studies. Grade D means traditional use only — no clinical data available. We always show the grade so you know how confident the evidence is.",
  },
  {
    q: "How does the drug interaction check work?",
    a: "We maintain a database of known herb-drug interactions based on published pharmacological research. When you enter your medications, we check each herb against your medication list for potential interactions — including effects on drug metabolism (CYP enzymes), blood thinning, blood sugar, and blood pressure.",
  },
  {
    q: "How many herbs does Ayurv cover?",
    a: "Currently 50 Ayurvedic herbs with full safety profiles, evidence-graded claims, dosage information, and interaction data. We're continuously adding more herbs and updating evidence as new research is published.",
  },
  {
    q: "Is my health data stored?",
    a: "Your assessment data is stored in your browser's session storage and cleared when you close the tab. We save an anonymous profile (no name, no email required) so returning users don't have to re-enter their conditions and medications. We never sell or share your data. See our Privacy Policy for full details.",
  },
  {
    q: "Why is a herb marked 'Avoid' for me?",
    a: "A herb is marked 'Avoid' when we find a known contraindication with your health profile — this could be a condition you have (e.g., liver disease + certain hepatotoxic herbs), a medication interaction (e.g., blood thinners + herbs that affect clotting), or pregnancy/breastfeeding restrictions.",
  },
  {
    q: "What does 'Use With Caution' mean?",
    a: "Caution herbs aren't necessarily unsafe, but they need monitoring or doctor guidance for your specific profile. This could mean a mild interaction, a need for dose adjustment, or a condition that requires professional oversight. We show the specific reasons and suggested clinical actions for each caution.",
  },
  {
    q: "Can I take multiple Ayurvedic herbs together?",
    a: "Some herbs work well together, while others may interact. Our assessment checks for herb-herb interactions when you list herbs you're currently taking. For new combinations, discuss with an Ayurvedic practitioner or pharmacist who understands both herbal and conventional medicine.",
  },
  {
    q: "How accurate is the dosage information?",
    a: "Dosage ranges come from published clinical trials and traditional Ayurvedic texts. These are general educational ranges — not prescriptions. Optimal dosage depends on your body weight, constitution (prakriti), form of the supplement, and other factors. A practitioner can help determine your ideal dose.",
  },
  {
    q: "Does Ayurv work for children?",
    a: "Our safety profiles and dosage ranges are primarily based on adult data. Pediatric herb safety requires specialized guidance. We recommend consulting a qualified Ayurvedic practitioner or pediatrician for children's herbal use.",
  },
  {
    q: "What if a herb I'm looking for isn't in the database?",
    a: "We currently cover 50 of the most commonly used Ayurvedic herbs. If a herb isn't listed, it doesn't mean it's safe or unsafe — it means we haven't added clinical evidence for it yet. We're continuously expanding coverage. You can check the full herb list on our Herbs Database page.",
  },
  {
    q: "How often is the safety data updated?",
    a: "We review and update evidence claims, interaction data, and safety profiles regularly as new research is published. Each herb's evidence grade reflects the most current clinical data available. Major updates are noted in our changelog.",
  },
  {
    q: "What's the difference between 'Recommended', 'Caution', and 'Avoid'?",
    a: "Recommended means the herb has evidence for your concern and no known conflicts with your health profile. Caution means it may help but has warnings specific to your conditions or medications — discuss with your doctor. Avoid means there's a direct contraindication with your profile — do not use without medical supervision.",
  },
  {
    q: "Can I use Ayurv if I'm pregnant or breastfeeding?",
    a: "Yes — in fact, that's when Ayurv is most useful. Many Ayurvedic herbs are contraindicated during pregnancy. When you enter pregnancy/breastfeeding status, we flag all herbs with reproductive safety concerns. However, always verify with your OB-GYN or midwife.",
  },
  {
    q: "Who built Ayurv?",
    a: "Ayurv is built by a team passionate about making Ayurvedic knowledge more accessible and evidence-based. We combine traditional Ayurvedic wisdom with modern clinical research to help people make informed decisions about herbal supplements.",
  },
];

// JSON-LD for FAQ rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto">
        <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
          <Link href="/" className="hover:text-ayurv-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-600">FAQ</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-ayurv-muted mb-8">
          Common questions about Ayurv, evidence grades, herb safety, and how the assessment works.
        </p>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <details
              key={i}
              className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-ayurv-primary/30 transition-all"
            >
              <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none hover:bg-gray-50 focus:outline-none focus:bg-ayurv-primary/5 transition-colors">
                <h2 className="text-sm font-semibold text-gray-900 pr-2">{faq.q}</h2>
                <svg
                  className="w-4 h-4 text-gray-400 shrink-0 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Ready to check your herbs?
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Takes under 2 minutes. No account required.
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
          Have a question not listed here? <Link href="/chat" className="text-ayurv-primary hover:underline">Ask our consultant</Link>.
        </p>
      </div>
    </>
  );
}
