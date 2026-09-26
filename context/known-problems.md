# Known Problems

## Active / Open Issues

### Admin page reads stale cache only
`Admin.jsx` has an inline comment admitting it never calls `callAdminData()`/`getEverything()` itself — renders whatever is already in `sessionStorage`, relying on another flow to have populated it first. Flagged in-code as a known, deferred gap.

### No server-side price validation
`constants/bowls.js` notes that Django backend trusts whatever `bowlTotal`/`bowlName` the frontend sends — a client could POST an arbitrary price via devtools.

### Legacy dead code — auth.js
`Frontend/myApp/src/auth.js` duplicates CSRF logic now centralized in `utils/api.js`. Nothing found still imports it — candidate for deletion (confirm with grep first).

### Debug logging left in production
`console.log` calls remain in `MainCheckout.jsx`, `LoginLogic.jsx`, and `utils/api.js` (logs every server response).

### Insecure SECRET_KEY default
Django `settings.py` falls back to empty string if `SECRET_KEY` env var isn't set, rather than failing loudly.

### Unused scaffold model
`Data` in `models.py` looks like leftover Django-tutorial scaffolding, not used by the app.

### Orphaned Firebase config
`Frontend/firebase/firebaseConfig.js` sets up Firebase Auth/Analytics/emulator but nothing uses it. Real auth is Django session-based.

### Unrelated personal work in repo
`combine_excel.py`, `generate_dummy_files.py`, `dist/combine_excel.exe` (~30MB binary), 50 generated `test_files/*.xlsx` dummy files, and personal notes/PDFs are committed alongside the app. Bloats the repo. Worth splitting into a separate repo.

### Non-descriptive commit history
A `"git"` npm script runs `git add . && git commit -m '.' && git push`, explaining the long run of `'.'`/`dfs`/`sdf` commit messages — not unstable code, just informal solo-dev habits.

### Deliberate eslint-disable
`LoginLogic.jsx` has `eslint-disable-next-line react-hooks/exhaustive-deps` — `manualLogout` intentionally left out of a dependency array as a known simplification (would need `useCallback`).
