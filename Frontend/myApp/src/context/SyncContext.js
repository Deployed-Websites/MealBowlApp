import { createContext, useContext } from "react";

export const SyncContext = createContext(null);

// Components call this instead of receiving 9 individual props.
export function useSyncContext() {
  const ctx = useContext(SyncContext);
  if (!ctx) {
    throw new Error("useSyncContext must be used inside a <SyncProvider>");
  }
  return ctx;
}
