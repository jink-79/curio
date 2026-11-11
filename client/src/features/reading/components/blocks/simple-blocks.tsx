import { SectionHeading } from "../section-heading";

/** Only real images are shown: an empty placeholder is noise in a reading view. */
export function ImageBlock({ alt, caption, credit, src }: { alt: string; caption: string; credit: string; src?: string }) {
  if (!src) return null;
  return (
    <figure className="my-7">
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-xl" />
      <figcaption className="mt-2 text-xs leading-[1.45] text-r-muted">
        {caption} — {credit}
      </figcaption>
    </figure>
  );
}

/** Dates as a plain two-column list: knowledge, not decoration. */
export function TimelineBlock({ heading, items }: { heading: string; items: { date: string; text: string }[] }) {
  return (
    <section>
      <SectionHeading>{heading}</SectionHeading>
      <dl className="divide-y divide-r-border border-y border-r-border">
        {items.map((d) => (
          <div key={d.date} className="flex gap-4 py-3">
            <dt className="w-[6.5rem] shrink-0 text-sm text-r-muted tabular-nums">{d.date}</dt>
            <dd className="text-[15px] leading-normal">{d.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
