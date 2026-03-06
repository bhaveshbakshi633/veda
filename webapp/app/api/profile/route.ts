// ============================================
// GET  /api/profile?uid=xxx — Load saved health profile
// POST /api/profile        — Save/update health profile
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from("user_profiles")
    .select("age, sex, pregnancy_status, chronic_conditions, medications, current_herbs, updated_at")
    .eq("user_id", uid)
    .single();

  if (error || !data) {
    return NextResponse.json({ profile: null });
  }

  return NextResponse.json({ profile: data });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, age, sex, pregnancy_status, chronic_conditions, medications, current_herbs } = body;

    if (!uid || typeof uid !== "string") {
      return NextResponse.json({ error: "uid required" }, { status: 400 });
    }

    const db = getServiceClient();

    // upsert profile — create or update
    const { error } = await db
      .from("user_profiles")
      .upsert(
        {
          user_id: uid,
          age: age || null,
          sex: sex || null,
          pregnancy_status: pregnancy_status || null,
          chronic_conditions: chronic_conditions || [],
          medications: medications || [],
          current_herbs: current_herbs || "",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Profile save error:", error.message);
      return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
    }

    return NextResponse.json({ saved: true });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
