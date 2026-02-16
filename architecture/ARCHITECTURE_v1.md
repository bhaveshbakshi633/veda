# Ayurv Risk Intelligence WebApp v1 — Architecture Document

**Version:** 1.0
**Date:** 2026-02-16
**Status:** Design specification — pre-implementation
**Classification:** Healthcare safety engine — regulatory-grade design intent

---

## 1. System Architecture

### 1.1 Stack Decision

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | Next.js 14+ (App Router) | SSR for SEO (herb pages need indexing). React ecosystem for component libraries. Built-in API routes eliminate separate backend for MVP. TypeScript enforced. |
| **Backend** | Next.js API Routes (MVP) → FastAPI (scale) | MVP: API routes inside Next.js — zero deployment complexity, single codebase. Scale: FastAPI (Python) when risk engine logic needs ML/NLP or heavy computation. Python has superior medical/scientific library ecosystem (pandas, scipy, nltk). |
| **Database** | PostgreSQL | Relational data with strict referential integrity. Herb-condition-medication relationships are inherently relational. JSONB columns for flexible nested data (evidence claims, dosage ranges) without losing query power. ACID compliance matters for medical data. Not MongoDB — medical risk mappings need enforced foreign keys, not eventual consistency. |
| **ORM** | Prisma | Type-safe queries from TypeScript. Schema-first design. Migration management. |
| **Auth** | NextAuth.js (session-based) | No user accounts for MVP browse mode. Auth required only for: intake form submission, saved consultations, and future doctor dashboard. |
| **Hosting** | Vercel (frontend) + Supabase (PostgreSQL) | Vercel: zero-config Next.js deployment, edge functions, CDN. Supabase: managed PostgreSQL with row-level security, built-in auth, and real-time if needed later. Both have generous free tiers for MVP. |
| **Search** | PostgreSQL full-text search (MVP) → Typesense (scale) | pg_trgm + tsvector handles herb/condition search at MVP scale. Typesense if fuzzy multilingual search needed (Hindi/Sanskrit/English). |

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                           │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────────┐  │
│  │ Landing  │→ │ Intake   │→ │ Risk      │→ │ Herb Explorer /   │  │
│  │ Page     │  │ Form     │  │ Summary   │  │ Safety Panel      │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────────────┘  │
│                      │              ▲                                │
│                      │              │                                │
│              ┌───────▼──────────────┴──────────┐                    │
│              │     DISCLAIMER GATE              │                    │
│              │  (must accept before results)    │                    │
│              └──────────────────────────────────┘                    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS SERVER (Vercel)                          │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────────────────────────────┐   │
│  │  API Routes      │  │  Server Components (SSR)                │   │
│  │                  │  │  - Herb pages (static generation)       │   │
│  │  POST /intake    │  │  - Evidence tables                      │   │
│  │  POST /assess    │  │  - Risk coding displays                 │   │
│  │  GET  /herbs     │  └─────────────────────────────────────────┘   │
│  │  GET  /herbs/:id │                                                │
│  │  GET  /search    │                                                │
│  └────────┬─────────┘                                                │
│           │                                                          │
│  ┌────────▼──────────────────────────────────────────────────────┐   │
│  │                    RISK ENGINE (Core)                          │   │
│  │                                                                │   │
│  │  intake_validator  →  red_flag_detector  →  herb_filter       │   │
│  │       →  caution_scorer  →  evidence_ranker  →  output_gen    │   │
│  │                                                                │   │
│  │  All decisions logged to audit_log table                       │   │
│  └────────┬──────────────────────────────────────────────────────┘   │
│           │                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │ SQL (Prisma)
            ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL (Supabase)                              │
│                                                                      │
│  ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │  herbs   │ │ conditions │ │ medications  │ │ interactions     │  │
│  └──────────┘ └────────────┘ └──────────────┘ └──────────────────┘  │
│  ┌──────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────────┐  │
│  │ evidence │ │ risk_maps  │ │ intake_logs  │ │ audit_log        │  │
│  └──────────┘ └────────────┘ └──────────────┘ └──────────────────┘  │
│  ┌──────────────────┐ ┌───────────────────────┐                      │
│  │ disclaimer_log   │ │ sessions              │                      │
│  └──────────────────┘ └───────────────────────┘                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 1.3 Data Storage Strategy

| Data Type | Storage Method | Why |
|-----------|---------------|-----|
| Herb core data (names, properties, Dosha) | Relational tables with fixed columns | Queryable, enforceable, indexable |
| Evidence claims | JSONB column on `evidence_claims` table | Variable structure per claim. Needs to store claim text, grade, notes, references. JSONB allows flexible nesting while remaining queryable. |
| Dosage ranges | JSONB column on `herbs` table | Multiple forms per herb (churna, extract, decoction) with different ranges. Schema varies per herb. |
| Risk mappings | Junction table `herb_condition_risks` | Many-to-many with risk_code and explanation. Relational integrity required — if a condition is deleted, risk mappings must cascade. |
| Interaction matrix | Junction table `herb_medication_interactions` | Many-to-many with severity, mechanism, evidence_type. Must enforce referential integrity on both sides. |
| User intakes | Structured JSONB + relational references | Intake data stored as JSONB (flexible, forward-compatible) with foreign keys to conditions and medications where possible. |
| Audit logs | Append-only table with JSONB payload | Every risk engine decision logged with full input/output. Never deleted. JSONB for flexibility. Timestamped. |

---

## 2. Data Schema Design

### 2.A Herb Object

