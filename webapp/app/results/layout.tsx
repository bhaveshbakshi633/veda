import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Safety Report — Ayurv",
  description:
    "Personalized herb safety report based on your conditions, medications, and clinical evidence. See which herbs are safe, which to use with caution, and which to avoid.",
  openGraph: {
    title: "Your Safety Report — Ayurv",
    description:
      "Personalized herb safety assessment — evidence-graded recommendations checked against your health profile.",
  },
  robots: { index: false, follow: false },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
