# 00 — Critical Review of the Brief

This document stress-tests the master brief before any design is locked. Each item says what is wrong or missing, why it matters, and what I propose. Items marked **[OPEN]** need an owner decision; the rest have a proposed default that later documents assume.

---

## A. The three problems that decide whether CURIO works

### A1. "CURIO breaks a subject into chapters" has no free, reliable engine behind it

The brief wants subject → ordered curriculum with prerequisites, **without mandatory AI**, and "checked for historical accuracy, logical ordering and appropriate prerequisites." Nothing in the brief says *who or what* performs that check.

Reality of deterministic options:

| Source signal | Works well for | Fails for |
|---|---|---|
| Wikipedia "Outline of X" / "Timeline of X" / "History of X" pages | History, broad surveys | Narrow or niche subjects (no outline exists) |
| Wikipedia article section headings (TOC) | A quick skeleton of any well-covered topic | Ordering for *learning* — TOCs are encyclopedic, not pedagogical |
| Wikidata `point in time` / `start time` / `follows` / `part of` | Chronological ordering of events | Concepts (math, programming, philosophy) — no dates |
| Wikipedia link graph (A links to B, B doesn't link back) | Weak prerequisite hints | Precision is low; needs human confirmation |
| Curated per-category templates | Predictable quality for launch categories | Doesn't scale to "any subject" |

**Conclusion:** deterministic generation produces a *usable draft skeleton* for history and well-covered topics, and a *mediocre* one for conceptual subjects. Prerequisite detection without an LLM or curated data is weak, so it must be presented as suggestions.

**Proposal [PROPOSED]:**
1. Generation always outputs a **draft** that the user must review and accept. It is never auto-published.
2. Every generated stage and lesson carries a `generatedFrom` provenance record (which page or entity produced it) and a confidence score.
3. A **pluggable `CurriculumGenerator` interface** with a deterministic implementation (default) and an optional local LLM implementation (Ollama, off by default). This satisfies "AI optional" without designing the engine around its absence.
4. Ship **curated seed templates** for the 10 launch categories so the first-run experience isn't judged by the weakest generator output.

**[OPEN Q1]** Is an *optional, locally hosted* LLM adapter (Ollama + an open-weights model) acceptable in Phase 2, or must Phase 2 be strictly deterministic?

### A2. The 10-section lesson structure has no author

The brief requires every lesson to support Introduction, Background, Detailed explanation, Concepts, People & dates, Images, Takeaways, Further reading, Sources and Knowledge check. Without AI, **nothing writes "Key takeaways" or "Detailed explanation" automatically.** The available options are:

- **Republish open text** (Wikipedia CC BY-SA, Gutenberg public domain). This is legal with attribution, but it turns CURIO into a Wikipedia re-skin and brings ShareAlike obligations (see A3).
- **Link out** to sources. This is legally safe, but the lesson becomes a reading list.
- **Human-authored**, by the path creator or community. This gives the highest quality and the lowest coverage.

**Proposal [PROPOSED]:** A lesson is a **composition of blocks**:
- *Authored blocks*, written by the path owner or editors. These are optional, and every structured section is an authored block type.
- *Source excerpts*: an attributed, license-tagged snapshot of open content, such as the Wikipedia lead section or a Commons image.
- *Linked resources*: metadata plus a link, for anything not licensed for reproduction.
- *Deterministic facts*: people and dates pulled from Wikidata (CC0), shown as structured "People & dates".

Empty sections are hidden, not shown as blank headings. A lesson with zero authored blocks is honestly labeled "Reading list". It is not dressed up as a full lesson.

### A3. Licensing of user content is undefined, and it collides with Wikipedia's ShareAlike

If a lesson mixes CC BY-SA Wikipedia text with user-authored text, the lesson as a whole is arguably an adaptation and must be CC BY-SA. The brief says nothing about the license of user-generated paths, lessons, notes or suggestions. Community editing and forking are also legally messy without a declared license.

**Proposal [PROPOSED]:**
- Public and unlisted user-authored curriculum content is licensed **CC BY-SA 4.0**. This is compatible with Wikipedia excerpts and allows community edits and forks.
- Private content and personal notes remain the user's own, unlicensed and never shared.
- Excerpts are stored as separate blocks with their own license, not merged into authored text. This keeps attribution precise and lets us drop a provider cleanly if needed.

**[OPEN Q2]** Do you accept CC BY-SA 4.0 for public user-authored content? The alternative, "all rights reserved, CURIO gets a display licence," blocks forking and makes community edits legally murky.

---

## B. Contradictions and ambiguities in the brief

| # | Issue | Proposal |
|---|---|---|
| B1 | **"Add personal learning material" to a curriculum.** When a user follows someone else's public path, they cannot edit its structure. Whose path receives the material? | Two mechanisms. A **personal overlay** holds notes, bookmarks and personal resources attached to a lesson's stable key, and it never touches the shared path. A **fork** copies the path into the user's own path for structural changes. |
| B2 | **Versioning vs. "community editing must not overwrite user data".** Highlights anchor to text. When lesson text changes, anchors break. | Highlights use W3C Web Annotation-style `TextQuoteSelector` (exact + prefix + suffix) pinned to a content hash. When content changes, the system tries to re-anchor; if that fails, the highlight is marked *orphaned*, shown in the library, and never deleted. |
| B3 | **Spaced repetition example (1 / 2 / 7 / 30 days)** is a fixed ladder. It ignores whether the user actually remembered the card. | Use a `ReviewScheduler` interface with an **SM-2** default, implemented in-house in about 60 lines with no dependency. The fixed ladder becomes an optional scheduler. **FSRS** (`ts-fsrs`, MIT) can be considered later. |
| B4 | **"Dark theme should be default"** + **"comfortable for long reading sessions."** Many long-form readers prefer light or sepia, and a dark-only reader causes halation for users with astigmatism. | Dark remains the default for the app. The reader offers **Dark / Dim / Light / Sepia**. This needs approval because it touches brand. **[OPEN Q5]** |
| B5 | **Brand palette fails WCAG AA** (measured below). The brief also requires "accessible contrast." | Adjusted tokens are in [09-design-system](09-design-system.md). The brand hex values are kept for marks and highlights; accessible variants are used for text and buttons. |
| B6 | **Roadmap order**: Phase 2 (curriculum generation) comes before Phase 3 (content adapters). Generation *depends on* the Wikipedia and Wikidata adapters. | Reordered in [10-milestones](10-milestones.md): manual curriculum and versioning model first, then the Wikimedia adapters, then generation. |
| B7 | **"Knowledge check"** is part of the lesson structure (Phase 4), but quizzes arrive in Phase 5. | The section is hidden until Phase 5. Quiz blocks are designed into the content schema now so no migration is needed later. |
| B8 | **"Validate relevance"** is listed as a requirement with no definition. | Defined as a scored pipeline (entity match, term overlap, category fit) with thresholds. Below-threshold resources become *candidates* for the editor to accept. Nothing auto-attaches to a public path. See [05-content-engine](05-content-engine.md). |
| B9 | **"Never silently change a user's curriculum when content refreshes"** vs. "last verified date" refresh jobs. | Refresh updates the **global resource cache** only. Lesson excerpts are immutable snapshots. If a source changed, the editor sees an "update available" flag and chooses whether to pull it into a new draft. |
| B10 | **"Collaborate on shared paths"** + **"Review proposed modifications"**: is there one draft per path or one per editor? | One shared draft per path in the MVP, with optimistic concurrency (`revision` counter, 409 on conflict). Contributors submit **change proposals** instead of editing the draft directly. Real-time co-editing is out of scope. |

---

## C. Gaps the brief does not mention

These are not optional for a product with accounts and public user-generated content.

1. **Password reset and email verification need an email sender.** This is the first infrastructure cost the brief doesn't acknowledge. Options: SMTP through a personal mailbox (fragile, free), a free tier of a transactional email service (free today but a vendor dependency), or OAuth login (GitHub/Google, free) as the primary auth. **[OPEN Q3]**
2. **Moderation and legal.** Public UGC requires terms of service, a privacy policy, a report → review → takedown workflow, a copyright (DMCA-style) contact, and account bans. Reporting is in the brief; the moderator role and takedown flow are not. A moderator platform role is added.
3. **Privacy and data rights.** Data export (JSON) and account deletion are needed. Also missing: what happens to public paths when the owner deletes their account? Proposal: they are transferred to an editor if one exists, else archived as read-only, keeping attribution as "deleted user."
4. **Analytics privacy.** Reading-time tracking is per user and visible only to that user. No third-party analytics.
5. **Search.** "Searchable knowledge library" works with MongoDB text indexes for the MVP. Atlas Search is cloud-only and has a paid path, so avoid it. Meilisearch (OSS) can come later if relevance is poor.
6. **Background jobs.** node-cron running *inside the API process* fires duplicate jobs once you run more than one instance. Proposal: a separate `worker` entrypoint and a Mongo-backed job queue with leases. That means no Redis, keeping the brief's zero-infra goal.
7. **Transactions.** Publishing a version touches several collections atomically, and MongoDB transactions require a replica set. Local development therefore runs a single-node replica set (one line in docker-compose).
8. **Media uploads.** "Images and illustrations" — if users upload images, we need storage (cost) and copyright exposure. Proposal: no uploads in the MVP; images come only from Wikimedia Commons, with per-file licence and attribution.
9. **Internationalisation.** Wikipedia exists in about 300 languages. Is CURIO English-only? Proposal: English UI and `en.wikipedia` for the MVP, with a `language` field on every content entity from day one. **[OPEN Q6]**
10. **Abuse via generation.** Curriculum generation fans out to external APIs. Without per-user quotas, one user can exhaust our Wikimedia or OpenAlex allowance for everyone. Per-user generation quotas and a shared response cache are required.

---

## D. External provider realities (verified November 2026)

| Provider | Constraint that affects design |
|---|---|
| **Wikimedia (Wikipedia, Wikidata, Commons)** | User-Agent with contact info is mandatory. 2026 rate limits are being enforced and are still changing; keep ≤3 concurrent requests, expect 429s. Wikimedia Enterprise is paid, so don't use it. Commons file licenses vary per file, and en.wikipedia hosts *non-free* fair-use images that must be excluded. |
| **OpenAlex** | **API key now required for meaningful use** (free key, daily usage budget). Metadata is CC0. Abstracts are publisher-copyrighted, so show them only when the work has an open licence; otherwise link out. A free full snapshot exists if API budget becomes a problem. |
| **Crossref** | Use the "polite pool" with a `mailto`. Metadata is free to use; abstracts carry publisher copyright, same rule as OpenAlex. |
| **Project Gutenberg** | **Automated crawling of gutenberg.org is prohibited and gets your IP blocked.** Use the public-domain **offline RDF catalog** (bulk import) and mirrors for text. Gutendex is a third-party wrapper and should not be a production dependency. Texts are public domain in the US, but the "Project Gutenberg" trademark licence applies if the PG header is kept. Strip it or comply. |
| **Library of Congress (loc.gov JSON API)** | **20 requests/minute; exceeding it gives a 1-hour block**, and limits drop under load (429s or CAPTCHA HTML). Rights vary per item, so read the item's rights statement and default to *link only*. |

Design consequence: every adapter runs behind a **per-provider token-bucket limiter + circuit breaker + response cache**, and the app must stay fully usable when every provider is down.

---

## E. Scope risk

The brief lists 16 backend modules, 12 frontend modules and 7 phases. For a small team this is 9–18 months of work. The biggest risk is not technical. It is **building collaboration, versioning and community before the single-player loop is good.**

**Proposal [PROPOSED]:** define **MVP = Phases 1–4 for a single user**: create or generate a path, read it, track progress, notes, highlights, bookmarks. Public and unlisted *read-only* sharing and "follow" are included because they are cheap. Collaboration, proposals and moderation come in Phase 6. **The versioning data model is built in Phase 1**, because retrofitting it is the expensive part.

**[OPEN Q4]** Team size, timeline, and is the first release for you and a few testers, or a public launch? This changes how much moderation, legal and email work must be in the MVP.

---

## F. Open questions (summary)

| ID | Question | Blocks |
|---|---|---|
| Q1 | Optional local LLM adapter (Ollama) allowed in Phase 2? | M7 |
| Q2 | CC BY-SA 4.0 for public user-authored content? | M3 (licence field), M12 |
| Q3 | Auth: email+password with an email provider, or OAuth-first? | M2 |
| Q4 | Team size, timeline, private beta vs public launch? | MVP cut |
| Q5 | Reader Light/Sepia themes allowed alongside dark default? | M9 |
| Q6 | English-only MVP? | M5 |
| Q7 | Adjusted accessible colour tokens acceptable (see doc 09)? | M1 UI shell |
| Q8 | Brand mark direction (concept in `docs/brand/`) acceptable? | M1 |
