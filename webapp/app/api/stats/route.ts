import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// cached in-memory for 5 minutes — don't hammer DB
let cachedCount = 0;
let cacheTime = 0;
const CACHE_TTL = 300_000;

export async function GET() {
  const now = Date.now();
  if (cachedCount > 0 && now - cacheTime < CACHE_TTL) {
    return NextResponse.json({ count: cachedCount });
  }

  try {
    const db = getServiceClient();
    const { count, error } = await db
      .from("intake_sessions")
      .select("*", { count: "exact", head: true });

    if (error) throw error;

    cachedCount = count || 0;
    cacheTime = now;
    return NextResponse.json({ count: cachedCount });
  } catch (err) {
    console.error("Stats query failed:", err);
    return NextResponse.json({ count: cachedCount });
  }
}
