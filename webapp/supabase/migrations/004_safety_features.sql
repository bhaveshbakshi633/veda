-- ============================================
-- AYURV SAFETY FEATURES — MIGRATION 004
-- ============================================
-- 1. Herb-herb interactions table
-- 2. Age-based herb restrictions table
-- Seed data in seed_safety.sql

-- ============================================
-- HERB-HERB INTERACTIONS
-- ============================================
-- Captures additive/synergistic risk when combining herbs.
-- CHECK constraint ensures herb_id_1 < herb_id_2 to prevent duplicate pairs.

CREATE TABLE IF NOT EXISTS herb_herb_interactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    herb_id_1       TEXT NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    herb_id_2       TEXT NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    risk_code       TEXT NOT NULL CHECK (risk_code IN ('yellow', 'red')),
    interaction_category TEXT NOT NULL,
    severity        TEXT NOT NULL CHECK (severity IN ('low', 'low_moderate', 'moderate', 'moderate_high', 'high', 'critical')),
    mechanism       TEXT NOT NULL,
    clinical_action TEXT NOT NULL,
    evidence_basis  TEXT NOT NULL CHECK (evidence_basis IN ('clinical', 'pharmacological', 'traditional', 'theoretical')),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(herb_id_1, herb_id_2),
    CHECK (herb_id_1 < herb_id_2)
);

CREATE INDEX IF NOT EXISTS idx_hhi_herb1 ON herb_herb_interactions(herb_id_1);
CREATE INDEX IF NOT EXISTS idx_hhi_herb2 ON herb_herb_interactions(herb_id_2);
CREATE INDEX IF NOT EXISTS idx_hhi_severity ON herb_herb_interactions(severity);

-- ============================================
-- AGE-BASED HERB RESTRICTIONS
-- ============================================

CREATE TABLE IF NOT EXISTS herb_age_restrictions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    herb_id         TEXT NOT NULL REFERENCES herbs(id) ON DELETE CASCADE,
    age_group       TEXT NOT NULL CHECK (age_group IN (
        'child_under_6', 'child_6_12', 'adolescent_13_17',
        'adult_18_45', 'adult_46_65', 'elderly_over_65'
    )),
    restriction     TEXT NOT NULL CHECK (restriction IN ('blocked', 'caution', 'dose_reduce')),
    explanation     TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(herb_id, age_group)
);

CREATE INDEX IF NOT EXISTS idx_har_herb ON herb_age_restrictions(herb_id);
CREATE INDEX IF NOT EXISTS idx_har_age ON herb_age_restrictions(age_group);
