import { ArrowRight } from "lucide-react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BlockRenderer } from "./components/blocks/block-renderer";
import { ContentsSheet } from "./components/contents-sheet";
import { LessonHeader } from "./components/lesson-header";
import { NotesSheet } from "./components/notes-sheet";
import { ReaderBottomBar } from "./components/reader-bottom-bar";
import { ReaderTopBar } from "./components/reader-top-bar";
import { SettingsSheet } from "./components/settings-sheet";
import { SAMPLE_HIGHLIGHTS, SAMPLE_LESSON, SAMPLE_PATH } from "./data/sample";
import { useLessonProgress } from "./hooks/use-lesson-progress";
import { useReaderSettings } from "./hooks/use-reader-settings";
import { scrollProgress } from "./lib/progress";
import { orphanedHighlights } from "./lib/segments";
import { FONT_SIZES, LINE_HEIGHTS } from "./lib/settings";

type Sheet = "settings" | "contents" | "notes" | null;

export function ReaderPage() {
  // Single sample lesson until the API exists; the route already carries pathId/lessonKey.
  const lesson = SAMPLE_LESSON;
  const path = SAMPLE_PATH;
  const highlights = SAMPLE_HIGHLIGHTS;

  const [settings, setSettings] = useReaderSettings();
  const { progress, toggleBookmark, toggleComplete, reportScroll } = useLessonProgress(lesson.lessonKey, lesson.estimatedMinutes);
  const [scrollPct, setScrollPct] = useState(0);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [openHighlightId, setOpenHighlightId] = useState<string | null>(null);

  // Theme lives on <html> so sheets (portalled to <body>) pick it up too.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.readerTheme = settings.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", getComputedStyle(root).getPropertyValue("--r-bar").trim());
    return () => {
      delete root.dataset.readerTheme;
    };
  }, [settings.theme]);

  const textStyle: CSSProperties = {
    fontSize: FONT_SIZES[settings.fontStep],
    lineHeight: LINE_HEIGHTS[settings.spacing],
    fontFamily: settings.typeface === "serif" ? "var(--font-serif)" : "var(--font-sans)",
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
        <article className="mx-auto max-w-[68ch] px-5.5 pt-5.5 pb-10">
          <LessonHeader lesson={lesson} sourceCount={sourceCount} />
          {lesson.blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              highlights={highlights}
              openHighlightId={openHighlightId}
              onToggleHighlight={(id) => setOpenHighlightId((cur) => (cur === id ? null : id))}
              textStyle={textStyle}
            />
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
      <ContentsSheet {...sheetProps("contents")} path={path} currentLessonKey={lesson.lessonKey} currentCompleted={progress.completed} />
      <NotesSheet {...sheetProps("notes")} highlights={highlights} orphaned={orphaned} />
    </div>
  );
}
