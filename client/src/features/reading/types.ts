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

/**
 * Lesson content blocks. The reader is deliberately reading-only: no
 * quizzes, takeaways or decorative chips (owner decision, ADR-026).
 */
export type Block =
  | { id: string; type: "authored"; heading?: string; markdown: string }
  | { id: string; type: "image"; alt: string; caption: string; credit: string; src?: string }
  | { id: string; type: "timeline"; heading: string; items: { date: string; text: string }[] }
  /** Attribution, required by source licences; rendered as a quiet footnote. */
  | { id: string; type: "sources"; items: SourceRef[] };

export interface LessonView {
  lessonKey: string;
  pathId: string;
  pathTitle: string;
  category: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  stage: { number: number; title: string };
  position: { index: number; total: number };
  /** A lesson this one assumes you have read; shown only while it isn't finished. */
  buildsOn?: { lessonKey: string; title: string };
  blocks: Block[];
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

export interface Category {
  slug: string;
  name: string;
  description: string;
  /** Lucide icon name, mapped to a component in the UI. */
  icon: "landmark" | "cpu" | "sparkles" | "flask" | "briefcase" | "trending-up" | "scale" | "brain" | "sigma" | "code";
}

export interface PathOutline {
  pathId: string;
  title: string;
  description: string;
  categorySlug: string;
  difficulty: string;
  objectives: string[];
  stages: { number: number; title: string; lessons: PathLesson[] }[];
}

export type HighlightColor = "blue" | "yellow" | "green" | "pink";

/**
 * A user's highlight on one block, anchored by quoted text in the style of the
 * W3C TextQuoteSelector: the exact words plus a little context either side,
 * so repeated phrases resolve to the right occurrence and edits to the lesson
 * can be detected.
 */
export interface Highlight {
  id: string;
  lessonKey: string;
  blockId: string;
  exact: string;
  prefix?: string;
  suffix?: string;
  color: HighlightColor;
  note?: string;
  createdAt: number;
  updatedAt?: number;
}
