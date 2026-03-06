"use client";

import Link from "next/link";

export default function DisclaimerFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/80 px-4 py-2.5 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
        <p className="text-[11px] text-gray-500 text-center sm:text-left leading-relaxed">
          Educational information only — not medical advice. Always consult a qualified healthcare practitioner.
        </p>
        <div className="flex items-center gap-3 text-[11px] text-gray-400 shrink-0">
          <Link href="/privacy" className="hover:text-ayurv-primary transition-colors">Privacy</Link>
          <span className="text-gray-300">&middot;</span>
          <Link href="/terms" className="hover:text-ayurv-primary transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
