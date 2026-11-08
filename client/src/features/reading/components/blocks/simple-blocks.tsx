import { Check, ImageIcon, Lightbulb } from "lucide-react";
import { SectionHeading } from "../section-heading";

export function ImageBlock({ alt, caption, credit, src }: { alt: string; caption: string; credit: string; src?: string }) {
  return (
    <figure className="mt-5.5 mb-1.5">
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="aspect-[16/10] w-full rounded-[14px] object-cover" />
      ) : (
        <div
          role="img"
          aria-label={`Image placeholder: ${alt}`}
          className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-r-border-strong bg-r-card text-r-muted"
        >
          <ImageIcon className="size-6.5" strokeWidth={1.6} aria-hidden />
          <span className="text-xs">[Wikimedia Commons image]</span>
        </div>
      )}
      <figcaption className="mt-2 text-xs leading-[1.45] text-r-muted">
        <span className="text-r-text">{caption}</span> — {credit}
      </figcaption>
    </figure>
  );
}

export function ConceptsBlock({ heading, items }: { heading: string; items: string[] }) {
  return (
    <section>
      <SectionHeading>{heading}</SectionHeading>
      <ul className="flex flex-wrap gap-2">
        {items.map((c) => (
          <li key={c} className="rounded-[10px] bg-r-accent-bg px-3 py-[7px] text-[13px] font-medium text-r-link">
            {c}
          </li>
        ))}
      </ul>
    </section>
  );
}

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
}

export function PeopleBlock({ heading, items }: { heading: string; items: { name: string; role: string }[] }) {
  return (
    <section>
      <SectionHeading className="mb-3">{heading}</SectionHeading>
      <ul className="grid grid-cols-2 gap-2">
        {items.map((p) => (
          <li key={p.name} className="flex items-center gap-2.5 rounded-xl border border-r-border bg-r-card p-2.5">
            <div aria-hidden className="grid size-[34px] shrink-0 place-items-center rounded-[9px] bg-r-accent-bg text-xs font-semibold text-r-link">
              {initials(p.name)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium">{p.name}</div>
              <div className="text-[11px] text-r-muted">{p.role}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TimelineBlock({ heading, items }: { heading: string; items: { date: string; text: string; emphasis?: boolean }[] }) {
  return (
    <section>
      <SectionHeading className="mb-3">{heading}</SectionHeading>
      <ol>
        {items.map((d, i) => (
          <li key={d.date} className="flex gap-3.5">
            <div aria-hidden className="flex w-2.5 flex-col items-center">
              <span className={d.emphasis ? "mt-1 size-2.5 rounded-full border-2 border-r-primary bg-r-primary" : "mt-1 size-2.5 rounded-full border-2 border-r-primary bg-r-bg"} />
              {i < items.length - 1 && <span className="my-1 w-0.5 flex-1 bg-r-border" />}
            </div>
            <div className="pb-4">
              <div className="text-xs font-semibold text-r-link">{d.date}</div>
              <div className="mt-0.5 text-sm leading-[1.45]">{d.text}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function TakeawaysBlock({ items }: { items: string[] }) {
  return (
    <section className="mt-3.5 rounded-2xl border border-r-border bg-r-card p-4">
      <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">
        <Lightbulb className="size-[15px] text-r-primary" strokeWidth={2} aria-hidden />
        Key takeaways
      </h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((k) => (
          <li key={k} className="flex gap-2.5 text-sm leading-normal">
            <Check className="mt-[3px] size-4 shrink-0 text-r-ok" strokeWidth={2.4} aria-hidden />
            <span>{k}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
