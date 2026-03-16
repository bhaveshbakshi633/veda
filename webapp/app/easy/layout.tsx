import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ayurv Easy Mode — Simple Herb Safety Check",
  description:
    "Simple, single-page herb safety check designed for easy use. Large buttons, clear text, no page navigation.",
};

export default function EasyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
