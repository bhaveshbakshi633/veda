import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Assessments — Ayurv",
  description:
    "View your past herb safety assessments and manage your health profile data.",
  openGraph: {
    title: "My Assessments — Ayurv",
    description: "Your past herb safety checks and saved health profile.",
  },
  robots: { index: false, follow: false },
};

export default function HistoryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
