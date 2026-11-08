import { Bookmark, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";
import type { LibraryItem } from "../lib/library";
import { relativeDay } from "../lib/relative-day";

function Footer({ item, label }: { item: LibraryItem; label: string }) {
  return (
    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-r-muted">
      <span className="truncate">
        {item.lesson.lessonTitle} · {item.lesson.pathTitle}
      </span>
      <span aria-hidden className="ml-auto shrink-0">
        {label}
      </span>
    </div>
  );
}

const cardClass = "block rounded-2xl border border-r-border bg-r-card p-4 text-r-text no-underline active:bg-r-accent-bg";

export function LibraryItemCard({ item }: { item: LibraryItem }) {
  const lessonUrl = `/read/${item.lesson.pathId}/${item.lesson.lessonKey}`;
  const ago = item.at ? relativeDay(item.at) : "";

  if (item.kind === "highlight") {
    const hl = item.id.slice(2);
    return (
      <Link to={`${lessonUrl}?block=${encodeURIComponent(item.blockId)}&hl=${encodeURIComponent(hl)}`} className={cardClass}>
        <span className="sr-only">Highlight: </span>
        <blockquote className="border-l-[3px] pl-3 font-serif text-[16px] leading-normal" style={{ borderColor: `var(--hl-solid-${item.color})` }}>
          {item.quote}
        </blockquote>
        {item.note && (
          <p className="mt-2.5 text-sm leading-normal whitespace-pre-line">
            <span className="sr-only">Note: </span>
            {item.note}
          </p>
        )}
        <Footer item={item} label={ago ? `${item.note ? "Note" : "Highlight"} · ${ago}` : item.note ? "Note" : "Highlight"} />
      </Link>
    );
  }

  if (item.kind === "bookmark") {
    return (
      <Link to={lessonUrl} className={cn(cardClass, "flex items-center gap-3.5")}>
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-r-accent-bg text-r-primary">
          <Bookmark className="size-[18px]" fill="currentColor" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="sr-only">Bookmarked lesson: </span>
          <span className="block truncate font-serif text-[17px] font-medium">{item.lesson.lessonTitle}</span>
          <span className="mt-0.5 block truncate text-xs text-r-muted">
            {item.lesson.pathTitle} · {item.lesson.minutes} min{ago ? ` · saved ${ago}` : ""}
          </span>
        </span>
      </Link>
    );
  }

  return (
    <Link to={lessonUrl} className={cn(cardClass, "flex items-center gap-3.5")}>
      <span
        aria-hidden
        className={cn("grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums", item.completed ? "bg-r-ok text-r-on-status" : "text-r-text")}
        style={
          item.completed
            ? undefined
            : { background: `conic-gradient(var(--r-primary) ${Math.round(item.percent * 3.6)}deg, var(--r-border) 0)`, boxShadow: "inset 0 0 0 4px var(--r-card)" }
        }
      >
        {item.completed ? <Check className="size-[18px]" strokeWidth={2.6} /> : `${item.percent}%`}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-serif text-[17px] font-medium">{item.lesson.lessonTitle}</span>
        <span className="mt-0.5 block truncate text-xs text-r-muted">
          {item.completed ? "Completed" : `${item.percent}% read`} · {item.lesson.pathTitle}
          {ago ? ` · ${ago}` : ""}
        </span>
      </span>
    </Link>
  );
}
