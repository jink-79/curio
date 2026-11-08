# 11 — Architecture Decision Log

Format: **ID — Decision** · Status · Context → Consequence. Status is one of: Proposed, Accepted, Superseded.

| ID | Decision | Status | Rationale / consequence |
|---|---|---|---|
| ADR-001 | ~~npm-workspaces monorepo (`apps/web`, `apps/api`, `apps/worker`, `packages/shared`)~~ | Superseded by ADR-023 | |
| ADR-002 | Zod schemas in `shared/`, used for validation on both frontend and backend | Proposed | Satisfies "validate on both sides" with a single source. Adds one dependency. |
| ADR-003 | Server-side sessions in Mongo + httpOnly cookie + CSRF header; no JWT in localStorage | Proposed | Revocable sessions and no XSS token theft. Costs a DB lookup per request (indexed, cheap). |
| ADR-004 | argon2id password hashing | Proposed | OWASP recommendation. The native module needs a build toolchain; `bcrypt` is the fallback. |
| ADR-005 | MongoDB as a replica set, including in development | Proposed | Needed for multi-document transactions (publish, migrate). |
| ADR-006 | Path = mutable draft + immutable versions; lessons have a stable `lessonKey` | Proposed | Satisfies "users keep progress on old version until they migrate." This is the core of the data model. |
| ADR-007 | Lesson bodies are content-addressed (`sha256`) in `lessonContents` | Proposed | Versions share unchanged lessons, so storage grows only with actual changes. |
| ADR-008 | Highlights use text-quote selectors + contentHash, with orphaning on failure | Proposed | Highlights survive content changes, and user data is never deleted. |
| ADR-009 | Lesson content as typed blocks (JSON), not raw HTML | Proposed | Safe rendering, per-block licence and attribution, empty-section hiding. |
| ADR-010 | Provider adapters behind `ProviderAdapter`, with a shared limiter, circuit breaker and cache | Proposed | No single-provider dependency, and rate limits are enforced centrally. |
| ADR-011 | Licence policy as one pure module; `UNKNOWN` → link only | Proposed | Copyright safety by default. |
| ADR-012 | Gutenberg through the offline RDF catalog, never by crawling the site | Proposed | Required by Project Gutenberg's robot policy. |
| ADR-013 | Deterministic generator by default; generator interface allows an optional local LLM | Proposed (Q1) | AI is optional, as the brief requires. Quality limits are documented in doc 04. |
| ADR-014 | ~~Separate worker process; node-cron only enqueues; Mongo `jobs` collection with leases~~ | Superseded by ADR-021 | Vercel can't run a long-lived worker. |
| ADR-015 | SM-2 scheduler behind a `ReviewScheduler` interface | Proposed | Adapts to recall, unlike a fixed ladder. FSRS remains possible later. |
| ADR-016 | MongoDB text indexes for search in the MVP | Proposed | Zero infrastructure. Meilisearch is the upgrade path. |
| ADR-017 | Public user-authored content licensed CC BY-SA 4.0 | Proposed (Q2) | Compatible with Wikipedia excerpts, and enables forks and community edits. |
| ADR-018 | No user file uploads in the MVP; images come only from Commons | Proposed | Avoids storage cost and copyright exposure. |
| ADR-019 | Accessible role tokens layered over the brand palette | Proposed (Q7) | The brief's own palette fails WCAG AA in three places. |
| ADR-020 | Outbound fetches are restricted to an allow-list of provider hosts | Proposed | SSRF prevention. |
| ADR-021 | Host on Vercel (Hobby, free): the web app is a static build; the API will run as Vercel serverless functions. Scheduled jobs run as GitHub Actions cron workflows that call the API or scripts | Accepted | Zero cost and no servers to run. Cron moves out of the app process, so ADR-014's duplicate-run concern disappears. |
| ADR-022 | Commits are authored as the repository owner, with Claude credited in a `Co-Authored-By` trailer | Accepted | Vercel Hobby blocks deployments of commits whose author is not the account owner. |
| ADR-023 | Two independent projects, `client/` (the official `create-vite` React + TypeScript template) and `server/` (added with the API), plus a plain `shared/` folder of types and schemas that both import by relative path | Accepted | Each project keeps the standard layout of its tool, and Vercel builds `client/` as a plain Vite app (Root Directory = `client`). Workspaces can come back if sharing code by path gets painful. |
