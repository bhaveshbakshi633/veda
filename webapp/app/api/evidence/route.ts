// ============================================
// GET /api/evidence — Evidence Claims Endpoint
// ============================================
// Returns evidence claims for a given herb. Educational data, no user PII.

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const VALID_HERB_IDS = [
  "herb_ashwagandha",
  "herb_brahmi",
  "herb_shatavari",
  "herb_triphala",
  "herb_tulsi",
  "herb_guduchi",
  "herb_haridra",
  "herb_arjuna",
  "herb_amalaki",
  "herb_yashtimadhu",
];

export async function GET(request: NextRequest) {
  const herbId = request.nextUrl.searchParams.get("herb_id");

  if (!herbId || !VALID_HERB_IDS.includes(herbId)) {
    return NextResponse.json(
      { error: "Invalid or missing herb_id parameter" },
      { status: 400 }
    );
  }

  try {
    const db = getServiceClient();
    const { data, error } = await db
      .from("evidence_claims")
      .select("*")
      .eq("herb_id", herbId)
      .order("evidence_grade", { ascending: true });

    if (error) {
      console.error("Evidence fetch error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch evidence data" },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Evidence endpoint error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
