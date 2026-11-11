import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { LessonView } from "../types";

interface LessonHeaderProps {
  lesson: LessonView;
  /** Show the "read this first" line (the lesson it builds on isn't finished). */
  prerequisiteUnread: boolean;
}

export function LessonHeader({ lesson, prerequisiteUnread }: LessonHeaderProps) {
  return (
    <header className="mb-8">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">
        {lesson.pathTitle} · Lesson {lesson.position.index}
      </p>
      <h1 className="mt-3 font-serif text-[34px] leading-[1.1] font-medium tracking-[-0.01em]">{lesson.title}</h1>
      <p className="mt-3 font-serif text-[18px] leading-normal text-r-muted italic">{lesson.subtitle}</p>
      <p className="mt-4 text-[13px] text-r-muted">{lesson.estimatedMinutes} min read</p>

      {lesson.buildsOn && prerequisiteUnread && (
        <Link
          to={`/p/${lesson.pathId}`}
          className="mt-4 flex items-center gap-2 border-l-2 border-r-primary py-1 pl-3 text-[13px] text-r-text no-underline"
        >
          <span>
            <span className="text-r-muted">Reads best after </span>
            {lesson.buildsOn.title}
          </span>
          <ArrowRight className="size-3.5 shrink-0 text-r-muted" strokeWidth={2} aria-hidden />
        </Link>
      )}
    </header>
  );
}
