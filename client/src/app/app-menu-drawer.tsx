import { ChevronRight, Download, Palette, Smartphone, X } from "lucide-react";
import { Dialog } from "radix-ui";
import { type ReactNode, type RefObject, useState } from "react";
import { cn } from "@/lib/cn";
import { downloadDeviceData } from "./export-data";

interface AppMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAppearance: () => void;
  /** Element to refocus when the menu closes (the ☰ button that opened it). */
  returnFocusTo: RefObject<HTMLElement | null>;
}

function isInstalledApp(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

function Row({ icon, title, detail, onClick, trailing }: { icon: ReactNode; title: string; detail: string; onClick: () => void; trailing?: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex min-h-16 w-full items-center gap-3.5 rounded-2xl px-3 py-2.5 text-left active:bg-r-accent-bg">
      <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-r-accent-bg text-r-link">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-r-muted">{detail}</span>
      </span>
      {trailing}
    </button>
  );
}

/** Right-hand app menu: a few app-wide actions, nothing that leads to an unbuilt screen. */
export function AppMenuDrawer({ open, onOpenChange, onAppearance, returnFocusTo }: AppMenuDrawerProps) {
  const [showInstall, setShowInstall] = useState(false);
  const [exportNote, setExportNote] = useState("");
  const installed = isInstalledApp();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setShowInstall(false);
          setExportNote("");
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 data-[state=open]:animate-[fade-in_160ms_ease-out]" />
        <Dialog.Content
          aria-describedby={undefined}
          onCloseAutoFocus={(e) => {
            if (returnFocusTo.current?.isConnected) {
              e.preventDefault();
              returnFocusTo.current.focus();
            }
          }}
          className="fixed inset-y-0 right-0 z-50 flex w-[84%] max-w-[340px] flex-col border-l border-r-border bg-r-sheet pt-[calc(env(safe-area-inset-top)+8px)] pb-[max(16px,env(safe-area-inset-bottom))] text-r-text outline-none data-[state=open]:animate-[drawer-in_200ms_ease-out]"
        >
          <div className="flex items-center justify-between pr-2 pl-5">
            <div className="flex items-center gap-2.5">
              <svg viewBox="0 0 64 64" className="size-8" aria-hidden>
                <rect width="64" height="64" rx="14" fill="#080D12" />
                <g transform="translate(-2 2)">
                  <path d="M47.5 27.9 A16 16 0 1 1 36.1 16.5" fill="none" stroke="#4C7FF5" strokeWidth="8" strokeLinecap="round" />
                  <circle cx="47" cy="17" r="5" fill="#4C7FF5" />
                </g>
              </svg>
              <Dialog.Title className="font-display text-base font-semibold tracking-[0.08em]">CURIO</Dialog.Title>
            </div>
            <Dialog.Close aria-label="Close menu" className="grid size-11 place-items-center rounded-xl text-r-muted">
              <X className="size-5" strokeWidth={2} />
            </Dialog.Close>
          </div>
          <p className="mt-1 px-5 font-serif text-[15px] text-r-muted">Explore. Learn. Remember.</p>

          <nav aria-label="App menu" className="mt-6 flex flex-col gap-1 px-2">
            <Row
              icon={<Palette className="size-5" strokeWidth={1.8} />}
              title="Appearance"
              detail="Theme, type and text size"
              onClick={onAppearance}
              trailing={<ChevronRight aria-hidden className="size-[18px] text-r-muted" strokeWidth={2} />}
            />
            <Row
              icon={<Download className="size-5" strokeWidth={1.8} />}
              title="Download my data"
              detail={exportNote || "Progress, highlights and notes"}
              onClick={() => setExportNote(downloadDeviceData() ? "Saved as a .json file" : "Couldn’t read this device’s storage")}
            />
            {!installed && (
              <>
                <Row
                  icon={<Smartphone className="size-5" strokeWidth={1.8} />}
                  title="Add to Home Screen"
                  detail="Open CURIO like an app"
                  onClick={() => setShowInstall((s) => !s)}
                  trailing={
                    <ChevronRight aria-hidden className={cn("size-[18px] text-r-muted transition-transform duration-150", showInstall && "rotate-90")} strokeWidth={2} />
                  }
                />
                {showInstall && (
                  <p className="mx-3 -mt-1 mb-1 rounded-xl bg-r-card px-3.5 py-3 text-[13px] leading-normal text-r-muted">
                    In Safari, tap <span className="font-semibold text-r-text">Share</span>, then{" "}
                    <span className="font-semibold text-r-text">Add to Home Screen</span>.
                  </p>
                )}
              </>
            )}
          </nav>

          <p role="status" className="sr-only">
            {exportNote}
          </p>
          <p className="mt-auto px-5 text-xs leading-normal text-r-muted">
            Your progress, highlights and notes are saved on this device. Accounts and sync come next.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
