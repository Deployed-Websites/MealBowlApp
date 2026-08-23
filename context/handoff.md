# MealBowlApp — Handoff

## Purpose
MealBowlApp (branded "Jyoti's Superbowls") is a small e-commerce site for ordering pre-configured healthy meal bowls (Indian gym/diet-style bowls). Users browse a fixed catalog of bowls, view ingredients and macros, register/log in, add quantities of bowls to a running order/basket, and check out by reviewing/adjusting that basket. There's an admin page that lists every user's orders and basket totals. No payment processing exists — "checkout" only tracks basket totals server-side; it's an order-tracking tool, not a real storefront with billing.

Built and maintained by a single developer as a personal/small-scale project (not a team codebase) — expect informal conventions and some genuinely unrelated personal work mixed into the repo (see Known rough edges).

## Tech stack
- **Frontend**: React 19 + Vite 7, in `Frontend/myApp/`. React Router v7 (`BrowserRouter`) for routing. No external state library — a custom React Context (`SyncContext`/`SyncProvider`) is used instead of Redux/Zustand. Styling is CSS Modules per-component plus global CSS files.
- **Backend**: Django, project `PostgreTest`, single app `testDB`, in `Backend/PostgreTest/`. Session-cookie auth (`django.contrib.auth`) with a custom CSRF/session middleware (see Data flow). `django-cors-headers` and `dj_database_url` are used for cross-origin + DB config.
- **Database**: `sqlite3` locally (`db.sqlite3`); production almost certainly Postgres via `DATABASE_URL`/`dj_database_url` (project is literally named "PostgreTest").
- **Deploy**: Frontend builds via Vite and is copied into a root-level `/docs` folder for GitHub Pages hosting (custom npm scripts, plus `gh-pages` package). Backend deploys to Render (`Procfile`, `requirements.txt`), live at `https://mealbowlapp.onrender.com`.
- **Notably absent/unused**: 
  - No payment integration.
  - No automated tests — `vitest` is wired into `package.json` scripts but zero test files exist under `src`; Django's `testDB/tests.py` is boilerplate/empty.
  - Firebase is configured (`Frontend/firebase/firebaseConfig.js` — Auth, Analytics, an auth emulator) but appears **orphaned/unused** — actual auth goes through Django sessions, and nothing else in the codebase appears to import this file.
  - No `Bowl` database model — the bowl catalog is fully static, hardcoded in frontend source.

## Data flow / architecture
1. **Bowl catalog**: fully static, defined in `Frontend/myApp/src/constants/bowls.js` (8 bowls, each with name/price/macros/ingredients/image/slug). The backend has no matching model and does not validate prices — it trusts whatever `bowlName`/`bowlTotal` the frontend POSTs.
2. **Auth**: Django session-cookie based. Frontend calls `POST /databaseTesting/createUser/` then `login/`. Because frontend (GitHub Pages) and backend (Render) are cross-origin, `SESSION_COOKIE_SAMESITE=None` + `Secure` is used, and a CSRF token is fetched via `GET .../getToken/` (returned in the JSON body rather than read from `document.cookie`) and sent back as an `X-CSRFToken` header on POSTs. A custom Django middleware (`testDB/middleware/CustomMiddleware.py`) copies that header into `request.COOKIES` so Django's normal CSRF check works, and also accepts an `X-SessionId` header to resolve `request.user` directly — a deliberate (if nonstandard) workaround for cross-site cookie friction.
3. **Client-side login-state cache**: `sessionStorage` holds `Logged-In` / `admin` flags; `localStorage` holds `MostRecentLogin` (last username), used to find "my" basket inside cached admin-wide data.
4. **Placing/editing an order**: on a bowl detail page (`SpecificBowlContents.jsx`), entering a quantity calls `updateOrder()` (upserts an `IndividualBowlOrder` row per user+bowl) and `updateBasket()` (upserts a `Basket` row per user holding `totalPrice`) via `utils/api.js`.
5. **Sync/resync**: setting the shared context flag `reShowSave` to true (via `SyncContext`/`SyncProvider`) causes every mounted component's `useSaveSync()` hook to call `SyncProvider.saveChanges()`, which refetches the current user's data and (for admin) everyone's data + prices from the backend and re-caches the JSON into `sessionStorage` under the keys `CheckoutData`, `AdminData`, `AdminPriceData`.
6. **Checkout**: `MainCheckout.jsx` reads/writes directly against those `sessionStorage` blobs to render and edit the current user's basket, calls the same `updateOrder`/`updateBasket`/`deleteOrder` API functions to persist changes, and re-triggers `reShowSave` to force a resync.
7. **Admin view**: `Admin.jsx` renders exclusively from the cached `sessionStorage.AdminData` / `AdminPriceData` — it never independently triggers a fresh fetch (this is called out in an inline code comment as an intentionally deferred gap; it depends on some other flow having already populated the cache).

