import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Herb Starter Kits — Curated Ayurvedic Bundles | Ayurv",
  description:
    "Curated Ayurvedic herb bundles for stress, digestion, immunity, skin, energy, joints, heart health, and women's wellness.",
};

export default function KitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
