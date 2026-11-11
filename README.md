# CURIO

**Explore. Learn. Remember.**

CURIO is a structured learning platform: you follow ordered learning paths, read lessons with their sources attributed, and build a personal knowledge library.

## Status

We're building one screen at a time, phone-first.

| Screen | State |
|---|---|
| Discover (`/discover`, the app's start screen) | Built. Search, continue-learning card, the 10 categories and all paths. |
| Category (`/discover/c/:slug`) | Built. A category's paths, or an empty state. |
| Path overview (`/p/:pathId`, the Learning tab) | Built. Shows progress, a Continue button and the stage-by-stage curriculum. |
| Library (`/library`) | Built. Highlights, notes, bookmarks and reading history, with search and filters. |
| Preferences (`/preferences`, from the ☰ menu) | Built. Article length (stored for the content engine), topics shown first in Discover, auto-complete on/off. |
| Reader (`/read/:pathId/:lessonKey`) | Built. Has reading settings, type pairings and themes. |

All screens use sample data: two paths (World War II, History of AI) and one written lesson. Progress and settings are saved on the device until accounts exist.

The API so far has only its base (health check, error handling, config); no product endpoints yet. Planning documents are in [`docs/`](docs/README.md), starting with [`docs/00-critical-review.md`](docs/00-critical-review.md).

## Repository layout

| Folder | What |
|---|---|
| [`client/`](client/README.md) | The web app, a standard Vite + React + TypeScript project |
| [`server/`](server/README.md) | The API: Express + TypeScript + MongoDB, deployed as a Vercel function |
| [`docs/`](docs/README.md) | Product and architecture documents |

## Run locally

```bash
cd client && npm install && npm run dev    # web app on :5173
cd server && npm install && npm run dev    # API on :4000
```

See [`client/README.md`](client/README.md) and [`server/README.md`](server/README.md) for tests, lint and build.

## Deploy

There are two Vercel projects, both deploying from `main`: the web app (Root Directory `client`) and the API (Root Directory `server`, see [`server/README.md`](server/README.md#deploy-vercel)).

The web app deploys on Vercel from `main`. In the Vercel project, set **Root Directory** to `client`; Vercel then detects Vite on its own, and [`client/vercel.json`](client/vercel.json) adds the SPA rewrite. Every merge to `main` updates the live site, and every pull request gets its own preview URL.

Vercel's free Hobby plan only deploys commits authored by the account owner, so commits in this repo are authored as the owner (see ADR-022).
