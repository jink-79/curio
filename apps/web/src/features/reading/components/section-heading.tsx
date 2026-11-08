import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Small uppercase section label used throughout lessons. */
export function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("mt-7 mb-2.5 text-[11px] font-semibold tracking-[0.14em] text-r-muted uppercase", className)}>
      {children}
    </h2>
  );
}
