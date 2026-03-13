// Ayurv event tracking — Vercel Analytics custom events
// sirf key user actions track karo, privacy-first

import { track } from "@vercel/analytics";

// type-safe event names — add new events here
type AyurvEvent =
  | "disclaimer_accepted"
  | "intake_started"
  | "intake_completed"
  | "assessment_viewed"
  | "chat_message_sent"
  | "chat_restored"
  | "evidence_drawer_opened"
  | "herb_page_viewed"
  | "voice_mode_toggled"
  | "language_changed"
  | "report_shared"
  | "new_assessment_started";

// track with optional properties (no PII — never track user input or health data)
export function trackEvent(event: AyurvEvent, props?: Record<string, string | number | boolean>) {
  try {
    track(event, props);
  } catch {
    // analytics fail silently — never block user flow
  }
}
