import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/cn";
import { usePathProgress } from "@/features/paths/hooks/use-path-progress";
import { BlockRenderer } from "./components/blocks/block-renderer";
import { ContentsSheet } from "./components/contents-sheet";
import { LessonEnd } from "./components/lesson-end";
import { LessonHeader } from "./components/lesson-header";
import { NotesSheet } from "./components/notes-sheet";
import { ReaderBottomBar } from "./components/reader-bottom-bar";
import { ReaderTopBar } from "./components/reader-top-bar";
import { SettingsSheet } from "./components/settings-sheet";
import { LessonUnavailable } from "./components/lesson-unavailable";
import { NoteSheet } from "./components/note-sheet";
import { SelectionBar } from "./components/selection-bar";
import { SAMPLE_LESSONS, SAMPLE_PATHS } from "./data/sample";
import { useHighlights } from "./hooks/use-highlights";
import { addHighlight, removeHighlight, updateHighlight } from "./lib/highlight-store";
import { clearSelection, type PendingSelection, readSelection } from "./lib/selection";
import { useLessonProgress } from "./hooks/use-lesson-progress";
import { useReaderSettings } from "./reader-settings";
import { scrollProgress } from "./lib/progress";
import { orphanedHighlights } from "./lib/segments";
import { FONT_SIZES, LINE_HEIGHTS } from "./lib/settings";
import type { HighlightColor, LessonView, PathOutline } from "./types";

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
  const allHighlights = useHighlights();
  const highlights = useMemo(() => allHighlights.filter((h) => h.lessonKey === lesson.lessonKey), [allHighlights, lesson.lessonKey]);
  const articleRef = useRef<HTMLElement>(null);
  const [pending, setPending] = useState<PendingSelection | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastColor, setLastColor] = useState<HighlightColor>("blue");
  const [toast, setToast] = useState("");

  // Watch the text selection inside the lesson (one read per frame). On iOS, touching a toolbar
  // button can clear the selection just before the tap lands, so the last usable selection is
  // kept in a ref and the bar lingers briefly after the selection disappears.
  const readyRef = useRef<PendingSelection | null>(null);
  useEffect(() => {
    let frame = 0;
    let hideTimer = 0;
    const onChange = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!articleRef.current) return;
        const next = readSelection(articleRef.current, highlights);
        window.clearTimeout(hideTimer);
        if (next) {
          if (next.status === "ready") readyRef.current = next;
          setPending(next);
        } else {
          hideTimer = window.setTimeout(() => {
            readyRef.current = null;
            setPending(null);
          }, 450);
        }
      });
    };
    document.addEventListener("selectionchange", onChange);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer);
      document.removeEventListener("selectionchange", onChange);
    };
  }, [highlights]);
  const done = () => {
    clearSelection();
    readyRef.current = null;
    setPending(null);
  };

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };
  const highlightSelection = (color: HighlightColor, thenEditNote: boolean) => {
    const sel = readyRef.current;
    if (sel?.status !== "ready") return;
    const { blockId, quote } = sel;
    const h = addHighlight({ lessonKey: lesson.lessonKey, blockId, exact: quote.exact, color, ...(quote.prefix ? { prefix: quote.prefix } : {}), ...(quote.suffix ? { suffix: quote.suffix } : {}) });
    setLastColor(color);
    done();
    if (thenEditNote) setEditingId(h.id);
    else flash("Highlighted");
  };
  const copySelection = async () => {
    const sel = readyRef.current;
    if (sel?.status !== "ready") return;
    const text = `“${sel.quote.exact}” — ${lesson.title}, ${path.title} (CURIO)`;
    try {
      await navigator.clipboard.writeText(text);
      flash("Copied with citation");
    } catch {
      flash("Couldn’t copy");
    }
    done();
  };

  const [settings, setSettings] = useReaderSettings();
  const { progress, toggleBookmark, toggleComplete, reportScroll, savePosition } = useLessonProgress(lesson.lessonKey, lesson.estimatedMinutes);
  const [scrollPct, setScrollPct] = useState(0);
  const [sheet, setSheet] = useState<Sheet>(null);
  const mainRef = useRef<HTMLElement>(null);

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

  // Resume where you left off (unless a deep link says where to go, or the lesson is finished).
  const [initialProgress] = useState(progress);
  useEffect(() => {
    const ratio = initialProgress.position ?? 0;
    if (targetBlock || initialProgress.completed || ratio < 0.03 || ratio > 0.97) return;
    const frame = requestAnimationFrame(() => {
      const el = mainRef.current;
      if (!el) return;
      el.scrollTop = ratio * (el.scrollHeight - el.clientHeight);
      flash("Picked up where you left off");
    });
    return () => cancelAnimationFrame(frame);
  }, [initialProgress, targetBlock]);

  // Bars slide away while reading down and return on scroll up or at the ends.
  const [barsHidden, setBarsHidden] = useState(false);
  const lastTop = useRef(0);
  const barsForced = sheet !== null || pending !== null || editingId !== null || toast !== "";
  const hideBars = barsHidden && !barsForced;

  const pathProgress = usePathProgress(path);
  const lessons = useMemo(() => path.stages.flatMap((s) => s.lessons), [path]);
  const index = lessons.findIndex((l) => l.lessonKey === lesson.lessonKey);
  const nextOutline = index >= 0 ? lessons[index + 1] : undefined;
  const next = nextOutline ? { ...nextOutline, readable: nextOutline.lessonKey in SAMPLE_LESSONS } : null;
  const prerequisiteUnread = lesson.buildsOn ? pathProgress.statuses[lesson.buildsOn.lessonKey] !== "done" : false;
  const sources = lesson.blocks.flatMap((b) => (b.type === "sources" ? b.items : []));

  const textStyle: CSSProperties = {
    fontSize: FONT_SIZES[settings.fontStep],
    lineHeight: LINE_HEIGHTS[settings.spacing],
    fontFamily: settings.typeface === "serif" ? "var(--font-read-serif)" : "var(--font-read-sans)",
  };

  const orphaned = useMemo(
    () =>
      lesson.blocks.flatMap((b) =>
        b.type === "authored" ? orphanedHighlights(b.markdown, highlights.filter((h) => h.blockId === b.id)) : [],
      ),
    [lesson, highlights],
  );

  const minutesLeft = Math.max(1, Math.ceil(lesson.estimatedMinutes * (1 - scrollPct / 100)));
  const status = progress.completed ? "Finished" : scrollPct >= 98 ? "End of lesson" : `${minutesLeft} min left`;

  const sheetProps = (name: Exclude<Sheet, null>) => ({
    open: sheet === name,
    onOpenChange: (open: boolean) => setSheet(open ? name : null),
  });

  return (
    <div className="fixed inset-0 overflow-hidden bg-r-bg text-r-text">
      <main
        ref={mainRef}
        className="absolute inset-0 overflow-y-auto overscroll-contain pt-[calc(env(safe-area-inset-top)+54px)] pb-[calc(env(safe-area-inset-bottom)+64px)]"
        onScroll={(e) => {
          const el = e.currentTarget;
          const pct = scrollProgress(el.scrollTop, el.scrollHeight, el.clientHeight);
          setScrollPct(pct);
          reportScroll(pct);
          const max = el.scrollHeight - el.clientHeight;
          if (max > 0) savePosition(el.scrollTop / max);
          const delta = el.scrollTop - lastTop.current;
          lastTop.current = el.scrollTop;
          if (el.scrollTop < 60 || pct >= 98) setBarsHidden(false);
          else if (delta > 8) setBarsHidden(true);
          else if (delta < -8) setBarsHidden(false);
        }}
      >
        <article ref={articleRef} className="mx-auto max-w-[66ch] px-6 pt-6 pb-6 font-reading">
          <LessonHeader lesson={lesson} prerequisiteUnread={prerequisiteUnread} />
          {lesson.blocks.map((block) => (
            <div
              key={block.id}
              id={`block-${block.id}`}
              className={cn(
                "-mx-2 scroll-mt-[calc(env(safe-area-inset-top)+64px)] rounded-xl px-2 transition-colors duration-700",
                flashBlock === block.id ? "bg-r-accent-bg" : "bg-transparent",
              )}
            >
              <BlockRenderer
                block={block}
                highlights={highlights}
                openHighlightId={openHighlightId}
                onToggleHighlight={(id) => setOpenHighlightId((cur) => (cur === id ? null : id))}
                onEditHighlight={setEditingId}
                textStyle={textStyle}
              />
            </div>
          ))}
          <LessonEnd pathId={path.pathId} completed={progress.completed} onToggleComplete={toggleComplete} next={next} sources={sources} />
        </article>
      </main>

      <ReaderTopBar
        backTo={`/p/${lesson.pathId}`}
        stageLabel={`Stage ${lesson.stage.number} · ${lesson.stage.title}`}
        positionLabel={`Lesson ${lesson.position.index} of ${lesson.position.total}`}
        progress={scrollPct}
        bookmarked={progress.bookmarked}
        hidden={hideBars}
        onToggleBookmark={toggleBookmark}
        onOpenSettings={() => setSheet("settings")}
      />

      <ReaderBottomBar
        status={status}
        noteCount={highlights.length}
        hidden={hideBars}
        onOpenContents={() => setSheet("contents")}
        onOpenNotes={() => setSheet("notes")}
        overlay={
          pending ? (
            <SelectionBar
              selection={pending}
              onHighlight={(c) => highlightSelection(c, false)}
              onNote={() => highlightSelection(lastColor, true)}
              onCopy={copySelection}
            />
          ) : toast ? (
            <div role="status" className="mx-auto w-fit rounded-full bg-r-text px-4 py-2 text-[13px] font-medium text-r-bg shadow-lg">
              {toast}
            </div>
          ) : null
        }
      />

      <SettingsSheet {...sheetProps("settings")} settings={settings} onChange={setSettings} />
      <ContentsSheet
        {...sheetProps("contents")}
        path={path}
        currentLessonKey={lesson.lessonKey}
        currentCompleted={progress.completed}
        statuses={pathProgress.statuses}
      />
      <NotesSheet
        {...sheetProps("notes")}
        highlights={highlights}
        orphaned={orphaned}
        onSelect={(h) => {
          setSheet(null);
          setEditingId(h.id);
        }}
      />
      <NoteSheet
        highlight={highlights.find((h) => h.id === editingId) ?? null}
        onClose={() => setEditingId(null)}
        onSave={(id, patch) => {
          updateHighlight(id, patch);
          setOpenHighlightId(id);
        }}
        onDelete={(id) => {
          removeHighlight(id);
          flash("Highlight deleted");
        }}
      />
    </div>
  );
}
