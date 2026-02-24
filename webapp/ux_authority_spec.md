# UX Authority Upgrade Specification

**Purpose:** Make Ayurv feel like a trusted clinical tool, not a hobby project.

---

## 1. Landing Page Text Replacements

### Before:
```
Ayurvedic Risk Intelligence
Evidence-graded herb information with safety-first risk assessment.
10 herbs · A/B/C/D evidence grading · Drug interaction checking · Indian context
```

### After:
```
Ayurv — Herb Safety Intelligence
Check if an Ayurvedic herb is safe for you — based on your conditions, medications, and clinical evidence.
10 herbs · Drug interaction checks · Evidence-graded claims · Built for Indian healthcare
```

### Rationale:
- "Risk Intelligence" is abstract. "Check if a herb is safe for you" is a clear value proposition.
- Adding "your conditions, medications" makes it personal.
- "Built for Indian healthcare" is more authoritative than "Indian context".

---

### Disclaimer — Before:
```
This tool provides structured educational information about Ayurvedic herbs based on
classical references and available scientific evidence. It does NOT diagnose any medical
condition, prescribe any treatment, or replace professional medical advice.
```

### Disclaimer — After:
```
Ayurv checks Ayurvedic herbs against your health profile using published clinical evidence
and known drug interactions. It does NOT diagnose, prescribe, or replace your doctor.
Herbal products can interact with prescription medications — this tool helps you check.
```

### Rationale:
- Shorter, action-oriented.
- "published clinical evidence and known drug interactions" = more specific authority.
- "this tool helps you check" = clear utility.

---

## 2. Results Page Hierarchy Change

### Current order:
1. Header ("Your Risk Assessment")
2. Doctor Referral Banner (conditional)
3. Summary Chips (Blocked / Caution / Safe)
4. Blocked Herbs section
5. Caution Herbs section
6. Safe Herbs section
7. Chat CTA
8. Disclaimer + New Assessment

### Proposed order:
1. Header — change to "Your Safety Report"
2. **Quick Summary Card** (new) — 1-sentence plain English summary
3. Doctor Referral Banner (conditional)
4. Summary Chips
5. **Chat CTA moved UP** — "Have questions? Ask the Ayurv consultant" directly after chips
6. Blocked Herbs section
7. Caution Herbs section
8. Safe Herbs section
9. Disclaimer + New Assessment

### Quick Summary Card — Implementation:
```tsx
// New component: ResultsSummary.tsx
// Generates a 1-sentence summary based on assessment data

function getSummary(result: RiskAssessment): string {
  const { blocked_herbs, caution_herbs, safe_herbs } = result;

  if (blocked_herbs.length === 0 && caution_herbs.length === 0) {
    return `All ${safe_herbs.length} herbs appear safe for your profile. Tap any herb for details.`;
  }

  if (blocked_herbs.length > 0 && caution_herbs.length > 0) {
    return `${blocked_herbs.length} herb${blocked_herbs.length > 1 ? 's' : ''} not recommended for you, ${caution_herbs.length} need caution. ${safe_herbs.length} appear safe.`;
  }

  if (blocked_herbs.length > 0) {
    return `${blocked_herbs.length} herb${blocked_herbs.length > 1 ? 's' : ''} not recommended due to your health profile. ${safe_herbs.length} appear safe.`;
  }

  return `${caution_herbs.length} herb${caution_herbs.length > 1 ? 's' : ''} need caution with your profile. ${safe_herbs.length} appear safe.`;
}
```

---

## 3. Results Page — Text Replacements

### Section Headers

| Current | Proposed |
|---------|----------|
| "Your Risk Assessment" | "Your Safety Report" |
| "Not Recommended For You" | "Not Safe For You" |
| "Use With Caution" | "Use With Doctor Guidance" |
| "Generally Safe For You" | "Lower Risk For Your Profile" |

### Section Descriptions

| Current | Proposed |
|---------|----------|
| "These herbs have specific risks given your health profile. No dosage information is provided." | "These herbs have known risks with your conditions or medications. We do not show dosage for blocked herbs." |
| "These herbs have moderate concerns. Read each caution carefully. Professional guidance recommended." | "These herbs may interact with your profile. Read each warning. Discuss with your doctor before use." |
| "No specific contraindications found. Sorted by evidence relevance to your concern." | "No known contraindications for your profile. Sorted by strength of clinical evidence." |

### Chat CTA — Before:
```
Have questions about these results?
Chat with the Ayurv consultant for personalized, evidence-graded guidance
based on your health profile.
[Chat with Consultant]
```

### Chat CTA — After:
```
Want to understand your results?
Ask the Ayurv consultant about specific herbs, dosages, or interactions —
it knows your health profile.
[Ask About My Results]
```

---

## 4. Chat-First Flow Modification

