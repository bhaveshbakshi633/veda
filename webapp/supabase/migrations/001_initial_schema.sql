-- ============================================
-- AYURV RISK INTELLIGENCE — INITIAL SCHEMA
-- ============================================

-- HERBS
CREATE TABLE herbs (
    id                  TEXT PRIMARY KEY,
    botanical_name      TEXT NOT NULL,
    family              TEXT NOT NULL,
    names               JSONB NOT NULL,
    parts_used          TEXT[] NOT NULL,
    classification      JSONB NOT NULL,
    ayurvedic_profile   JSONB NOT NULL,
    dosage_ranges       JSONB NOT NULL,
    side_effects        JSONB NOT NULL,
    misuse_patterns     JSONB NOT NULL DEFAULT '[]'::jsonb,
    red_flags           JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_monograph    TEXT,
    framework_version   TEXT NOT NULL DEFAULT 'v2',
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    review_status       TEXT DEFAULT 'initial'
);

-- CONDITIONS
CREATE TABLE conditions (
    id                  TEXT PRIMARY KEY,
    condition_name      TEXT NOT NULL,
    category            TEXT NOT NULL,
    severity_level      TEXT NOT NULL CHECK (severity_level IN ('low', 'moderate', 'high', 'critical')),
    description         TEXT,
    escalation_required BOOLEAN NOT NULL DEFAULT FALSE,
    escalation_reason   TEXT,
    default_guidance    TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- MEDICATIONS
CREATE TABLE medications (
    id                  TEXT PRIMARY KEY,
    medication_name     TEXT NOT NULL,
    medication_class    TEXT NOT NULL,
    common_brands_india TEXT[],
    therapeutic_area    TEXT NOT NULL,
    narrow_therapeutic_index BOOLEAN DEFAULT FALSE,
    general_warning     TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- HERB-CONDITION RISK MAPPINGS
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

-- HERB-MEDICATION INTERACTIONS
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

-- EVIDENCE CLAIMS
CREATE TABLE evidence_claims (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    herb_id         TEXT NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    claim_id        TEXT NOT NULL,
    claim           TEXT NOT NULL,
    evidence_grade  TEXT NOT NULL CHECK (evidence_grade IN ('A', 'B', 'B-C', 'C', 'C-D', 'D')),
    summary         TEXT NOT NULL,
    mechanism       TEXT,
    active_compounds TEXT[],
    key_references  JSONB,
    symptom_tags    TEXT[] NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(herb_id, claim_id)
);

-- INTAKE SESSIONS
CREATE TABLE intake_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    intake_data     JSONB NOT NULL,
    assessment_result JSONB,
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assessed', 'expired'))
);

-- DISCLAIMER ACCEPTANCES
CREATE TABLE disclaimer_acceptances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL REFERENCES intake_sessions(id),
    accepted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_hash         TEXT NOT NULL,
    user_agent      TEXT,
    disclaimer_version TEXT NOT NULL,
    checkboxes      JSONB NOT NULL
);

-- AUDIT LOG (APPEND-ONLY)
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID NOT NULL,
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type      TEXT NOT NULL,
    event_data      JSONB NOT NULL,
    engine_version  TEXT NOT NULL DEFAULT 'v1.0.0',
    herb_id         TEXT,
    risk_code       TEXT,
    trigger_type    TEXT,
    trigger_value   TEXT
);

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
CREATE INDEX idx_herbs_names ON herbs USING GIN(names jsonb_path_ops);
