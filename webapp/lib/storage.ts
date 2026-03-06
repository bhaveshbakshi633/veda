// ============================================
// CLIENT STORAGE — minimal, backend-first
// ============================================
// Client only stores: anonymous UUID + disclaimer flag
// All user data lives in Supabase.

const KEYS = {
  uid: "ayurv_uid",
  disclaimer: "ayurv_disclaimer_accepted",
} as const;

// ============================================
// ANONYMOUS USER ID
// ============================================

export function getOrCreateUid(): string {
  try {
    let uid = localStorage.getItem(KEYS.uid);
    if (!uid) {
      uid = crypto.randomUUID();
      localStorage.setItem(KEYS.uid, uid);
    }
    return uid;
  } catch {
    // localStorage disabled — fallback to session-only
    return crypto.randomUUID();
  }
}

export function getUid(): string | null {
  try {
    return localStorage.getItem(KEYS.uid);
  } catch {
    return null;
  }
}

// ============================================
// DISCLAIMER PERSISTENCE
// ============================================

export function saveDisclaimerAccepted(): void {
  try {
    localStorage.setItem(KEYS.disclaimer, "true");
  } catch {
    // noop
  }
}

export function hasAcceptedDisclaimer(): boolean {
  try {
    return localStorage.getItem(KEYS.disclaimer) === "true";
  } catch {
    return false;
  }
}

// ============================================
// CLEAR ALL CLIENT DATA
// ============================================

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(KEYS.uid);
    localStorage.removeItem(KEYS.disclaimer);
    sessionStorage.clear();
  } catch {
    // noop
  }
}
