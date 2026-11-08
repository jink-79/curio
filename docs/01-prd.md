# 01 — Product Requirements Document

**Product:** CURIO — *Explore. Learn. Remember.*
**Category:** Structured learning + personal knowledge management
**Status:** Draft v0.1 — pending answers to [open questions](00-critical-review.md#f-open-questions-summary)

## 1. Problem

Self-directed learners are failed by both kinds of tools available to them:

- **Feeds and search** (Wikipedia rabbit holes, blogs, YouTube) give information with no order, so they never teach prerequisites first.
- **Courses** (MOOCs, marketplaces) are ordered but fixed, often paid, and limited to the topics someone chose to package.
- **Note tools** (Notion, Obsidian, Anki) help you retain what you learned, but they don't help you *learn* it in the first place.

CURIO combines ordered learning journeys, attributed open sources, and personal retention tools in one loop.

## 2. Goals and non-goals

### Goals
- G1. A user can go from "I want to learn X" to an ordered, editable learning path in under 5 minutes.
- G2. Every piece of imported content shows where it came from and under what licence.
- G3. A user's progress, notes, highlights and bookmarks are never lost or altered by someone else's edits.
- G4. CURIO runs fully locally with no paid service and no AI.
- G5. Users retain what they read: quizzes and spaced review are first-class, not bolted on.

### Non-goals (explicit)
- Not a blogging or publishing platform: no free-form posts or feeds of opinion.
- Not a news aggregator: no "latest" feeds.
- Not a course marketplace: no payments, certificates or instructors-for-hire.
- No real-time co-editing (Google-Docs style) in the planned phases.
- No video hosting.
- No user file uploads in the MVP (see review C8).

## 3. Users and personas

| Persona | Description | Primary need |
|---|---|---|
| **Self-learner (Maya)** | Curious adult learning history or AI on evenings | A clear order, progress, not getting lost |
| **Curator (Arjun)** | Knows a subject, wants to build a path for others | Fast editing, sources, publish & update without breaking followers |
| **Follower (Lee)** | Finds a public path, follows it | Trust in sources, personal notes, stable progress |
| **Contributor (Sam)** | Spots an error or a better resource | Low-friction suggestion, sees outcome |
| **Moderator / Admin** | Platform operator | Handle reports, takedowns, categories, provider health |

## 4. Core concepts (glossary)

| Term | Definition |
|---|---|
| **Category** | Top-level subject (History, AI…). Hierarchical (`parentId`), admin-managed. |
| **Learning Path** | The curriculum container: metadata + a mutable **draft** + a list of immutable **published versions**. |
| **Path Version** | Immutable snapshot of stages + lessons at publish time (`v1`, `v2`…). |
| **Stage** | Ordered chapter inside a path. |
| **Lesson** | Ordered unit inside a stage. Has a **stable `lessonKey`** that survives across versions. |
| **Block** | Typed piece of lesson content (authored text, source excerpt, image, people & dates, quiz, takeaways…). |
| **Resource** | A normalized external item (article, book, paper, image, dataset) from a provider. Global and shared. |
| **Attachment** | A link between a lesson and a resource, with editor-assigned role (primary reading, further reading, image). |
| **Enrollment** | A user following a path, pinned to a specific version. |
| **Overlay** | A user's private data on top of a lesson: progress, notes, highlights, bookmarks, personal resources. |
| **Change Proposal** | A contributor's suggested modification, reviewed by owner or editor. |
| **Review Card** | A spaced-repetition item (from a quiz, highlight or manual card). |

## 5. Functional requirements (summary)

Full detail is in [02-feature-specs](02-feature-specs.md). Priority: **P0** = MVP, **P1** = next, **P2** = later.

| Area | Requirement | Priority |
|---|---|---|
| Auth | Register, log in and out, sessions, change password | P0 |
| Auth | Password reset / email verification (depends on Q3) | P0/P1 |
| Categories | Browse hierarchical categories; admin CRUD | P0 |
| Paths | Create / edit / delete path metadata; private visibility | P0 |
| Curriculum | Stages and lessons CRUD, reorder, rename | P0 |
| Curriculum | Publish versions; followers pinned to a version; migrate | P0 (model), P1 (migration UI) |
| Generation | Deterministic draft curriculum from a subject | P1 |
| Generation | Optional local-LLM generator | P2 (Q1) |
| Prerequisites | Concept prerequisites, suggested ordering warnings | P1 |
| Content | Wikipedia + Wikidata + Commons adapters | P0 |
| Content | OpenAlex, Crossref, Gutenberg (catalog), LoC adapters | P1 |
| Content | Normalization, dedup, relevance scoring, attribution | P0 |
| Reader | Structured reader, typography controls, reading width, progress | P0 |
| Personal | Bookmarks, notes, highlights | P0 |
| Visibility | Public, unlisted, private; discover and follow | P0 (read-only share) |
| Library | Searchable personal library | P1 |
| Quizzes | MCQ, true/false, fill-blank; authored + Wikidata-derived | P1 |
| Spaced repetition | Review cards, SM-2 scheduling, daily queue | P1 |
| Analytics | Personal reading time, completion, quiz, revision stats | P1 |
| Community | Roles (owner/editor/contributor/viewer), proposals, review, history | P2 |
| Moderation | Reports, takedown, bans, audit log | P1 if public launch, else P2 |
| Advanced | Knowledge graph, mind maps, recommendations, offline | P2+ |

## 6. Non-functional requirements

| Category | Requirement |
|---|---|
| Cost | No mandatory paid service. Every external service sits behind an interface and can be replaced. |
| Performance | Reader first contentful paint < 1.5 s on mid-range laptop (local). API p95 < 300 ms for non-ingestion endpoints. |
| Resilience | All provider outages degrade gracefully: cached content still renders, and generation reports which providers failed. |
| Security | OWASP ASVS L1 baseline: argon2id hashing, httpOnly session cookies, CSRF defence, rate limits, input validation on both ends, per-resource authorization checks. |
| Privacy | User overlays are readable only by their owner, enforced in the service layer *and* covered by tests. |
| Accessibility | WCAG 2.2 AA: contrast, keyboard navigation, focus visibility, reduced-motion respect. |
| Data integrity | Publishing is transactional. Published versions are immutable. User overlays are never cascade-deleted by curriculum edits. |
| Licensing | Every displayed external item shows provider, licence and attribution. Non-reproducible content is link-only. |
| Observability | Structured JSON logs, request IDs, provider health metrics visible to admins. |
| Portability | `docker compose up` runs Mongo (replica set) + API + worker + web locally. |

## 7. Success metrics (for the owner to track; in-app analytics are personal only)

- Path creation → first lesson completed: > 50% of new paths.
- 7-day return rate for users with ≥1 enrollment.
- Share of lessons with ≥1 attributed source: target 100% for generated paths.
- Review queue completion rate (once SRS ships).

## 8. Assumptions

- English-only MVP (Q6).
- Single deployment region; deployment hosting is evaluated separately (brief §12).
- Expected scale for planning: ≤10k users, ≤100k lessons. MongoDB on one replica set is more than sufficient.

## 9. Risks

See [00-critical-review](00-critical-review.md). The top three are deterministic generation quality (A1), lesson content authorship (A2), and scope creep (E).
