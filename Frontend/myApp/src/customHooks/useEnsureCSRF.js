// Wraps the "make sure we have a CSRF token as soon as this page loads"
// pattern that was duplicated in HomePage.jsx and LoginLogic.jsx.

import { useEffect } from "react";
import { ensureCSRFToken } from "../utils/api.js";

export function useEnsureCSRF() {
  useEffect(() => {
    (async () => {
      await ensureCSRFToken();
    })();
  }, []);
}
