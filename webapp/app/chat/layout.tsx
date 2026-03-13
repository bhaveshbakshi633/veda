import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayurv Consultant — Personalized Herb Safety Chat",
  description:
    "Chat with the Ayurv consultant about herb safety, dosages, and drug interactions — personalized to your health profile.",
  openGraph: {
    title: "Ayurv Consultant — Personalized Herb Safety Chat",
    description:
      "Ask about specific herbs, dosages, or interactions. The consultant knows your health profile and gives evidence-based answers.",
  },
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
