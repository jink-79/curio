import { BookOpen, Compass, Library } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/cn";
import { lastPathId } from "./last-path";

/*
 * Screens with the bottom tab bar. The layout fills the real screen
 * (fixed inset-0) and the tab bar is the last flex child, so it always sits
 * on the bottom edge, and each page scrolls its own content above it.
 * Only tabs whose screens exist are shown.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const tabs = [
    { to: "/discover", label: "Discover", icon: Compass, active: pathname.startsWith("/discover") },
    { to: `/p/${lastPathId()}`, label: "Learning", icon: BookOpen, active: pathname.startsWith("/p/") },
    { to: "/library", label: "Library", icon: Library, active: pathname.startsWith("/library") },
  ];

  return (
    <div className="fixed inset-0 flex flex-col bg-r-bg text-r-text">
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
      <nav aria-label="Main" className="shrink-0 border-t border-r-border bg-r-bar pb-[max(6px,calc(env(safe-area-inset-bottom)-14px))]">
        <div className="mx-auto flex h-[50px] max-w-xl items-stretch">
          {tabs.map((t) => (
            <NavLink
              key={t.label}
              to={t.to}
              aria-current={t.active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] leading-none font-medium tracking-wide no-underline transition-colors",
                t.active ? "text-r-primary" : "text-r-muted active:text-r-text",
              )}
            >
              <t.icon className="size-[22px]" strokeWidth={t.active ? 2 : 1.6} aria-hidden />
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
