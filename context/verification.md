# Verification

## Verification Procedures

Run these before marking any task complete.

### Frontend
```bash
cd Frontend/myApp
npm run build
```
Build must complete with no errors.

### Backend
```bash
cd Backend/PostgreTest
python manage.py check
```
Must report no issues.

### Manual smoke test (full flow)
1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev`
3. Register a new user → should succeed
4. Log in → should succeed, `Logged-In` in sessionStorage
5. Browse bowl catalog → all 8 bowls visible
6. Add quantity to a bowl → order saved to backend
7. Go to checkout → basket totals correct
8. Log in as admin → admin page shows all users' orders

### Known gaps (no automated tests)
- vitest is configured but zero test files exist
- Django tests.py is boilerplate/empty
- No CI/CD pipeline
