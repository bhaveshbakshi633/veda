# Ayurv - Checkpoint Log

## Checkpoint [2026-02-16 14:30]

### What Was Accomplished
- Full Phase 1 completion: 10 priority Ayurvedic herb database entries built
- Framework v2 (High-Authority Mode) established and battle-tested
- Evidence grading system (A/B/C/D) applied consistently across all entries
- Risk coding system (🟢🟡🔴) applied with mechanistic explanations
- Misuse patterns documented with Indian population context
- Drug interaction tables with severity ratings for all 10 herbs
- Special sections where needed: botanical clarification (Brahmi), religious sensitivity (Tulsi), hepatotoxicity crisis (Guduchi), cognitive hype control (Brahmi), bioavailability analysis (Haridra)

### Repository
- Remote: https://github.com/bhaveshbakshi633/veda
- Initial push: 2026-02-16

### Files Created
```
ayurv_context.md          — Project context and principles
ayurv_plan.md             — Implementation plan and progress
ayurv_checkpoint.md       — This file
herbs/ashwagandha.md      — 12KB
herbs/triphala.md         — 32KB
herbs/tulsi.md            — 42KB
herbs/brahmi.md           — 47KB
herbs/shatavari.md        — 16KB
herbs/guduchi.md          — 19KB
herbs/haridra.md          — 20KB
herbs/arjuna.md           — 18KB
herbs/amalaki.md          — 18KB
herbs/yashtimadhu.md      — 26KB
```
Total herb content: ~250KB across 10 entries

### Key Decisions Made
1. Evidence grading: A/B/C/D system (not inflated — most claims land at B-C)
2. Risk coding: 🟢🟡🔴 with mandatory WHY explanation
3. Misuse patterns: India-specific, named real patterns, not generic warnings
4. Drug interactions: Severity-rated, mechanism-explained
5. Brahmi: Chose *Bacopa monnieri* as primary (per API listing), flagged *Centella* confusion
6. Guduchi: Acknowledged hepatotoxicity reports honestly while noting adulteration/quality concerns
7. Yashtimadhu: Treated as most pharmacologically dangerous herb — glycyrrhizin toxicity mechanism fully explained
8. Arjuna: Treated as cardiac drug territory, not casual supplement
9. Haridra: Bioavailability problem positioned as central pharmacological reality
10. Tulsi: Religious reverence acknowledged, then separated from pharmacological assessment

### Known Issues / Open Questions
- Ashwagandha entry still on framework v1 (no risk coding, simpler evidence table) — may need upgrade to v2 format
- Cross-herb interaction matrix not yet built
- Structured data format (JSON) not yet created from markdown entries
- No AI prompt/system integration yet — entries are reference documents only

### Next Steps
- Phase 2: Consultancy logic (intake questionnaire, Dosha analysis, recommendation engine)
- Consider upgrading Ashwagandha to framework v2
- Build herb-herb interaction cross-reference
- Decide on platform/delivery mechanism
