# 10 — Development Milestone Plan

Each milestone is small enough to review in one sitting and ends with **demoable behavior + tests + updated docs**. The phase order differs from the brief: content adapters come *before* generation, because generation depends on them (review B6).

Size: S ≈ 2–4 days, M ≈ 1–2 weeks, L ≈ 2–3 weeks for one experienced developer. These are indicative and recalibrated after M2.

## Phase 1 — Foundation

### M1. Repository & toolchain (S)
- `client/` from the official `create-vite` React + TypeScript template (+ Tailwind, React Router, Radix/shadcn-style UI), `server/` (Express + TS) when the API starts, and `shared/` (Zod schemas + types) — see ADR-023.
- Strict `tsconfig` (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). ESLint + Prettier. Vitest (unit), Supertest (API), Playwright (a few end-to-end tests).
- `docker-compose.yml` with a single-node Mongo replica set. `.env.example`.
- Express skeleton: helmet, request ID, JSON logger (pino), error envelope, `/healthz`.
- Web skeleton: router, theme tokens from doc 09, app shell, favicon and icons.
- CI: a GitHub Actions workflow that runs typecheck, lint and test. This is free for public repos and within free minutes for private ones.
- **Done when:** `docker compose up` followed by `npm run dev` serves the shell, and CI is green.

### M2. Authentication & users (M) — *needs Q3*
- Register, login, logout, sessions, CSRF, password change, rate limits, `/auth/me`. Frontend auth pages and route guards.
- Tests: hashing, session expiry, CSRF rejection, uniform response for wrong password vs unknown email, rate limit.

### M3. Categories, paths & the draft/version model (M)
- Category seed and admin CRUD. Path CRUD with `private` visibility only.
- `pathDrafts` with stages and lessons: CRUD, reorder (fractional ranks), optimistic concurrency.
- **Publishing + immutable versions + diff**, as pure functions with full unit tests.
- The editor UI: tree, lesson form, and authored Markdown blocks only.
- **Done when:** a user creates a path, edits it, publishes v1 and v2, and sees the diff.

## Phase 2 — Reading core (single-player loop)

### M4. Reader + progress (M)
- Lesson rendering by block type, the reader layout, typography controls and preferences.
- Heartbeat progress, completion rules, enrollment pinned to a version, and a Dashboard "Continue reading" card.

### M5. Bookmarks, notes, highlights (M)
- Overlay CRUD with text-quote selectors and the highlight popover.
- **Isolation test suite:** user B gets 404 or 403 on every overlay endpoint that touches user A's data.

### M6. Version migration (S)
- Update banner, diff view, migration service (re-anchoring, archiving), and idempotency tests.
- **MVP checkpoint A:** private single-player CURIO works end to end without any external provider.

## Phase 3 — Content engine

### M7a. Provider framework + Wikimedia adapters (L)
- `ProviderAdapter` contract, HTTP client with User-Agent, token-bucket limiter, circuit breaker, `providerCache`, typed errors.
- Wikipedia, Wikidata and Commons adapters. Contract tests use recorded fixtures (no live calls in CI).
- Licence policy module (unit tested against the full table).
- Lesson **Find sources** panel, attach, **snapshot excerpt**, sanitization, AttributionFooter.

### M7b. Curriculum generation (L) — *Q1*
- Subject resolution and disambiguation, the deterministic pipeline (doc 04), generation jobs on the worker, and the proposal review UI.
- **Evaluation set:** 30 subjects with reference curricula, plus a scoring script that runs as a regression check in CI.
- Prerequisite concepts and ordering-conflict warnings.

### M8. Scholarly & library providers (M)
- OpenAlex (key-gated), Crossref (polite pool), dedup by DOI and fuzzy match, relevance weights tuned on the evaluation set.
- Gutenberg offline catalog import job. Library of Congress adapter with a 15 requests/min limiter.
- Re-verification jobs and "update available" flags. Admin provider-health panel.

## Phase 4 — Discovery & sharing

### M9. Public and unlisted paths, Discover, follow, fork (M)
- Visibility rules, share tokens, Discover search (text index), category pages, PathCard, follow, and fork with attribution. Reader themes (Q5).
- Minimal reporting plus the moderator takedown flow. This is required before public visibility goes live if Q4 = public launch.
- **MVP checkpoint B:** this is the shippable MVP.

## Phase 5 — Retention

### M10. Quizzes (M)
- Authored quiz editor, Wikidata-derived question templates, attempts and explanations.

### M11. Spaced repetition + library + analytics (L)
- `ReviewScheduler` with SM-2 (unit tests against reference sequences), review queue UI, cards from highlights and wrong answers.
- Knowledge library with unified search.
- Daily stats aggregation and the analytics dashboard (charts follow the dataviz guidelines).

## Phase 6 — Community

### M12. Roles & collaboration (L) — *Q2 must be settled*
- `pathMembers`, the policy module covering the full role matrix, proposals (submit, review, apply), activity log, and contributor credit in changelogs.

### M13. Moderation & admin completion (M)
- Report queue, suspensions, audit log, feature flags, account deletion and data export.

## Phase 7 — Advanced (scoped separately, not estimated)
Optional local-LLM generator and summarizer (Ollama adapter), concept knowledge graph view (from the `concepts` edges), mind maps, recommendations (co-enrollment plus concept overlap, deterministic first), offline reading (PWA + IndexedDB cache of pinned versions).

## Per-milestone template (applied to every PR)

1. **Objective** — one paragraph.
2. **Files/modules touched.**
3. **Architecture notes** — link to the ADR if a decision was made.
4. **Implementation.**
5. **Testing instructions** — commands plus manual steps.
6. **Verification** — expected behavior checklist.
7. **Docs updated** — which files in `docs/`.

## Testing strategy summary

| Layer | Tooling | Must cover |
|---|---|---|
| Pure logic | Vitest | diff, migration mapping, ranking/ordering, licence policy, dedup, relevance, SM-2, reading-time estimate, highlight re-anchoring |
| API | Vitest + Supertest + Mongo (replica set via docker or `mongodb-memory-server` **[PROPOSED dev dep]**) | authz matrix, overlay isolation, 409 conflicts, publish transaction |
| Adapters | Recorded fixtures | normalization, licence extraction, 429 handling |
| Web | Vitest + Testing Library | forms, query states |
| E2E | Playwright (≤10 flows) | register → create → publish → follow → read → highlight → migrate |