### Current flow:
```
Landing → Intake (3 steps) → Results → Chat (optional)
```

### Proposed flow:
```
Landing → Intake (3 steps) → Results → Chat (prominent)
                                          ↑
                                    Auto-open on first visit
```

### Implementation:

**Option A: Auto-scroll to chat CTA on results page**
```tsx
// In results/page.tsx useEffect:
useEffect(() => {
  if (result && !sessionStorage.getItem("ayurv_chat_prompted")) {
    setTimeout(() => {
      document.getElementById("chat-cta")?.scrollIntoView({ behavior: "smooth" });
      sessionStorage.setItem("ayurv_chat_prompted", "true");
    }, 2000);
  }
}, [result]);
```

**Option B: Floating chat button on results page**
```tsx
// Persistent floating button at bottom-right
<button
  onClick={() => router.push("/chat")}
  className="fixed bottom-6 right-6 bg-ayurv-primary text-white rounded-full
             w-14 h-14 shadow-lg flex items-center justify-center
             hover:bg-ayurv-secondary transition-colors z-50"
  aria-label="Chat with consultant"
>
  <ChatIcon />
</button>
```

**Recommended: Option B** — Non-intrusive, always visible, standard UX pattern.

---

## 5. Evidence Transparency Drawer

### Purpose:
When a user taps an evidence grade badge (e.g., "Grade B"), show the underlying research in a slide-up drawer.

### Trigger:
Click/tap on any `EvidenceBadge` component in results or chat.

### Drawer Content:
```
┌─────────────────────────────────────┐
│  Evidence: Ashwagandha for Stress   │
│  ─────────────────────────────────  │
│  Grade B — Moderate Evidence        │
│                                     │
│  Claim: Reduces cortisol and        │
│  perceived stress in adults         │
│                                     │
│  Summary: Multiple RCTs show        │
│  23-44% cortisol reduction vs       │
│  placebo over 8-12 weeks            │
│                                     │
│  Mechanism: Modulates HPA axis      │
│  via withanolide compounds          │
│                                     │
│  Active Compounds:                  │
│  Withaferin A, Withanolide D        │
│                                     │
│  Key References:                    │
│  • Chandrasekhar 2012, IJEM         │
│  • Salve 2019, Cureus               │
│                                     │
│  What does Grade B mean?            │
│  Moderate evidence from smaller     │
│  clinical studies. Results are      │
│  promising but need larger trials.  │
│                                     │
│  [Close]                            │
└─────────────────────────────────────┘
```

### Implementation Spec:

```tsx
// components/EvidenceDrawer.tsx
interface EvidenceDrawerProps {
  open: boolean;
  onClose: () => void;
  herbName: string;
  claims: EvidenceClaimResult[];
}

// Fetches from: GET /api/evidence?herb_id=herb_ashwagandha
// New API endpoint needed: app/api/evidence/route.ts
// Returns: evidence_claims rows for the herb

// Grade explanation map (static):
const GRADE_EXPLANATIONS: Record<string, string> = {
  "A": "Strong evidence from multiple large clinical trials or meta-analyses.",
  "B": "Moderate evidence from smaller clinical studies. Promising but needs larger trials.",
  "B-C": "Moderate to limited evidence. Some clinical data supplemented by preclinical studies.",
  "C": "Limited evidence. Mainly laboratory or animal studies. Human data is sparse.",
  "C-D": "Very limited evidence. Mostly preclinical with anecdotal clinical reports.",
  "D": "Based on traditional Ayurvedic texts only. No clinical studies available.",
};
```

### Required New Files:
1. `components/EvidenceDrawer.tsx` — Drawer UI component
2. `app/api/evidence/route.ts` — Evidence claims API endpoint

### Required Modifications:
1. `components/HerbCard.tsx` — Make EvidenceBadge clickable, pass herbId
2. `app/results/page.tsx` — Add EvidenceDrawer state management

---

## 6. Herb Card Text Improvements

### Blocked Herb Card — Before:
```
[herb name]
[reason text]
```

### Blocked Herb Card — After:
```
[herb name] — NOT SAFE
Why: [reason text]
What to do: Discuss alternatives with your doctor.
```

### Caution Herb Card — Before:
```
[herb name]
[cautions listed]
[dosage info]
```

### Caution Herb Card — After:
```
[herb name] — USE WITH CARE
⚠ [number] warnings for your profile:
[cautions listed with icons]
───
Dosage (discuss with doctor first):
[dosage info]
```

### Safe Herb Card — Before:
```
[herb name]
[evidence grade badge]
[dosage info]
```

### Safe Herb Card — After:
```
[herb name] — LOWER RISK
Evidence: [grade badge — clickable]
[1-line evidence summary if available]
───
Standard dosage range:
[dosage info]
```
