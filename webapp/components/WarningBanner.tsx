"use client";

interface WarningBannerProps {
  blockedCount: number;
  cautionCount: number;
  severity?: string;
}

export default function WarningBanner({
  blockedCount,
  cautionCount,
  severity,
}: WarningBannerProps) {
  return (
    <div className="bg-amber-50 border-l-4 border-risk-amber rounded-r-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 text-risk-amber mt-0.5 shrink-0"
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
        <div>
          <p className="font-semibold text-risk-amber text-sm">
            Consult a Healthcare Professional
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Based on your health profile
            {blockedCount > 0 && (
              <span>
                , <strong>{blockedCount} herb(s) are not recommended</strong>
              </span>
            )}
            {cautionCount > 0 && (
              <span>
                {blockedCount > 0 ? " and " : ", "}
                <strong>{cautionCount} herb(s) require caution</strong>
              </span>
            )}
            {severity === "severe" && (
              <span>
                . Your symptoms are reported as <strong>severe</strong>
              </span>
            )}
            . Please discuss with a qualified doctor or Ayurvedic practitioner
            before using any of the information below.
          </p>
        </div>
      </div>
    </div>
  );
}
