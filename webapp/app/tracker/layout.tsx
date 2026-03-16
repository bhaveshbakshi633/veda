import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Herb Tracker — Ayurv",
  description: "Track your daily Ayurvedic herb intake. Build healthy habits with simple check-ins.",
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
