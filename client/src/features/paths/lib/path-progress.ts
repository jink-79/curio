import type { PathLesson, PathOutline } from "@/features/reading/types";

export type LessonStatus = "done" | "next" | "todo";

export interface PathProgress {
  statuses: Record<string, LessonStatus>;
  doneCount: number;
  total: number;
  /** 0–100, rounded. */
  percent: number;
  minutesLeft: number;
  /** The lesson "Continue" opens: the first unfinished lesson that can be read, else null. */
  next: (PathLesson & { stageNumber: number }) | null;
}

/**
 * Where a learner stands in a path. `isDone` and `isReadable` are passed in
 * so the same logic works for device storage today and the API later.
 */
export function computePathProgress(
  path: PathOutline,
  isDone: (lesson: PathLesson) => boolean,
  isReadable: (lesson: PathLesson) => boolean,
): PathProgress {
  const lessons = path.stages.flatMap((s) => s.lessons.map((l) => ({ ...l, stageNumber: s.number })));
  const done = new Set(lessons.filter(isDone).map((l) => l.lessonKey));
  const next = lessons.find((l) => !done.has(l.lessonKey) && isReadable(l)) ?? null;

  const statuses: Record<string, LessonStatus> = {};
  for (const l of lessons) {
    statuses[l.lessonKey] = done.has(l.lessonKey) ? "done" : l.lessonKey === next?.lessonKey ? "next" : "todo";
  }

  const total = lessons.length;
  return {
    statuses,
    doneCount: done.size,
    total,
    percent: total === 0 ? 0 : Math.round((done.size / total) * 100),
    minutesLeft: lessons.filter((l) => !done.has(l.lessonKey)).reduce((m, l) => m + l.minutes, 0),
    next,
  };
}

/** "1h 40m", "45m", "2h". */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
