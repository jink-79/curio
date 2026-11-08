const when = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "today", "yesterday", "3 days ago", "2 months ago" — by calendar day, not 24h windows. */
export function relativeDay(at: number, now = Date.now()): string {
  const days = Math.round((startOfDay(at) - startOfDay(now)) / 86_400_000);
  if (days > -30) return when.format(days, "day");
  return when.format(Math.round(days / 30), "month");
}
