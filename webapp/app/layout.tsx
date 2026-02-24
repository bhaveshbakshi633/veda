import type { Metadata } from "next";
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
        <header className="bg-ayurv-primary text-white px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="text-xl font-bold tracking-tight">
              Ayurv
            </a>
            <span className="text-xs text-green-200 hidden sm:inline">
              Evidence-Based &middot; Safety-First &middot; Educational Only
            </span>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

        <DisclaimerFooter />
      </body>
    </html>
  );
}
