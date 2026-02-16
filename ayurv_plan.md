# Ayurv - Implementation Plan

## Phase 1: Herb Database Foundation ✅ COMPLETE
- [x] Define master prompt and response framework
- [x] Create entry: Ashwagandha (baseline framework, DILI signal, thyroid stimulation)
- [x] Create entry: Triphala (multi-botanical, evidence grading A/B/C/D, risk coding, laxative dependency, misuse patterns)
- [x] Create entry: Tulsi (species clarification, religious sensitivity, COVID-era misuse, fertility signal, essential oil AVOID)
- [x] Create entry: Brahmi (botanical disambiguation Bacopa vs Centella, cognitive hype control, paediatric misuse, exam-time megadosing, neuropsychiatric drug interactions)
- [x] Create entry: Shatavari (phytoestrogen myth dismantled, estrogen-sensitive condition safety, PCOS overclaim, galactogogue evidence)
- [x] Create entry: Guduchi/Giloy (COVID hepatotoxicity crisis, DILI case series, immunostimulant vs immunosuppressant clash, adulteration)
- [x] Create entry: Haridra/Turmeric (curcumin bioavailability problem, piperine CYP inhibition, cancer self-medication danger, culinary vs supplement distinction)
- [x] Create entry: Arjuna (cardiac pharmacology, inotropic/chronotropic effects, digoxin/beta-blocker HIGH interactions, self-prescribing danger)
- [x] Create entry: Amalaki/Amla (Vitamin C reality check, tannin antioxidant contribution, murabba sugar paradox, oxalate concerns)
- [x] Create entry: Yashtimadhu/Mulethi (glycyrrhizin pseudohyperaldosteronism, digoxin CRITICAL interaction, pregnancy fetal exposure, potassium wasting)
- [x] All 10 priority herbs complete
- [ ] Standardize evidence-level tagging system (JSON/structured data format)
- [ ] Cross-reference interaction matrix (herb-herb interactions)

## Phase 2: Consultancy Logic
- [ ] Structured intake questionnaire flow
- [ ] Dosha pattern analysis logic (Prakriti assessment)
- [ ] Lifestyle/diet suggestion templates (Ritucharya — seasonal)
- [ ] Safety boundary enforcement layer
- [ ] Red flag detection and escalation flow
- [ ] Herb recommendation engine (constitution-aware, medication-aware)

## Phase 3: Platform Integration
- [ ] Decide platform (website, chatbot, API)
- [ ] UI/UX for herb database browsing
- [ ] Consultancy mode interface
- [ ] Search and filter by condition, Dosha, evidence level, risk code
- [ ] Disclaimer and consent flow

## Completed Herb Database (10/10)

| # | Herb | File | Key Challenge Tested |
|---|------|------|---------------------|
| 1 | Ashwagandha | `herbs/ashwagandha.md` | Framework baseline, DILI, thyroid |
| 2 | Triphala | `herbs/triphala.md` | Multi-botanical, laxative dependency |
| 3 | Tulsi | `herbs/tulsi.md` | Religious sensitivity, immunity hype |
| 4 | Brahmi | `herbs/brahmi.md` | Botanical confusion, cognitive hype |
| 5 | Shatavari | `herbs/shatavari.md` | Phytoestrogen myth, gender marketing |
| 6 | Guduchi | `herbs/guduchi.md` | Hepatotoxicity crisis, COVID controversy |
| 7 | Haridra | `herbs/haridra.md` | Bioavailability problem, piperine danger |
| 8 | Arjuna | `herbs/arjuna.md` | Cardiac pharmacology, drug interactions |
| 9 | Amalaki | `herbs/amalaki.md` | Vitamin C reality, dietary vs supplement |
| 10 | Yashtimadhu | `herbs/yashtimadhu.md` | Glycyrrhizin toxicity, lethal interactions |
