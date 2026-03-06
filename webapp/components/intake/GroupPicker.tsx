"use client";

// reusable accordion group picker — used for conditions and medications

interface GroupPickerProps {
  groups: { label: string; items: { value: string; label: string }[] }[];
  selected: string[];
  onToggle: (value: string) => void;
  expandedGroup: string | null;
  onExpandGroup: (label: string | null) => void;
  // optional: filter items per group (e.g. hide female-only meds for males)
  filterItems?: (items: { value: string; label: string }[]) => { value: string; label: string }[];
  // optional: filter groups (e.g. hide Women's Health for males)
  filterGroup?: (group: { label: string }) => boolean;
}

export default function GroupPicker({
  groups,
  selected,
  onToggle,
  expandedGroup,
  onExpandGroup,
  filterItems,
  filterGroup,
}: GroupPickerProps) {
  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 animate-fade-in">
      {groups
        .filter((g) => !filterGroup || filterGroup(g))
        .map((group) => {
          const items = filterItems ? filterItems(group.items) : group.items;
          if (items.length === 0) return null;

          const isExpanded = expandedGroup === group.label;
          const hasSelected = items.some((i) => selected.includes(i.value));

          return (
            <div
              key={group.label}
              className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                hasSelected
                  ? "border-ayurv-accent/30 bg-ayurv-primary/[0.02]"
                  : "border-gray-200"
              }`}
            >
              <button
                type="button"
                aria-expanded={isExpanded}
                onClick={() => onExpandGroup(isExpanded ? null : group.label)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50/80 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  {group.label}
                  {hasSelected && (
                    <span className="w-2 h-2 bg-ayurv-primary rounded-full" />
                  )}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div
                  className="px-4 pb-3 flex flex-wrap gap-2 animate-fade-in"
                  role="group"
                  aria-label={`${group.label} options`}
                >
                  {items.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={selected.includes(item.value)}
                      onClick={() => onToggle(item.value)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                        selected.includes(item.value)
                          ? "bg-ayurv-primary text-white border-ayurv-primary shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-ayurv-primary/5 hover:border-ayurv-accent/30"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}
