import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayurvedic Glossary — Key Terms Explained | Ayurv",
  description:
    "Searchable glossary of Ayurvedic terms — Dosha, Rasa, Guna, Agni, Ojas, Rasayana, and more. Understand the science behind traditional medicine.",
};

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
