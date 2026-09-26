# Architecture

## Tech Stack
- **Frontend**: React 19 + Vite 7, in `Frontend/myApp/`. React Router v7 (`BrowserRouter`). No external state library — custom React Context (`SyncContext`/`SyncProvider`). Styling: CSS Modules per-component + global CSS.
- **Backend**: Django, project `PostgreTest`, single app `testDB`, in `Backend/PostgreTest/`. Session-cookie auth (`django.contrib.auth`) with custom CSRF/session middleware. Uses `django-cors-headers` and `dj_database_url`.
- **Database**: `sqlite3` locally (`db.sqlite3`); production Postgres via `DATABASE_URL`/`dj_database_url`.
- **Deploy**: Frontend → Vite build → `/docs` folder → GitHub Pages. Backend → Render (`Procfile`, `requirements.txt`), live at `https://mealbowlapp.onrender.com`.

## Data Flow

1. **Bowl catalog**: fully static in `Frontend/myApp/src/constants/bowls.js` (8 bowls, name/price/macros/ingredients/image/slug). Backend has no matching model — trusts whatever the frontend POSTs.

2. **Auth**: Django session-cookie based. Cross-origin (GitHub Pages ↔ Render) handled via `SESSION_COOKIE_SAMESITE=None` + `Secure`. CSRF token fetched via `GET .../getToken/` (returned in JSON body, sent back as `X-CSRFToken` header). Custom middleware (`testDB/middleware/CustomMiddleware.py`) copies that header into `request.COOKIES` and also resolves `request.user` from an `X-SessionId` header — nonstandard workaround for cross-site cookie friction.

3. **Client-side login-state cache**: `sessionStorage` holds `Logged-In`/`admin` flags; `localStorage` holds `MostRecentLogin`.

4. **Placing/editing orders**: `SpecificBowlContents.jsx` calls `updateOrder()` (upserts `IndividualBowlOrder` per user+bowl) and `updateBasket()` (upserts `Basket` per user) via `utils/api.js`.

5. **Sync/resync**: setting `reShowSave` to true (via `SyncContext`) triggers every mounted component's `useSaveSync()` hook → `SyncProvider.saveChanges()` → refetches + re-caches into `sessionStorage` as `CheckoutData`, `AdminData`, `AdminPriceData`.

6. **Checkout**: `MainCheckout.jsx` reads/writes `sessionStorage` blobs, calls `updateOrder`/`updateBasket`/`deleteOrder`, re-triggers `reShowSave`.

7. **Admin view**: `Admin.jsx` renders exclusively from cached `sessionStorage.AdminData`/`AdminPriceData` — never independently triggers a fresh fetch (deferred known gap; relies on another flow populating the cache first).

## Source Layout
```
MealBowlApp/
├── docs/                          # generated GitHub Pages build — do not hand-edit
├── Backend/PostgreTest/
│   ├── manage.py
│   ├── PostgreTest/               # Django project config (settings.py, urls.py, Procfile, requirements.txt)
│   └── testDB/
│       ├── models.py              # IndividualBowlOrder, Basket, Perms (+ unused Data scaffold)
│       ├── views.py               # all API logic
│       ├── urls.py                # routes under /databaseTesting/
│       └── middleware/CustomMiddleware.py
├── Frontend/
│   ├── firebase/firebaseConfig.js # orphaned/unused Firebase setup
│   └── myApp/
│       ├── package.json
│       ├── vite.config.js, index.html
│       └── src/
│           ├── main.jsx, App.jsx
│           ├── auth.js                        # legacy/likely-dead duplicate of CSRF helpers
│           ├── constants/bowls.js             # static bowl catalog
│           ├── context/SyncContext.js, SyncProvider.jsx
│           ├── customHooks/useSaveSync.js, useEnsureCSRF.js
│           ├── utils/api.js                   # all backend calls
│           ├── components/                    # pages: HomePage, BowlImage, SpecificBowlContents, MainCheckout, Admin, LoginLogic, Contact
│           │   └── modulesCSSs/*.module.css
│           └── styles/globalStyles.css, variables.css
└── (unrelated personal files — see known-problems.md)
```

## Key Files
| File | Owns |
|---|---|
| `Frontend/myApp/src/constants/bowls.js` | Bowl catalog: names, prices, macros, ingredients |
| `Backend/PostgreTest/testDB/views.py` + `urls.py` | Backend API endpoints |
| `Backend/PostgreTest/testDB/models.py` | DB schema |
| `Frontend/myApp/src/utils/api.js` | All frontend→backend calls |
| `Frontend/myApp/src/App.jsx` | Routes |
| `Frontend/myApp/src/context/SyncProvider.jsx` + `customHooks/useSaveSync.js` | Cross-page sync/cache |
