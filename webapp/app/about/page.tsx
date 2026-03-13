import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — How Ayurv Works | Transparent, Evidence-Based, Safety-First",
  description:
    "Learn how Ayurv evaluates Ayurvedic herbs — evidence grading, drug interaction checks, safety architecture, and data sources. Transparent methodology for informed decisions.",
  openGraph: {
    title: "About Ayurv — Transparent Herb Safety Methodology",
    description:
      "Evidence-graded claims, drug interaction databases, and safety-first architecture. Learn exactly how Ayurv works.",
    type: "website",
    locale: "en_IN",
    siteName: "Ayurv",
  },
};

/* -------------------------------------------------------------------------- */
/*  Evidence grade definitions — same as GRADE_EXPLANATIONS in lib/constants  */
/* -------------------------------------------------------------------------- */
const EVIDENCE_GRADES = [
  {
    grade: "A",
    label: "Strong Evidence",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description:
      "Multiple large-scale randomised controlled trials (RCTs) or systematic reviews/meta-analyses with consistent results.",
  },
  {
    grade: "B",
    label: "Moderate Evidence",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description:
      "One or two well-designed clinical trials with positive outcomes. Promising, but needs larger replication studies.",
  },
  {
    grade: "C",
    label: "Limited Evidence",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    description:
      "Primarily laboratory (in-vitro) or animal studies. Human clinical data is sparse or preliminary.",
  },
  {
    grade: "D",
    label: "Traditional Use Only",
    color: "bg-gray-100 text-gray-600 border-gray-300",
    description:
      "Based solely on traditional Ayurvedic texts and practitioner experience. No published clinical studies available.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Data sources — kahan se evidence aata hai                                 */
/* -------------------------------------------------------------------------- */
const DATA_SOURCES = [
  {
    title: "Published Clinical Trials",
    description:
      "PubMed-indexed RCTs, systematic reviews, and meta-analyses on Ayurvedic herbs and their bioactive compounds.",
  },
  {
    title: "Pharmacological Studies",
    description:
      "Peer-reviewed pharmacokinetic and pharmacodynamic research — CYP enzyme interactions, bioavailability, and dose-response data.",
  },
  {
    title: "Drug Interaction Databases",
    description:
      "Cross-referencing against established herb-drug interaction databases for known contraindications with common medications.",
  },
  {
    title: "Traditional Ayurvedic Texts",
    description:
      "Classical references including Charaka Samhita, Sushruta Samhita, and Ashtanga Hridaya — clearly labelled as traditional knowledge (Grade D).",
  },
];

/* -------------------------------------------------------------------------- */
/*  Safety architecture features                                               */
/* -------------------------------------------------------------------------- */
const SAFETY_FEATURES = [
  {
    title: "Red Flag Screening",
    description:
      "Automatic detection of dangerous combinations — pregnancy + hepatotoxic herbs, blood thinners + anticoagulant herbs, and other high-risk profiles.",
  },
  {
    title: "Blocked Herb Logic",
    description:
      "Herbs with known severe contraindications for your profile are explicitly marked 'Avoid' with clinical reasoning, not just hidden.",
  },
  {
    title: "Escalation Protocols",
    description:
      "When risk factors stack up, the system escalates its warnings and strongly recommends professional consultation before any action.",
  },
  {
    title: "Audit Trails",
    description:
      "Every safety assessment is logged (anonymously, 24-hour TTL) for quality monitoring and continuous improvement of the risk engine.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      {/* breadcrumb nav */}
      <nav className="text-xs text-gray-400 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-ayurv-primary transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-600">About</span>
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/*  Hero section                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          How Ayurv Works
        </h1>
        <p className="text-lg text-ayurv-accent font-medium mb-2">
          Transparent, Evidence-Based, Safety-First
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Ayurv cross-references Ayurvedic herbs against your health profile
          using clinical evidence, pharmacological data, and known drug
          interactions. Every claim is evidence-graded. Every risk flag is
          explained. No black boxes.
        </p>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Methodology — how herbs are evaluated                              */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Our Evaluation Methodology
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 text-sm text-gray-700 leading-relaxed">
          <p>
            Each herb in our database goes through a structured evaluation
            process:
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Clinical evidence search</strong> — We review published
              human trials (RCTs, cohort studies) and systematic reviews for each
              claimed benefit.
            </li>
            <li>
              <strong>Evidence grading (A through D)</strong> — Every health
              claim is assigned a transparency grade based on the strength of
              available clinical evidence.
            </li>
            <li>
              <strong>Drug interaction mapping</strong> — Known pharmacological
              interactions are catalogued: CYP enzyme effects, blood thinning,
              blood sugar impact, blood pressure modulation, and more.
            </li>
            <li>
              <strong>Contraindication profiling</strong> — Conditions,
              medications, pregnancy status, and age factors that make a herb
              unsafe or require clinical supervision.
            </li>
            <li>
              <strong>Safety classification</strong> — Based on your profile,
              each herb is classified as Safe, Use With Caution, or Avoid — with
              specific clinical reasoning.
            </li>
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Evidence grading explanation                                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Evidence Grades Explained
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          We never hide the strength of evidence behind a claim. Every benefit
          listed for every herb carries one of these grades:
        </p>
        <div className="space-y-3">
          {EVIDENCE_GRADES.map((eg) => (
            <div
              key={eg.grade}
              className={`flex items-start gap-3 border rounded-xl p-4 ${eg.color} border`}
            >
              {/* grade badge */}
              <span className="text-sm font-bold px-2.5 py-1 rounded-lg bg-white/60 shrink-0">
                {eg.grade}
              </span>
              <div>
                <p className="text-sm font-semibold">{eg.label}</p>
                <p className="text-xs mt-0.5 opacity-80">{eg.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Data sources                                                       */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Where Our Data Comes From
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {DATA_SOURCES.map((ds) => (
            <div
              key={ds.title}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <h3 className="text-sm font-semibold text-ayurv-primary mb-1">
                {ds.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {ds.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  What Ayurv is NOT — sabse zaroori disclaimer section               */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          What Ayurv is NOT
        </h2>
        <div className="bg-risk-red-light border border-red-200 rounded-xl p-5">
          <ul className="space-y-3 text-sm text-gray-800">
            <li className="flex items-start gap-2.5">
              {/* x-circle icon */}
              <svg
                className="w-5 h-5 text-risk-red shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span>
                <strong>Not a doctor.</strong> Ayurv is not a licensed medical
                professional and cannot diagnose any condition.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <svg
                className="w-5 h-5 text-risk-red shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span>
                <strong>Not medical advice.</strong> Information provided is
                educational only. It does not replace professional medical
                consultation.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <svg
                className="w-5 h-5 text-risk-red shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span>
                <strong>Not a prescription service.</strong> Ayurv does not
                prescribe herbs, dosages, or treatment plans. Always consult a
                qualified healthcare practitioner.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <svg
                className="w-5 h-5 text-risk-red shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <span>
                <strong>Not a substitute for lab tests.</strong> Herb safety
                depends on individual factors that only clinical testing can
                confirm.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Safety architecture                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Safety Architecture
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Patient safety is not a feature — it is the foundation. Here is how
          the system protects you:
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SAFETY_FEATURES.map((sf) => (
            <div
              key={sf.title}
              className="bg-risk-green-light border border-green-200 rounded-xl p-4"
            >
              <h3 className="text-sm font-semibold text-risk-green mb-1">
                {sf.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {sf.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  Open source & transparency                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Open Source and Transparency
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            Ayurv is an educational project built with full transparency in
            mind:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              Every health claim carries an evidence grade — you always know the
              strength of the supporting research.
            </li>
            <li>
              The herb database is updated regularly as new clinical research is
              published.
            </li>
            <li>
              Safety logic is deterministic, not probabilistic — the same inputs
              always produce the same risk classification.
            </li>
            <li>
              No hidden algorithms or proprietary scoring. If a herb is flagged
              as risky, the clinical reasoning is shown to you.
            </li>
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*  CTA — start your safety check                                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-ayurv-primary/5 border border-ayurv-primary/15 rounded-2xl p-6 text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          Ready to check your herbs?
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Takes under 2 minutes. No account required. Evidence-graded results.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-ayurv-primary text-white font-semibold rounded-xl hover:bg-ayurv-secondary transition-colors shadow-md"
        >
          Start Your Safety Check
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>

      {/* bottom nav links */}
      <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between text-sm">
        <Link
          href="/faq"
          className="text-ayurv-primary hover:text-ayurv-accent underline"
        >
          Frequently Asked Questions
        </Link>
        <Link
          href="/"
          className="text-ayurv-primary hover:text-ayurv-accent underline"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
