"use client";

import { HERB_LIST, POPULAR_HERB_COUNT } from "./constants";

interface HerbPickerProps {
  selected: string[];
  onToggle: (herbName: string) => void;
  search: string;
  onSearchChange: (query: string) => void;
  showAll: boolean;
  onShowAllChange: (show: boolean) => void;
}

export default function HerbPicker({
  selected,
  onToggle,
  search,
  onSearchChange,
  showAll,
  onShowAllChange,
}: HerbPickerProps) {
  const query = search.toLowerCase();
  const filtered = query
    ? HERB_LIST.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          (h.hindi && h.hindi.includes(query)) ||
          h.id.includes(query)
      )
    : showAll
      ? HERB_LIST
      : HERB_LIST.slice(0, POPULAR_HERB_COUNT);

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">
        Any herbs you take or want to check?{" "}
        <span className="text-gray-400 font-normal">(optional)</span>
      </p>
      <p className="text-xs text-gray-400 mb-3">
        Tap to select. We&apos;ll check all 50 herbs regardless — this helps prioritise.
      </p>

      {/* search */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (e.target.value.length > 0) onShowAllChange(true);
          }}
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-ayurv-primary/20 focus:border-ayurv-primary/30 outline-none transition-all"
          placeholder="Search herbs..."
        />
      </div>

      {/* chips */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((herb) => (
          <button
            key={herb.id}
            type="button"
            onClick={() => onToggle(herb.name)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
              selected.includes(herb.name)
                ? "bg-ayurv-primary text-white border-ayurv-primary shadow-sm"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-ayurv-primary/5 hover:border-ayurv-accent/30"
            }`}
          >
            {herb.name}
            {herb.hindi && (
              <span
                className={`ml-1 ${selected.includes(herb.name) ? "text-white/70" : "text-gray-400"}`}
              >
                {herb.hindi}
              </span>
            )}
          </button>
        ))}
        {query && filtered.length === 0 && (
          <p className="text-xs text-gray-400 py-2">
            No herbs found for &quot;{search}&quot;
          </p>
        )}
      </div>

      {/* show more / less */}
      {!showAll && !query && (
        <button
          type="button"
          onClick={() => onShowAllChange(true)}
          className="mt-2 text-xs text-ayurv-primary font-medium hover:underline"
        >
          Show all {HERB_LIST.length} herbs
        </button>
      )}
      {showAll && !query && (
        <button
          type="button"
          onClick={() => onShowAllChange(false)}
          className="mt-2 text-xs text-gray-400 font-medium hover:underline"
        >
          Show fewer
        </button>
      )}

      {/* selection count */}
      {selected.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-ayurv-primary font-medium bg-ayurv-primary/5 rounded-lg px-3 py-2">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {selected.length} herb{selected.length > 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}
