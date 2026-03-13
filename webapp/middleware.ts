import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter — per IP, per endpoint group
// Good enough for launch. Replace with Redis/Upstash for multi-instance.

const WINDOW_MS = 60_000; // 1 minute
const LIMITS: Record<string, number> = {
  "/api/assess": 10,   // 10 assessments per minute
  "/api/chat": 30,     // 30 chat messages per minute
  "/api/evidence": 60, // 60 evidence lookups per minute
  "/api/user": 20,     // 20 user ops per minute
  "/api/profile": 20,  // 20 profile ops per minute
  "/api/user/history": 30, // 30 history lookups per minute
  "/api/waitlist": 5,  // 5 email signups per minute (abuse prevention)
  "/api/interactions": 30, // 30 interaction checks per minute
  "/api/stats": 20,   // 20 stats checks per minute
};

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 300_000);

function getClientIP(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Only rate-limit API routes
  const limit = LIMITS[path];
  if (!limit) return NextResponse.next();

  const ip = getClientIP(req);
  const key = `${ip}:${path}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, limit - entry.count);
  const resetSec = Math.ceil((entry.resetAt - now) / 1000);

  if (entry.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(resetSec),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", String(limit));
  res.headers.set("X-RateLimit-Remaining", String(remaining));
  res.headers.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
  return res;
}

export const config = {
  matcher: ["/api/assess", "/api/chat", "/api/evidence", "/api/user", "/api/profile", "/api/user/history", "/api/waitlist", "/api/interactions", "/api/stats"],
};
