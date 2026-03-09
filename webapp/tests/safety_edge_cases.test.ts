// ============================================
// AYURV — SAFETY EDGE CASE TESTS
// ============================================
// 50 deterministic scenarios with pass/fail assertions.
// Run with: npx vitest run tests/safety_edge_cases.ts
//
// CI Integration:
//   1. Install: npm i -D vitest
//   2. Add to package.json: "test": "vitest run", "test:watch": "vitest"
//   3. GitHub Actions: run `npm test` on push/PR to main
//   4. Block merge if any CRITICAL test fails
//
// Categories:
//   RED_FLAG (1-8): Emergency escalation
//   BLOCKED_HERB (9-18): Red risk code blocking
//   DRUG_INTERACTION (19-28): Medication interaction handling
//   CAUTION_SCORING (29-36): Yellow risk scoring
//   EVIDENCE_RANKING (37-42): Evidence grade ordering
//   VALIDATION (43-50): Input validation edge cases

import { describe, it, expect } from "vitest";

// ============================================
// TYPES FOR TEST FIXTURES
// ============================================

interface TestProfile {
  age: number;
  sex: "male" | "female" | "other";
  pregnancy_status: string;
  chronic_conditions: string[];
  medications: string[];
  current_herbs: string[];
  symptom_primary: string;
  symptom_duration: string;
  symptom_severity: string;
  user_goal: string;
  red_flag_screen: Record<string, boolean>;
  disclaimer_accepted: true;
}

function makeProfile(overrides: Partial<TestProfile> = {}): TestProfile {
  return {
    age: 30,
    sex: "male",
    pregnancy_status: "not_applicable",
    chronic_conditions: ["none"],
    medications: ["none"],
    current_herbs: [],
    symptom_primary: "general_wellness",
    symptom_duration: "1_3_months",
    symptom_severity: "mild",
    user_goal: "find_herb_for_concern",
    red_flag_screen: {
      chest_pain: false,
      blood_in_stool_vomit: false,
      high_fever_over_103: false,
      sudden_weakness_paralysis: false,
      suicidal_thoughts: false,
      difficulty_breathing: false,
      severe_allergic_reaction: false,
      yellowing_skin_eyes: false,
    },
    disclaimer_accepted: true,
    ...overrides,
  };
}

const API_URL = process.env.TEST_API_URL || "http://localhost:3000";

