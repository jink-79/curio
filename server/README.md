# CURIO server

The CURIO API: Express 5 + TypeScript + MongoDB (Mongoose). It deploys to Vercel as a serverless function.

```bash
cp .env.example .env   # then fill in MONGODB_URI if you have one
npm install
npm run dev            # http://localhost:4000/api/v1/health
npm test
npm run typecheck
```

Requires Node 22. TypeScript is pinned to 5.9 because Vercel compiles the functions through the TypeScript JS API, which TypeScript 7 does not ship yet.

## Layout

```
api/index.ts             Vercel entry: exports the Express app (vercel.json routes every path here)
src/app.ts               createApp(env): middleware, routes, error handling. Never listens or connects on import
src/server.ts            local dev entry (app.listen)
src/config/env.ts        environment variables, validated with Zod at startup
src/db/connection.ts     cached Mongoose connection (reused across warm serverless invocations)
src/http/                error envelope, request id + access log
src/modules/<feature>/   one folder per API module (health/ for now)
```

## Conventions

- Base path `/api/v1`. Errors always use the envelope `{ "error": { "code", "message", "details"?, "requestId" } }` (docs/07-api-spec.md).
- Every response carries `X-Request-Id`, and each request logs one JSON line.
- Unknown errors return `500 INTERNAL` with no internals leaked; the detail goes to the log.

## Environment

| Variable | Required | Notes |
|---|---|---|
| `MONGODB_URI` | not yet | Without it, `/api/v1/health` reports `"db": "not_configured"`. |
| `CORS_ORIGINS` | yes, in production | Comma-separated browser origins, e.g. the client's Vercel URL. |
| `NODE_ENV` | no | Vercel sets `production`. |
| `PORT` | no | Local only (default 4000). |

## Deploy (Vercel)

Create a **second** Vercel project from this repo with **Root Directory = `server`**. Add `MONGODB_URI` and `CORS_ORIGINS` under Settings → Environment Variables, then check `https://<server-project>.vercel.app/api/v1/health`.