```json
{
  "id": "herb_ashwagandha",
  "botanical_name": "Withania somnifera",
  "family": "Solanaceae",
  "names": {
    "sanskrit": "Ashwagandha",
    "hindi": "Asgandh",
    "english": "Indian Ginseng, Winter Cherry",
    "tamil": "Amukkira",
    "botanical_synonyms": []
  },
  "parts_used": ["root"],
  "classification": {
    "rasayana": true,
    "medhya": false,
    "hridya": false,
    "classical_groups": ["Balya", "Brimhaniya"]
  },
  "ayurvedic_profile": {
    "rasa": ["tikta", "kashaya", "madhura"],
    "guna": ["laghu", "snigdha"],
    "virya": "ushna",
    "vipaka": "madhura",
    "dosha_action": {
      "vata": { "effect": "pacifies", "strength": "strong" },
      "pitta": { "effect": "may_aggravate", "strength": "mild", "note": "Use with caution in Pitta-dominant individuals due to Ushna virya" },
      "kapha": { "effect": "pacifies", "strength": "moderate" }
    }
  },
  "evidence_claims": [
    {
      "claim_id": "ashwa_stress_01",
      "claim": "Stress and cortisol reduction",
      "evidence_grade": "A",
      "evidence_grade_definition": "Multiple human RCTs or meta-analysis",
      "summary": "Multiple RCTs. Significant cortisol reduction (14-28%) in controlled studies.",
      "key_references": [
        {
          "author": "Salve J et al.",
          "year": 2019,
          "journal": "Cureus",
          "title": "Adaptogenic and anxiolytic effects of Ashwagandha root extract"
        }
      ],
      "active_compounds": ["withanolides"],
      "mechanism": "HPA axis modulation, cortisol regulation"
    },
    {
      "claim_id": "ashwa_anxiety_01",
      "claim": "Anxiety reduction",
      "evidence_grade": "A",
      "evidence_grade_definition": "Multiple human RCTs or meta-analysis",
      "summary": "Several double-blind RCTs. Comparable to some anxiolytics in specific trials.",
      "key_references": [],
      "active_compounds": ["withanolides"],
      "mechanism": "GABAergic activity"
    },
    {
      "claim_id": "ashwa_sleep_01",
      "claim": "Sleep quality improvement",
      "evidence_grade": "B",
      "evidence_grade_definition": "Small clinical trials with positive results",
      "summary": "Clinically meaningful improvement in insomnia scores. Active compound: Triethylene glycol (from leaves).",
      "key_references": [
        {
          "author": "Langade D et al.",
          "year": 2019,
          "journal": "Cureus",
          "title": "Efficacy and safety of Ashwagandha root extract in insomnia and anxiety"
        }
      ],
      "active_compounds": ["triethylene_glycol"],
      "mechanism": "GABAergic activity"
    }
  ],
  "risk_conditions": [
    {
      "condition_id": "cond_pregnancy",
      "risk_code": "red",
      "risk_label": "Avoid Unless Supervised",
      "explanation": "Traditional texts classify it as Garbhashaya Shuddikara (uterine stimulant action noted). Insufficient safety data. Some animal studies suggest teratogenic potential at high doses.",
      "overrides_all_recommendations": true
    },
    {
      "condition_id": "cond_hyperthyroid",
      "risk_code": "red",
      "risk_label": "Avoid Unless Supervised",
      "explanation": "May increase thyroid hormone levels (T3, T4). Can worsen hyperthyroid conditions.",
      "overrides_all_recommendations": true
    },
    {
      "condition_id": "cond_autoimmune",
      "risk_code": "yellow",
      "risk_label": "Use With Caution",
      "explanation": "Immunomodulatory effects could theoretically stimulate an already overactive immune response. Evidence is mixed.",
      "overrides_all_recommendations": false
    },
    {
      "condition_id": "cond_diabetes_medicated",
      "risk_code": "yellow",
      "risk_label": "Use With Caution",
      "explanation": "May lower blood sugar. Risk of hypoglycemia if combined with antidiabetic drugs. Monitor glucose.",
      "overrides_all_recommendations": false
    }
  ],
  "interaction_list": [
    {
      "medication_id": "med_thyroid_hormones",
      "severity": "moderate_high",
      "interaction_type": "proven",
      "mechanism": "May increase T3/T4 levels. Potentiation risk.",
      "clinical_action": "Monitor thyroid function. Inform endocrinologist."
    },
    {
      "medication_id": "med_benzodiazepines",
      "severity": "moderate",
      "interaction_type": "theoretical",
      "mechanism": "Additive sedation via GABAergic activity.",
      "clinical_action": "Monitor for excessive sedation."
    },
    {
      "medication_id": "med_antidiabetics",
      "severity": "moderate",
      "interaction_type": "theoretical",
      "mechanism": "Additive blood sugar lowering. Hypoglycemia risk.",
      "clinical_action": "Monitor blood glucose."
    },
    {
      "medication_id": "med_immunosuppressants",
      "severity": "moderate_high",
      "interaction_type": "theoretical",
      "mechanism": "May counteract immunosuppression due to immune-stimulating effects.",
      "clinical_action": "Inform treating physician. Avoid without supervision."
    }
  ],
  "misuse_patterns": [
    {
      "pattern_id": "ashwa_misuse_01",
      "title": "Exam-time megadosing",
      "description": "Students take 2-3x doses weeks before exams expecting instant cognitive enhancement.",
      "why_harmful": "Effects require 6-8 weeks. Overdosing causes GI distress and sedation.",
      "prevalence": "common"
    }
  ],
  "dosage_ranges": {
    "disclaimer": "This is general educational information, not a medical prescription.",
    "forms": [
      {
        "form": "Root powder (Churna)",
        "range_min": "3g",
        "range_max": "6g",
        "unit": "per day",
        "notes": "Traditionally taken with warm milk, ghee, or honey. Divided into 2 doses."
      },
      {
        "form": "Standardized extract (2.5-5% withanolides)",
        "range_min": "300mg",
        "range_max": "600mg",
        "unit": "per day",
        "notes": "Most studied form in clinical trials. Usually divided into 2 doses."
      },
      {
        "form": "KSM-66 (root-only extract)",
        "range_min": "300mg",
        "range_max": "600mg",
        "unit": "per day",
        "notes": "Full-spectrum root extract. Well-studied."
      }
    ],
    "time_to_effect": {
      "stress_anxiety": "2-4 weeks",
      "strength_vitality": "6-8 weeks"
    },
    "max_studied_duration_weeks": 12,
    "long_term_safety_data": false
  },
  "red_flags": [
    {
      "symptom": "Yellowing of skin/eyes, dark urine, upper right abdominal pain",
      "severity": "urgent",
      "action": "Stop immediately. Seek liver function testing.",
      "rationale": "Potential hepatotoxicity — DILI case reports exist."
    },
    {
      "symptom": "Rapid heart rate, tremors, excessive sweating, unexplained weight loss",
      "severity": "urgent",
      "action": "Stop use. Check thyroid function.",
      "rationale": "Possible thyroid overstimulation."
    },
    {
      "symptom": "Skin rash, swelling, difficulty breathing",
      "severity": "emergency",
      "action": "Stop all herbal products. Seek emergency care.",
      "rationale": "Allergic reaction."
    }
  ],
  "side_effects": {
    "common": [
      "GI discomfort (nausea, diarrhea, stomach upset) — especially on empty stomach",
      "Drowsiness/sedation — especially at higher doses"
    ],
    "uncommon": [
      "Headache",
      "Skin rash (rare allergic)",
      "Increased appetite",
      "Vivid dreams"
    ],
    "rare": [
      "Hepatotoxicity — multiple case reports (2020-2024). Mechanism unclear.",
      "Thyroid overstimulation symptoms in susceptible individuals",
      "Vertigo"
    ]
  },
  "metadata": {
    "framework_version": "v2",
    "last_updated": "2026-02-16",
    "entry_author": "system",
    "review_status": "initial",
    "source_monograph": "herbs/ashwagandha.md"
  }
}
```

### 2.B Condition Object

