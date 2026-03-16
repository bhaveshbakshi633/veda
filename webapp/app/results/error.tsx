"use client";

// results page error — assessment data load failure
export default function ResultsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto mt-16 text-center p-6">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
        <svg
          className="w-12 h-12 text-red-400 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-lg font-bold text-red-700 mb-2">
          Could not load your results
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          There was a problem displaying your safety report. Your assessment data
          is still saved. Try reloading or start a new check.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-ayurv-primary text-white rounded-xl text-sm font-semibold hover:bg-ayurv-secondary transition-colors"
          >
            Reload Results
          </button>
          <a
            href="/"
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            New Assessment
          </a>
        </div>
      </div>
    </div>
  );
}