### Prior significant change (July refactor)
Git history shows no single "rewrite," but a deliberate incremental cleanup pass in mid-July:
- Extracted duplicated CSRF/save-sync boilerplate (previously copy-pasted across `Contact.jsx`, `HomePage.jsx`, `LoginLogic.jsx`, `MainCheckout.jsx`, `SpecificBowlContents.jsx`) into `customHooks/useEnsureCSRF.js` and `customHooks/useSaveSync.js`.
- Moved loose `.jsx`/`.css` files from `src/` root into `src/components/` and `src/styles/`.
- Reorganized component CSS Modules into `components/modulesCSSs/`.
- Consolidated all backend calls into `utils/api.js` and all bowl data into `constants/bowls.js`.
- Introduced `SyncContext`/`SyncProvider` to replace prop-drilling of sync state.

The two most recent commits (early August) are unrelated scope creep — see Known rough edges.

## Source layout
```
MealBowlApp/
├── README.md                      # one-line placeholder, not real docs
├── docs/                          # generated GitHub Pages build output — do not hand-edit
├── Backend/PostgreTest/           # Django backend
│   ├── manage.py
│   ├── PostgreTest/               # Django project config (settings.py, urls.py, asgi/wsgi, Procfile, requirements.txt)
│   └── testDB/                    # the single Django app
│       ├── models.py              # Data (unused scaffold), IndividualBowlOrder, Basket, Perms
│       ├── views.py               # all API logic: auth, orders, basket, admin data endpoints
│       ├── urls.py                # routes under /databaseTesting/
│       ├── middleware/CustomMiddleware.py  # custom CSRF/session-header middleware
│       └── migrations/, admin.py, apps.py, tests.py (empty)
├── Frontend/
│   ├── firebase/firebaseConfig.js # orphaned/unused Firebase setup
│   └── myApp/                     # the actual Vite React app
│       ├── package.json           # build/deploy scripts, incl. an auto git-commit-push script
│       ├── vite.config.js, index.html
│       ├── public/assets/*        # static images
│       └── src/
│           ├── main.jsx, App.jsx              # entry point + router/route table (wraps app in SyncProvider)
│           ├── auth.js                        # legacy/likely-dead duplicate of CSRF helpers now in utils/api.js
│           ├── constants/bowls.js             # static bowl catalog (source of truth for prices/macros/ingredients)
│           ├── context/SyncContext.js, SyncProvider.jsx  # shared sync state (login flags, save/resync logic)
│           ├── customHooks/useSaveSync.js, useEnsureCSRF.js
│           ├── utils/api.js                   # single source of truth for all backend calls
│           ├── components/                   # pages: HomePage, BowlImage, SpecificBowlContents, MainCheckout, Admin, LoginLogic, Contact
│           │   └── modulesCSSs/*.module.css   # per-component CSS Modules
│           ├── styles/globalStyles.css, variables.css
│           └── assets/*                       # images
├── combine_excel.py, generate_dummy_files.py, dist/combine_excel.exe, test_files/*.xlsx
│                                   # unrelated personal Excel tool + generated dummy data — not part of the app
└── csrf_explanation.pdf, *.pdf, R3F.txt, "To follow up.txt", stray root index.html
                                    # unrelated personal/scratch files checked into the repo
```