```json
{
  "id": "cond_pregnancy",
  "condition_name": "Pregnancy",
  "category": "reproductive",
  "severity_level": "high",
  "description": "Active pregnancy at any trimester.",
  "related_herb_risks": [
    {
      "herb_id": "herb_ashwagandha",
      "risk_code": "red",
      "reason": "Uterine stimulant properties. Animal teratogenicity data."
    },
    {
      "herb_id": "herb_tulsi",
      "risk_code": "red",
      "reason": "Anti-implantation effects in animal models. Ursolic acid concerns."
    },
    {
      "herb_id": "herb_yashtimadhu",
      "risk_code": "red",
      "reason": "Glycyrrhizin crosses placenta. Finnish cohort: adverse fetal outcomes at >500mg glycyrrhizin/week."
    },
    {
      "herb_id": "herb_guduchi",
      "risk_code": "red",
      "reason": "Insufficient safety data. Immunostimulatory effects."
    },
    {
      "herb_id": "herb_arjuna",
      "risk_code": "red",
      "reason": "Cardiac-active herb. Not for pregnancy self-medication."
    },
    {
      "herb_id": "herb_shatavari",
      "risk_code": "yellow",
      "reason": "Classical texts consider it safe during pregnancy. Modern safety RCTs absent. Steroidal saponins theoretical concern."
    },
    {
      "herb_id": "herb_triphala",
      "risk_code": "red",
      "reason": "Haritaki is Garbhashaya stimulant. Apana Vayu stimulation may promote contractions."
    },
    {
      "herb_id": "herb_haridra",
      "risk_code": "yellow",
      "reason": "Culinary turmeric safe. Curcumin supplements at high doses: insufficient safety data."
    },
    {
      "herb_id": "herb_amalaki",
      "risk_code": "green",
      "reason": "Dietary Amla safe. Long history of pregnancy use."
    },
    {
      "herb_id": "herb_brahmi",
      "risk_code": "red",
      "reason": "Insufficient safety data. Saponins may irritate uterine tissue."
    }
  ],
  "escalation_required": false,
  "escalation_reason": null,
  "intake_questions": [
    "Which trimester?",
    "Any complications (gestational diabetes, pre-eclampsia, high-risk)?",
    "Currently under obstetrician care?"
  ],
  "default_guidance": "During pregnancy, avoid all herbal supplements unless specifically advised by your obstetrician or a qualified Ayurvedic practitioner experienced in Garbhini Paricharya. Dietary herbs (Amla, culinary turmeric) at normal food quantities are generally considered safe."
}
```

```json
{
  "id": "cond_chest_pain",
  "condition_name": "Chest pain (active)",
  "category": "emergency",
  "severity_level": "critical",
  "description": "User reports active chest pain, tightness, or pressure.",
  "related_herb_risks": [],
  "escalation_required": true,
  "escalation_reason": "Possible cardiac emergency. No herbal information should be provided. Immediate medical evaluation required.",
  "intake_questions": [],
  "default_guidance": "STOP. Chest pain requires immediate medical evaluation. Please call emergency services or visit the nearest hospital. Do not attempt to self-treat with herbal or any other remedies."
}
```

### 2.C Medication Object

```json
{
  "id": "med_digoxin",
  "medication_name": "Digoxin",
  "medication_class": "Cardiac glycoside",
  "common_brands_india": ["Lanoxin", "Digox"],
  "therapeutic_area": "cardiology",
  "narrow_therapeutic_index": true,
  "interaction_severity_profile": {
    "herb_ashwagandha": { "severity": "low", "type": "theoretical" },
    "herb_arjuna": { "severity": "high", "type": "pharmacological", "mechanism": "Additive positive inotropic effect. Risk of digoxin-like toxicity." },
    "herb_yashtimadhu": { "severity": "critical", "type": "proven", "mechanism": "Glycyrrhizin-induced hypokalemia potentiates digoxin toxicity. Potentially fatal. Case reports exist." }
  },
  "affected_herbs": [
    {
      "herb_id": "herb_arjuna",
      "severity": "high",
      "action": "Do not combine without cardiologist supervision."
    },
    {
      "herb_id": "herb_yashtimadhu",
      "severity": "critical",
      "action": "AVOID. Potentially fatal interaction. Hypokalemia + digoxin = cardiac arrhythmia risk."
    }
  ],
  "general_warning": "Digoxin has a narrow therapeutic index. Any herbal supplement that affects potassium levels, cardiac contractility, or heart rate must be disclosed to the prescribing cardiologist.",
  "metadata": {
    "last_updated": "2026-02-16",
    "source": "Standard pharmacology references + herb database cross-reference"
  }
}
```

```json
{
  "id": "med_ssris",
  "medication_name": "SSRIs (Selective Serotonin Reuptake Inhibitors)",
  "medication_class": "Antidepressant",
  "common_brands_india": ["Fluoxetine/Fludac", "Sertraline/Daxid", "Escitalopram/Nexito"],
  "therapeutic_area": "psychiatry",
  "narrow_therapeutic_index": false,
  "interaction_severity_profile": {
    "herb_brahmi": { "severity": "moderate", "type": "theoretical", "mechanism": "Brahmi upregulates serotonin synthesis. Theoretical serotonin syndrome risk." },
    "herb_ashwagandha": { "severity": "low", "type": "theoretical" },
    "herb_yashtimadhu": { "severity": "low_moderate", "type": "theoretical" }
  },
  "affected_herbs": [
    {
      "herb_id": "herb_brahmi",
      "severity": "moderate",
      "action": "Inform psychiatrist before combining. Monitor for agitation, tremor, restlessness."
    }
  ],
  "general_warning": "SSRIs affect serotonin pathways. Herbs with serotonergic activity (Brahmi, Shankhpushpi) may create additive effects. Always inform your psychiatrist about herbal supplement use."
}
```

