# 03 — User Journeys & Workflows

## J1. First run → first lesson (Self-learner)

1. Land on **Discover** (no account needed): categories, featured public paths, search box "What do you want to learn?".
2. Type "World War II".
   - If public paths match, they are shown first ("Follow an existing path").
   - Secondary action: "Build my own path" leads to sign-up if the user is anonymous, then J2.
3. Choose a public path, then the **Path detail** page: objectives, stages, estimated time, sources summary, version and last updated date.
4. Click **Follow**. An enrollment is created and pinned to the current version.
5. **Reader** opens at lesson 1. Prerequisite notices are shown, and progress is tracked.
6. At the end of the lesson: "Mark complete," the knowledge check (once it ships), and a "Next lesson" button.

**Failure paths:** if a provider is down, cached excerpts still render, and any image that fails to load shows its attribution with "View original."

## J2. Generate a path (Curator)

```
Subject ─► Options (category, depth, size) ─► Generating… (progress per provider)
      ─► Proposal review ─► Accept (writes draft) ─► Editor ─► Publish v1 ─► Set visibility
```

1. **New path** → "Start from subject" (or "Start blank" / "Start from template").
2. Enter "History of Artificial Intelligence", category AI, depth Standard, size M.
3. A job is queued. The UI polls `GET /generation-jobs/:id`, shows per-provider status (Wikipedia ✓, Wikidata ✓, OpenAlex ⚠ rate limited — skipped), and typically finishes in under 20 s.
4. **Proposal review**: a tree of stages and lessons. Each item shows a confidence bar and a provenance chip. The user can toggle items on and off, rename them, drag to reorder, and see candidate resources per lesson.
   - Warnings: "Lesson 'Transformers' lists prerequisite 'Neural networks', which comes later in the order. Move it?"
5. **Accept** writes the selected items to the draft. Generation output is never published directly.
6. In the **Editor**, the user writes authored blocks, attaches resources and snapshots excerpts.
7. **Publish** opens a validation checklist, then the changelog, and creates v1.
8. Set visibility to Public. The path now appears in Discover.

## J3. Edit a published path without breaking followers (Curator)

1. The owner edits the draft (which is always open) by adding a lesson and changing the text of another.
2. The path page shows "Draft has unpublished changes."
3. Publish v2 with a changelog. Followers on v1 are not affected.
4. A follower sees the banner, opens **Review update**, sees the diff (2 added, 1 changed), and accepts. Migration runs, progress carries over, and highlights are re-anchored or marked orphaned.

## J4. Personalize a followed path (Follower)

- **Personal additions** (notes, bookmarks, a personal resource link on a lesson) form an overlay: they are visible only to that user and survive version updates.
- **Structural changes** (reorder, delete lessons) trigger "This path belongs to Arjun. **Fork** it to make your own version." Forking creates a private copy that records attribution. The fork does not receive the original's updates (this is shown explicitly), though a "Compare with original" diff is possible later.

## J5. Suggest an improvement (Contributor, Phase 6)

1. While reading, select a lesson menu → **Suggest a change** (add resource / edit / report inaccuracy).
2. Fill the form. "Report inaccuracy" requires a quote and, optionally, a source URL.
3. The editors get a notification (in-app only). They review a side-by-side view and choose accept, reject (with a reason) or request changes.
4. If accepted, the change goes into the draft and appears in the next published version. The contributor is credited in the activity log and the version changelog.

## J6. Daily review (Retention, Phase 5)

1. The Dashboard shows "12 cards due · 4 min."
2. The Review screen shows the card front, then **Show answer**, then a grade (Again / Hard / Good / Easy, mapped to SM-2 grades 1/3/4/5).
3. When the queue is done, a summary shows retention for the day and the next due date.

## J7. Find something I read before (Library)

1. **Library** → search "Versailles reparations".
2. Results come from the user's own highlights, notes, bookmarked lessons and completed lessons, with filters.
3. Selecting a result opens the reader at that block, with the highlight flashed.

## J8. Moderation (Moderator)

1. A user reports a lesson for "Copyright violation."
2. The report appears in the moderator queue with the content snapshot and reporter note.
3. The moderator chooses **Take down**: the lesson is hidden in all versions, the owner is notified, and the action is written to the audit log. Followers see "This lesson was removed for policy reasons," and their notes stay visible to them.

## J9. Provider outage (System)

1. Wikimedia returns 429s and the circuit breaker opens for 60 s, backing off exponentially up to 15 min.
2. Generation jobs mark Wikipedia as "temporarily unavailable" and continue with whatever other providers are healthy. If no structural source is available, the job fails with a clear message and a retry option.
3. Reading continues normally, because excerpts are stored snapshots.
4. The admin health panel shows the open circuit and the 429 rate.
