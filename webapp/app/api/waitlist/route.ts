import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, source, concern } = await req.json();

    // basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const db = getServiceClient();
    const { error } = await db.from("email_waitlist").insert({
      email: email.toLowerCase().trim(),
      source: source || "unknown",
      concern: concern || null,
    });

    if (error) {
      // duplicate email — not an error for the user
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, message: "Already subscribed" });
      }
      // table doesn't exist yet on cloud — graceful handling
      if (error.code === "42P01") {
        console.warn("email_waitlist table not found — run migration 005");
        return NextResponse.json({ ok: true, message: "Noted" });
      }
      console.error("Waitlist insert error:", error);
      return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Subscribed" });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