### 2.D Intake Schema

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "AyurvIntakeForm",
  "type": "object",
  "required": ["age", "sex", "pregnancy_status", "chronic_conditions", "medications", "user_goal", "disclaimer_accepted"],
  "properties": {
    "session_id": {
      "type": "string",
      "format": "uuid",
      "description": "Auto-generated. Links intake to risk assessment output and audit log."
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "disclaimer_accepted": {
      "type": "boolean",
      "const": true,
      "description": "User MUST accept disclaimer before form submission. Cannot be false."
    },
    "age": {
      "type": "integer",
      "minimum": 1,
      "maximum": 120,
      "description": "Years. Validated integer."
    },
    "age_group": {
      "type": "string",
      "enum": ["child_under_6", "child_6_12", "adolescent_13_17", "adult_18_45", "adult_46_65", "elderly_over_65"],
      "description": "Auto-derived from age. Used for risk filtering."
    },
    "sex": {
      "type": "string",
      "enum": ["male", "female", "other"],
      "description": "Biological sex. Relevant for pregnancy, fertility, hormone-sensitive conditions."
    },
    "pregnancy_status": {
      "type": "string",
      "enum": ["not_pregnant", "pregnant_trimester_1", "pregnant_trimester_2", "pregnant_trimester_3", "trying_to_conceive", "lactating", "not_applicable"],
      "description": "Mandatory. 'not_applicable' for male users."
    },
    "chronic_conditions": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "none",
          "hypertension",
          "diabetes_type_1",
          "diabetes_type_2",
          "hypothyroid",
          "hyperthyroid",
          "heart_failure",
          "coronary_artery_disease",
          "arrhythmia",
          "asthma",
          "copd",
          "kidney_disease_mild",
          "kidney_disease_moderate_severe",
          "liver_disease",
          "peptic_ulcer",
          "gerd",
          "ibs_constipation",
          "ibs_diarrhea",
          "ibd",
          "autoimmune_lupus",
          "autoimmune_ra",
          "autoimmune_ms",
          "autoimmune_hashimotos",
          "autoimmune_graves",
          "autoimmune_other",
          "bleeding_disorder",
          "iron_overload",
          "kidney_stones",
          "epilepsy",
          "depression",
          "anxiety_disorder",
          "bipolar_disorder",
          "breast_cancer_history",
          "endometriosis",
          "uterine_fibroids",
          "pcos",
          "obesity",
          "underweight",
          "scheduled_surgery_within_4_weeks",
          "organ_transplant",
          "other"
        ]
      },
      "description": "Multi-select. 'none' clears array. 'other' triggers free-text but is NOT used for risk engine logic — only logged."
    },
    "medications": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "none",
          "antidiabetic_oral",
          "insulin",
          "antihypertensive_ace_arb",
          "antihypertensive_beta_blocker",
          "antihypertensive_ccb",
          "antihypertensive_diuretic_loop",
          "antihypertensive_diuretic_thiazide",
          "diuretic_potassium_sparing",
          "digoxin",
          "warfarin",
          "aspirin_antiplatelet",
          "clopidogrel",
          "doac_anticoagulant",
          "statin",
          "ssri",
          "snri",
          "benzodiazepine",
          "antiepileptic",
          "lithium",
          "antipsychotic",
          "thyroid_levothyroxine",
          "antithyroid_medication",
          "corticosteroid_oral",
          "immunosuppressant",
          "methotrexate",
          "anti_tb_drugs",
          "chemotherapy",
          "tamoxifen",
          "aromatase_inhibitor",
          "oral_contraceptive",
          "hrt",
          "iron_supplement",
          "nsaid_regular",
          "ppi_antacid",
          "other"
        ]
      },
      "description": "Multi-select. Maps to medication objects for interaction checking."
    },
    "current_herbs": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Herbs user is already taking. Free-text + autocomplete from herb database. Used for herb-herb interaction checking."
    },
    "symptom_primary": {
      "type": "string",
      "enum": [
        "general_wellness",
        "stress_anxiety",
        "sleep_issues",
        "digestive_issues",
        "constipation",
        "acidity_reflux",
        "joint_pain",
        "skin_issues",
        "hair_issues",
        "respiratory_cold_cough",
        "low_energy_fatigue",
        "memory_concentration",
        "weight_management",
        "immunity_general",
        "reproductive_health",
        "menstrual_issues",
        "menopausal_symptoms",
        "blood_sugar_concern",
        "cholesterol_concern",
        "heart_health",
        "other"
      ],
      "description": "Structured selection. NOT free-text diagnosis."
    },
    "symptom_duration": {
      "type": "string",
      "enum": ["less_than_1_week", "1_4_weeks", "1_3_months", "3_6_months", "over_6_months", "chronic_ongoing"],
      "description": "Duration of primary concern."
    },
    "symptom_severity": {
      "type": "string",
      "enum": ["mild", "moderate", "severe"],
      "description": "Self-reported severity."
    },
    "user_goal": {
      "type": "string",
      "enum": [
        "learn_about_specific_herb",
        "find_herb_for_concern",
        "check_safety_of_current_herb",
        "check_drug_herb_interaction",
        "general_ayurvedic_guidance",
        "understand_dosage"
      ],
      "description": "What the user wants from this session. Routes the engine."
    },
    "red_flag_screen": {
      "type": "object",
      "description": "Mandatory screening questions. If ANY are true → immediate escalation.",
      "properties": {
        "chest_pain": { "type": "boolean" },
        "blood_in_stool_vomit": { "type": "boolean" },
        "high_fever_over_103": { "type": "boolean" },
        "sudden_weakness_paralysis": { "type": "boolean" },
        "suicidal_thoughts": { "type": "boolean" },
        "difficulty_breathing": { "type": "boolean" },
        "severe_allergic_reaction": { "type": "boolean" },
        "yellowing_skin_eyes": { "type": "boolean" }
      },
      "required": ["chest_pain", "blood_in_stool_vomit", "high_fever_over_103", "sudden_weakness_paralysis", "suicidal_thoughts", "difficulty_breathing", "severe_allergic_reaction", "yellowing_skin_eyes"]
    }
  }
}
```

---

## 3. Risk Engine Logic Flow

### Pseudocode

```
FUNCTION assess_risk(intake: IntakeForm) → RiskAssessment:

    // ──────────────────────────────────
    // STEP 0: Generate session
    // ──────────────────────────────────
    session = create_session(intake.session_id, intake.timestamp)
    audit = init_audit_log(session)

    // ──────────────────────────────────
    // STEP 1: Intake validation
    // ──────────────────────────────────
    IF intake.disclaimer_accepted != true:
        RETURN error("Disclaimer must be accepted")

    IF intake.age < 1 OR intake.age > 120:
        RETURN error("Invalid age")

    IF intake.sex == "male" AND intake.pregnancy_status NOT IN ["not_applicable", "not_pregnant"]:
        RETURN error("Invalid pregnancy status for sex")

    // Auto-derive age group
    intake.age_group = derive_age_group(intake.age)

    audit.log("intake_validated", intake)

    // ──────────────────────────────────
    // STEP 2: Red flag detection
    // PRIORITY: HIGHEST. Overrides everything.
    // ──────────────────────────────────
    red_flags_triggered = []

    FOR EACH flag IN intake.red_flag_screen:
        IF flag.value == true:
            red_flags_triggered.append(flag.key)

    IF red_flags_triggered.length > 0:
        audit.log("red_flag_triggered", red_flags_triggered)
        RETURN RiskAssessment {
            status: "EMERGENCY_ESCALATION",
            message: "One or more symptoms require immediate medical attention.",
            red_flags: red_flags_triggered,
            herbs_shown: NONE,
            action: "Seek immediate professional medical help. Call emergency services if symptoms are acute.",
            disclaimer: FULL_MEDICAL_DISCLAIMER,
            herbs_blocked: ALL
        }
        // NO herb information is shown. Full stop.

    // ──────────────────────────────────
    // STEP 3: Build user risk profile
    // ──────────────────────────────────
    user_risk_profile = {
        conditions: intake.chronic_conditions,
        medications: intake.medications,
        pregnancy: intake.pregnancy_status,
        age_group: intake.age_group,
        current_herbs: intake.current_herbs
    }

    // ──────────────────────────────────
    // STEP 4: 🔴 Hard filter — absolute blocks
    // ──────────────────────────────────
    blocked_herbs = []
    caution_herbs = []
    safe_herbs = []

    candidate_herbs = get_herbs_for_goal(intake.user_goal, intake.symptom_primary)
    // Returns all potentially relevant herbs for the user's stated concern

    FOR EACH herb IN candidate_herbs:

        herb_blocked = false
        herb_cautions = []

        // 4a. Check condition-based risks
        FOR EACH condition IN user_risk_profile.conditions:
            risk = lookup_herb_condition_risk(herb.id, condition)
            IF risk IS NOT NULL:
                IF risk.risk_code == "red":
                    IF risk.overrides_all_recommendations == true:
                        herb_blocked = true
                        blocked_herbs.append({
                            herb: herb.id,
                            reason: risk.explanation,
                            trigger: condition,
                            risk_code: "red"
                        })
                        BREAK  // No need to check further — this herb is blocked
                    ELSE:
                        herb_cautions.append({
                            type: "condition",
                            condition: condition,
                            risk_code: "red",
                            explanation: risk.explanation
                        })
                ELSE IF risk.risk_code == "yellow":
                    herb_cautions.append({
                        type: "condition",
                        condition: condition,
                        risk_code: "yellow",
                        explanation: risk.explanation
                    })

        IF herb_blocked:
            CONTINUE  // Skip to next herb

        // 4b. Check medication-based interactions
        FOR EACH medication IN user_risk_profile.medications:
            interaction = lookup_herb_medication_interaction(herb.id, medication)
            IF interaction IS NOT NULL:
                IF interaction.severity IN ["critical", "high"]:
                    herb_blocked = true
                    blocked_herbs.append({
                        herb: herb.id,
                        reason: interaction.mechanism,
                        trigger: medication,
                        risk_code: "red",
                        interaction_severity: interaction.severity
                    })
                    BREAK
                ELSE IF interaction.severity IN ["moderate", "moderate_high"]:
                    herb_cautions.append({
                        type: "medication_interaction",
                        medication: medication,
                        severity: interaction.severity,
                        mechanism: interaction.mechanism,
                        clinical_action: interaction.clinical_action
                    })
                ELSE:
                    herb_cautions.append({
                        type: "medication_interaction",
                        medication: medication,
                        severity: interaction.severity,
                        mechanism: interaction.mechanism,
                        clinical_action: interaction.clinical_action
                    })

        IF herb_blocked:
            CONTINUE

        // 4c. Check pregnancy-specific blocks
        IF user_risk_profile.pregnancy IN ["pregnant_trimester_1", "pregnant_trimester_2", "pregnant_trimester_3"]:
            preg_risk = lookup_herb_condition_risk(herb.id, "cond_pregnancy")
            IF preg_risk IS NOT NULL AND preg_risk.risk_code == "red":
                herb_blocked = true
                blocked_herbs.append({
                    herb: herb.id,
                    reason: preg_risk.explanation,
                    trigger: "pregnancy",
                    risk_code: "red"
                })
                CONTINUE

        IF user_risk_profile.pregnancy == "trying_to_conceive":
            fertility_risk = lookup_herb_condition_risk(herb.id, "cond_trying_to_conceive")
            IF fertility_risk IS NOT NULL:
                herb_cautions.append({
                    type: "fertility_concern",
                    risk_code: fertility_risk.risk_code,
                    explanation: fertility_risk.explanation
                })

        // 4d. Check herb-herb interactions
        FOR EACH current_herb IN user_risk_profile.current_herbs:
            herb_herb_interaction = lookup_herb_herb_interaction(herb.id, current_herb)
            IF herb_herb_interaction IS NOT NULL:
                herb_cautions.append({
                    type: "herb_herb_interaction",
                    other_herb: current_herb,
                    risk_level: herb_herb_interaction.risk_level,
                    explanation: herb_herb_interaction.explanation
                })

        // 4e. Classify herb
        IF herb_cautions.length > 0:
            caution_herbs.append({
                herb: herb,
                cautions: herb_cautions,
                caution_score: calculate_caution_score(herb_cautions)
            })
        ELSE:
            safe_herbs.append(herb)

    audit.log("herb_filtering_complete", {
        blocked: blocked_herbs.length,
        caution: caution_herbs.length,
        safe: safe_herbs.length
    })

    // ──────────────────────────────────
    // STEP 5: Caution scoring
    // ──────────────────────────────────
    FUNCTION calculate_caution_score(cautions: list) → integer:
        score = 0
        FOR EACH caution IN cautions:
            IF caution.risk_code == "red": score += 100
            IF caution.risk_code == "yellow": score += 30
            IF caution.type == "medication_interaction":
                IF caution.severity == "high": score += 80
                IF caution.severity == "moderate_high": score += 50
                IF caution.severity == "moderate": score += 30
                IF caution.severity == "low_moderate": score += 15
                IF caution.severity == "low": score += 5
            IF caution.type == "herb_herb_interaction": score += 20
            IF caution.type == "fertility_concern": score += 40
        RETURN score

    // Sort caution herbs: lowest caution score first (safest first)
    caution_herbs.sort_by(caution_score, ascending)

    // ──────────────────────────────────
    // STEP 6: Evidence ranking
    // ──────────────────────────────────
    // Within safe and caution herbs, rank by evidence grade for the user's concern

    FOR EACH herb IN (safe_herbs + caution_herbs):
        relevant_claims = herb.evidence_claims.filter(
            claim.matches_symptom(intake.symptom_primary)
        )
        herb.best_evidence_grade = max_grade(relevant_claims)
        // A > B > C > D

    safe_herbs.sort_by(best_evidence_grade, descending)  // Best evidence first
    caution_herbs.sort_by([best_evidence_grade DESC, caution_score ASC])

    // ──────────────────────────────────
    // STEP 7: Generate output
    // ──────────────────────────────────
    output = RiskAssessment {
        status: "COMPLETE",
        session_id: session.id,
        disclaimer: FULL_EDUCATIONAL_DISCLAIMER,

        blocked_herbs: blocked_herbs.map(herb → {
            name: herb.name,
            reason: herb.reason,
            trigger: herb.trigger,
            icon: "🔴"
        }),

        caution_herbs: caution_herbs.map(entry → {
            name: entry.herb.name,
            evidence_grade: entry.herb.best_evidence_grade,
            caution_score: entry.caution_score,
            cautions: entry.cautions,
            dosage: entry.herb.dosage_ranges,
            icon: "🟡",
            message: "This herb may be suitable with caution. Review the warnings below."
        }),

        safe_herbs: safe_herbs.map(herb → {
            name: herb.name,
            evidence_grade: herb.best_evidence_grade,
            dosage: herb.dosage_ranges,
            icon: "🟢",
            message: "No specific contraindications identified for your profile."
        }),

        general_guidance: generate_guidance(intake.symptom_primary, intake.user_goal),
        doctor_referral_suggested: (blocked_herbs.length > 2 OR
                                    intake.symptom_severity == "severe" OR
                                    intake.symptom_duration == "over_6_months" OR
                                    any_caution_score > 100),
        red_flags_for_herb_use: aggregate_red_flags(safe_herbs + caution_herbs)
    }

    audit.log("assessment_complete", output)
    RETURN output
