"use client";

import { useEffect } from "react";
import { addRecentHerb } from "@/lib/recentHerbs";

export default function TrackHerbView({ herbId, herbName, slug }: { herbId: string; herbName: string; slug: string }) {
  useEffect(() => {
    addRecentHerb(herbId, herbName, slug);
  }, [herbId, herbName, slug]);

  return null;
}
