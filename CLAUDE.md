# MealBowlApp

## Overview
MealBowlApp ("Jyoti's Superbowls") is a small e-commerce web app for ordering pre-configured healthy meal bowls. It's a React 19 + Vite frontend (deployed to GitHub Pages) talking to a separate Django REST-ish backend (deployed on Render) over session-cookie auth with a custom CSRF handshake. There is no payment processing — checkout just tracks basket totals server-side. The bowl catalog itself is fully static/hardcoded on the frontend, not stored in the database.

## Full context
For architecture, data flow, tech stack, file structure, key files, and known rough edges, see [context/handoff.md](context/handoff.md). When you need context for a specific request, read only the relevant section of that file (or the relevant part of the codebase) rather than the whole document.

## Progress-report doc
`context/overview.html` is a client/developer-facing progress-report artifact. Do not read it unless explicitly told to, and only update it at the end of a substantial task, when asked to.

## Updating the docs
`context/overview.html` is developer/client-facing and follows a milestone structure: a sidebar table of contents, a "Since the last major change" section at the top for incremental work, and older content grouped under "Major change" sections below it, newest first. Small refinements get added to the top section instead of editing older milestone text.

When a change is substantial enough to count as its own milestone: promote the existing "Since the last major change" section in place — relabel it "Major change: ...", move it down to sit right above the previous top-most "Major change" section (keeping newest-first order), and update its anchor/TOC entry. Then open a new, empty "Since the last major change" section at the top for whatever comes next. Never create a second parallel section and copy content into it — the existing section itself gets relabeled and repositioned.

`context/handoff.md` can follow its own structure loosely — strict adherence isn't required there, since it's Claude-facing context and having the information present matters more than the shape it's in.

The narrative sections in `overview.html` ("Since the last major change" / "Major change: ...") must be written in fully layman terms — assume the reader has no visibility into the codebase. No variable/function/file names, no code-style monospace snippets, no shorthand or acronyms invented for the codebase. Describe what changed and why the way you'd explain it out loud to someone who has never opened the repo. This rule applies specifically to those narrative sections — any explicitly developer-facing reference sections elsewhere on the page (e.g. a file/source-layout map, a "key files" table) are expected to use real code identifiers, since mapping code is their purpose.