```

### Decision Priority Order (Non-Negotiable)

```
1. RED FLAG SCREEN         →  Overrides EVERYTHING. Emergency escalation.
2. DISCLAIMER GATE         →  Must be accepted. No bypass.
3. 🔴 HARD BLOCKS         →  Condition/medication blocks. Herb removed entirely.
4. 🟡 CAUTION SCORING     →  Accumulated risk score. Ranked for user.
5. EVIDENCE RANKING        →  Best-evidence herbs shown first.
6. EDUCATIONAL OUTPUT      →  Structured, disclaimed, never prescriptive.
```

---

## 4. UI Flow Design

### 4.1 Flow Map

```
┌─────────────────────────────────────────────────────┐
│                  LANDING PAGE                        │
│                                                     │
│  "Ayurvedic Intelligence — Evidence-Based,          │
│   Safety-First"                                     │
│                                                     │
│  [Explore Herbs]    [Start Assessment]              │
│                                                     │
│  Footer: Permanent disclaimer bar                   │
└──────────┬──────────────────────┬───────────────────┘
           │                      │
     ┌─────▼─────┐         ┌─────▼──────────────┐
     │ HERB      │         │ DISCLAIMER GATE     │
     │ BROWSER   │         │                     │
     │           │         │ Full text displayed  │
     │ Search,   │         │ Checkbox: "I accept" │
     │ filter,   │         │ Cannot proceed       │
     │ read-only │         │ without check        │
     │ entries   │         │ Timestamped + logged  │
     └───────────┘         └─────────┬────────────┘
                                     │
                           ┌─────────▼────────────┐
                           │ INTAKE FORM           │
                           │                       │
                           │ Step 1: Demographics  │
                           │   Age, Sex, Pregnancy │
                           │                       │
                           │ Step 2: Red Flags     │
                           │   8 screening Qs      │
                           │   ↓ IF ANY TRUE       │
                           │   → EMERGENCY SCREEN  │
                           │                       │
                           │ Step 3: Conditions    │
                           │   Multi-select chips  │
                           │                       │
                           │ Step 4: Medications   │
                           │   Multi-select chips  │
                           │                       │
                           │ Step 5: Current Herbs │
                           │   Autocomplete input  │
                           │                       │
                           │ Step 6: Concern       │
                           │   Primary symptom     │
                           │   Duration            │
                           │   Severity            │
                           │   Goal                │
                           │                       │
                           │ [Submit Assessment]   │
                           └─────────┬────────────┘
                                     │
                    ┌────────────────┬┴────────────────┐
                    │                │                  │
          ┌─────────▼──┐   ┌────────▼───────┐  ┌──────▼──────────┐
          │ EMERGENCY  │   │ RISK SUMMARY   │  │ RISK SUMMARY    │
          │ SCREEN     │   │ (with blocks)  │  │ (no blocks)     │
          │            │   │                │  │                 │
          │ 🚨 Red     │   │ 🔴 Blocked     │  │ 🟢 Safe herbs   │
          │ banner     │   │ herbs + why    │  │ ranked by       │
          │            │   │                │  │ evidence        │
          │ "Seek      │   │ 🟡 Caution     │  │                 │
          │ immediate  │   │ herbs ranked   │  │ 🟡 Caution      │
          │ care"      │   │                │  │ herbs with      │
          │            │   │ 🟢 Safe herbs  │  │ warnings        │
          │ No herb    │   │ ranked         │  │                 │
          │ info shown │   │                │  │ Dosage info     │
          │            │   │ Doctor referral│  │ (educational)   │
          │ Emergency  │   │ suggestion     │  │                 │
          │ numbers    │   └───────┬────────┘  └────────┬────────┘
          └────────────┘           │                     │
                                   └──────────┬──────────┘
                                              │
                                    ┌─────────▼──────────┐
                                    │ HERB DETAIL PANEL  │
                                    │                    │
                                    │ Full monograph     │
                                    │ Evidence table     │
                                    │ Risk coding        │
                                    │ Side effects       │
                                    │ Drug interactions  │
                                    │ Misuse patterns    │
                                    │ When to see doctor │
                                    │                    │
                                    │ Persistent footer  │
                                    │ disclaimer         │
                                    └────────────────────┘
