"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// system status indicator — health endpoint se fetch karta hai
function StatusDot() {
  const [status, setStatus] = useState<"healthy" | "degraded" | "down" | "loading">("loading");

  useEffect(() => {
    // page load hone ke baad check karo, lazy
    const timer = setTimeout(() => {
      fetch("/api/health")
        .then(res => res.json())
        .then(data => setStatus(data.status))
        .catch(() => setStatus("down"));
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const color =
    status === "healthy" ? "bg-green-400" :
    status === "degraded" ? "bg-amber-400" :
    status === "loading" ? "bg-gray-300" : "bg-red-400";

  const label =
    status === "healthy" ? "All systems operational" :
    status === "degraded" ? "Partial service degradation" :
    status === "loading" ? "Checking..." : "Service disruption";

  return (
    <span className="inline-flex items-center gap-1 cursor-default" title={label}>
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="hidden sm:inline">{status === "healthy" ? "OK" : status === "degraded" ? "Degraded" : status === "loading" ? "" : "Down"}</span>
    </span>
  );
}

export default function DisclaimerFooter() {
  const pathname = usePathname();

  // chat page has its own disclaimer — hide footer to avoid overlapping input
  // chat page has its own disclaimer — hide footer
  if (pathname.startsWith("/chat")) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/80 px-4 py-2.5 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
        <p className="text-[11px] text-gray-500 text-center sm:text-left leading-relaxed">
          Educational information only — not medical advice. Always consult a qualified healthcare practitioner.
        </p>
        <div className="flex items-center gap-3 text-[11px] text-gray-400 shrink-0">
          <Link href="/faq" aria-label="Frequently asked questions" className="hover:text-ayurv-primary transition-colors">FAQ</Link>
          <span className="text-gray-300">&middot;</span>
          <Link href="/herbs" aria-label="Browse herb database" className="hover:text-ayurv-primary transition-colors">Herbs</Link>
          <span className="text-gray-300">&middot;</span>
          <Link href="/about" aria-label="About Ayurv" className="hover:text-ayurv-primary transition-colors">About</Link>
          <span className="text-gray-300">&middot;</span>
          <Link href="/privacy" aria-label="Privacy policy" className="hover:text-ayurv-primary transition-colors">Privacy</Link>
          <span className="text-gray-300">&middot;</span>
          <Link href="/terms" aria-label="Terms and conditions" className="hover:text-ayurv-primary transition-colors">Terms</Link>
          <span className="text-gray-300">&middot;</span>
          <StatusDot />
        </div>
      </div>
    </footer>
  );
}
