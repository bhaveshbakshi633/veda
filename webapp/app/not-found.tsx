import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-ayurv-primary/5 flex items-center justify-center">
        <svg className="w-10 h-10 text-ayurv-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm text-gray-500 mb-8">
        This page doesn&apos;t exist. You may have followed an old link or typed the URL incorrectly.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="px-5 py-2.5 text-sm font-semibold bg-ayurv-primary text-white rounded-xl hover:bg-ayurv-secondary transition-colors shadow-sm"
        >
          Start Safety Check
        </Link>
        <Link
          href="/herbs"
          className="px-5 py-2.5 text-sm font-medium text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary/5 transition-colors"
        >
          Browse Herbs
        </Link>
        <Link
          href="/faq"
          className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          FAQ
        </Link>
      </div>
    </div>
  );
}
