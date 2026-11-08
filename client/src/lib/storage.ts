/**
 * localStorage wrapper that never throws: private mode, blocked storage or a
 * full quota all fall back to "nothing stored". Only for per-device
 * conveniences until the API exists.
 */
export function readJson<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable — the in-memory state still works for this visit.
  }
}
