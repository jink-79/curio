import { SAMPLE_PATHS } from "@/features/reading/data/sample";

const KEY = "curio.lastPath.v1";
const FALLBACK = "world-war-2";

/** The path the Learning tab opens: the one you looked at last. */
export function lastPathId(): string {
  try {
    const id = window.localStorage.getItem(KEY);
    if (id && id in SAMPLE_PATHS) return id;
  } catch {
    // storage unavailable
  }
  return FALLBACK;
}

export function rememberPath(pathId: string): void {
  try {
    window.localStorage.setItem(KEY, pathId);
  } catch {
    // storage unavailable
  }
}
