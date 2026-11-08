# 04 — Curriculum Engine Architecture

Covers: generation, prerequisites, editing model, versioning and migration.

## 1. Honest scope statement

Deterministic generation produces a **reviewable draft**, not a finished curriculum. Expected quality:

| Subject type | Example | Expected draft quality | Main signal |
|---|---|---|---|
| Historical event/era | World War II | Good | "Outline of", "Timeline of", Wikidata dates |
| Field history | History of AI | Good–fair | "History of X" article sections + "Timeline of X" |
| Conceptual field | Linear algebra, Python | Fair–poor | Article sections, curated templates, link graph |
| Niche topic | "Byzantine coinage" | Poor | Single article TOC only |

Quality must be measured, not assumed. Milestone M7 includes an **evaluation set** of 30 subjects across categories, with a hand-written reference curriculum for each. The generator is scored on lesson recall and ordering inversions (Kendall tau), and this scoring is a regression test.

## 2. Pipeline

```
               ┌──────────────────────────────────────────────────────┐
 subject ──►   │ 1. Resolve   →  2. Gather    →  3. Extract candidates │
               │   (entity)       (sources)        (topics)            │
               │ 4. Cluster   →  5. Order     →  6. Size & stage       │
               │   & dedupe       (time/deps)      (group into stages) │
               │ 7. Attach candidate resources → 8. Score & explain    │
               └──────────────────────────────────────────────────────┘
                                   │
                         CurriculumProposal (JSON, stored with job)
```

### Step 1 — Resolve the subject
- Search Wikipedia (`en.wikipedia` search) and Wikidata (`wbsearchentities`) to get the top 5 candidates.
- If the best candidate's score margin over the second is low, return a **disambiguation choice** to the user ("Mercury (planet) / Mercury (element) / Mercury (mythology)") before generating.
- Output: `{ wikidataId, wikipediaTitle, instanceOf[] }`. `instanceOf` (Wikidata P31) is used to classify the subject as *event*, *field/discipline*, *concept*, *person* or *other*, and that class decides the strategy.

### Step 2 — Gather structural sources (in parallel, each optional)
| Source | Query | Used for |
|---|---|---|
| `Outline of {title}` page | page exists? → sections + linked articles | Primary skeleton |
| `Timeline of {title}` / `History of {title}` | page exists? → sections | Chronology, stages |
| Main article | section headings (TOC), lead, outgoing links | Fallback skeleton |
| Wikidata entity | `has part(s)` P527, `part of` P361 (inverse), `follows`/`followed by` P155/P156, `point in time` P585, `start`/`end` P580/P582, `subclass of` P279, `facet of` P1269 | Children, ordering, dates |
| Curated template | category + subject class | Default stage names (e.g. *Foundations → Core → Applications → Frontier*) |

### Step 3 — Extract candidate topics
- Each candidate is `{label, sourceRefs[], wikidataId?, wikipediaTitle?, date?, depthHint}`.
- Noise filters drop sections such as *See also*, *References*, *External links*, *Further reading*, *Notes*, *In popular culture* (an editable stop-list), and drop links into non-article namespaces.

### Step 4 — Cluster and dedupe
- Merge candidates that share a `wikidataId` or a redirect target. Otherwise merge when normalized label similarity (token Jaccard ≥ 0.6 after stemming) is high.
- A topic that appears in several sources gets a higher **support score**.

### Step 5 — Order
Ordering is a constraint problem that combines three signals:
1. **Temporal**: if both topics have dates, the earlier comes first. This is a hard constraint for the *event* class.
2. **Dependency hints** (soft):
   - Wikidata P155/P156 (follows / followed by).
   - P279 / P361: the general topic before the specific one.
   - Link asymmetry: if A's lead paragraph links to B and B's lead does not link to A, then B is probably a prerequisite of A. Weight is low.
3. **Source order**: the position in the outline or TOC is the tie-breaker.

The algorithm builds a weighted directed graph, removes cycles by dropping the lowest-weight edge, then runs a topological sort with source order as the tie-break. The result is deterministic, and identical inputs give identical output (unit tested).

### Step 6 — Size and stage
- Keep the top N topics by `supportScore × relevance`, with N set by the size option (S/M/L).
- Group into stages:
  - For the *event* class, use date gaps (split where the gap is above the median gap) or the outline's top-level sections.
  - For fields and concepts, use the outline's top-level sections, otherwise the curated template buckets.
- Stage names come from outline section names where available. Otherwise they come from the template and stay editable.

### Step 7 — Attach candidate resources
- For each lesson, the content engine ([05](05-content-engine.md)) runs a *scoped* discovery. The lesson's Wikipedia article and its Commons lead image are almost always available. OpenAlex and Gutenberg run only if the category opts in (for example, AI → papers; History → public-domain books).
- Only resources scoring ≥ 0.7 are pre-selected. The rest are listed as candidates.

