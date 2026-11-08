# CURIO client

The CURIO web app: a Vite + React + TypeScript project generated from the official `create-vite` `react-ts` template.

```bash
npm install
npm run dev        # http://localhost:5173 (use `npm run dev -- --host` to open it on your phone over LAN)
npm test           # unit tests (Vitest)
npm run lint       # oxlint
npm run typecheck
npm run build      # outputs dist/
```

Requires Node 22.12+.

## Layout

```
index.html          app shell, PWA meta tags
public/             favicon, home-screen icons, web manifest
src/main.tsx        entry point
src/App.tsx         root component (router)
src/router.tsx      routes
src/index.css       Tailwind + design tokens (docs/09-design-system.md)
src/features/       one folder per feature (reading/ …)
src/pages/          route-level pages that aren't a feature yet
src/lib/            small shared helpers
vercel.json         SPA rewrite + asset caching for Vercel
```
