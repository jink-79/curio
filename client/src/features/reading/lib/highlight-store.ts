import { readJson, writeJson } from "@/lib/storage";
import type { Highlight, HighlightColor } from "../types";

/*
 * The learner's highlights and notes, kept on this device until accounts
 * exist (then the same shape goes to the API). A tiny external store:
 * screens read it with useSyncExternalStore and re-render on change.
 */

const KEY = "curio.highlights.v1";
export const HIGHLIGHT_COLORS: HighlightColor[] = ["blue", "yellow", "green", "pink"];
export const NOTE_MAX = 2000;

const isString = (v: unknown) => typeof v === "string";
function isHighlight(v: unknown): v is Highlight {
  if (typeof v !== "object" || v === null) return false;
  const h = v as Record<string, unknown>;
  return (
    isString(h.id) &&
    isString(h.lessonKey) &&
    isString(h.blockId) &&
    isString(h.exact) &&
    (h.exact as string).length > 0 &&
    HIGHLIGHT_COLORS.includes(h.color as HighlightColor) &&
    typeof h.createdAt === "number" &&
    ["prefix", "suffix", "note"].every((k) => h[k] === undefined || isString(h[k]))
  );
}

let cache: Highlight[] | null = null;
const listeners = new Set<() => void>();

export function getHighlights(): Highlight[] {
  if (cache === null) {
    const stored = readJson(KEY, (v): v is unknown[] => Array.isArray(v));
    cache = (stored ?? []).filter(isHighlight);
  }
  return cache;
}

function commit(next: Highlight[]): void {
  cache = next;
  writeJson(KEY, next);
  for (const l of listeners) l();
}

export function subscribeHighlights(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function addHighlight(input: Omit<Highlight, "id" | "createdAt" | "updatedAt">, now = Date.now()): Highlight {
  const note = input.note?.trim().slice(0, NOTE_MAX);
  const { note: _note, ...rest } = input;
  const h: Highlight = { ...rest, ...(note ? { note } : {}), id: newId(), createdAt: now };
  commit([...getHighlights(), h]);
  return h;
}

/** Change a highlight's colour or note. An empty note removes it. */
export function updateHighlight(id: string, patch: { color?: HighlightColor; note?: string }, now = Date.now()): void {
  commit(
    getHighlights().map((h) => {
      if (h.id !== id) return h;
      const next: Highlight = { ...h, ...(patch.color ? { color: patch.color } : {}), updatedAt: now };
      if (patch.note !== undefined) {
        const note = patch.note.trim().slice(0, NOTE_MAX);
        if (note) next.note = note;
        else delete next.note;
      }
      return next;
    }),
  );
}

export function removeHighlight(id: string): void {
  commit(getHighlights().filter((h) => h.id !== id));
}

/** Test helper: forget the in-memory copy. */
export function resetHighlightCache(): void {
  cache = null;
}
