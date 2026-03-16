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

  // non-API routes — security headers only, no rate limiting
  const limit = LIMITS[path];
  if (!limit) {
    const res = NextResponse.next();
    setSecurityHeaders(res);
    return res;
  }

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
      {
        error: "Too many requests",
        message: `Rate limit reached (${limit} requests per minute). Please wait ${resetSec} seconds and try again.`,
        retry_after: resetSec,
      },
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

  // security headers — sabhi API responses pe
  setSecurityHeaders(res);
  return res;
}

// ============================================
// SECURITY HEADERS — industry standard
// ============================================

function setSecurityHeaders(res: NextResponse) {
  // XSS protection
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");

  // HSTS — force HTTPS (1 year, include subdomains)
  res.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  // referrer policy — health data leak mat hone dena
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // permissions policy — unnecessary browser APIs block karo
  res.headers.set(
    "Permissions-Policy",
    "camera=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), microphone=(self)"
  );

  // CSP — basic but effective
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.vercel-insights.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
}

export const config = {
  matcher: [
    "/api/assess", "/api/chat", "/api/evidence", "/api/user", "/api/profile",
    "/api/user/history", "/api/waitlist", "/api/interactions", "/api/stats",
    "/api/health",
    // security headers sabhi pages pe lagao
    "/((?!_next/static|_next/image|favicon|icon|manifest|og-image|sitemap|robots).*)",
  ],
};
