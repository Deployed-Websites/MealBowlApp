// This exact pattern - a mounted ref, a saveClicked callback, and an effect
// watching reShowSave - used to be copy-pasted identically in HomePage.jsx,
// Contact.jsx, LoginLogic.jsx, MainCheckout.jsx, and SpecificBowlContents.jsx.
// Any component that needs "sync my changes when reShowSave becomes true"
// now just calls useSaveSync() once instead of carrying its own copy.

import { useEffect, useRef, useCallback } from "react";
import { useSyncContext } from "../context/SyncContext.js";

export function useSaveSync() {
  const { saveChanges, reShowSave, setreShowSave, setText } = useSyncContext();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const saveClicked = useCallback(async () => {
    if (!isMounted.current) return;
    setText("Syncing changes");
    console.log("Syncing changes");
    await saveChanges();

    if (!isMounted.current) return;
    console.log("Synced changes");
    setText("Synced changes");
    setreShowSave(false);
  }, [saveChanges, setText, setreShowSave]);

  useEffect(() => {
    if (reShowSave) {
      (async () => {
        await saveClicked();
      })();
    }
  }, [reShowSave, saveClicked]);
}
