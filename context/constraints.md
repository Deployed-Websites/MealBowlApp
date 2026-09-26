# Constraints

## Project Constraints
- **Solo developer, personal project** — informal conventions are expected and acceptable
- **No payment processing** — out of scope; checkout tracks totals only
- **No automated tests** — not a current priority; vitest is wired but unused
- **Cross-origin deployment** — frontend (GitHub Pages) and backend (Render) are different origins, requiring `SESSION_COOKIE_SAMESITE=None; Secure` and the custom CSRF/session-header middleware

## Technical Constraints
- Django `SECRET_KEY` falls back to empty string if env var not set — does not fail loudly (known issue, acceptable for personal project)
- `Admin.jsx` can only render stale cache — it depends on another flow having already populated sessionStorage (by design, deferred)
- Bowl catalog is static frontend data — adding/changing bowls requires a code deploy, not a CMS change
- No Bowl database model — backend cannot independently validate catalog prices

## Deploy Constraints
- Frontend must be built and copied into `/docs` folder for GitHub Pages (handled by npm scripts)
- Backend on Render free tier may cold-start (slow first request)
