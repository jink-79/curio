import { Bookmark, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

interface ReaderTopBarProps {
  backTo: string;
  stageLabel: string;
  positionLabel: string;
  progress: number;
  bookmarked: boolean;
  /** Slid up out of the way while reading; the 2px progress line stays visible. */
  hidden: boolean;
  onToggleBookmark: () => void;
  onOpenSettings: () => void;
}

export function ReaderTopBar(props: ReaderTopBarProps) {
  const { backTo, stageLabel, positionLabel, progress, bookmarked, hidden, onToggleBookmark, onOpenSettings } = props;
  return (
    <header
      className={cn(
        "absolute inset-x-0 top-0 z-10 bg-r-bar pt-[env(safe-area-inset-top)] transition-transform duration-200 ease-out",
        // Keep the bottom 2px (the progress line) on screen when hidden.
        hidden && "-translate-y-[calc(100%-2px)]",
      )}
    >
      <div className={cn("flex h-[52px] items-center gap-1 px-1.5 transition-opacity duration-150", hidden && "opacity-0")} inert={hidden}>
        <Link to={backTo} aria-label="Back to path" className="grid size-11 place-items-center rounded-xl text-r-text">
          <ChevronLeft className="size-[22px]" strokeWidth={1.8} />
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-[10px] font-semibold tracking-[0.14em] text-r-muted uppercase">{stageLabel}</div>
          <div className="mt-0.5 text-[13px] font-medium">{positionLabel}</div>
        </div>
        <button
          type="button"
          onClick={onToggleBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark lesson"}
          aria-pressed={bookmarked}
          className={bookmarked ? "grid size-11 place-items-center rounded-xl text-r-primary" : "grid size-11 place-items-center rounded-xl text-r-text"}
        >
          <Bookmark className="size-5" strokeWidth={1.8} fill={bookmarked ? "currentColor" : "none"} />
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Reading settings"
          className="grid size-11 place-items-center rounded-xl font-serif text-[17px] font-semibold text-r-text"
        >
          Aa
        </button>
      </div>
      <div role="progressbar" aria-label="Reading progress" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="h-0.5 bg-r-border">
        <div className="h-0.5 bg-r-primary transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}
