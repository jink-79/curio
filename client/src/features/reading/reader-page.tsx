import { ArrowRight } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/cn";
import { usePathProgress } from "@/features/paths/hooks/use-path-progress";
import { BlockRenderer } from "./components/blocks/block-renderer";
import { ContentsSheet } from "./components/contents-sheet";
import { LessonHeader } from "./components/lesson-header";
import { NotesSheet } from "./components/notes-sheet";
import { ReaderBottomBar } from "./components/reader-bottom-bar";
import { ReaderTopBar } from "./components/reader-top-bar";
import { SettingsSheet } from "./components/settings-sheet";
import { LessonUnavailable } from "./components/lesson-unavailable";
import { SAMPLE_HIGHLIGHTS, SAMPLE_LESSONS, SAMPLE_PATHS } from "./data/sample";
import { useLessonProgress } from "./hooks/use-lesson-progress";
import { useReaderSettings } from "./reader-settings";
import { scrollProgress } from "./lib/progress";
import { orphanedHighlights } from "./lib/segments";
import { FONT_SIZES, LINE_HEIGHTS } from "./lib/settings";
import type { LessonView, PathOutline } from "./types";

type Sheet = "settings" | "contents" | "notes" | null;

/** Route entry: resolves the lesson (sample data until the API exists). */
export function ReaderPage() {
  const { pathId = "", lessonKey = "" } = useParams();
  const path = SAMPLE_PATHS[pathId];
  const lesson = SAMPLE_LESSONS[lessonKey];
  if (!path || !lesson || lesson.pathId !== pathId) {
    return <LessonUnavailable pathId={path ? pathId : null} title={path?.stages.flatMap((s) => s.lessons).find((l) => l.lessonKey === lessonKey)?.title} />;
  }
  // key: a different lesson gets fresh reader state (scroll, sheets, progress hook).
  return <Reader key={lesson.lessonKey} lesson={lesson} path={path} />;
}

function Reader({ lesson, path }: { lesson: LessonView; path: PathOutline }) {
  const highlights = SAMPLE_HIGHLIGHTS.filter((h) => lesson.blocks.some((b) => b.id === h.blockId));

  const [settings, setSettings] = useReaderSettings();
  const { progress, toggleBookmark, toggleComplete, reportScroll } = useLessonProgress(lesson.lessonKey, lesson.estimatedMinutes);
  const [scrollPct, setScrollPct] = useState(0);
  const [sheet, setSheet] = useState<Sheet>(null);
  // Deep link from the Library: ?block=<blockId>&hl=<highlightId> scrolls to the passage and opens its note.
  const [params] = useSearchParams();
  const targetBlock = params.get("block");
  const [openHighlightId, setOpenHighlightId] = useState<string | null>(() => params.get("hl"));
  const [flashBlock, setFlashBlock] = useState<string | null>(targetBlock);
  useEffect(() => {
    if (!targetBlock) return;
    document.getElementById(`block-${targetBlock}`)?.scrollIntoView({ block: "start" });
    const t = window.setTimeout(() => setFlashBlock(null), 1600);
    return () => window.clearTimeout(t);
  }, [targetBlock]);
  const pathProgress = usePathProgress(path);

  const textStyle: CSSProperties = {
    fontSize: FONT_SIZES[settings.fontStep],
    lineHeight: LINE_HEIGHTS[settings.spacing],
    fontFamily: settings.typeface === "serif" ? "var(--font-read-serif)" : "var(--font-read-sans)",
  };

  const sourceCount = useMemo(
    () => lesson.blocks.reduce((n, b) => n + (b.type === "sources" ? b.items.length : b.type === "image" ? 1 : 0), 0),
    [lesson],
  );
  const orphaned = useMemo(
    () =>
      lesson.blocks.flatMap((b) =>
        b.type === "authored" ? orphanedHighlights(b.markdown, highlights.filter((h) => h.blockId === b.id)) : [],
      ),
    [lesson, highlights],
  );

  const sheetProps = (name: Exclude<Sheet, null>) => ({
    open: sheet === name,
    onOpenChange: (open: boolean) => setSheet(open ? name : null),
  });

  return (
    <div className="fixed inset-0 flex flex-col bg-r-bg text-r-text">
      <ReaderTopBar
        backTo={`/p/${lesson.pathId}`}
        stageLabel={`Stage ${lesson.stage.number} · ${lesson.stage.title}`}
        positionLabel={`Lesson ${lesson.position.index} of ${lesson.position.total}`}
        progress={scrollPct}
        bookmarked={progress.bookmarked}
        onToggleBookmark={toggleBookmark}
        onOpenSettings={() => setSheet("settings")}
      />

      <main
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        onScroll={(e) => {
          const el = e.currentTarget;
          const pct = scrollProgress(el.scrollTop, el.scrollHeight, el.clientHeight);
          setScrollPct(pct);
          reportScroll(pct);
        }}
      >
        <article className="mx-auto max-w-[68ch] px-5.5 pt-5.5 pb-10 font-reading">
          <LessonHeader lesson={lesson} sourceCount={sourceCount} />
          {lesson.blocks.map((block) => (
            <div
              key={block.id}
              id={`block-${block.id}`}
              className={cn("-mx-2 scroll-mt-3 rounded-xl px-2 transition-colors duration-700", flashBlock === block.id ? "bg-r-accent-bg" : "bg-transparent")}
            >
              <BlockRenderer
                block={block}
                highlights={highlights}
                openHighlightId={openHighlightId}
                onToggleHighlight={(id) => setOpenHighlightId((cur) => (cur === id ? null : id))}
                textStyle={textStyle}
              />
            </div>
          ))}

          {lesson.next && (
            <Link
              to={`/p/${lesson.pathId}`}
              className="mt-5.5 flex items-center justify-between rounded-[14px] border border-r-border px-4 py-3.5 text-r-text no-underline"
            >
              <span>
                <span className="block text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">
                  Up next · {lesson.next.minutes} min
                </span>
                <span className="mt-0.5 block text-[15px] font-medium">{lesson.next.title}</span>
              </span>
              <ArrowRight className="size-5" strokeWidth={1.8} aria-hidden />
            </Link>
          )}
        </article>
      </main>

      <ReaderBottomBar
        completed={progress.completed}
        noteCount={highlights.length}
        onOpenContents={() => setSheet("contents")}
        onOpenNotes={() => setSheet("notes")}
        onToggleComplete={toggleComplete}
      />

      <SettingsSheet {...sheetProps("settings")} settings={settings} onChange={setSettings} />
      <ContentsSheet
        {...sheetProps("contents")}
        path={path}
        currentLessonKey={lesson.lessonKey}
        currentCompleted={progress.completed}
        statuses={pathProgress.statuses}
      />
      <NotesSheet {...sheetProps("notes")} highlights={highlights} orphaned={orphaned} />
    </div>
  );
}
