# 02 — Feature Specifications

Each feature lists rules and acceptance criteria (AC). "Editor" means the path owner or a user with the editor role.

---

## F1. Authentication & accounts

**Rules**
- Sign up with email, password and display name. Password minimum is 10 characters, checked against a small bundled common-password list. There are no composition rules (NIST 800-63B).
- Passwords are hashed with argon2id.
- Sessions are stored server-side (`sessions` collection), and the browser holds a random 256-bit token in an `httpOnly`, `Secure`, `SameSite=Lax` cookie. Sessions expire after 30 days rolling, or 14 days idle.
- Every state-changing request must send the `X-CURIO-CSRF` header, which carries a per-session token. The cookie's SameSite setting plus this header together form the CSRF defence.
- Login is rate-limited to 5 attempts per 15 minutes per account and per IP, and responses do not reveal whether an email is registered.
- Users can change their password, which revokes all other sessions, and can log out of all devices.
- Users can export their data (JSON) and delete their account (path-ownership rules are in review C3).
- Password reset and email verification depend on Q3. If no email provider is chosen, an admin-issued one-time reset link is the fallback.

**AC**
- A wrong password and an unknown email return the same 401 response, with the same body and similar timing.
- After a password change, any other open session receives 401 on its next request.

## F2. Categories

- Categories are hierarchical (`parentId`) with a slug, name, description, icon name and sort order.
- Only admins can create or change them. A category with paths in it cannot be deleted; it must be merged into another category first.
- The 10 launch categories are seeded from the brief. New categories are data, not code, which satisfies "expandable without architectural changes."

## F3. Learning paths

**Fields:** title (3–120 characters), description (≤2,000), category, difficulty (`beginner | intermediate | advanced`), objectives (1–10 short strings), reading depth (`overview | standard | deep`), estimated time (derived from lessons, can be overridden), visibility (`private | unlisted | public`), language, licence, tags (≤10).

**Rules**
- A path has exactly one **draft** and zero or more **published versions**.
- A path cannot be public or unlisted until it has at least one published version.
- An **unlisted** path is reachable by `/p/:slug-:shareToken`. The share token is 128-bit random and can be regenerated, which invalidates old links. Unlisted pages send `noindex`.
- **Fork** copies the latest published version (or the draft, for an owner) into a new private path. The fork records `forkedFrom: {pathId, versionId}` and keeps attribution, which CC BY-SA requires.
- A path can be deleted only by its owner. Deleting it archives the path: its versions remain readable by enrolled users, and their overlays are retained.

**AC**
- A follower of v1 sees v1 content even after v2 is published.
- Changing visibility from public to private removes the path from discovery, but existing enrollments keep read access to the versions they are pinned to. **[PROPOSED]** The alternative is to revoke access; decide before M12.

## F4. Curriculum editing (stages & lessons)

- Editors can add, remove, rename and reorder stages and lessons, and move a lesson between stages.
- Lessons have a stable `lessonKey` (UUID). It is created once and kept when a lesson is renamed, moved or edited, and it is never reused.
- Ordering uses fractional rank strings (LexoRank-style), so a reorder writes a single document.
- Each lesson has: title, summary, objectives, prerequisite concept references, estimated minutes (auto-calculated from word count at 230 wpm plus 30 s per image, can be overridden), and blocks.
- Draft edits use optimistic concurrency. Each draft carries a `revision` number, and a write sent with a stale revision gets 409.
- **Rule:** no external refresh process may write to a draft or a version. Only user actions do.

**AC**
- Reorder followed by a refresh keeps the order. Two editors reordering concurrently: the second gets 409 with the current state attached.

## F5. Publishing & versioning

- **Publish** validates the draft (every stage is non-empty, every lesson has a title, every excerpt has a licence). It then creates an immutable `PathVersion` in a single transaction.
- The publisher writes a short changelog. The system also computes a structural diff (lessons added, removed, renamed, moved or changed) keyed by `lessonKey`.
- Each enrollment is pinned to `versionId`. When a newer version exists, the follower sees a banner: "v3 available — 2 lessons added, 1 changed. Review & update."
- **Migrate:** progress, notes, highlights and bookmarks carry over by `lessonKey`. Lessons that were removed keep their overlays as *archived*, still visible in the library. Lessons whose content changed keep their progress, and their highlights are re-anchored (see F9).
- A follower can stay on an old version indefinitely. Old versions are never deleted while any enrollment references them.

**AC**
- Migration is idempotent. Running it twice gives the same result. Migration never deletes overlay data.

## F6. Curriculum generation

See [04-curriculum-engine](04-curriculum-engine.md). Summary:

- Input: subject text, plus optional category, depth, difficulty and size (S = 5–8 lessons, M = 9–16, L = 17–30).
- Output: a **proposal**, shown in a review screen where the user can accept, edit or discard each stage and lesson. Only after acceptance is it written to the draft.
- Every generated item shows its provenance ("From Wikipedia: *Outline of World War II*, section 'Background'").
- Quota: 10 generations per user per day (configurable).

## F7. Content discovery & attachment

