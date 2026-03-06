// ============================================
// AYURV AGENT — ORCHESTRATOR ENFORCEMENT LAYER
// ============================================
// This layer sits BETWEEN the LLM and the user.
// It catches safety violations that the system prompt alone cannot guarantee.
// This is CODE, not prompting. It cannot be prompt-injected.

import type { ConversationState } from "./systemPrompt";

// ============================================
// BANNED PHRASES (regex patterns)
// ============================================

const BANNED_PATTERNS: { pattern: RegExp; replacement: string }[] = [
  { pattern: /\bboost(?:s|ing|ed)?\s+(?:your\s+)?immunit/gi, replacement: "supports immune function" },
  { pattern: /\bimmune?\s+boost(?:er|ing)/gi, replacement: "immunomodulatory support" },
  { pattern: /\bstrengthen(?:s|ing)?\s+(?:your\s+)?immunit/gi, replacement: "supports immune function" },
  { pattern: /\bdetox(?:ify|ifies|ification|ing|ed)?\b/gi, replacement: "supports natural processes" },
  { pattern: /\bcleanse(?:s|ing)?\s+(?:your\s+)?(?:body|system|liver|blood)/gi, replacement: "supports digestive function" },
  { pattern: /\bflush(?:es|ing)?\s+toxins?\b/gi, replacement: "supports elimination" },
  { pattern: /\bcure(?:s|d)?\b(?!\s+rate)/gi, replacement: "may help with" },
  { pattern: /\btreat(?:s|ed|ing)?\b(?!\s+(?:plan|protocol|as))/gi, replacement: "may support" },
  { pattern: /\btreatment(?:s)?\b/gi, replacement: "approach" },
  { pattern: /\bremedy\b/gi, replacement: "option" },
  { pattern: /\bheal(?:s|ing|ed)?\b(?!\s+th)/gi, replacement: "support recovery" },
  { pattern: /\bprescri(?:be|ption|bed)\b/gi, replacement: "educational information" },
  { pattern: /\bguaranteed?\b/gi, replacement: "may" },
  { pattern: /\bproven to work\b/gi, replacement: "shows evidence for" },
  { pattern: /\bdefinitely helps?\b/gi, replacement: "may help" },
  { pattern: /\bmiracle\s+herb\b/gi, replacement: "herb" },
  { pattern: /\bwonder\s+herb\b/gi, replacement: "herb" },
  { pattern: /\bsuperfood\b/gi, replacement: "food" },
  { pattern: /\bno side effects?\b/gi, replacement: "generally well-tolerated" },
  { pattern: /\bcompletely safe\b/gi, replacement: "generally considered safe within recommended ranges" },
  { pattern: /\b100%\s+(?:natural|safe)\b/gi, replacement: "generally considered safe" },
  { pattern: /\bancient wisdom (?:says|proves|shows)\b/gi, replacement: "traditional texts describe" },
  { pattern: /\bbetter than (?:your |the )?(?:medicine|medication|drug)\b/gi, replacement: "may complement (not replace) your medication" },
  { pattern: /\byou (?:don'?t|do not) need (?:your |a )?doctor\b/gi, replacement: "please discuss with your doctor" },
  { pattern: /\bstop (?:taking )?(?:your |the )?(?:medicine|medication)\b/gi, replacement: "continue your prescribed medication and discuss any changes with your doctor" },
];

// ============================================
// KNOWN HERB IDS (for reference detection)
// ============================================

const KNOWN_HERB_IDS = [
  "herb_ashwagandha", "herb_triphala", "herb_tulsi", "herb_brahmi", "herb_shatavari",
  "herb_guduchi", "herb_haridra", "herb_arjuna", "herb_amalaki", "herb_yashtimadhu",
  "herb_neem", "herb_guggulu", "herb_moringa", "herb_gokshura", "herb_punarnava",
  "herb_shilajit", "herb_kutki", "herb_bhringaraj", "herb_shankhapushpi", "herb_vidanga",
  "herb_vacha", "herb_pippali", "herb_maricha", "herb_shunthi", "herb_dalchini",
  "herb_elaichi", "herb_lavanga", "herb_methi", "herb_kalmegh", "herb_manjistha",
  "herb_chitrak", "herb_bala", "herb_jatamansi", "herb_kumari", "herb_tagar",
  "herb_musta", "herb_haritaki", "herb_bibhitaki", "herb_sariva", "herb_chirata",
  "herb_ajwain", "herb_jeera", "herb_kalonji", "herb_isabgol", "herb_senna",
  "herb_safed_musli", "herb_kapikacchu", "herb_rasna", "herb_lodhra", "herb_nagkesar",
];

const HERB_NAME_PATTERNS = [
  // Original 10
  /\bashwagandha\b/i, /\btriphala\b/i, /\btulsi\b/i, /\bholy basil\b/i,
  /\bbrahmi\b/i, /\bbacopa\b/i, /\bshatavari\b/i,
  /\bguduchi\b/i, /\bgiloy\b/i, /\btinospora\b/i,
  /\bharidra\b/i, /\bhaldi\b/i, /\bturmeric\b/i, /\bcurcumin\b/i,
  /\barjuna\b/i, /\bamalaki\b/i, /\bamla\b/i,
  /\byashtimadhu\b/i, /\bmulethi\b/i, /\blicorice\b/i, /\bliquorice\b/i,
  // 40 new herbs
  /\bneem\b/i, /\bnimba\b/i, /\bguggul(?:u)?\b/i, /\bmoringa\b/i, /\bdrumstick\b/i,
  /\bgokshura\b/i, /\bgokhru\b/i, /\btribulus\b/i, /\bpunarnava\b/i, /\bshilajit\b/i,
  /\bkutki\b/i, /\bkatuki\b/i, /\bbhri?ngaraj\b/i, /\bshankh(?:a)?pushpi\b/i,
  /\bvidanga\b/i, /\bvacha\b/i, /\bpippali\b/i, /\blong pepper\b/i,
  /\bmaricha\b/i, /\bblack pepper\b/i, /\bkali mirch\b/i,
  /\bshunthi\b/i, /\bginger\b/i, /\badrak\b/i, /\bsonth\b/i,
  /\bdalchini\b/i, /\bcinnamon\b/i, /\belaichi\b/i, /\bcardamom\b/i,
  /\blavanga?\b/i, /\bclove\b/i, /\blaung\b/i,
  /\bmethi\b/i, /\bfenugreek\b/i, /\bkalmegh\b/i, /\bandrographis\b/i,
  /\bmanjistha\b/i, /\bchitrak\b/i, /\bbala\b/i,
  /\bjatamansi\b/i, /\bspikenard\b/i, /\bkumari\b/i, /\baloe vera\b/i,
  /\btagar\b/i, /\bvalerian\b/i, /\bmusta\b/i, /\bnagarmotha\b/i,
  /\bharitaki\b/i, /\bharad\b/i, /\bbibhitaki\b/i, /\bbaheda\b/i,
  /\bsariva\b/i, /\banantamool\b/i, /\bchirata\b/i, /\bchirayita\b/i,
  /\bajwain\b/i, /\bcarom\b/i, /\bjeera\b/i, /\bcumin\b/i,
  /\bkalonji\b/i, /\bnigella\b/i, /\bblack seed\b/i,
  /\bisabgol\b/i, /\bpsyllium\b/i, /\bsenna\b/i,
  /\bsafed musli\b/i, /\bkapikacchu\b/i, /\bmucuna\b/i,
  /\brasna\b/i, /\blodhra\b/i, /\bnagkesar\b/i,
];

// Dosage-related patterns
const DOSAGE_PATTERNS = [
  /\d+\s*(?:mg|g|ml|tablet|capsule)/i,
  /\brange\b.*\bto\b/i,
  /\bstart with\b.*\b(?:mg|g)\b/i,
  /\btake\s+\d/i,
  /\bdose\b/i, /\bdosage\b/i,
];

// ============================================
// RED FLAG KEYWORDS
// ============================================

const RED_FLAG_KEYWORDS = [
  /\bchest\s+pain\b/i, /\bchest\s+(?:tight|pressure|heaviness)\b/i,
  /\bblood\s+in\s+(?:stool|vomit|urine)\b/i,
  /\bcan'?t\s+breathe?\b/i, /\bdifficulty\s+breathing\b/i, /\bbreathing\s+(?:trouble|problem)\b/i,
  /\bparalys(?:is|ed)\b/i, /\bsudden\s+weakness\b/i, /\bnumb(?:ness)?\s+(?:one|left|right)\s+side\b/i,
  /\bsuicid(?:e|al)\b/i, /\bkill\s+(?:my|him|her)self\b/i, /\bself[\s-]harm\b/i, /\bwant\s+to\s+die\b/i,
  /\bsevere\s+allerg(?:y|ic)\b/i, /\bthroat\s+(?:closing|swelling|swollen)\b/i, /\banaphyla/i,
  /\bjaundice\b/i, /\byellow(?:ing)?\s+(?:skin|eyes)\b/i,
  /\bfever\s+(?:above|over|>\s*)103\b/i, /\b(?:very\s+)?high\s+fever\b/i,
];

// ============================================
// ENFORCEMENT FUNCTIONS
// ============================================

export interface EnforcementResult {
  passed: boolean;
  sanitized_response: string;
  violations: string[];
  actions_taken: string[];
}

/**
 * Scan a user message for red flags BEFORE sending to LLM.
 * If detected, the orchestrator should bypass the LLM entirely
 * and return a pre-built escalation response.
 */
export function scanUserMessageForRedFlags(message: string): {
  detected: boolean;
  flags: string[];
} {
  const flags: string[] = [];

  for (const pattern of RED_FLAG_KEYWORDS) {
    if (pattern.test(message)) {
      flags.push(pattern.source);
    }
  }

  return { detected: flags.length > 0, flags };
}

/**
 * Check if the LLM response references specific herbs.
 * Used to verify that safety checks were called.
 */
export function detectHerbReferences(response: string): string[] {
  const found: string[] = [];
  for (const pattern of HERB_NAME_PATTERNS) {
    if (pattern.test(response)) {
      found.push(pattern.source.replace(/\\b/g, "").replace(/\\s/g, " "));
    }
  }
  return [...new Set(found)];
}

/**
 * Check if the LLM response contains dosage information.
 */
export function containsDosageInfo(response: string): boolean {
  return DOSAGE_PATTERNS.some((p) => p.test(response));
}

/**
 * MAIN ENFORCEMENT: Sanitize and validate LLM response before delivery.
 */
export function enforceResponse(
  response: string,
  state: ConversationState,
  toolCallsMade: string[]
): EnforcementResult {
  const violations: string[] = [];
  const actions: string[] = [];
  let sanitized = response;

  // ─── CHECK 1: Banned phrases ───
  for (const { pattern, replacement } of BANNED_PATTERNS) {
    if (pattern.test(sanitized)) {
      violations.push(`Banned phrase detected: ${pattern.source}`);
      sanitized = sanitized.replace(pattern, replacement);
      actions.push(`Replaced banned phrase with: "${replacement}"`);
    }
  }

  // ─── CHECK 2: Herb reference without safety check ───
  const herbsReferenced = detectHerbReferences(sanitized);
  if (herbsReferenced.length > 0) {
    const safetyCheckCalled = toolCallsMade.includes("runSafetyCheck");
    if (!safetyCheckCalled) {
      violations.push(
        `Herb(s) referenced without runSafetyCheck: ${herbsReferenced.join(", ")}`
      );
      // Don't block educational mentions, but flag for review
      actions.push("WARNING: Herb mentioned without safety check in this turn");
    }
  }

  // ─── CHECK 3: Dosage on blocked herb ───
  if (containsDosageInfo(sanitized)) {
    for (const blockedHerbId of state.herbs_blocked) {
      // Map herb_id to common names for matching
      const herbNames = getHerbNames(blockedHerbId);
      for (const name of herbNames) {
        if (sanitized.toLowerCase().includes(name.toLowerCase())) {
          violations.push(
            `Dosage provided for BLOCKED herb: ${blockedHerbId}`
          );
          // Strip dosage lines that mention this herb
          // This is aggressive but necessary for blocked herbs
          actions.push(
            `CRITICAL: Dosage stripped for blocked herb ${blockedHerbId}`
          );
        }
      }
    }
  }

  // ─── CHECK 4: Recommendation count exceeded ───
  if (state.recommendation_count >= 2) {
    // Check if response contains new recommendation language
    const recommendPatterns = [
      /\bi(?:'d| would) (?:suggest|recommend)\b/i,
      /\byou (?:could|should|might want to) try\b/i,
      /\bconsider (?:starting|taking|using)\b/i,
    ];

    const newHerbsInResponse = herbsReferenced.filter(
      (h) => !state.herbs_recommended.some((r) => r.includes(h.toLowerCase()))
    );

    if (
      newHerbsInResponse.length > 0 &&
      recommendPatterns.some((p) => p.test(sanitized))
    ) {
      violations.push("Recommendation count exceeded (max 2)");
      sanitized +=
        "\n\n*Note: I've already suggested 2 herbs this session. Let's focus on those before considering others.*";
      actions.push("Appended recommendation limit notice");
    }
  }

  // ─── CHECK 5: Post-escalation — ALL content blocked ───
  if (state.red_flag_escalated) {
    violations.push("Response attempted after red flag escalation");
    sanitized =
      "I cannot discuss herbs right now. Based on symptoms mentioned earlier, please get medical evaluation first.\n\nEmergency: 112 | iCall: 9152987821 | Vandrevala: 1860-2662-345 | AASRA: 9820466726";
    actions.push("CRITICAL: ALL response replaced with escalation — terminal state");
    return { passed: false, sanitized_response: sanitized, violations, actions_taken: actions };
  }

  // ─── CHECK 6: Ensure disclaimer present on herb-specific content ───
  if (herbsReferenced.length > 0 && !state.red_flag_escalated) {
    const hasDisclaimer =
      /educational information/i.test(sanitized) ||
      /not (?:a )?(?:medical )?(?:advice|prescription)/i.test(sanitized) ||
      /discuss with (?:your )?(?:doctor|healthcare|physician)/i.test(
        sanitized
      );

    if (!hasDisclaimer) {
      sanitized +=
        "\n\n*This is educational information — please discuss with your healthcare provider.*";
      actions.push("Appended missing disclaimer");
    }
  }

  return {
    passed: violations.length === 0,
    sanitized_response: sanitized,
    violations,
    actions_taken: actions,
  };
}

// ============================================
// HELPER: Map herb_id to common names
// ============================================

function getHerbNames(herbId: string): string[] {
  const map: Record<string, string[]> = {
    herb_ashwagandha: ["ashwagandha", "withania"],
    herb_triphala: ["triphala"],
    herb_tulsi: ["tulsi", "holy basil"],
    herb_brahmi: ["brahmi", "bacopa"],
    herb_shatavari: ["shatavari"],
    herb_guduchi: ["guduchi", "giloy", "tinospora"],
    herb_haridra: ["haridra", "haldi", "turmeric", "curcumin"],
    herb_arjuna: ["arjuna"],
    herb_amalaki: ["amalaki", "amla"],
    herb_yashtimadhu: ["yashtimadhu", "mulethi", "licorice", "liquorice"],
    herb_neem: ["neem", "nimba"],
    herb_guggulu: ["guggulu", "guggul"],
    herb_moringa: ["moringa", "drumstick", "sahjan"],
    herb_gokshura: ["gokshura", "gokhru", "tribulus"],
    herb_punarnava: ["punarnava"],
    herb_shilajit: ["shilajit"],
    herb_kutki: ["kutki", "katuki"],
    herb_bhringaraj: ["bhringaraj", "bhringraj"],
    herb_shankhapushpi: ["shankhapushpi", "shankhpushpi"],
    herb_vidanga: ["vidanga"],
    herb_vacha: ["vacha", "sweet flag"],
    herb_pippali: ["pippali", "long pepper"],
    herb_maricha: ["maricha", "black pepper", "kali mirch"],
    herb_shunthi: ["shunthi", "ginger", "adrak", "sonth"],
    herb_dalchini: ["dalchini", "cinnamon"],
    herb_elaichi: ["elaichi", "cardamom"],
    herb_lavanga: ["lavanga", "clove", "laung"],
    herb_methi: ["methi", "fenugreek"],
    herb_kalmegh: ["kalmegh", "andrographis"],
    herb_manjistha: ["manjistha"],
    herb_chitrak: ["chitrak"],
    herb_bala: ["bala"],
    herb_jatamansi: ["jatamansi", "spikenard"],
    herb_kumari: ["kumari", "aloe vera", "aloe"],
    herb_tagar: ["tagar", "valerian"],
    herb_musta: ["musta", "nagarmotha"],
    herb_haritaki: ["haritaki", "harad"],
    herb_bibhitaki: ["bibhitaki", "baheda"],
    herb_sariva: ["sariva", "anantamool"],
    herb_chirata: ["chirata", "chirayita"],
    herb_ajwain: ["ajwain", "carom"],
    herb_jeera: ["jeera", "cumin"],
    herb_kalonji: ["kalonji", "nigella", "black seed"],
    herb_isabgol: ["isabgol", "psyllium"],
    herb_senna: ["senna"],
    herb_safed_musli: ["safed musli"],
    herb_kapikacchu: ["kapikacchu", "mucuna", "velvet bean"],
    herb_rasna: ["rasna"],
    herb_lodhra: ["lodhra"],
    herb_nagkesar: ["nagkesar"],
  };
  return map[herbId] || [];
}

// ============================================
// UNKNOWN HERB DETECTION (deterministic pre-scan)
// ============================================

const UNKNOWN_HERB_PATTERNS = [
  /\bvasaka\b/i, /\bvidari\b/i, /\bkaunch\b/i, /\bshatpushpa\b/i,
  /\bpathya\b/i, /\bdevdaru\b/i, /\bpriyangu\b/i, /\bkhadira\b/i,
  /\bgambhari\b/i, /\bbilva\b/i, /\bshyonaka\b/i,
];

/**
 * Detect if user is asking about a herb NOT in our verified database.
 * If true, return a canned response — bypass the LLM entirely.
 */
export function scanForUnknownHerb(message: string): {
  detected: boolean;
  herbName: string | null;
} {
  const hasKnownHerb = HERB_NAME_PATTERNS.some((p) => p.test(message));
  for (const pattern of UNKNOWN_HERB_PATTERNS) {
    if (pattern.test(message)) {
      return { detected: !hasKnownHerb, herbName: pattern.source.replace(/\\b/g, "").replace(/\\?/g, "") };
    }
  }
  return { detected: false, herbName: null };
}

export const UNKNOWN_HERB_RESPONSE = `I don't have verified safety and evidence data for that herb in my database yet. I can provide safety-checked information for the 50 herbs I have clinical data for. Would you like to explore one of those?`;

// ============================================
// PRE-BUILT ESCALATION RESPONSE
// ============================================

export const ESCALATION_RESPONSE = `I'm concerned about what you've described. These symptoms need immediate medical attention — they are beyond what herbal information can address.

**Please seek help now:**
- Emergency: **112**
- iCall: **9152987821**
- Vandrevala Foundation: **1860-2662-345**
- AASRA: **9820466726**

I cannot provide herbal information when there may be a medical emergency. Please get evaluated by a doctor first. We can discuss herbs once you've been cleared.`;
