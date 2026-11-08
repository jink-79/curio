import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

/** Phone-first modal sheet: slides up from the bottom, traps focus, closes on scrim tap or Escape. */
export function BottomSheet({ open, onOpenChange, title, description, children }: BottomSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/55 data-[state=open]:animate-[fade-in_160ms_ease-out]" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[82dvh] w-full max-w-xl overflow-y-auto rounded-t-[22px] border-t border-r-border bg-r-sheet px-5 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-r-text outline-none data-[state=open]:animate-[sheet-up_200ms_ease-out]"
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <div aria-hidden className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-r-border-strong" />
          <div className="mb-2 flex items-center justify-between">
            <Dialog.Title className="font-display text-lg font-semibold">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="-mr-2.5 grid size-11 place-items-center rounded-xl text-r-muted"
            >
              <X className="size-5" strokeWidth={2} />
            </Dialog.Close>
          </div>
          {description && <Dialog.Description className="sr-only">{description}</Dialog.Description>}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
