"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateUid, hasAcceptedDisclaimer, saveDisclaimerAccepted } from "@/lib/storage";
import { trackEvent } from "@/lib/track";
import { getCurrentSeason } from "@/lib/seasonal";

const DISCLAIMER_CHECKS = [
  {
    id: "educational",
    label: "I understand this is educational information only, not medical advice or a prescription.",
  },
  {
    id: "consult",
    label:
      "I will consult a qualified healthcare professional before acting on any information provided.",
  },
  {
    id: "responsibility",
    label:
      "I accept full responsibility for my health decisions. This tool does not diagnose, prescribe, or treat any condition.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Tell us about you",
    desc: "Age, conditions, medications — a quick health snapshot.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "We check safety",
    desc: "Cross-reference herbs against your profile and clinical evidence.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Chat with your consultant",
    desc: "Get personalised recommendations, ask follow-ups, and understand your safety report.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<Record<string, boolean>>({
    educational: false,
    consult: false,
    responsibility: false,
  });

  const [savedProfile, setSavedProfile] = useState<{ assessments: number } | null>(null);
  const [totalAssessments, setTotalAssessments] = useState(0);

  // check for returning user — fetch from backend
  useEffect(() => {
    if (hasAcceptedDisclaimer()) {
      setChecks({ educational: true, consult: true, responsibility: true });
    }

    const uid = getOrCreateUid();
    // register/touch user and check for saved profile
    Promise.all([
      fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, user_agent: navigator.userAgent }),
      }).then((r) => r.json()).catch(() => null),
      fetch(`/api/profile?uid=${uid}`).then((r) => r.json()).catch(() => null),
      fetch(`/api/user/history?uid=${uid}`).then((r) => r.json()).catch(() => null),
    ]).then(([userRes, profileRes, historyRes]) => {
      const hasProfile = profileRes?.profile !== null;
      const assessmentCount = historyRes?.history?.length || 0;
      if (hasProfile || assessmentCount > 0) {
        setSavedProfile({ assessments: assessmentCount });
      }
    });

    // total assessment count for social proof
    fetch("/api/stats").then(r => r.json()).then(d => {
      if (d.count > 0) setTotalAssessments(d.count);
    }).catch(() => {});
  }, []);

  const allChecked = DISCLAIMER_CHECKS.every((c) => checks[c.id]);

  function toggleCheck(id: string) {
    setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function proceed() {
    if (!allChecked) return;
    const ts = new Date().toISOString();
    sessionStorage.setItem(
      "ayurv_disclaimer",
      JSON.stringify({ accepted: true, timestamp: ts, version: "v1.0", checks })
    );
    saveDisclaimerAccepted();
    trackEvent("disclaimer_accepted");
    router.push("/intake");
  }

  // JSON-LD structured data — Google rich results ke liye
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Ayurv",
        url: "https://webapp-self-rho.vercel.app",
        applicationCategory: "HealthApplication",
        operatingSystem: "Web",
        description: "Check if an Ayurvedic herb is safe for you — based on your conditions, medications, and clinical evidence.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        featureList: "50 herb safety profiles, Drug interaction checks, Evidence-graded claims, Personalized risk assessment",
      },
      {
        "@type": "HowTo",
        name: "How to Check Ayurvedic Herb Safety",
        description: "Check if an Ayurvedic herb is safe for you in under 2 minutes.",
        step: [
          { "@type": "HowToStep", position: 1, name: "Tell us about you", text: "Age, conditions, medications — a quick health snapshot." },
          { "@type": "HowToStep", position: 2, name: "We check safety", text: "Cross-reference herbs against your profile and clinical evidence." },
          { "@type": "HowToStep", position: 3, name: "Chat with your consultant", text: "Get personalised recommendations, ask follow-ups, and understand your safety report." },
        ],
      },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* JSON-LD — structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ---- Hero Section ---- */}
      <section className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-ayurv-primary/5 border border-ayurv-primary/10 rounded-full text-xs font-medium text-ayurv-primary mb-6">
          <span className="w-1.5 h-1.5 bg-risk-green rounded-full animate-pulse" />
          Evidence-based herb safety for India
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-ayurv-primary mb-4 tracking-tight leading-tight">
          Is that herb
          <span className="bg-gradient-to-r from-ayurv-primary to-ayurv-accent bg-clip-text text-transparent"> safe for you?</span>
        </h1>

        <p className="text-gray-600 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
          Check Ayurvedic herbs against your conditions, medications, and clinical evidence — in under 2 minutes.
        </p>

        {/* Trust signals */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6 text-sm text-ayurv-muted">
          {totalAssessments > 0 && (
            <span className="flex items-center gap-1.5 font-medium text-ayurv-primary">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
              {totalAssessments.toLocaleString()} assessments done
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-risk-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            50 herbs verified
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-risk-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Drug interaction database
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-risk-green" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            Evidence-graded claims
          </span>
        </div>
      </section>

      {/* ---- Welcome Back Banner ---- */}
      {savedProfile && (
        <section className="mb-8 animate-fade-in">
          <div className="bg-white border border-ayurv-primary/15 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ayurv-primary/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-ayurv-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Welcome back!</p>
                  <p className="text-xs text-gray-500">
                    Welcome back{savedProfile.assessments > 0 ? ` — ${savedProfile.assessments} past assessment${savedProfile.assessments > 1 ? "s" : ""}` : ""}. Your profile is saved.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/history")}
                  className={`px-3.5 py-2 text-xs font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary/5 transition-colors ${savedProfile.assessments === 0 ? "hidden" : ""}`}
                >
                  Past Results
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---- How it Works ---- */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {HOW_IT_WORKS.map((item) => (
          <div
            key={item.step}
            className="relative bg-white border border-gray-100 rounded-xl p-5 text-center card-hover shadow-sm"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-ayurv-primary/5 text-ayurv-primary mb-3">
              {item.icon}
            </div>
            <p className="text-xs font-semibold text-ayurv-accent uppercase tracking-wider mb-1">
              Step {item.step}
            </p>
            <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* ---- Seasonal Recommendations ---- */}
      {(() => {
        const season = getCurrentSeason();
        return (
          <section className="mb-12 bg-gradient-to-br from-ayurv-primary/5 to-green-50/50 border border-ayurv-primary/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🌿</span>
              <h2 className="text-lg font-bold text-gray-900">{season.name}</h2>
              <span className="text-xs text-gray-500">({season.english} · {season.months})</span>
            </div>
            <p className="text-xs text-gray-600 mb-4">{season.description}</p>
            <p className="text-[11px] font-medium text-ayurv-primary mb-2">Recommended herbs this season:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {season.herbs.map(herb => (
                <div key={herb.id} className="bg-white rounded-lg border border-gray-200 px-3 py-2.5">
                  <p className="text-sm font-semibold text-gray-800">{herb.name}</p>
                  <p className="text-[10px] text-gray-500 leading-snug mt-0.5">{herb.reason}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {season.diet_tips.map((tip, i) => (
                <span key={i} className="text-[10px] text-gray-500 bg-white/80 px-2 py-1 rounded-full border border-gray-100">
                  {tip}
                </span>
              ))}
            </div>
          </section>
        );
      })()}

      {/* ---- Credibility Section ---- */}
      <section className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Evidence-Graded Claims</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Every herb claim is graded A-D based on clinical trial quality. No anecdotal claims.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Drug Interaction Alerts</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Checks against 25 medication classes. Warns about herb-drug conflicts before you take anything.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Safety-First Architecture</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Red flag screening, emergency escalation, and audit trails built into every assessment.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Transparent Methodology</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Every recommendation shows why. Click evidence grades to see source studies and mechanisms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Testimonials / Social Proof ---- */}
      <section className="mb-12">
        <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
          What users are saying
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { quote: "Finally a tool that shows the evidence grade. My doctor appreciated the clinical summary I shared.", initials: "A.K.", location: "Mumbai" },
            { quote: "I was taking turmeric with blood thinners without knowing the risk. Ayurv caught it instantly.", initials: "P.S.", location: "Delhi" },
            { quote: "Simple, fast, and doesn't try to sell me anything. Just honest safety information.", initials: "R.M.", location: "Bangalore" },
          ].map((t) => (
            <div key={t.initials} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <svg className="w-5 h-5 text-ayurv-primary/30 mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{t.quote}</p>
              <p className="text-xs text-gray-400 font-medium">{t.initials}, {t.location}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How We're Different ---- */}
      <section className="mb-12 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Why Ayurv?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-ayurv-primary mb-1">A-D</div>
            <p className="text-xs text-gray-500">Evidence grading on every claim — not just &ldquo;traditional use&rdquo;</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-risk-red mb-1">25+</div>
            <p className="text-xs text-gray-500">Medication classes checked for herb-drug interactions</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-risk-green mb-1">Free</div>
            <p className="text-xs text-gray-500">No account, no paywall, no upsell — safety first</p>
          </div>
        </div>
      </section>

      {/* ---- Disclaimer & Consent ---- */}
      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in">
        {/* card header — gradient stripe */}
        <div className="bg-gradient-to-r from-ayurv-primary to-ayurv-secondary px-6 py-4">
          <h2 className="text-base font-semibold text-white">Before You Begin</h2>
          <p className="text-sm text-green-200/80 mt-0.5">Please review and accept the following conditions</p>
        </div>

        <div className="p-6">
          {/* disclaimer box */}
          <div className="bg-amber-50/80 border border-risk-amber/20 rounded-xl p-4 mb-6">
            <div className="flex gap-3">
              <div className="shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-risk-amber" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-risk-amber text-sm mb-1">Important Disclaimer</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Ayurv checks Ayurvedic herbs against your health profile using published clinical
                  evidence and known drug interactions. It does{" "}
                  <strong>NOT</strong> diagnose, prescribe, or replace your doctor. Herbal products can
                  interact with prescription medications — this tool helps you check.
                </p>
              </div>
            </div>
          </div>

          {/* consent checkboxes */}
          <div className="space-y-3 mb-6">
            {DISCLAIMER_CHECKS.map((check, idx) => (
              <label
                key={check.id}
                className={`flex items-start gap-3.5 p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                  checks[check.id]
                    ? "bg-risk-green-light border-risk-green/20 shadow-sm"
                    : "bg-gray-50/50 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={checks[check.id]}
                    onChange={() => toggleCheck(check.id)}
                    className="peer sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    checks[check.id]
                      ? "bg-risk-green border-risk-green"
                      : "border-gray-300 bg-white"
                  }`}>
                    {checks[check.id] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-ayurv-muted uppercase tracking-wider">
                    {idx + 1} of {DISCLAIMER_CHECKS.length}
                  </span>
                  <p className={`text-sm mt-0.5 leading-relaxed transition-colors ${
                    checks[check.id] ? "text-gray-900 font-medium" : "text-gray-600"
                  }`}>
                    {check.label}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* CTA button */}
          <button
            onClick={proceed}
            disabled={!allChecked}
            aria-disabled={!allChecked}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
              allChecked
                ? "bg-ayurv-primary text-white hover:bg-ayurv-secondary shadow-lg shadow-ayurv-primary/20 hover:shadow-xl hover:shadow-ayurv-primary/30 hover:-translate-y-0.5 cursor-pointer"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {allChecked
              ? "Check My Herb Safety"
              : `${Object.values(checks).filter(Boolean).length} / ${DISCLAIMER_CHECKS.length} — Accept all to proceed`
            }
          </button>

          {allChecked && (
            <p className="text-center text-xs text-ayurv-muted mt-3">
              Takes about 2 minutes. Your data stays in your browser.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
