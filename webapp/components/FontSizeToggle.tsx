"use client";

import { useState, useEffect } from "react";

// persistent font size preference
const STORAGE_KEY = "ayurv_font_size";
type FontSize = "normal" | "large" | "xl";

const SIZES: { value: FontSize; label: string; class: string }[] = [
  { value: "normal", label: "A", class: "" },
  { value: "large", label: "A+", class: "text-lg-mode" },
  { value: "xl", label: "A++", class: "text-xl-mode" },
];

export default function FontSizeToggle() {
  const [size, setSize] = useState<FontSize>("normal");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as FontSize | null;
      if (saved && SIZES.some((s) => s.value === saved)) {
        setSize(saved);
        applySize(saved);
      }
    } catch { /* noop */ }
  }, []);

  function applySize(newSize: FontSize) {
    const html = document.documentElement;
    // remove all size classes first
    SIZES.forEach((s) => {
      if (s.class) html.classList.remove(s.class);
    });
    // apply new
    const sizeConfig = SIZES.find((s) => s.value === newSize);
    if (sizeConfig?.class) {
      html.classList.add(sizeConfig.class);
    }
  }

  function handleChange(newSize: FontSize) {
    setSize(newSize);
    applySize(newSize);
    try {
      localStorage.setItem(STORAGE_KEY, newSize);
    } catch { /* noop */ }
  }

  return (
    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden" role="group" aria-label="Font size">
      {SIZES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => handleChange(s.value)}
          aria-label={`${s.value} font size`}
          aria-pressed={size === s.value}
          className={`px-2.5 py-1.5 text-xs font-bold transition-all ${
            size === s.value
              ? "bg-ayurv-primary text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
