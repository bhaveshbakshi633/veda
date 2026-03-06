-- ============================================
-- AYURV — PERSISTENT USER DATA
-- ============================================
-- Anonymous users with device-linked UUID.
-- No PII. No auth. Just a persistent identifier
-- for profile recall and analytics.

-- ANONYMOUS USERS
CREATE TABLE anonymous_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_hash     TEXT,                -- SHA-256 of user-agent (optional, for analytics)
    total_sessions  INTEGER NOT NULL DEFAULT 0,
    metadata        JSONB DEFAULT '{}'::jsonb  -- flexible analytics bag
);

-- USER PROFILES (saved health profile — 1 per user)
CREATE TABLE user_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES anonymous_users(id) ON DELETE CASCADE,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    age             TEXT,
    sex             TEXT,
    pregnancy_status TEXT,
    chronic_conditions TEXT[] NOT NULL DEFAULT '{}',
    medications     TEXT[] NOT NULL DEFAULT '{}',
    current_herbs   TEXT DEFAULT '',
    UNIQUE(user_id)
);

-- Link intake_sessions to anonymous users (nullable — backwards compatible)
ALTER TABLE intake_sessions ADD COLUMN IF NOT EXISTS anonymous_uid UUID REFERENCES anonymous_users(id);

-- INDEXES
CREATE INDEX idx_anon_users_last_seen ON anonymous_users(last_seen_at);
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_intake_sessions_uid ON intake_sessions(anonymous_uid);

-- COMMENTS
COMMENT ON TABLE anonymous_users IS 'Device-linked anonymous identifiers. No PII. UUID stored in client localStorage.';
COMMENT ON TABLE user_profiles IS 'Saved health profile for returning users. One per anonymous user. No PII beyond health conditions.';
COMMENT ON COLUMN intake_sessions.anonymous_uid IS 'Links session to anonymous user for history recall. Nullable for backwards compatibility.';
