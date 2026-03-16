"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecentHerbs } from "@/lib/recentHerbs";

export default function RecentHerbs() {
  const [herbs, setHerbs] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    setHerbs(getRecentHerbs());
  }, []);

  if (herbs.length === 0) return null;

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recently Viewed</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {herbs.map((herb) => (
          <Link
            key={herb.id}
            href={`/herbs/${herb.slug}`}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-ayurv-primary/30 hover:text-ayurv-primary whitespace-nowrap transition-all shrink-0"
          >
            {herb.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
