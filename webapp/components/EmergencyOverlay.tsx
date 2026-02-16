"use client";

interface EmergencyOverlayProps {
  message: string;
  flags: string[];
}

const FLAG_LABELS: Record<string, string> = {
  chest_pain: "Chest Pain",
  blood_in_stool_vomit: "Blood in Stool/Vomit",
  high_fever_over_103: "High Fever (>103°F)",
  sudden_weakness_paralysis: "Sudden Weakness/Paralysis",
  suicidal_thoughts: "Thoughts of Self-Harm",
  difficulty_breathing: "Difficulty Breathing",
  severe_allergic_reaction: "Severe Allergic Reaction",
  yellowing_skin_eyes: "Yellowing Skin/Eyes",
};

export default function EmergencyOverlay({
  message,
  flags,
}: EmergencyOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-risk-red/95 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-risk-red rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-risk-red mb-3">
          Seek Medical Help Immediately
        </h1>

        <p className="text-gray-700 text-sm mb-6 leading-relaxed">{message}</p>

        <div className="bg-risk-red-light rounded-lg p-4 mb-6">
          <p className="text-xs font-medium text-risk-red mb-2 uppercase tracking-wide">
            Triggered Concerns
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {flags.map((flag) => (
              <span key={flag} className="risk-badge-red">
                {FLAG_LABELS[flag] || flag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <a
            href="tel:112"
            className="block w-full py-3 bg-risk-red text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Call Emergency: 112
          </a>
          <div className="text-gray-500 text-xs space-y-1">
            <p>India Crisis Helplines:</p>
            <p>
              iCall: <strong>9152987821</strong> | Vandrevala Foundation:{" "}
              <strong>1860-2662-345</strong>
            </p>
            <p>
              AASRA: <strong>9820466726</strong>
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          This tool cannot provide medical care. The symptoms you reported
          require professional evaluation. No herbal information will be shown.
        </p>
      </div>
    </div>
  );
}
