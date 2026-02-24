# AYURV — Project Status Ledger

**Last Updated:** 2026-02-18
**Current Version:** v0.9.0-mvp
**Target Version:** v1.0.0-clinical

---

## Track Status

### Intelligence Track
| Item | Status | Blocking |
|------|--------|----------|
| intelligence_test_suite.json (25 cases) | DONE | — |
| Model comparison harness | DESIGNED | Needs runner script |
| Scoring rubric | DONE | — |
| Model swap to larger Ollama model | NOT STARTED | Test suite first |
| Structured output enforcement | NOT STARTED | — |

### Reliability Track
| Item | Status | Blocking |
|------|--------|----------|
| tests/safety_edge_cases.ts (50 cases) | DONE | — |
| Vitest setup + config | NOT STARTED | — |
| CI pipeline (GitHub Actions) | NOT STARTED | Tests first |
| API contract tests | NOT STARTED | — |
| Load testing | NOT STARTED | — |

### UX Track
| Item | Status | Blocking |
|------|--------|----------|
| Results page text authority upgrade | DESIGNED | Implementation |
| Chat-first flow modification | DESIGNED | Implementation |
| Evidence transparency drawer | DESIGNED | Implementation |
| Landing page authority upgrade | DESIGNED | Implementation |
| Mobile responsiveness audit | NOT STARTED | — |

### Clinical Depth Track
| Item | Status | Blocking |
|------|--------|----------|
| conversation_state table schema | DONE | Migration |
| State update logic | DONE | — |
| Persist vs expire rules | DONE | — |
| Anti-hallucination guards | DONE | — |
| Migration file | DONE | DB reset |

---

## Open Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| llama3.1:8b instruction following is inconsistent | HIGH | Test suite will quantify; upgrade path to 70b or Mistral |
| No automated tests = regressions undetected | HIGH | Reliability track delivers tests first |
| In-memory session state lost on restart | MEDIUM | conversation_state table solves this |
| No rate limiting on API endpoints | MEDIUM | Add middleware before public deploy |
| Seed data may have incomplete interaction coverage | MEDIUM | Audit herb×condition matrix for gaps |
| No HTTPS in local dev | LOW | Supabase handles in production |

---

## Completed This Sprint

- [x] Deterministic risk engine (6-step pipeline)
- [x] 10 herb monographs with evidence grading
- [x] Intake form (redesigned to 3 steps)
- [x] Results page (blocked/caution/safe)
- [x] Chat endpoint (Ollama integration)
- [x] Orchestrator enforcement (39 banned patterns)
- [x] Red flag escalation (8 triggers, terminal state)
- [x] Audit logging (append-only)
- [x] Intelligence test suite (25 cases)
- [x] Safety edge case tests (50 scenarios)
- [x] UX authority upgrade spec
- [x] Conversation state persistence design

---

## Next 5 Executable Tasks

1. **Install Vitest + run safety_edge_cases.ts** — Get the 50 tests passing against live Supabase
2. **Apply conversation_state migration** — `npx supabase db reset` with 002 migration
3. **Implement UX text replacements** — Apply before/after copy changes to results + landing pages
4. **Run intelligence test suite** — Execute 25 cases against llama3.1:8b, record baseline scores
5. **Wire conversation_state into chat route** — Replace in-memory Map with DB persistence
