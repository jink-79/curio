# CURIO

**Explore. Learn. Remember.**

CURIO is a structured learning platform: you follow ordered learning paths, read lessons with their sources attributed, and build a personal knowledge library.

## Status

We're building one screen at a time, phone-first.

| Screen | State |
|---|---|
| Reader (`/read/:pathId/:lessonKey`) | Built. Uses sample data; settings and progress are saved on the device. |
| Path overview (`/p/:pathId`) | Next. Shows a placeholder for now. |

There is no API yet. Planning documents are in [`docs/`](docs/README.md), starting with [`docs/00-critical-review.md`](docs/00-critical-review.md).

## Repository layout

| Folder | What |
|---|---|
| [`client/`](client/README.md) | The web app, a standard Vite + React + TypeScript project |
| `server/` | The API, added when the backend starts |
| [`docs/`](docs/README.md) | Product and architecture documents |

## Run locally

```bash
cd client
npm install
npm run dev
```

See [`client/README.md`](client/README.md) for tests, lint and build.

## Deploy

The app deploys on Vercel from `main`. In the Vercel project, set **Root Directory** to `client`; Vercel then detects Vite on its own, and [`client/vercel.json`](client/vercel.json) adds the SPA rewrite. Every merge to `main` updates the live site, and every pull request gets its own preview URL.

Vercel's free Hobby plan only deploys commits authored by the account owner, so commits in this repo are authored as the owner (see ADR-022).
