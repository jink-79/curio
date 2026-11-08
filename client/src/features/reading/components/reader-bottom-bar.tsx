import { Check, List, StickyNote } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ReaderBottomBarProps {
  completed: boolean;
  noteCount: number;
  onOpenContents: () => void;
  onOpenNotes: () => void;
  onToggleComplete: () => void;
  /** Floats just above the bar (the text-selection toolbar). */
  overlay?: ReactNode;
}

const sideButton = "flex h-12 w-14 flex-col items-center justify-center gap-[3px] text-[10px] font-medium text-r-muted";

export function ReaderBottomBar({ completed, noteCount, onOpenContents, onOpenNotes, onToggleComplete, overlay }: ReaderBottomBarProps) {
  return (
    <nav
      aria-label="Lesson"
      className="relative flex shrink-0 items-center gap-1.5 border-t border-r-border bg-r-bar px-2.5 pt-1.5 pb-[max(6px,calc(env(safe-area-inset-bottom)-14px))]"
    >
      {overlay && <div className="pointer-events-none absolute inset-x-0 bottom-full z-20 px-3 pb-2.5 [&>*]:pointer-events-auto">{overlay}</div>}
      <button type="button" onClick={onOpenContents} className={sideButton}>
        <List className="size-[21px]" strokeWidth={1.7} />
        Contents
      </button>
      <button type="button" onClick={onOpenNotes} className={sideButton}>
        <StickyNote className="size-[21px]" strokeWidth={1.7} />
        Notes · {noteCount}
      </button>
      <button
        type="button"
        onClick={onToggleComplete}
        aria-pressed={completed}
        className={cn(
          "flex h-[46px] flex-1 items-center justify-center gap-2 rounded-[14px] border text-[15px] font-semibold transition-colors",
          completed ? "border-r-ok bg-r-ok-bg text-r-ok" : "border-r-primary bg-r-primary text-r-on-primary active:bg-r-primary-hover",
        )}
      >
        <Check className="size-[18px]" strokeWidth={2.4} />
        {completed ? "Completed" : "Mark complete"}
      </button>
    </nav>
  );
}
