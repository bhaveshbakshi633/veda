import { Metadata } from "next";

export const metadata: Metadata = {
  title: "50 Ayurvedic Herbs — Safety, Dosage & Evidence | Ayurv",
  description: "Browse 50 evidence-graded Ayurvedic herbs. Check safety, dosage, drug interactions, and clinical evidence for each herb.",
  openGraph: {
    title: "50 Ayurvedic Herbs — Safety & Evidence Database",
    description: "Browse 50 evidence-graded Ayurvedic herbs with safety profiles, dosage info, and clinical evidence.",
    type: "website",
    locale: "en_IN",
    siteName: "Ayurv",
  },
};

export default function HerbsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