```

### 4.2 Warning Display Hierarchy

```
LEVEL 1 — 🚨 EMERGENCY (Red banner, full-screen overlay)
  Triggered by: Red flag screening
  Behaviour: Blocks ALL content. Only shows emergency message + numbers.
  Dismissible: NO.
  Colour: #DC2626 (red-600) background, white text.

LEVEL 2 — 🔴 BLOCKED HERB (Red card, crossed-out herb name)
  Triggered by: Risk engine hard filter
  Behaviour: Herb name shown but struck-through. Reason displayed.
             "This herb is not recommended for your profile because: [reason]"
  Dismissible: NO. Cannot expand to see dosage or usage.
  Colour: Red left-border, light red background.

LEVEL 3 — 🟡 CAUTION HERB (Amber card, expandable with warnings)
  Triggered by: Risk engine caution scoring
  Behaviour: Herb shown with amber indicator. Expandable.
             On expand: full cautions listed BEFORE any dosage info.
             "This herb may be suitable with the following cautions: [list]"
  Dismissible: User can acknowledge and view details.
  Colour: Amber left-border, light yellow background.

LEVEL 4 — 🟢 SAFE HERB (Green card, full info available)
  Triggered by: No blocks, no cautions for this profile
  Behaviour: Full herb info shown. Evidence grade prominently displayed.
             Dosage info with educational disclaimer.
  Colour: Green left-border, white background.

LEVEL 5 — ℹ️ GENERAL DISCLAIMER (Persistent footer, every page)
  Content: "This is educational information, not medical advice..."
  Behaviour: Always visible. Cannot be dismissed or hidden.
  Colour: Grey background, small text, persistent.
```

### 4.3 🔴 Override Behaviour

When a 🔴 block is triggered, the system:

1. **Removes** the herb from all recommendation lists
2. **Does NOT** show dosage information for that herb
3. **Does NOT** allow "I'll take the risk" bypass — there is no override button
4. **Shows** the blocked herb in a separate "Not Recommended" section with explanation
5. **Logs** the block to audit trail with reason, trigger condition, and timestamp
6. If >50% of candidate herbs are blocked → triggers doctor referral suggestion
7. If ALL candidate herbs are blocked → shows doctor referral as primary action

### 4.4 Disclaimer Presentation

**Pre-assessment disclaimer (gate):**
```
AYURV EDUCATIONAL DISCLAIMER

This tool provides structured educational information about Ayurvedic herbs
based on classical references and available scientific evidence.

This tool does NOT:
- Diagnose any medical condition
- Prescribe any treatment
- Replace professional medical advice
- Guarantee any health outcome

Herbal products can interact with modern medicines and medical conditions.
Always consult a qualified healthcare practitioner before starting any
herbal supplementation, especially if you are pregnant, breastfeeding,
on medication, or have a chronic health condition.

By proceeding, you acknowledge that:
☐ I understand this is educational information only
☐ I will consult a healthcare professional before acting on any information
☐ I accept full responsibility for my health decisions

[All three checkboxes must be checked to proceed]
[Timestamp and acceptance logged to database]
```

---

## 5. Liability Protection Layer

### 5.1 Required Disclaimers

| Location | Disclaimer | Behaviour |
|----------|-----------|-----------|
| **Landing page footer** | Short disclaimer: "Educational only. Not medical advice." | Persistent. Always visible. |
| **Pre-intake gate** | Full disclaimer (see 4.4). Three checkboxes. | Must accept to proceed. Logged with timestamp. |
| **Every herb detail page** | "This is general educational information, not a medical prescription." | Inline, non-dismissible. |
| **Every dosage section** | "Dosage depends on individual constitution, health status, and formulation. Consult a qualified practitioner." | Inline before any dose number. |
| **Every risk summary** | "This assessment is based on the information you provided and does not constitute a medical diagnosis or prescription." | Top of results page. |
| **Emergency escalation** | "This may require urgent medical care. Please seek immediate professional help." | Full-screen. Cannot be dismissed. |
| **PDF/print output** (if added) | Full disclaimer on every page. Watermark: "EDUCATIONAL — NOT A PRESCRIPTION" | Cannot be removed. |

### 5.2 What Cannot Be Shown

| Category | Prohibition | Reason |
|----------|-------------|--------|
| **Disease treatment protocols** | Never show: "For [disease], take [herb] at [dose] for [duration]" | Constitutes medical prescription. Regulatory violation. |
| **Cure claims** | Never show: "cures", "heals", "treats", "eliminates" in relation to any disease | Drugs and Magic Remedies Act (India), FTC (US), TGA (Australia) violations. |
| **Diagnostic statements** | Never show: "You have [condition]", "Your symptoms indicate [disease]" | Medical diagnosis. Requires licensed practitioner. |
| **Absolute safety claims** | Never show: "100% safe", "no side effects", "completely natural and harmless" | Legally indefensible. Pharmacologically false. |
| **Dosage as prescription** | Never show dose without disclaimer | Even "educational" dosing can be construed as prescription without disclaimer. |
| **Comparative efficacy** | Never show: "Better than [drug]", "As effective as [pharmaceutical]" | Unsubstantiated comparative claims. Regulatory violation. |

### 5.3 Language That Must Be Avoided

```
BANNED PHRASES (enforced in content pipeline):
- "boosts immunity"          → use "immunomodulatory activity (evidence level: X)"
- "detoxifies"               → use "traditional use for digestive regulation"
- "cleanses"                 → use "mild laxative effect (evidence level: X)"
- "balances hormones"        → use "contains phytoestrogens with weak receptor activity"
- "cures"                    → NEVER use
- "heals"                    → use "traditional use for [condition]"
- "miracle"                  → NEVER use
- "ancient secret"           → NEVER use
- "no side effects"          → NEVER use
- "safe for everyone"        → NEVER use
- "doctor recommended"       → NEVER use (unless citing specific clinical guideline)
- "clinically proven"        → use "evidence level A/B/C/D" with citation
- "FDA approved"             → NEVER use (herbs are not FDA approved as drugs)
```

### 5.4 Disclaimer Acceptance Logging

```sql
CREATE TABLE disclaimer_acceptances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL,
    accepted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash         TEXT NOT NULL,           -- SHA-256 of IP. Not raw IP (privacy).
    user_agent      TEXT,
    disclaimer_version TEXT NOT NULL,         -- "v1.0", "v1.1" etc.
    checkboxes_accepted JSONB NOT NULL,      -- {"educational": true, "consult_professional": true, "responsibility": true}
    country_code    TEXT                     -- Geo-derived. Relevant for jurisdiction.
);

