import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// GET /api/interactions?herb=herb_ashwagandha&medication=med_warfarin
// OR  /api/interactions?herb1=herb_ashwagandha&herb2=herb_tulsi
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const herb = searchParams.get("herb");
  const medication = searchParams.get("medication");
  const herb2 = searchParams.get("herb2");

  if (!herb) {
    return NextResponse.json({ error: "herb parameter required" }, { status: 400 });
  }

  const db = getServiceClient();

  try {
    // herb-medication interaction
    if (medication) {
      const { data, error } = await db
        .from("herb_medication_interactions")
        .select("*")
        .eq("herb_id", herb)
        .eq("medication_id", medication)
        .maybeSingle();

      if (error) throw error;

      // also fetch herb name
      const { data: herbData } = await db
        .from("herbs")
        .select("names")
        .eq("id", herb)
        .single();

      return NextResponse.json({
        type: "herb_medication",
        herb_id: herb,
        herb_name: herbData?.names?.english || herb,
        medication_id: medication,
        interaction: data || null,
        has_interaction: !!data,
      });
    }

    // herb-herb interaction
    if (herb2) {
      // table enforces herb_id_1 < herb_id_2
      const [h1, h2] = [herb, herb2].sort();

      const { data, error } = await db
        .from("herb_herb_interactions")
        .select("*")
        .eq("herb_id_1", h1)
        .eq("herb_id_2", h2)
        .maybeSingle();

      if (error) throw error;

      // fetch herb names
      const { data: herbs } = await db
        .from("herbs")
        .select("id, names")
        .in("id", [herb, herb2]);

      const getName = (id: string) =>
        herbs?.find(h => h.id === id)?.names?.english || id;

      return NextResponse.json({
        type: "herb_herb",
        herb1: { id: herb, name: getName(herb) },
        herb2: { id: herb2, name: getName(herb2) },
        interaction: data || null,
        has_interaction: !!data,
      });
    }

    // no target specified — return all interactions for this herb
    const [medResult, herbResult, herbData] = await Promise.all([
      db.from("herb_medication_interactions").select("*").eq("herb_id", herb),
      db.from("herb_herb_interactions").select("*").or(`herb_id_1.eq.${herb},herb_id_2.eq.${herb}`),
      db.from("herbs").select("names").eq("id", herb).single(),
    ]);

    return NextResponse.json({
      herb_id: herb,
      herb_name: herbData.data?.names?.english || herb,
      medication_interactions: medResult.data || [],
      herb_interactions: herbResult.data || [],
    });
  } catch (err) {
    console.error("Interaction lookup error:", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