## Key files
| File | Owns |
|---|---|
| `Frontend/myApp/src/constants/bowls.js` | Bowl catalog: names, prices, macros, ingredients, images |
| `Backend/PostgreTest/testDB/views.py` + `testDB/urls.py` | Backend API endpoints/behavior |
| `Backend/PostgreTest/testDB/models.py` | DB schema (needs a migration on change) |
| `Frontend/myApp/src/utils/api.js` | All frontend→backend calls; add new endpoint wrappers here |
| `Frontend/myApp/src/App.jsx` | Routes/pages |
| `Frontend/myApp/src/context/SyncProvider.jsx` + `customHooks/useSaveSync.js` | Cross-page sync/cache-refresh behavior |
| `Frontend/myApp/src/components/modulesCSSs/*.module.css`, `src/styles/` | Styling |

## Known rough edges
- **Admin page reads stale cache only**: `Admin.jsx` has an inline comment admitting it never calls `callAdminData()`/`getEverything()` itself — it only renders whatever is already in `sessionStorage`, relying on some other flow to have populated it first. Flagged in-code as a known, deferred gap.
- **No server-side price validation**: `constants/bowls.js` notes that the Django backend trusts whatever `bowlTotal`/`bowlName` the frontend sends — a client could POST an arbitrary price via devtools with no backend check against real catalog data.
- **Legacy dead code**: `Frontend/myApp/src/auth.js` duplicates CSRF logic now centralized in `utils/api.js`; nothing found still imports it — candidate for deletion after confirming with a grep.
- **Deliberately skipped lint rule**: `LoginLogic.jsx` has an `eslint-disable-next-line react-hooks/exhaustive-deps` with a comment noting `manualLogout` is intentionally left out of a dependency array as a known simplification (would need `useCallback`).
- **Ad-hoc client cache as de facto state store**: heavy reliance on `sessionStorage`/`localStorage` keys (`CheckoutData`, `AdminData`, `AdminPriceData`, `Logged-In`, `admin`, `MostRecentLogin`) instead of component state or a real store — fragile and the direct cause of the admin-page staleness issue above.
- **Debug logging left in**: `console.log` calls remain in production code paths in `MainCheckout.jsx`, `LoginLogic.jsx`, and `utils/api.js` (logs every server response).
- **No automated tests**: `vitest` is configured in `package.json` but no test files exist; Django `tests.py` is empty/boilerplate.
- **Insecure default**: Django `settings.py` falls back to an empty string if `SECRET_KEY` isn't set in the environment, rather than failing loudly.
- **Unused scaffold model**: `Data` in `models.py` looks like leftover Django-tutorial scaffolding, not used by the app.
- **Orphaned Firebase config**: `Frontend/firebase/firebaseConfig.js` sets up Firebase Auth/Analytics/emulator but nothing appears to use it — real auth is Django session-based.
- **Unrelated personal work committed to the repo**: `combine_excel.py`, `generate_dummy_files.py`, a compiled `dist/combine_excel.exe` (~30MB binary), 50 generated `test_files/*.xlsx` dummy files, and personal notes/PDFs (`To follow up.txt`, `csrf_explanation.pdf`, misc mockup PDFs) are committed alongside the actual app — bloats the repo and is unrelated to MealBowlApp itself. Worth splitting into a separate repo.
- **Commit history is largely non-descriptive**: a `"git"` npm script runs `git add . && git commit -m '.' && git push`, explaining the long run of `'.'`/`dfs`/`sdf`/"just saving stuff" commit messages — not a sign of unstable code, just informal solo-dev habits.
