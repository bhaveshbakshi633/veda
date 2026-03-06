import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import DisclaimerFooter from "@/components/DisclaimerFooter";

export const metadata: Metadata = {
  title: "Ayurv — Herb Safety Intelligence",
  description:
    "Check if an Ayurvedic herb is safe for you — based on your conditions, medications, and clinical evidence.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ayurv-bg text-gray-900 pb-12 min-h-screen">
        {/* Skip to content — keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:text-ayurv-primary focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>

        <header className="bg-ayurv-primary text-white px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Ayurv
            </Link>
            <span className="text-xs text-green-200">
              <span className="hidden sm:inline">Evidence-Based &middot; Safety-First &middot; Educational Only</span>
              <span className="sm:hidden">Safety-First &middot; Educational</span>
            </span>
          </div>
        </header>

        <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">{children}</main>

        <DisclaimerFooter />
      </body>
    </html>
  );
}
