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
  // escalate styling if many herbs blocked or severity is severe
  const isCritical = blockedCount >= 3 || severity === "severe";
  const borderColor = isCritical ? "border-risk-red" : "border-risk-amber";
  const bgColor = isCritical ? "bg-red-50" : "bg-amber-50";
  const iconColor = isCritical ? "text-risk-red" : "text-risk-amber";
  const titleColor = isCritical ? "text-risk-red" : "text-risk-amber";

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} rounded-r-xl p-4 mb-6`} role="alert">
      <div className="flex items-start gap-3">
        <svg
          className={`w-5 h-5 ${iconColor} mt-0.5 shrink-0`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div>
          <p className={`font-semibold ${titleColor} text-sm`}>
            {isCritical ? "Important — Discuss With Your Doctor" : "Consult a Healthcare Professional"}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Based on your health profile
            {blockedCount > 0 && (
              <span>
                , <strong className={titleColor}>{blockedCount} herb{blockedCount > 1 ? "s are" : " is"} not safe</strong>
              </span>
            )}
            {cautionCount > 0 && (
              <span>
                {blockedCount > 0 ? " and " : ", "}
                <strong>{cautionCount} herb{cautionCount > 1 ? "s" : ""} need{cautionCount === 1 ? "s" : ""} doctor guidance</strong>
              </span>
            )}
            {severity === "severe" && (
              <span>
                . Your symptoms are reported as <strong className="text-risk-red">severe</strong>
              </span>
            )}
            . Please discuss with a qualified doctor or Ayurvedic practitioner
            before using any herbs listed below.
          </p>
          {isCritical && (
            <p className="text-xs text-risk-red font-medium mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              If experiencing chest pain, difficulty breathing, or severe symptoms — contact emergency services immediately.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
