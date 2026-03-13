import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import DisclaimerFooter from "@/components/DisclaimerFooter";
import MobileNav from "@/components/MobileNav";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Ayurv — Herb Safety Intelligence",
  description:
    "Check if an Ayurvedic herb is safe for you — 50 herbs checked against your conditions, medications, and clinical evidence.",
  openGraph: {
    title: "Ayurv — Herb Safety Intelligence",
    description: "Check if an Ayurvedic herb is safe for you — based on your conditions, medications, and clinical evidence.",
    type: "website",
    locale: "en_IN",
    siteName: "Ayurv",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Ayurv — Herb Safety Intelligence" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ayurv — Herb Safety Intelligence",
    description: "Check if an Ayurvedic herb is safe for you — based on your conditions, medications, and clinical evidence.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/icon-192.png",
  },
  metadataBase: new URL("https://webapp-self-rho.vercel.app"),
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans bg-ayurv-bg text-gray-900 pb-12 min-h-screen`}>
        {/* Skip to content — keyboard accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:text-ayurv-primary focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>

        <header className="bg-gradient-to-r from-ayurv-primary to-ayurv-secondary text-white px-6 py-4 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">Ayurv</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-xs text-green-200/80 font-medium hidden sm:inline">
                Evidence-Based &middot; Safety-First &middot; Educational Only
              </span>
              <Link
                href="/history"
                className="hidden sm:flex items-center gap-1.5 text-xs text-green-200/80 hover:text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                My Data
              </Link>
              <MobileNav />
            </div>
          </div>
        </header>

        <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        <DisclaimerFooter />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
