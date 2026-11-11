import { useCallback, useEffect, useRef, useState } from "react";
import { getPreferences } from "@/features/preferences/lib/preferences";
import { readJson, writeJson } from "@/lib/storage";
import { shouldAutoComplete } from "../lib/progress";

export interface LessonProgress {
  bookmarked: boolean;
  completed: boolean;
  /** Set once the user un-marks a lesson, so auto-complete never fights them. */
  manuallyIncomplete: boolean;
  maxScrollPct: number;
  activeSeconds: number;
  /** Epoch ms. Optional: progress saved before these existed has none. */
  lastReadAt?: number;
  bookmarkedAt?: number;
  completedAt?: number;
}

const EMPTY: LessonProgress = { bookmarked: false, completed: false, manuallyIncomplete: false, maxScrollPct: 0, activeSeconds: 0 };

function isProgress(v: unknown): v is LessonProgress {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.bookmarked === "boolean" &&
    typeof p.completed === "boolean" &&
    typeof p.manuallyIncomplete === "boolean" &&
    typeof p.maxScrollPct === "number" &&
    typeof p.activeSeconds === "number" &&
    ["lastReadAt", "bookmarkedAt", "completedAt"].every((k) => p[k] === undefined || typeof p[k] === "number")
  );
}

export const progressKey = (lessonKey: string) => `curio.progress.v1.${lessonKey}`;

/** One lesson's stored progress, for screens that list many lessons. */
export function readLessonProgress(lessonKey: string): LessonProgress {
  return readJson(progressKey(lessonKey), isProgress) ?? EMPTY;
}

/**
 * Per-lesson progress for the signed-in user. Stored on the device for now;
 * the same shape becomes `lessonProgress` + `bookmarks` on the API.
 * Active time only counts while the tab is visible.
 */
export function useLessonProgress(lessonKey: string, estimatedMinutes: number) {
  const key = progressKey(lessonKey);
  const [progress, setProgress] = useState<LessonProgress>(() => readJson(key, isProgress) ?? EMPTY);
  const latest = useRef(progress);

  const save = useCallback(
    (patch: Partial<LessonProgress>) => {
      setProgress((prev) => {
        const now = Date.now();
        const next: LessonProgress = { ...prev, ...patch, lastReadAt: now };
        if (!next.completed && !next.manuallyIncomplete && getPreferences().autoComplete && shouldAutoComplete(next.maxScrollPct, next.activeSeconds, estimatedMinutes)) {
          next.completed = true;
        }
        if (next.completed && !prev.completed) next.completedAt = now;
        if (next.bookmarked && !prev.bookmarked) next.bookmarkedAt = now;
        latest.current = next;
        writeJson(key, next);
        return next;
      });
    },
    [key, estimatedMinutes],
  );

  useEffect(() => {
    const tick = window.setInterval(() => {
      if (document.visibilityState === "visible") save({ activeSeconds: latest.current.activeSeconds + 5 });
    }, 5000);
    return () => window.clearInterval(tick);
  }, [save]);

  return {
    progress,
    toggleBookmark: () => save({ bookmarked: !latest.current.bookmarked }),
    toggleComplete: () => {
      const completed = !latest.current.completed;
      save({ completed, manuallyIncomplete: !completed });
    },
    reportScroll: (pct: number) => {
      if (pct > latest.current.maxScrollPct) save({ maxScrollPct: pct });
    },
  };
}
