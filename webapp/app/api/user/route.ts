// ============================================
// POST /api/user — Register or touch anonymous user
// GET  /api/user?uid=xxx — Check if user exists
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { uid, user_agent } = await request.json();

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "uid required" }, { status: 400 });
    }

    const db = getServiceClient();

    // hash user-agent for analytics (no raw PII)
    let deviceHash: string | null = null;
    if (user_agent) {
      const hashBuffer = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(user_agent)
      );
      deviceHash = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }

    // upsert — create if new, update last_seen + bump session count if returning
    const { data, error } = await db
      .from("anonymous_users")
      .upsert(
        {
          id: uid,
          last_seen_at: new Date().toISOString(),
          device_hash: deviceHash,
        },
        { onConflict: "id" }
      )
      .select("id, created_at, last_seen_at, total_sessions")
      .single();

    if (error) {
      console.error("User upsert error:", error.message);
      return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }

    // bump session count
    await db
      .from("anonymous_users")
      .update({ total_sessions: (data.total_sessions || 0) + 1, last_seen_at: new Date().toISOString() })
      .eq("id", uid);

    return NextResponse.json({
      uid: data.id,
      created_at: data.created_at,
      returning: data.total_sessions > 0,
    });
  } catch (err) {
    console.error("User API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from("anonymous_users")
    .select("id, created_at, total_sessions")
    .eq("id", uid)
    .single();

  if (error || !data) {
    return NextResponse.json({ exists: false });
  }

  return NextResponse.json({ exists: true, total_sessions: data.total_sessions });
}
