import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interaction Checker — Ayurv",
  description:
    "Check if an Ayurvedic herb interacts with your medication or another herb. Free, evidence-based interaction database.",
  openGraph: {
    title: "Interaction Checker — Ayurv",
    description: "Check herb-drug and herb-herb interactions with clinical evidence.",
  },
};

export default function CheckLayout({ children }: { children: React.ReactNode }) {
  return children;
}
