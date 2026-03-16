"use client";

// chat page error — LLM connection failure ya network issue
export default function ChatError({
  error,
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
            d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
          />
        </svg>
        <h2 className="text-lg font-bold text-amber-800 mb-2">
          Chat unavailable right now
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          The consultation service is temporarily unavailable. Your previous
          messages are saved locally. Try again in a moment.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-ayurv-primary text-white rounded-xl text-sm font-semibold hover:bg-ayurv-secondary transition-colors"
          >
            Retry
          </button>
          <a
            href="/"
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Back to Assessment
          </a>
        </div>
      </div>
    </div>
  );
}
