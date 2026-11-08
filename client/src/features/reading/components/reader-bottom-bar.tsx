import { Check, List, StickyNote } from "lucide-react";
import { cn } from "@/lib/cn";

interface ReaderBottomBarProps {
  completed: boolean;
  noteCount: number;
  onOpenContents: () => void;
  onOpenNotes: () => void;
  onToggleComplete: () => void;
}

const sideButton = "flex h-12 w-14 flex-col items-center justify-center gap-[3px] text-[10px] font-medium text-r-muted";

export function ReaderBottomBar({ completed, noteCount, onOpenContents, onOpenNotes, onToggleComplete }: ReaderBottomBarProps) {
  return (
    <nav
      aria-label="Lesson"
      className="flex shrink-0 items-center gap-1.5 border-t border-r-border bg-r-bar px-2.5 pt-1.5 pb-[max(6px,calc(env(safe-area-inset-bottom)-14px))]"
    >
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
