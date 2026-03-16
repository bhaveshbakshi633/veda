import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Herbs — Your Bookmarked Herbs | Ayurv",
  description: "View your saved/bookmarked Ayurvedic herbs for quick access.",
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return children;
}
