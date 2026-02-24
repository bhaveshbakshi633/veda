-- ============================================
-- AYURV — CONVERSATION STATE PERSISTENCE
-- ============================================
-- Replaces in-memory Map<string, ConversationState>
-- with database-backed state that survives server restarts.
--
-- Design rules:
--   1. State is SESSION-SCOPED (tied to intake_sessions.id)
--   2. TTL matches intake_sessions (24h)
--   3. herb_facts_cited tracks WHICH facts were shown (anti-hallucination)
--   4. safety_checks_cache stores DETERMINISTIC tool results (not LLM output)
--   5. red_flag_escalated is TERMINAL and IMMUTABLE once set
--   6. No LLM-generated content stored in state (only structured data)

-- CONVERSATION STATE
CREATE TABLE conversation_state (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID NOT NULL REFERENCES intake_sessions(id) ON DELETE CASCADE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at              TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',

    -- Turn tracking
    turn_count              INTEGER NOT NULL DEFAULT 0,

    -- Profile reference (loaded once, never LLM-generated)
    profile_loaded          BOOLEAN NOT NULL DEFAULT FALSE,

    -- Herb tracking (deterministic, from tool calls)
    herbs_discussed         TEXT[] NOT NULL DEFAULT '{}',
    herbs_recommended       TEXT[] NOT NULL DEFAULT '{}',
    herbs_blocked           TEXT[] NOT NULL DEFAULT '{}',
    recommendation_count    INTEGER NOT NULL DEFAULT 0,

    -- Safety check cache (deterministic results from runSafetyCheck)
    -- Key: herb_id, Value: {risk_code, cautions[], interactions[], evidence_grade, checked_at}
    safety_checks_cache     JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Facts actually cited to user (anti-hallucination audit)
    -- Array of {herb_id, fact_type, fact_value, cited_at}
    herb_facts_cited        JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Concern tracking (from user message parsing, not LLM)
    current_concern         JSONB DEFAULT NULL,
    -- Schema: {symptom_primary, symptom_severity, symptom_duration, user_goal, established_at_turn}

    -- Safety state (IMMUTABLE once set to true)
    red_flag_escalated      BOOLEAN NOT NULL DEFAULT FALSE,
    red_flag_triggers       TEXT[] NOT NULL DEFAULT '{}',
    escalated_at            TIMESTAMPTZ DEFAULT NULL,

    -- Referral tracking
    doctor_referral_given   BOOLEAN NOT NULL DEFAULT FALSE,
    lifestyle_advice_given  BOOLEAN NOT NULL DEFAULT FALSE,
    stacking_discouraged    BOOLEAN NOT NULL DEFAULT FALSE,

    -- Orchestrator violation log (append-only within session)
    orchestrator_violations JSONB NOT NULL DEFAULT '[]'::jsonb,

    UNIQUE(session_id)
);

-- INDEXES
CREATE INDEX idx_conv_state_session ON conversation_state(session_id);
CREATE INDEX idx_conv_state_expires ON conversation_state(expires_at);
CREATE INDEX idx_conv_state_escalated ON conversation_state(red_flag_escalated) WHERE red_flag_escalated = TRUE;

-- FUNCTION: Prevent un-escalation (red_flag_escalated is terminal)
CREATE OR REPLACE FUNCTION prevent_unescalation()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.red_flag_escalated = TRUE AND NEW.red_flag_escalated = FALSE THEN
        RAISE EXCEPTION 'Cannot un-escalate a red flag. This is a terminal state.';
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_unescalation
    BEFORE UPDATE ON conversation_state
    FOR EACH ROW
    EXECUTE FUNCTION prevent_unescalation();

-- FUNCTION: Auto-expire old conversation states
CREATE OR REPLACE FUNCTION cleanup_expired_states()
RETURNS void AS $$
BEGIN
    DELETE FROM conversation_state WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- COMMENT: Usage
COMMENT ON TABLE conversation_state IS 'Server-side conversation state for chat sessions. Replaces in-memory Map. TTL=24h. red_flag_escalated is immutable once true.';
COMMENT ON COLUMN conversation_state.safety_checks_cache IS 'Cached results from deterministic runSafetyCheck calls. NOT LLM output. Safe to trust.';
COMMENT ON COLUMN conversation_state.herb_facts_cited IS 'Tracks which specific facts were shown to the user. Used to prevent hallucinated memory — if a fact is not in this array, the LLM did not cite it.';
COMMENT ON COLUMN conversation_state.orchestrator_violations IS 'Append-only log of orchestrator enforcement actions within this session.';
