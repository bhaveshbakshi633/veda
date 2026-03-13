-- Email waitlist — growth tracking
-- Users can optionally leave email to get notified about new herbs, features
CREATE TABLE IF NOT EXISTS email_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'results',  -- where they signed up: results, landing, herbs
  concern TEXT,                             -- what concern they were checking (context)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)                            -- ek email ek baar
);

-- RLS: insert-only from anon, no read/update/delete
ALTER TABLE email_waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_insert_only" ON email_waitlist
  FOR INSERT TO anon WITH CHECK (true);