See [05-content-engine](05-content-engine.md). Summary:

- From a lesson, an editor opens a **Find sources** panel. Results are grouped by provider, with relevance scores, licence badges and dedup clusters.
- The editor attaches a resource with a role: `primary | further_reading | image | reference`. If the licence permits reproduction, the editor can also **snapshot an excerpt** into a block.
- Content is never auto-attached to public paths. During generation, high-confidence matches are pre-selected but still go through user review.

## F8. Reader

- The reader shows stage and lesson navigation (a sidebar on desktop, a drawer on mobile), and blocks in schema order with empty sections hidden.
- Controls: font size (5 steps), reading width (narrow 60ch, medium 70ch, wide 80ch), line height, and theme (Q5). These are saved per user (server side) and cached locally.
- Reading progress is calculated as scroll depth per lesson, reported every 15 s while the tab is visible and active (heartbeat), plus an explicit "Mark complete."
- A lesson auto-completes at 90% scroll *and* at least 40% of its estimated time, so skimming to the end doesn't count. The user can always mark it complete or incomplete manually.
- Prerequisite notice: if a lesson's prerequisite concepts map to incomplete lessons in the same path, a non-blocking notice says so. Navigation is never blocked.
- Every excerpt and image shows an attribution footer: provider, title, author, licence (linked), "View original," and "retrieved on DATE."

## F9. Bookmarks, notes, highlights

- **Bookmarks** can point to a lesson or to a specific block.
- **Notes** are Markdown, limited to 20,000 characters and sanitized on render. They are attached to a lesson, a block or a highlight, or are free-standing in the library.
- **Highlights** store `{versionId, lessonKey, blockId, contentHash, selector: {exact, prefix, suffix}, color}`, using four colours.
- When the user migrates versions and a block's `contentHash` has changed, the system searches the new block text for `exact` using prefix and suffix context. If it finds a match, the highlight is re-anchored. If not, it is marked `orphaned` and stays visible in the library together with its quoted text.
- All of this data is private to its owner, with no exceptions.

## F10. Knowledge library & search

- Lists every bookmark, note, highlight, review card and completed lesson, with filters for type, path, category and date.
- Full-text search uses MongoDB text indexes on the user's own notes and highlights and on the titles of lessons they are enrolled in. Every search is filtered by `userId`.

## F11. Quizzes

> **Superseded for the reader (ADR-026, Nov 2026):** lessons show no knowledge checks or takeaways. Kept here only as history.


- Question types: `mcq` (2–6 options, one correct), `true_false`, `fill_blank` (accepts several answers, case-insensitive, trimmed).
- Each question has an explanation and optional source references.
- Questions come from three origins: `authored` (editor), `wikidata` (deterministic templates, e.g. "In what year did X occur?", with distractors drawn from sibling entities), and `llm` (optional, Q1, must cite a source block).
- Quizzes are versioned with the lesson. Attempts are stored per user. Wrong answers can create review cards.

## F12. Spaced repetition

- A review card has a front, a back, its source (`quiz_question | highlight | manual`) and a reference.
- The scheduler interface is `schedule(card, grade: 0..5, now) → {dueAt, interval, ease, reps, lapses}`. The default is SM-2.
- The daily queue holds due cards sorted by `dueAt`, with a cap of 50 new cards per day (configurable).
- Cards stay valid when the curriculum changes. If their source is removed, the card keeps a snapshot of its own text.

## F13. Analytics (personal)

- Reading time is the sum of heartbeats. Data is aggregated nightly by the worker into `dailyStats` (minutes, lessons completed, quiz accuracy, reviews done, per category).
- The dashboard shows a weekly chart, streak, completion per path, quiz accuracy trend and review retention.
- There is no cross-user analytics in planned phases, apart from admin aggregate counts.

## F14. Community & collaboration (Phase 6)

- Roles on a path:

| Capability | Owner | Editor | Contributor | Viewer |
|---|---|---|---|---|
| Read (private path) | ✓ | ✓ | ✓ | ✓ |
| Edit draft | ✓ | ✓ | — | — |
| Publish | ✓ | ✓ | — | — |
| Submit proposal | ✓ | ✓ | ✓ | — |
| Review proposals | ✓ | ✓ | — | — |
| Manage members, visibility, delete | ✓ | — | — | — |

- Any signed-in user can submit a proposal on a public path, acting as an implicit contributor.
- Proposal types: `add_lesson`, `edit_lesson`, `remove_lesson`, `add_resource`, `reorder`, `report_inaccuracy`.
- Proposals reference the draft revision they were based on. Accepting one applies the change to the draft, and a conflict (stale revision) needs manual resolution.
- Contribution history is an append-only `activity` log per path (who, what, when, proposal link).

## F15. Moderation & administration

- Any user can report a path, lesson, resource or proposal (reason enum plus free text).
- The moderator queue offers four actions: dismiss, hide content (soft), take down (hard, with notice to the owner), or ban user. Every moderator action is written to an `auditLog`.
- The admin panel covers: categories, provider health (success rate, 429 counts, circuit state), job queue status, user management, and feature flags (for example enabling the LLM generator).
