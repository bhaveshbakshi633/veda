"use client";

// global error page — koi bhi route crash ho toh ye dikhega
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto mt-20 text-center p-8">
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
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
        <h2 className="text-xl font-bold text-red-700 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          An error occurred while loading this page. Your data is safe — try
          again or go back home.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-ayurv-primary text-white rounded-xl text-sm font-semibold hover:bg-ayurv-secondary transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Go Home
          </a>
        </div>
        {error.digest && (
          <p className="text-xs text-gray-400 mt-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