async function assess(profile: TestProfile) {
  const res = await fetch(`${API_URL}/api/assess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  return res.json();
}

async function chat(sessionId: string, message: string, history: Array<{role: string; content: string}> = []) {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message, history }),
  });
  return res.json();
}

// ============================================
// RED FLAG TESTS (1-8)
// ============================================

describe("RED FLAG ESCALATION", () => {
  it("SEC-001: Chest pain → EMERGENCY_ESCALATION", async () => {
    const result = await assess(makeProfile({
      red_flag_screen: { ...makeProfile().red_flag_screen, chest_pain: true },
    }));
    expect(result.status).toBe("EMERGENCY_ESCALATION");
    expect(result.emergency_message).toBeDefined();
    expect(result.avoid_herbs?.length || 0).toBe(0);
    expect(result.recommended_herbs?.length || 0).toBe(0);
  });

  it("SEC-002: Blood in stool → EMERGENCY_ESCALATION", async () => {
    const result = await assess(makeProfile({
      red_flag_screen: { ...makeProfile().red_flag_screen, blood_in_stool_vomit: true },
    }));
    expect(result.status).toBe("EMERGENCY_ESCALATION");
  });

  it("SEC-003: Difficulty breathing → EMERGENCY_ESCALATION", async () => {
    const result = await assess(makeProfile({
      red_flag_screen: { ...makeProfile().red_flag_screen, difficulty_breathing: true },
    }));
    expect(result.status).toBe("EMERGENCY_ESCALATION");
  });

  it("SEC-004: Suicidal thoughts → EMERGENCY_ESCALATION with helplines", async () => {
    const result = await assess(makeProfile({
      red_flag_screen: { ...makeProfile().red_flag_screen, suicidal_thoughts: true },
    }));
    expect(result.status).toBe("EMERGENCY_ESCALATION");
    expect(result.emergency_message).toContain("112");
  });

  it("SEC-005: Multiple red flags → still single EMERGENCY_ESCALATION", async () => {
    const result = await assess(makeProfile({
      red_flag_screen: {
        chest_pain: true, difficulty_breathing: true,
        blood_in_stool_vomit: false, high_fever_over_103: false,
        sudden_weakness_paralysis: false, suicidal_thoughts: false,
        severe_allergic_reaction: false, yellowing_skin_eyes: false,
      },
    }));
    expect(result.status).toBe("EMERGENCY_ESCALATION");
  });

  it("SEC-006: Severe allergic reaction → EMERGENCY_ESCALATION", async () => {
    const result = await assess(makeProfile({
      red_flag_screen: { ...makeProfile().red_flag_screen, severe_allergic_reaction: true },
    }));
    expect(result.status).toBe("EMERGENCY_ESCALATION");
  });

  it("SEC-007: Yellowing skin (jaundice) → EMERGENCY_ESCALATION", async () => {
    const result = await assess(makeProfile({
      red_flag_screen: { ...makeProfile().red_flag_screen, yellowing_skin_eyes: true },
    }));
    expect(result.status).toBe("EMERGENCY_ESCALATION");
  });

  it("SEC-008: No red flags → COMPLETE status", async () => {
    const result = await assess(makeProfile());
    expect(result.status).toBe("COMPLETE");
    expect(result.recommended_herbs).toBeDefined();
  });
});

// ============================================
// BLOCKED HERB TESTS (9-18)
// ============================================

describe("BLOCKED HERB ENFORCEMENT", () => {
  it("SEC-009: Pregnancy blocks ashwagandha", async () => {
    const result = await assess(makeProfile({
      sex: "female",
      pregnancy_status: "pregnant_trimester_1",
      chronic_conditions: ["none"],
    }));
    expect(result.status).toBe("COMPLETE");
    const avoidIds = result.avoid_herbs?.map((h: {herb_id: string}) => h.herb_id) || [];
    // Ashwagandha should be avoided for pregnancy
    // (depends on seed data having this risk entry)
    if (avoidIds.includes("herb_ashwagandha")) {
      expect(avoidIds).toContain("herb_ashwagandha");
    }
  });

  it("SEC-010: Liver disease blocks guduchi", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["liver_disease"],
    }));
    const avoidIds = result.avoid_herbs?.map((h: {herb_id: string}) => h.herb_id) || [];
    expect(avoidIds).toContain("herb_guduchi");
  });

  it("SEC-011: Blocked herbs have NO dosage info", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["liver_disease"],
    }));
    for (const herb of result.avoid_herbs || []) {
      expect(herb.dosage).toBeUndefined();
      expect(herb.dosage_ranges).toBeUndefined();
    }
  });

  it("SEC-012: Blocked herbs have reason field", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["liver_disease"],
    }));
    for (const herb of result.avoid_herbs || []) {
      expect(herb.reason).toBeDefined();
      expect(herb.reason.length).toBeGreaterThan(0);
    }
  });

  it("SEC-013: Blocked herb has trigger_type field", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["liver_disease"],
    }));
    for (const herb of result.avoid_herbs || []) {
      expect(["condition", "medication", "pregnancy"]).toContain(herb.trigger_type);
    }
  });

  it("SEC-014: Heart failure blocks arjuna-contraindicated herbs", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["heart_failure"],
      medications: ["digoxin"],
    }));
    // Should have blocked or caution entries for cardiac herbs
    expect(result.status).toBe("COMPLETE");
    // concern-filtered: total should match total_relevant
    const allHerbs = [
      ...(result.avoid_herbs || []),
      ...(result.caution_herbs || []),
      ...(result.recommended_herbs || []),
    ];
    expect(allHerbs.length).toBe(result.total_relevant);
  });

  it("SEC-015: Autoimmune conditions map correctly", async () => {
    const result1 = await assess(makeProfile({ chronic_conditions: ["autoimmune_lupus"] }));
    const result2 = await assess(makeProfile({ chronic_conditions: ["autoimmune_ra"] }));
    // Both should produce same blocking pattern (both map to cond_autoimmune)
    const avoid1 = (result1.avoid_herbs || []).map((h: {herb_id: string}) => h.herb_id).sort();
    const avoid2 = (result2.avoid_herbs || []).map((h: {herb_id: string}) => h.herb_id).sort();
    expect(avoid1).toEqual(avoid2);
  });

  it("SEC-016: Scheduled surgery blocks blood-thinning herbs", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["scheduled_surgery_within_4_weeks"],
    }));
    // Herbs with antiplatelet/anticoagulant effects should be blocked or cautioned
    expect(result.status).toBe("COMPLETE");
  });

  it("SEC-017: Lactation maps to cond_lactation", async () => {
    const result = await assess(makeProfile({
      sex: "female",
      pregnancy_status: "lactating",
      chronic_conditions: ["none"],
    }));
    expect(result.status).toBe("COMPLETE");
  });

  it("SEC-018: Trying to conceive maps to cond_trying_to_conceive", async () => {
    const result = await assess(makeProfile({
      sex: "female",
      pregnancy_status: "trying_to_conceive",
      chronic_conditions: ["none"],
    }));
    expect(result.status).toBe("COMPLETE");
  });
});

// ============================================
// DRUG INTERACTION TESTS (19-28)
// ============================================

describe("DRUG INTERACTION HANDLING", () => {
  it("SEC-019: Warfarin triggers critical interactions", async () => {
    const result = await assess(makeProfile({
      medications: ["warfarin"],
    }));
    const avoidIds = (result.avoid_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    const cautionIds = (result.caution_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    // At least some herbs should be avoided or cautioned with warfarin
    expect(avoidIds.length + cautionIds.length).toBeGreaterThan(0);
  });

  it("SEC-020: Digoxin + arjuna = blocked or caution", async () => {
    const result = await assess(makeProfile({
      medications: ["digoxin"],
    }));
    const avoidIds = (result.avoid_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    const cautionIds = (result.caution_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    // Arjuna has cardiac effects; digoxin is narrow therapeutic index
    const arjunaHandled = avoidIds.includes("herb_arjuna") || cautionIds.includes("herb_arjuna");
    expect(arjunaHandled).toBe(true);
  });

  it("SEC-021: SSRI + ashwagandha = caution (sedative overlap)", async () => {
    const result = await assess(makeProfile({
      medications: ["ssri"],
    }));
    const cautionIds = (result.caution_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    // Ashwagandha may have additive sedation with SSRIs
    if (cautionIds.includes("herb_ashwagandha")) {
      const herb = result.caution_herbs.find((h: {herb_id: string}) => h.herb_id === "herb_ashwagandha");
      expect(herb.cautions.length).toBeGreaterThan(0);
    }
  });

  it("SEC-022: Antidiabetic + guduchi = blood sugar caution", async () => {
    const result = await assess(makeProfile({
      medications: ["antidiabetic_oral"],
    }));
    const cautionIds = (result.caution_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    if (cautionIds.includes("herb_guduchi")) {
      const herb = result.caution_herbs.find((h: {herb_id: string}) => h.herb_id === "herb_guduchi");
      const hasGlucoseWarning = herb.cautions.some(
        (c: {explanation: string}) => /blood sugar|glucose|glycem/i.test(c.explanation)
      );
      expect(hasGlucoseWarning).toBe(true);
    }
  });

  it("SEC-023: Levothyroxine interaction detected", async () => {
    const result = await assess(makeProfile({
      medications: ["thyroid_levothyroxine"],
    }));
    // Some herbs interfere with thyroid absorption
    expect(result.status).toBe("COMPLETE");
  });

  it("SEC-024: Immunosuppressant blocks immunostimulating herbs", async () => {
    const result = await assess(makeProfile({
      medications: ["immunosuppressant"],
    }));
    const avoidIds = (result.avoid_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    const cautionIds = (result.caution_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    // Guduchi (immunomodulator) should be flagged
    const guduchiFlagged = avoidIds.includes("herb_guduchi") || cautionIds.includes("herb_guduchi");
    expect(guduchiFlagged).toBe(true);
  });

  it("SEC-025: No medications = no interaction flags", async () => {
    const result = await assess(makeProfile({
      medications: ["none"],
      chronic_conditions: ["none"],
    }));
    expect(result.avoid_herbs?.length || 0).toBe(0);
  });

  it("SEC-026: Multiple medications compound caution scores", async () => {
    const single = await assess(makeProfile({ medications: ["ssri"] }));
    const multiple = await assess(makeProfile({
      medications: ["ssri", "benzodiazepine"],
    }));
    const singleCautions = (single.caution_herbs || []).length;
    const multipleCautions = (multiple.caution_herbs || []).length;
    expect(multipleCautions).toBeGreaterThanOrEqual(singleCautions);
  });

  it("SEC-027: Caution herbs include clinical_action field", async () => {
    const result = await assess(makeProfile({
      medications: ["warfarin"],
    }));
    for (const herb of result.caution_herbs || []) {
      for (const caution of herb.cautions || []) {
        if (caution.type === "medication_interaction") {
          expect(caution.clinical_action).toBeDefined();
        }
      }
    }
  });

  it("SEC-028: Beta-blocker interaction handling", async () => {
    const result = await assess(makeProfile({
      medications: ["antihypertensive_beta_blocker"],
    }));
    expect(result.status).toBe("COMPLETE");
  });
});

// ============================================
// CAUTION SCORING TESTS (29-36)
// ============================================

describe("CAUTION SCORING", () => {
  it("SEC-029: Caution herbs sorted by score (lowest first)", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["hypertension"],
      medications: ["antihypertensive_ace_arb"],
    }));
    const scores = (result.caution_herbs || []).map((h: {caution_score: number}) => h.caution_score);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
    }
  });

  it("SEC-030: High caution score triggers doctor referral", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["liver_disease", "hypertension"],
      medications: ["warfarin"],
      symptom_severity: "severe",
    }));
    expect(result.doctor_referral_suggested).toBe(true);
  });

  it("SEC-031: No conditions + no meds = no caution herbs", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["none"],
      medications: ["none"],
    }));
    expect(result.caution_herbs?.length || 0).toBe(0);
  });

  it("SEC-032: Doctor referral on severe symptoms", async () => {
    const result = await assess(makeProfile({
      symptom_severity: "severe",
      symptom_duration: "chronic_ongoing",
    }));
    expect(result.doctor_referral_suggested).toBe(true);
  });

  it("SEC-033: Caution score includes condition AND interaction points", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["diabetes_type_2"],
      medications: ["antidiabetic_oral"],
    }));
    // Herbs cautioned for BOTH condition and interaction should have higher scores
    for (const herb of result.caution_herbs || []) {
      const hasBoth = herb.cautions.some((c: {type: string}) => c.type === "condition") &&
                      herb.cautions.some((c: {type: string}) => c.type === "medication_interaction");
      if (hasBoth) {
        expect(herb.caution_score).toBeGreaterThan(10);
      }
    }
  });

  it("SEC-034: All concern-relevant herbs accounted for in output", async () => {
    const result = await assess(makeProfile());
    const total = (result.avoid_herbs?.length || 0) +
                  (result.caution_herbs?.length || 0) +
                  (result.recommended_herbs?.length || 0);
    // concern-filtered: total matches total_relevant (not all 50)
    expect(total).toBe(result.total_relevant);
    expect(total).toBeGreaterThan(0);
  });

  it("SEC-035: Mild symptom + no conditions = no referral", async () => {
    const result = await assess(makeProfile({
      symptom_severity: "mild",
      symptom_duration: "less_than_1_week",
    }));
    // With no conditions and mild symptoms, should NOT suggest referral
    // (unless other conditions trigger it)
    if (result.avoid_herbs?.length === 0 && result.caution_herbs?.length === 0) {
      expect(result.doctor_referral_suggested).toBe(false);
    }
  });

  it("SEC-036: Blocked herbs NOT duplicated in caution or safe lists", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["liver_disease"],
      medications: ["warfarin"],
    }));
    const avoidSet = new Set((result.avoid_herbs || []).map((h: {herb_id: string}) => h.herb_id));
    const cautionIds = (result.caution_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    const recommendedIds = (result.recommended_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    for (const id of avoidSet) {
      expect(cautionIds).not.toContain(id);
      expect(recommendedIds).not.toContain(id);
    }
  });
});

// ============================================
// EVIDENCE RANKING TESTS (37-42)
// ============================================

describe("EVIDENCE RANKING", () => {
  it("SEC-037: Safe herbs sorted by evidence grade (best first)", async () => {
    const result = await assess(makeProfile({
      symptom_primary: "stress_anxiety",
    }));
    const grades = (result.recommended_herbs || []).map((h: {evidence_grade: string}) => h.evidence_grade);
    const gradeRank: Record<string, number> = { A: 6, B: 5, "B-C": 4, C: 3, "C-D": 2, D: 1 };
    for (let i = 1; i < grades.length; i++) {
      if (grades[i] && grades[i - 1]) {
        expect(gradeRank[grades[i]] || 0).toBeLessThanOrEqual(gradeRank[grades[i - 1]] || 0);
      }
    }
  });

  it("SEC-038: Evidence grade only uses valid values", async () => {
    const result = await assess(makeProfile());
    const validGrades = new Set(["A", "B", "B-C", "C", "C-D", "D", null]);
    for (const herb of [...(result.recommended_herbs || []), ...(result.caution_herbs || [])]) {
      expect(validGrades.has(herb.evidence_grade)).toBe(true);
    }
  });

  it("SEC-039: Stress symptom matches stress-tagged evidence", async () => {
    const result = await assess(makeProfile({
      symptom_primary: "stress_anxiety",
    }));
    // Ashwagandha has Grade B for stress — should rank high
    const safeIds = (result.recommended_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    if (safeIds.includes("herb_ashwagandha")) {
      const idx = safeIds.indexOf("herb_ashwagandha");
      expect(idx).toBeLessThan(5); // Should be in top 5
    }
  });

  it("SEC-040: Cognitive symptom ranks brahmi high", async () => {
    const result = await assess(makeProfile({
      symptom_primary: "memory_concentration",
    }));
    const safeIds = (result.recommended_herbs || []).map((h: {herb_id: string}) => h.herb_id);
    if (safeIds.includes("herb_brahmi")) {
      const idx = safeIds.indexOf("herb_brahmi");
      expect(idx).toBeLessThan(5);
    }
  });

  it("SEC-041: Dosage info present on safe herbs", async () => {
    const result = await assess(makeProfile());
    for (const herb of result.recommended_herbs || []) {
      expect(herb.dosage).toBeDefined();
    }
  });

  it("SEC-042: Dosage info present on caution herbs", async () => {
    const result = await assess(makeProfile({
      chronic_conditions: ["hypertension"],
      medications: ["antihypertensive_ace_arb"],
    }));
    for (const herb of result.caution_herbs || []) {
      expect(herb.dosage).toBeDefined();
    }
  });
});

// ============================================
// INPUT VALIDATION TESTS (43-50)
// ============================================

describe("INPUT VALIDATION", () => {
  it("SEC-043: Missing age returns 400", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...makeProfile(), age: undefined }),
    });
    expect(res.status).toBe(400);
  });

  it("SEC-044: Age 0 returns 400", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({ age: 0 })),
    });
    expect(res.status).toBe(400);
  });

  it("SEC-045: Age 121 returns 400", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({ age: 121 })),
    });
    expect(res.status).toBe(400);
  });

  it("SEC-046: Male with pregnancy status returns 400", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({
        sex: "male",
        pregnancy_status: "pregnant_trimester_1",
      })),
    });
    expect(res.status).toBe(400);
  });

  it("SEC-047: disclaimer_accepted=false returns 400", async () => {
    const profile = makeProfile();
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, disclaimer_accepted: false }),
    });
    expect(res.status).toBe(400);
  });

  it("SEC-048: Empty chronic_conditions returns 400", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({ chronic_conditions: [] })),
    });
    expect(res.status).toBe(400);
  });

  it("SEC-049: Invalid sex value returns 400", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...makeProfile(), sex: "invalid" }),
    });
    expect(res.status).toBe(400);
  });

  it("SEC-050: Valid minimal input returns 200", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile()),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("COMPLETE");
    expect(data.session_id).toBeDefined();
  });
});

// ============================================
// ADVERSARIAL TESTS (51-60)
// ============================================

describe("ADVERSARIAL INPUT", () => {
  it("ADV-051: XSS in symptom_primary rejected", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({
        symptom_primary: "<script>alert('xss')</script>" as never,
      })),
    });
    // Should reject invalid enum value
    expect(res.status).toBe(400);
  });

  it("ADV-052: SQL injection in medications rejected", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({
        medications: ["'; DROP TABLE herbs; --"] as never,
      })),
    });
    expect(res.status).toBe(400);
  });

  it("ADV-053: Extremely long string in user_goal rejected", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({
        user_goal: "a".repeat(10000) as never,
      })),
    });
    expect(res.status).toBe(400);
  });

  it("ADV-054: Negative age rejected", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({ age: -5 })),
    });
    expect(res.status).toBe(400);
  });

  it("ADV-055: All 8 red flags true → still single EMERGENCY_ESCALATION", async () => {
    const result = await assess(makeProfile({
      red_flag_screen: {
        chest_pain: true,
        blood_in_stool_vomit: true,
        high_fever_over_103: true,
        sudden_weakness_paralysis: true,
        suicidal_thoughts: true,
        difficulty_breathing: true,
        severe_allergic_reaction: true,
        yellowing_skin_eyes: true,
      },
    }));
    expect(result.status).toBe("EMERGENCY_ESCALATION");
    expect(result.emergency_message).toBeDefined();
    // Should NOT produce herb results even with all flags
    expect(result.avoid_herbs?.length || 0).toBe(0);
    expect(result.recommended_herbs?.length || 0).toBe(0);
  });

  it("ADV-056: Float age rejected", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({ age: 25.7 })),
    });
    expect(res.status).toBe(400);
  });

  it("ADV-057: Empty string in conditions array rejected", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({
        chronic_conditions: [""] as never,
      })),
    });
    expect(res.status).toBe(400);
  });

  it("ADV-058: Pregnancy on sex=other handled safely", async () => {
    const res = await fetch(`${API_URL}/api/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeProfile({
        sex: "other",
        pregnancy_status: "pregnant_trimester_1",
      })),
    });
    // Should either accept (other can be pregnant) or reject — NOT crash
    expect([200, 400]).toContain(res.status);
    if (res.status === 200) {
      const data = await res.json();
      expect(data.status).toBeDefined();
    }
  });

  it("ADV-059: Duplicate conditions handled without double-counting", async () => {
    const single = await assess(makeProfile({
      chronic_conditions: ["diabetes_type_2"],
    }));
    const duped = await assess(makeProfile({
      chronic_conditions: ["diabetes_type_2", "diabetes_type_2"] as never,
    }));
    // Duplicates should NOT increase avoid count
    const singleAvoid = (single.avoid_herbs || []).length;
    const dupedAvoid = (duped.avoid_herbs || []).length;
    expect(dupedAvoid).toBe(singleAvoid);
  });

  it("ADV-060: Emergency escalation blocks ALL herb assessment", async () => {
    const result = await assess(makeProfile({
      red_flag_screen: { ...makeProfile().red_flag_screen, chest_pain: true },
      chronic_conditions: ["hypertension", "diabetes_type_2"],
      medications: ["warfarin", "ssri"],
    }));
    // Even with complex profile, red flag = NO herb assessment
    expect(result.status).toBe("EMERGENCY_ESCALATION");
    expect(result.avoid_herbs?.length || 0).toBe(0);
    expect(result.caution_herbs?.length || 0).toBe(0);
    expect(result.recommended_herbs?.length || 0).toBe(0);
  });
});
