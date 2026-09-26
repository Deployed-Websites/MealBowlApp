# Dependencies

## Frontend
- React 19 + React Router v7
- Vite 7 (build + dev server)
- `gh-pages` (deploy to GitHub Pages)
- `vitest` (configured but zero test files exist)

## Backend
- Django
- `django-cors-headers`
- `dj_database_url`
- `gunicorn` (production server via Procfile)

## Infrastructure
- GitHub Pages (frontend hosting)
- Render (backend hosting — `https://mealbowlapp.onrender.com`)
- SQLite (local dev) / Postgres (production via DATABASE_URL)

## Notably Absent / Unused
- **No payment integration** — checkout is order-tracking only
- **No automated tests** — vitest configured but zero test files; Django tests.py is boilerplate/empty
- **Firebase** — `Frontend/firebase/firebaseConfig.js` configures Auth/Analytics/emulator but is **orphaned/unused**; nothing imports it; real auth is Django session-based
- **No Bowl database model** — catalog is entirely frontend-static; backend never validates prices against catalog data
