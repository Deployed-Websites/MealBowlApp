# Decisions

## July Refactor (mid-July, incremental cleanup pass)
Extracted duplicated CSRF/save-sync boilerplate that was copy-pasted across `Contact.jsx`, `HomePage.jsx`, `LoginLogic.jsx`, `MainCheckout.jsx`, `SpecificBowlContents.jsx`:
- Created `customHooks/useEnsureCSRF.js` and `customHooks/useSaveSync.js`
- Moved loose `.jsx`/`.css` files from `src/` root into `src/components/` and `src/styles/`
- Reorganized component CSS Modules into `components/modulesCSSs/`
- Consolidated all backend calls into `utils/api.js`
- Consolidated all bowl data into `constants/bowls.js`
- Introduced `SyncContext`/`SyncProvider` to replace prop-drilling of sync state

## Custom CSRF Middleware Approach
Chose to implement a custom Django middleware that copies the `X-CSRFToken` header into `request.COOKIES` and resolves `request.user` from `X-SessionId`. Rationale: cross-origin (GitHub Pages ↔ Render) prevents standard `document.cookie` access; this is a deliberate workaround for cross-site cookie friction, not an oversight.

## Static Bowl Catalog
Decided to keep the bowl catalog entirely on the frontend (`constants/bowls.js`) rather than in the database. The backend trusts whatever `bowlName`/`bowlTotal` the frontend POSTs. Accepted tradeoff: no server-side price validation.

## sessionStorage as De Facto State Store
Chose to cache `CheckoutData`, `AdminData`, `AdminPriceData` in sessionStorage rather than using a state library. Accepted tradeoff: fragile, direct cause of admin-page staleness issue.
