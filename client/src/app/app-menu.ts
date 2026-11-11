import { createContext, useContext } from "react";

export const AppMenuContext = createContext<(() => void) | null>(null);

/** Opens the right-hand app menu. Only available inside <AppLayout>. */
export function useOpenAppMenu(): () => void {
  const open = useContext(AppMenuContext);
  if (!open) throw new Error("useOpenAppMenu must be used inside <AppLayout>");
  return open;
}
