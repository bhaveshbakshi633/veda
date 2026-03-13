import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Profile — Ayurv Safety Check",
  description:
    "Enter your age, conditions, and medications to get a personalized herb safety assessment in under 2 minutes.",
  openGraph: {
    title: "Health Profile — Ayurv Safety Check",
    description: "Quick health profile for personalized Ayurvedic herb safety assessment.",
  },
  robots: { index: false, follow: false },
};

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