-- Index for compliance queries
CREATE INDEX idx_disclaimer_session ON disclaimer_acceptances(session_id);
CREATE INDEX idx_disclaimer_date ON disclaimer_acceptances(accepted_at);
```

### 5.5 Session Storage

- Sessions are **server-side** (database-backed, not localStorage).
- Intake data, risk assessment results, and disclaimer acceptance are linked by `session_id`.
- Sessions expire after 24 hours. Data retained in audit log permanently.
- No PII stored beyond what's in the intake form. No names, no email (unless auth is added).
- IP addresses are hashed, not stored raw.
- GDPR/India DPDP Act consideration: intake data is health data. If user accounts are added, data deletion must be supported.

---

## 6. Future Scalability

### 6.1 Adding More Herbs

**Current:** 10 herbs in markdown monographs → JSON schema.

**Scale path:**
```
Phase 1 (current):  10 herbs, manually authored
Phase 2 (next):     25-50 herbs, same manual process
Phase 3 (scale):    100+ herbs. Introduce:
                    - Herb authoring admin panel
                    - Structured form for data entry (not free-text)
                    - Review/approval workflow (draft → reviewed → published)
                    - Version history per herb entry
                    - Automated evidence grade validation (flag if claim has no reference)
```

**Schema designed for this:** The herb JSON schema supports any number of evidence claims, risk conditions, and interactions. Adding a new herb means inserting a new record, not modifying the schema.

### 6.2 Adding Condition Modules

**Current:** Conditions are flat enum list in intake form.

**Scale path:**
```
Phase 1: Flat condition list with herb risk mappings
Phase 2: Condition modules — each condition gets:
         - Detailed description
         - Risk explanation for each herb
         - Related conditions (comorbidity mapping)
         - Condition-specific intake follow-up questions
         - Condition-specific guidance text
Phase 3: ICD-10 mapping for conditions (enables interop with medical systems)
```

### 6.3 Doctor Dashboard

```
┌──────────────────────────────────────────────────┐
│              DOCTOR DASHBOARD (Phase 3)           │
│                                                   │
│  Requires: Doctor auth (verified BAMS/MD/MBBS)    │
│                                                   │
│  Features:                                        │
│  - View patient-shared assessments                │
│  - Override risk engine decisions (logged)         │
│  - Add clinical notes to assessment               │
│  - Flag herb entries for review                   │
│  - View audit trail for patient session           │
│  - Export assessment as clinical reference PDF     │
│                                                   │
│  NOT a prescription pad. NOT an EMR.              │
│  A clinical reference layer.                      │
└──────────────────────────────────────────────────┘
```

### 6.4 Teleconsultation Integration

```
Phase 3-4:
- Patient completes intake on Ayurv
- Risk assessment generated
- Patient can "share with practitioner" (generates shareable link)
- Practitioner reviews assessment pre-consultation
- Video consultation via integrated service (Jitsi/Daily.co — open-source, HIPAA-available)
- Practitioner adds clinical notes
- Post-consult: updated guidance (practitioner-authored, not AI-generated)
```

### 6.5 Audit Log for AI Decisions

```sql
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type      TEXT NOT NULL,
    -- event_types: "intake_validated", "red_flag_triggered", "herb_blocked",
    --              "herb_cautioned", "herb_cleared", "assessment_complete",
    --              "doctor_override", "disclaimer_accepted"
    event_data      JSONB NOT NULL,
    -- Full input/output snapshot for this decision point
    engine_version  TEXT NOT NULL,
    -- "v1.0.0" — tracks which version of risk engine made this decision
    herb_id         TEXT,               -- NULL if not herb-specific
    risk_code       TEXT,               -- "red", "yellow", "green", NULL
    trigger_type    TEXT,               -- "condition", "medication", "pregnancy", "red_flag", NULL
    trigger_value   TEXT                -- The specific condition/medication that triggered
);

-- Indexes for compliance and debugging
CREATE INDEX idx_audit_session ON audit_log(session_id);
CREATE INDEX idx_audit_event ON audit_log(event_type);
CREATE INDEX idx_audit_time ON audit_log(timestamp);
CREATE INDEX idx_audit_herb ON audit_log(herb_id);
CREATE INDEX idx_audit_risk ON audit_log(risk_code);

-- IMPORTANT: This table is APPEND-ONLY.
-- No UPDATE or DELETE operations permitted.
-- Enforced via database role permissions:
-- GRANT INSERT, SELECT ON audit_log TO app_role;
-- (No UPDATE, DELETE granted)
```

**Audit log answers these questions:**
- Why was this herb blocked for this user? (regulatory query)
- What information did the user see? (liability query)
- Did the user accept the disclaimer before seeing results? (compliance query)
- What version of the risk engine made this decision? (debugging, version comparison)
- How many users were shown herb X with caution Y? (safety monitoring)

---

## 7. Deployment

### 7.1 MVP Deployment

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel     │────→│  Supabase   │     │  GitHub      │
│   (Next.js)  │     │  (Postgres) │     │  (Source)    │
│              │     │             │     │              │
│  Frontend +  │     │  Database + │     │  CI/CD via   │
│  API Routes  │     │  Auth +     │     │  Vercel Git  │
│  Edge CDN    │     │  Row-level  │     │  integration │
│              │     │  security   │     │              │
│  HTTPS auto  │     │  Daily      │     │  Branch      │
│              │     │  backups    │     │  previews    │
└─────────────┘     └─────────────┘     └─────────────┘
```

| Concern | Solution |
|---------|----------|
| HTTPS | Vercel provides automatic SSL |
| Database backups | Supabase daily automatic backups + point-in-time recovery |
| Environment variables | Vercel encrypted env vars (DB connection string, API keys) |
| Rate limiting | Vercel Edge Middleware (rate limit intake submissions) |
| DDoS protection | Vercel/Cloudflare built-in |
| Database access | Supabase Row Level Security. API routes use service role. No direct client-DB connection. |
| Content Security Policy | Strict CSP headers via Next.js middleware |
| Input sanitization | Zod schema validation on all API inputs (matches intake JSON schema) |
| Error handling | Never expose stack traces or database errors to client. Generic error messages. Detailed errors to server logs only. |

