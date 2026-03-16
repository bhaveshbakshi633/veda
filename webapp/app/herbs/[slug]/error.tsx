"use client";

// herb detail page error — DB fetch failure ya invalid slug
export default function HerbDetailError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto mt-16 text-center p-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
        <svg
          className="w-12 h-12 text-amber-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <h2 className="text-lg font-bold text-amber-800 mb-2">
          Herb data unavailable
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          We could not load this herb&apos;s information. It may be temporarily
          unavailable or not in our database yet.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-ayurv-primary text-white rounded-xl text-sm font-semibold hover:bg-ayurv-secondary transition-colors"
          >
            Try Again
          </button>
          <a
            href="/herbs"
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Browse All Herbs
          </a>
        </div>
      </div>
    </div>
  );
}
