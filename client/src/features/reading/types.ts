/**
 * Reader view models. These mirror the block model in docs/06-data-model.md
 * and will move to a shared package once the API exists.
 */

export type ReaderTheme = "dark" | "dim" | "light" | "tidepool";
export type TypePairing = "tidepool" | "fern" | "bookmark";
export type Typeface = "serif" | "sans";
export type LineSpacing = "compact" | "comfort" | "airy";

export interface Licence {
  /** Short label shown on the badge, e.g. "CC BY-SA 4.0". */
  label: string;
  url?: string;
}

export interface SourceRef {
  provider: string;
  role: "Primary reading" | "Further reading" | "Reference";
  title: string;
  /** Author/date or retrieval line. */
  meta: string;
  url: string;
  licence: Licence;
}

export type Block =
  | { id: string; type: "authored"; heading?: string; markdown: string }
  | { id: string; type: "image"; alt: string; caption: string; credit: string; src?: string }
  | { id: string; type: "concepts"; heading: string; items: string[] }
  | { id: string; type: "people"; heading: string; items: { name: string; role: string }[] }
  | { id: string; type: "timeline"; heading: string; items: { date: string; text: string; emphasis?: boolean }[] }
  | { id: string; type: "takeaways"; items: string[] }
  | { id: string; type: "quiz"; questions: QuizQuestion[] }
  | { id: string; type: "sources"; heading: string; items: SourceRef[] };

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation: string;
}

export interface LessonView {
  lessonKey: string;
  pathId: string;
  pathTitle: string;
  category: string;
  title: string;
  subtitle: string;
  difficulty: string;
  estimatedMinutes: number;
  stage: { number: number; title: string };
  position: { index: number; total: number };
  buildsOn?: { title: string; completed: boolean };
  blocks: Block[];
  next?: { title: string; minutes: number };
}

export interface PathLesson {
  lessonKey: string;
  title: string;
  minutes: number;
  /** One-line hint shown under the title in the curriculum. */
  summary: string;
  /** Sample data only: treat as already completed (lesson 1 has no written content). */
  seedCompleted?: boolean;
}

export interface PathOutline {
  pathId: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  objectives: string[];
  stages: { number: number; title: string; lessons: PathLesson[] }[];
}

/** A user's highlight on one block, anchored by quoted text (W3C TextQuoteSelector style). */
export interface Highlight {
  id: string;
  blockId: string;
  exact: string;
  note?: string;
}
