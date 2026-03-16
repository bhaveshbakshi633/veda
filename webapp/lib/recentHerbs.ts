// ============================================
// Recently Viewed Herbs — localStorage queue (max 8)
// ============================================

const STORAGE_KEY = "ayurv_recent_herbs";
const MAX_RECENT = 8;

interface RecentHerb {
  id: string;
  name: string;
  slug: string;
}

export function getRecentHerbs(): RecentHerb[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentHerb[];
  } catch {
    return [];
  }
}

export function addRecentHerb(id: string, name: string, slug: string): void {
  try {
    const current = getRecentHerbs().filter((h) => h.id !== id);
    current.unshift({ id, name, slug });
    if (current.length > MAX_RECENT) current.length = MAX_RECENT;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // quota exceeded — silently fail
  }
}
