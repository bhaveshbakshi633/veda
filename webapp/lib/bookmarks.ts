// ============================================
// Herb Bookmarks — localStorage-based saved herbs list
// Users can save herbs for quick access later
// ============================================

const STORAGE_KEY = "ayurv_bookmarks";

export interface BookmarkedHerb {
  id: string;
  name: string;
  savedAt: string;
}

export function getBookmarks(): BookmarkedHerb[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as BookmarkedHerb[];
  } catch {
    return [];
  }
}

export function addBookmark(herbId: string, herbName: string): void {
  try {
    const current = getBookmarks();
    if (current.some((b) => b.id === herbId)) return; // already saved
    current.push({ id: herbId, name: herbName, savedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // quota exceeded — silently fail
  }
}

export function removeBookmark(herbId: string): void {
  try {
    const current = getBookmarks().filter((b) => b.id !== herbId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // noop
  }
}

export function isBookmarked(herbId: string): boolean {
  return getBookmarks().some((b) => b.id === herbId);
}

export function toggleBookmark(herbId: string, herbName: string): boolean {
  if (isBookmarked(herbId)) {
    removeBookmark(herbId);
    return false;
  } else {
    addBookmark(herbId, herbName);
    return true;
  }
}

export function clearBookmarks(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
