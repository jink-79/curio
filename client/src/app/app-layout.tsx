import { BookOpen, Compass, Library } from "lucide-react";
import { useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { SettingsSheet } from "@/features/reading/components/settings-sheet";
import { useReaderSettings } from "@/features/reading/reader-settings";
import { cn } from "@/lib/cn";
import { AppMenuContext } from "./app-menu";
import { AppMenuDrawer } from "./app-menu-drawer";
import { lastPathId } from "./last-path";

/*
 * Screens with the bottom tab bar. The layout fills the real screen
 * (fixed inset-0) and the tab bar is the last flex child, so it always sits
 * on the bottom edge, and each page scrolls its own content above it.
 * Only tabs whose screens exist are shown.
 */
export function AppLayout() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  // The ☰ button lives in each page, outside the dialog, so focus is returned to it by hand.
  const opener = useRef<HTMLElement | null>(null);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [settings, setSettings] = useReaderSettings();
  const tabs = [
    { to: "/discover", label: "Discover", icon: Compass, active: pathname.startsWith("/discover") },
    { to: `/p/${lastPathId()}`, label: "Learning", icon: BookOpen, active: pathname.startsWith("/p/") },
    { to: "/library", label: "Library", icon: Library, active: pathname.startsWith("/library") },
  ];

  return (
    <AppMenuContext.Provider
      value={() => {
        opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setMenuOpen(true);
      }}
    >
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
      <AppMenuDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        returnFocusTo={opener}
        onAppearance={() => {
          setMenuOpen(false);
          setAppearanceOpen(true);
        }}
      />
      <SettingsSheet open={appearanceOpen} onOpenChange={setAppearanceOpen} settings={settings} onChange={setSettings} />
    </AppMenuContext.Provider>
  );
}
