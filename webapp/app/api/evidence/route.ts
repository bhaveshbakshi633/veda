// ============================================
// GET /api/evidence — Evidence Claims Endpoint
// ============================================
// Returns evidence claims for a given herb. Educational data, no user PII.

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

const VALID_HERB_IDS = [
  // Original 10
  "herb_ashwagandha", "herb_brahmi", "herb_shatavari", "herb_triphala", "herb_tulsi",
  "herb_guduchi", "herb_haridra", "herb_arjuna", "herb_amalaki", "herb_yashtimadhu",
  // 40 new herbs
  "herb_neem", "herb_guggulu", "herb_moringa", "herb_gokshura", "herb_punarnava",
  "herb_shilajit", "herb_kutki", "herb_bhringaraj", "herb_shankhapushpi", "herb_vidanga",
  "herb_vacha", "herb_pippali", "herb_maricha", "herb_shunthi", "herb_dalchini",
  "herb_elaichi", "herb_lavanga", "herb_methi", "herb_kalmegh", "herb_manjistha",
  "herb_chitrak", "herb_bala", "herb_jatamansi", "herb_kumari", "herb_tagar",
  "herb_musta", "herb_haritaki", "herb_bibhitaki", "herb_sariva", "herb_chirata",
  "herb_ajwain", "herb_jeera", "herb_kalonji", "herb_isabgol", "herb_senna",
  "herb_safed_musli", "herb_kapikacchu", "herb_rasna", "herb_lodhra", "herb_nagkesar",
];

export async function GET(request: NextRequest) {
  const herbId = request.nextUrl.searchParams.get("herb_id")?.trim();

  if (!herbId || herbId.length === 0 || !VALID_HERB_IDS.includes(herbId)) {
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
