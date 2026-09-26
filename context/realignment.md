# Realignment

## Purpose
This file is written at the start of a session when Claude needs to re-orient after a context loss, compact, or confused state.

## When to use
Run `/realign` (or read this file) when:
- A session has gone off-track
- After a PreCompact, resuming mid-task
- Picking up after a long gap

## Project North Star
MealBowlApp is a personal, single-developer project. The goal is a working bowl-ordering flow — not production hardening, not refactoring for its own sake. Prefer small, focused changes over sweeping cleanups unless explicitly asked.

## Current priorities (update as needed)
1. Fix the admin page stale cache issue
2. Clean up dead code (auth.js, Data model, Firebase config)
3. Remove debug logging

## What NOT to do without asking
- Introduce a state management library (Redux, Zustand, etc.)
- Add automated tests (not a current priority)
- Refactor the sessionStorage cache design (known rough edge, accepted for now)
- Touch the `/docs` build output directly