### Step 8 — Score and explain
Every lesson gets a `confidence` (0–1) and a `why[]` list, for example `"Appears in Outline of WWII §Background"` or `"Dated 1919 (Wikidata P585)"`. Warnings are produced for low support, ordering conflicts and missing sources.

## 3. Generator interface

```ts
interface CurriculumGenerator {
  readonly id: 'deterministic' | 'llm-local' | string;
  generate(input: GenerationInput, ctx: GenerationContext): Promise<CurriculumProposal>;
}

interface GenerationInput {
  subject: string;
  resolvedEntity?: ResolvedEntity;     // after disambiguation
  categoryId?: string;
  depth: 'overview' | 'standard' | 'deep';
  size: 'S' | 'M' | 'L';
  language: 'en';
}

interface CurriculumProposal {
  generatorId: string;
  subject: ResolvedEntity;
  stages: ProposedStage[];             // ordered
  warnings: ProposalWarning[];
  providerReport: { provider: string; status: 'ok' | 'partial' | 'failed' | 'skipped'; detail?: string }[];
}
interface ProposedStage  { tempId: string; title: string; lessons: ProposedLesson[]; why: string[] }
interface ProposedLesson {
  tempId: string; title: string; summary?: string;
  concepts: ConceptRef[];              // wikidata-backed where possible
  prerequisites: ConceptRef[];
  candidateResourceIds: string[];
  preselectedResourceIds: string[];
  confidence: number; why: string[];
}
```

**Optional `llm-local` generator (Q1):** it calls a local Ollama endpoint. It must still produce `ConceptRef`s that resolve to real Wikidata or Wikipedia entities, and any lesson whose concepts don't resolve is dropped or flagged. In practice the LLM only proposes structure, and grounding stays deterministic. It is disabled by default behind a feature flag.

## 4. Concepts & prerequisites

- **Concept** is a first-class entity: `{ _id, label, wikidataId?, wikipediaTitle?, aliases[] }`, deduplicated globally by `wikidataId`.
- Lessons reference `teaches: ConceptId[]` and `requires: ConceptId[]`.
- Within a path, the check is: for each lesson, if any required concept is taught only by a *later* lesson, raise an `ordering_conflict` warning.
- If a required concept is taught nowhere in the path, the lesson shows a "background you may need" link to the Wikipedia article.
- Prerequisite data accumulates from edits. When an editor confirms a prerequisite, it becomes an `editor_confirmed` edge with higher weight than heuristic ones. That gives a slow, community-built improvement loop without AI.

## 5. Editing model: draft + immutable versions

```
LearningPath ──1:1──► PathDraft (mutable, revision counter)
     │                   └─ stages[] → lessons[] (lessonKey, rank, blocks…)
     └──1:N──► PathVersion (immutable)
                         └─ manifest: stages[] → lessons[] {lessonKey, title, contentRef(hash)}
LessonContent (content-addressed by SHA-256 of canonical JSON; shared by draft & versions)
```

- A version stores a **manifest** of structure plus content *hashes*. Lesson bodies live once in `lessonContents`, keyed by hash. Ten versions with one changed lesson therefore store eleven bodies, not a hundred.
- Publishing:
  1. Load the draft at revision R.
  2. Validate it.
  3. Canonicalize and hash each lesson body, then upsert into `lessonContents`.
  4. In one transaction: insert a `PathVersion {number: n+1, manifest, diffFromPrevious, changelog}`, set `path.latestVersionId`, and write the activity log entry.
  5. A 409 if the draft revision changed during the publish.

### Diff
`diff(vA, vB)` compares manifests by `lessonKey`:
- `added`: present only in vB.
- `removed`: present only in vA.
- `moved`: a different stage or rank.
- `renamed`: a different title.
- `contentChanged`: a different content hash.

The diff is pure-function and unit tested.

### Migration of an enrollment from vA → vB
For each overlay record of the user in that path:
- If its `lessonKey` is in vB, keep it and update `versionId`. If the content hash changed, re-anchor highlights.
- If its `lessonKey` was removed in vB, set `archived: true` and keep `versionId = vA`, so the item still opens read-only in the library.

Progress percentages are recalculated against vB's lesson set. Migration writes are batched in a transaction, and running it again is a no-op.

## 6. Failure handling

| Failure | Behavior |
|---|---|
| Subject can't be resolved | Ask the user to rephrase, or start blank / from template |
| Ambiguous subject | Return disambiguation options (no generation run) |
| Outline/Timeline missing | Fall back to main article TOC + Wikidata |
| All structural providers down | Job `failed` with `retryAfter`; template-only proposal offered |
| Generation > 60 s | Job continues in background; user is notified in-app when done |
