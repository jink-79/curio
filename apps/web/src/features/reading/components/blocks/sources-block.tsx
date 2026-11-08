import type { SourceRef } from "../../types";
import { SectionHeading } from "../section-heading";

/** Attribution is mandatory: provider, licence, and a link to the original on every source. */
export function SourcesBlock({ heading, items }: { heading: string; items: SourceRef[] }) {
  return (
    <section>
      <SectionHeading className="mb-3">{heading}</SectionHeading>
      <ul className="flex flex-col gap-2">
        {items.map((s) => (
          <li key={s.url}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl border border-r-border bg-r-card px-3.5 py-3 text-r-text no-underline"
            >
              <div className="flex justify-between gap-2 text-[11px] text-r-muted">
                <span>
                  {s.provider} · {s.role}
                </span>
                <span className="rounded-md border border-r-border-strong px-[7px] py-px font-semibold text-r-text">{s.licence.label}</span>
              </div>
              <div className="mt-1.5 text-sm font-medium">{s.title}</div>
              <div className="mt-0.5 flex justify-between text-xs text-r-muted">
                <span>{s.meta}</span>
                <span className="text-r-link">
                  View original <span aria-hidden>↗</span>
                  <span className="sr-only">(opens in a new tab)</span>
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
