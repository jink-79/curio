import { Bookmark, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface ReaderTopBarProps {
  backTo: string;
  stageLabel: string;
  positionLabel: string;
  progress: number;
  bookmarked: boolean;
  onToggleBookmark: () => void;
  onOpenSettings: () => void;
}

export function ReaderTopBar(props: ReaderTopBarProps) {
  const { backTo, stageLabel, positionLabel, progress, bookmarked, onToggleBookmark, onOpenSettings } = props;
  return (
    <header className="shrink-0 bg-r-bar pt-[env(safe-area-inset-top)]">
      <div className="flex h-[52px] items-center gap-1 px-1.5">
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
          className={bookmarked ? "grid size-11 place-items-center rounded-xl text-brand" : "grid size-11 place-items-center rounded-xl text-r-text"}
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
      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-0.5 bg-r-border"
      >
        <div className="h-0.5 bg-brand transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
}
