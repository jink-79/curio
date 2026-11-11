import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** A quiet serif subhead, like a book or long-form article — not a form label. */
export function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("mt-10 mb-3 font-serif text-[22px] leading-snug font-medium tracking-[-0.005em]", className)}>{children}</h2>;
}
