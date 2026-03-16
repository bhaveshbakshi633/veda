// ============================================
// GET /api/health — System Health Check
// ============================================
// production readiness ke liye — Supabase + LLM connectivity check

import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ServiceStatus {
  status: "healthy" | "degraded" | "down";
  latency_ms: number;
  error?: string;
}

export async function GET() {
  const start = Date.now();
  const services: Record<string, ServiceStatus> = {};

  // 1. Supabase connectivity
  try {
    const dbStart = Date.now();
    const db = getServiceClient();
    const { error } = await db.from("herbs").select("id").limit(1);
    const latency = Date.now() - dbStart;
    services.database = error
      ? { status: "down", latency_ms: latency, error: error.message }
      : { status: "healthy", latency_ms: latency };
  } catch (err) {
    services.database = {
      status: "down",
      latency_ms: Date.now() - start,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }

  // 2. LLM (Ollama) — optional, degraded is OK (Groq fallback exists)
  try {
    const llmStart = Date.now();
    const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${ollamaUrl}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    const latency = Date.now() - llmStart;
    services.llm_primary = res.ok
      ? { status: "healthy", latency_ms: latency }
      : { status: "degraded", latency_ms: latency, error: `HTTP ${res.status}` };
  } catch {
    services.llm_primary = {
      status: "degraded",
      latency_ms: 0,
      error: "Ollama unreachable — Groq fallback active",
    };
  }

  // 3. Groq fallback check (just verify API key exists)
  const groqKey = process.env.GROQ_API_KEY?.trim();
  services.llm_fallback = groqKey
    ? { status: "healthy", latency_ms: 0 }
    : { status: "down", latency_ms: 0, error: "GROQ_API_KEY not configured" };

  // overall status — database must be healthy, LLM can be degraded
  const dbOk = services.database.status === "healthy";
  const llmOk = services.llm_primary.status === "healthy" || services.llm_fallback.status === "healthy";
  const overall = dbOk && llmOk ? "healthy" : dbOk ? "degraded" : "down";

  const response = {
    status: overall,
    version: process.env.npm_package_version || "1.0.0",
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    services,
    total_latency_ms: Date.now() - start,
  };

  return NextResponse.json(response, {
    status: overall === "down" ? 503 : 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
