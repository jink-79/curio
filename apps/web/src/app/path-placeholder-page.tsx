import { Link, useParams } from "react-router-dom";

/** Stand-in until the Path overview screen is built (next screen). */
export function PathPlaceholderPage() {
  const { pathId } = useParams();
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase">Path overview</p>
      <h1 className="font-display text-2xl font-semibold">Coming next</h1>
      <p className="max-w-xs text-sm text-r-muted">This screen is the next one we build. For now, head back to the lesson.</p>
      <Link to={`/read/${pathId ?? "world-war-2"}/treaty-of-versailles`} className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand no-underline">
        Back to the lesson
      </Link>
    </main>
  );
}