### 7.2 Domain and Identity

```
Domain:        veda.ayurv.in (or similar)
Staging:       staging.veda.ayurv.in (Vercel preview deployments)
API:           veda.ayurv.in/api/*
Herb pages:    veda.ayurv.in/herbs/[slug]  (SSG for SEO)
Assessment:    veda.ayurv.in/assess        (SSR, not cached)
```

### 7.3 Cost at MVP Scale

| Service | Free Tier | Cost at 10K users/month |
|---------|-----------|------------------------|
| Vercel | 100GB bandwidth, 100K function invocations | Free tier likely sufficient |
| Supabase | 500MB database, 1GB storage, 50K auth users | Free tier likely sufficient |
| Domain | — | ~$10-15/year |
| **Total MVP cost** | | **~$15/year** |

---

## Appendix: Database Schema (SQL)

```sql
-- ============================================
-- CORE TABLES
-- ============================================

CREATE TABLE herbs (
    id                  TEXT PRIMARY KEY,           -- "herb_ashwagandha"
    botanical_name      TEXT NOT NULL,
    family              TEXT NOT NULL,
    names               JSONB NOT NULL,             -- {sanskrit, hindi, english, tamil, ...}
    parts_used          TEXT[] NOT NULL,
    classification      JSONB NOT NULL,             -- {rasayana, medhya, hridya, classical_groups[]}
    ayurvedic_profile   JSONB NOT NULL,             -- {rasa[], guna[], virya, vipaka, dosha_action{}}
    dosage_ranges       JSONB NOT NULL,             -- {disclaimer, forms[], time_to_effect{}}
    side_effects        JSONB NOT NULL,             -- {common[], uncommon[], rare[]}
    misuse_patterns     JSONB NOT NULL,             -- [{pattern_id, title, description, ...}]
    red_flags           JSONB NOT NULL,             -- [{symptom, severity, action, rationale}]
    source_monograph    TEXT,                       -- "herbs/ashwagandha.md"
    framework_version   TEXT NOT NULL DEFAULT 'v2',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    review_status       TEXT DEFAULT 'initial'      -- initial, reviewed, published
);

CREATE TABLE conditions (
    id                  TEXT PRIMARY KEY,           -- "cond_pregnancy"
    condition_name      TEXT NOT NULL,
    category            TEXT NOT NULL,              -- "reproductive", "cardiac", "emergency", etc.
    severity_level      TEXT NOT NULL,              -- "low", "moderate", "high", "critical"
    description         TEXT,
    escalation_required BOOLEAN NOT NULL DEFAULT FALSE,
    escalation_reason   TEXT,
    intake_questions    TEXT[],
    default_guidance    TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medications (
    id                  TEXT PRIMARY KEY,           -- "med_digoxin"
    medication_name     TEXT NOT NULL,
    medication_class    TEXT NOT NULL,
    common_brands_india TEXT[],
    therapeutic_area    TEXT NOT NULL,
    narrow_therapeutic_index BOOLEAN DEFAULT FALSE,
    general_warning     TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RELATIONSHIP TABLES (Risk Mappings)
-- ============================================

CREATE TABLE herb_condition_risks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    herb_id         TEXT NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    condition_id    TEXT NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
    risk_code       TEXT NOT NULL CHECK (risk_code IN ('green', 'yellow', 'red')),
    risk_label      TEXT NOT NULL,
    explanation     TEXT NOT NULL,
    overrides_all   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(herb_id, condition_id)
);

CREATE TABLE herb_medication_interactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    herb_id         TEXT NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    medication_id   TEXT NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    severity        TEXT NOT NULL CHECK (severity IN ('low', 'low_moderate', 'moderate', 'moderate_high', 'high', 'critical')),
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('proven', 'pharmacological', 'theoretical')),
    mechanism       TEXT NOT NULL,
    clinical_action TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(herb_id, medication_id)
);

CREATE TABLE herb_herb_interactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    herb_id_1       TEXT NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    herb_id_2       TEXT NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    risk_level      TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
    explanation     TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(herb_id_1, herb_id_2),
    CHECK (herb_id_1 < herb_id_2)    -- Enforce ordering to prevent duplicates
);

CREATE TABLE evidence_claims (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    herb_id         TEXT NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    claim_id        TEXT NOT NULL,              -- "ashwa_stress_01"
    claim           TEXT NOT NULL,
    evidence_grade  TEXT NOT NULL CHECK (evidence_grade IN ('A', 'B', 'B-C', 'C', 'C-D', 'D')),
    summary         TEXT NOT NULL,
    mechanism       TEXT,
    active_compounds TEXT[],
    key_references  JSONB,                     -- [{author, year, journal, title}]
    symptom_tags    TEXT[],                     -- Maps to intake symptom_primary values
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(herb_id, claim_id)
);

-- ============================================
-- SESSION & LOGGING TABLES
-- ============================================

CREATE TABLE intake_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    intake_data     JSONB NOT NULL,
    assessment_result JSONB,
    status          TEXT DEFAULT 'pending'      -- pending, assessed, expired
);

CREATE TABLE disclaimer_acceptances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES intake_sessions(id),
    accepted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash         TEXT NOT NULL,
    user_agent      TEXT,
    disclaimer_version TEXT NOT NULL,
    checkboxes      JSONB NOT NULL
);

CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type      TEXT NOT NULL,
    event_data      JSONB NOT NULL,
    engine_version  TEXT NOT NULL,
    herb_id         TEXT,
    risk_code       TEXT,
    trigger_type    TEXT,
    trigger_value   TEXT
);

-- Append-only enforcement
REVOKE UPDATE, DELETE ON audit_log FROM app_role;
GRANT INSERT, SELECT ON audit_log TO app_role;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_herb_cond_risk_herb ON herb_condition_risks(herb_id);
CREATE INDEX idx_herb_cond_risk_cond ON herb_condition_risks(condition_id);
CREATE INDEX idx_herb_cond_risk_code ON herb_condition_risks(risk_code);
CREATE INDEX idx_herb_med_int_herb ON herb_medication_interactions(herb_id);
CREATE INDEX idx_herb_med_int_med ON herb_medication_interactions(medication_id);
CREATE INDEX idx_herb_med_int_sev ON herb_medication_interactions(severity);
CREATE INDEX idx_evidence_herb ON evidence_claims(herb_id);
CREATE INDEX idx_evidence_grade ON evidence_claims(evidence_grade);
CREATE INDEX idx_evidence_symptoms ON evidence_claims USING GIN(symptom_tags);
CREATE INDEX idx_audit_session ON audit_log(session_id);
CREATE INDEX idx_audit_event ON audit_log(event_type);
CREATE INDEX idx_audit_time ON audit_log(timestamp);
CREATE INDEX idx_herbs_search ON herbs USING GIN(names jsonb_path_ops);
```

---

*Architecture document v1.0 — Ayurv Risk Intelligence WebApp*
*Designed for scrutiny by: physicians, regulatory advisors, software architects.*
*This is a healthcare safety engine, not a content platform.*
