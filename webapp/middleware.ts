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

  if (entry.count > limit) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/assess", "/api/chat", "/api/evidence", "/api/user", "/api/profile", "/api/user/history"],
};
