import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Herbs — Side-by-Side Safety Comparison | Ayurv",
  description:
    "Compare Ayurvedic herbs side by side — pregnancy safety, dosha affinity, food interactions, and synergies at a glance.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
