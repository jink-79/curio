import { List, StickyNote } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ReaderBottomBarProps {
  /** e.g. "6 min left" or "Finished". */
  status: string;
  noteCount: number;
  hidden: boolean;
  onOpenContents: () => void;
  onOpenNotes: () => void;
  /** Floats just above the bar (the text-selection toolbar, toasts). */
  overlay?: ReactNode;
}

const sideButton = "flex h-12 w-16 flex-col items-center justify-center gap-[3px] text-[10px] font-medium text-r-muted";

export function ReaderBottomBar({ status, noteCount, hidden, onOpenContents, onOpenNotes, overlay }: ReaderBottomBarProps) {
  return (
    <nav
      aria-label="Lesson"
      className={cn(
        "absolute inset-x-0 bottom-0 z-10 border-t border-r-border bg-r-bar px-2.5 pt-1 pb-[max(6px,calc(env(safe-area-inset-bottom)-14px))] transition-transform duration-200 ease-out",
        hidden && "translate-y-full",
      )}
    >
      {overlay && <div className="pointer-events-none absolute inset-x-0 bottom-full z-20 px-3 pb-2.5 [&>*]:pointer-events-auto">{overlay}</div>}
      <div className="flex items-center justify-between" inert={hidden}>
        <button type="button" onClick={onOpenContents} className={sideButton}>
          <List className="size-[21px]" strokeWidth={1.7} />
          Contents
        </button>
        <span className="text-xs text-r-muted tabular-nums" aria-live="off">
          {status}
        </span>
        <button type="button" onClick={onOpenNotes} className={sideButton}>
          <StickyNote className="size-[21px]" strokeWidth={1.7} />
          Notes{noteCount > 0 ? ` · ${noteCount}` : ""}
        </button>
      </div>
    </nav>
  );
}
