import { Menu } from "lucide-react";
import { cn } from "@/lib/cn";
import { useOpenAppMenu } from "./app-menu";

/** The ☰ button at the top right of every tab screen. */
export function MenuButton({ className }: { className?: string }) {
  const open = useOpenAppMenu();
  return (
    <button type="button" onClick={open} aria-label="Open menu" className={cn("grid size-11 place-items-center rounded-xl text-r-text", className)}>
      <Menu className="size-[22px]" strokeWidth={1.8} />
    </button>
  );
}
