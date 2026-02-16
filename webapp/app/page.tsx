"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function LandingPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<Record<string, boolean>>({
    educational: false,
    consult: false,
    responsibility: false,
  });

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
    router.push("/intake");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <section className="text-center mb-10">
        <h1 className="text-3xl font-bold text-ayurv-primary mb-3">
          Ayurvedic Risk Intelligence
        </h1>
        <p className="text-gray-600 text-lg">
          Evidence-graded herb information with safety-first risk assessment.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          10 herbs &middot; A/B/C/D evidence grading &middot; Drug interaction checking &middot; Indian context
        </p>
      </section>

      <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Before You Begin</h2>

        <div className="bg-amber-50 border-l-4 border-risk-amber p-4 mb-6 text-sm text-gray-700">
          <p className="font-medium text-risk-amber mb-1">Important Disclaimer</p>
          <p>
            This tool provides structured educational information about Ayurvedic herbs based on
            classical references and available scientific evidence. It does{" "}
            <strong>NOT</strong> diagnose any medical condition, prescribe any treatment, or replace
            professional medical advice. Herbal products can interact with modern medicines and
            medical conditions.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {DISCLAIMER_CHECKS.map((check) => (
            <label
              key={check.id}
              className="flex items-start gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={checks[check.id]}
                onChange={() => toggleCheck(check.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-ayurv-primary focus:ring-ayurv-accent"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                {check.label}
              </span>
            </label>
          ))}
        </div>

        <button
          onClick={proceed}
          disabled={!allChecked}
          className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
            allChecked
              ? "bg-ayurv-primary text-white hover:bg-ayurv-secondary cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {allChecked ? "Start Assessment" : "Accept all conditions to proceed"}
        </button>
      </section>
    </div>
  );
}
