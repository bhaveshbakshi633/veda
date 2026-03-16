"use client";

import { useState, useEffect } from "react";
import { isBookmarked, toggleBookmark } from "@/lib/bookmarks";

interface BookmarkButtonProps {
  herbId: string;
  herbName: string;
  size?: "sm" | "lg";
}

export default function BookmarkButton({ herbId, herbName, size = "sm" }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(herbId));
  }, [herbId]);

  function handleClick() {
    const nowSaved = toggleBookmark(herbId, herbName);
    setSaved(nowSaved);
  }

  const isLg = size === "lg";

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={saved ? `Remove ${herbName} from saved` : `Save ${herbName}`}
      title={saved ? "Remove from saved" : "Save for later"}
      className={`inline-flex items-center gap-1.5 transition-all ${
        isLg
          ? `px-4 py-2.5 rounded-xl border-2 text-sm font-semibold ${
              saved
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : "bg-white text-gray-500 border-gray-200 hover:border-amber-300 hover:text-amber-600"
            }`
          : `p-1.5 rounded-lg ${
              saved
                ? "text-amber-500 hover:text-amber-600"
                : "text-gray-300 hover:text-amber-400"
            }`
      }`}
    >
      <svg
        className={isLg ? "w-5 h-5" : "w-4 h-4"}
        fill={saved ? "currentColor" : "none"}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={saved ? 0 : 2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
        />
      </svg>
      {isLg && (saved ? "Saved" : "Save")}
    </button>
  );
}
