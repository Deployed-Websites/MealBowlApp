# Git Context

## Branch strategy
Single developer — all work on `main`. No feature branches in practice.

## Commit style
Non-descriptive commit messages are intentional (a `"git"` npm script runs `git add . && git commit -m '.' && git push`). This is a known rough edge, not a sign of unstable code.

## Recent significant commits
- Mid-July: incremental cleanup pass (custom hooks extraction, file reorganization, utils consolidation) — see decisions.md
- Early August: two commits described as "unrelated scope creep" — personal Excel tool files added to repo

## Deploy process
Frontend: `npm run deploy` (builds Vite app, copies to `/docs`, pushes to GitHub → GitHub Pages auto-deploys)
Backend: push to main → Render auto-deploys from `Procfile`

## .gitignore gaps
Large binary and generated files are committed (combine_excel.exe ~30MB, test_files/*.xlsx) — these should be gitignored or moved to a separate repo.
