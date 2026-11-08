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

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173 (also on your LAN IP, so you can open it on a phone)
npm test           # unit tests
npm run typecheck
npm run build
```

Requires Node 22+.

## Deploy

The app deploys on Vercel from `main` using [`vercel.json`](vercel.json). Every merge to `main` updates the live site, and every pull request gets its own preview URL.

Vercel's free Hobby plan only deploys commits authored by the account owner, so commits in this repo are authored as the owner (see ADR-022).
