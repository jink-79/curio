# CURIO

**Explore. Learn. Remember.**

CURIO is a structured learning platform: you follow ordered learning paths, read lessons with their sources attributed, and build a personal knowledge library.

## Status

We're building one screen at a time, phone-first.

| Screen | State |
|---|---|
| Reader (`/read/:pathId/:lessonKey`) | Built. Uses sample data; settings and progress are saved on the device. |
| Path overview (`/p/:pathId`) | Next. Shows a placeholder for now. |

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
