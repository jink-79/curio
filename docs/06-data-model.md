# 06 — Database Schema & Entity Relationships (MongoDB)

Conventions: every document has `_id: ObjectId`, `createdAt` and `updatedAt`. Strings are trimmed and length-limited by Zod (the shared schema) before they reach Mongoose. Collections use camelCase plurals.

## 1. Entity relationship overview

```
User ─┬─< Session
      ├─< LearningPath (ownerId) ─┬── PathDraft (1:1)
      │                           ├─< PathVersion ──(manifest refs)──► LessonContent (by hash)
      │                           ├─< PathMember (role)            ▲
      │                           ├─< ChangeProposal               │ blocks reference
      │                           └─< ActivityLog                  │
      ├─< Enrollment ──► (pathId, versionId)                       │
      ├─< LessonProgress ─┐                                        │
      ├─< Bookmark ───────┤ keyed by (userId, pathId, lessonKey, versionId)
      ├─< Note ───────────┤                                        │
      ├─< Highlight ──────┘                                        │
      ├─< QuizAttempt ──► Quiz (embedded in LessonContent)         │
      ├─< ReviewCard ─< ReviewLog                                  │
      ├─< ReadingSession / DailyStat                               │
      └─< Report                                                   │
Category ─< LearningPath                         Resource ◄── Attachment (in LessonContent)
Concept ◄── Lesson.teaches / requires            Resource ─ canonicalResourceId → Resource
GenerationJob ─► CurriculumProposal (embedded)   ProviderCache, Job, AuditLog
```

**Isolation rule:** every user-overlay collection has `userId` as the leading field of every index, and every repository query for these collections requires `userId` as an argument (it is a compile-time requirement in the repository signature).

## 2. Collections

### users
```ts
{ email (unique, lowercased), passwordHash, displayName, handle (unique), avatarUrl?,
  platformRole: 'user' | 'moderator' | 'admin', status: 'active' | 'suspended' | 'deleted',
  emailVerifiedAt?, preferences: { readerTheme, fontSize, readingWidth, lineHeight, dailyNewCards },
  lastLoginAt? }
```
### sessions
`{ tokenHash (unique), userId, csrfToken, userAgent, ip, expiresAt (TTL index), lastSeenAt }`

### categories
`{ slug (unique), name, description, icon, parentId?, sortOrder, pathCount }`

### learningPaths
```ts
{ ownerId, title, slug, description, categoryId, difficulty, readingDepth, objectives: string[],
  language: 'en', licence: 'CC-BY-SA-4.0' | 'PRIVATE', tags: string[],
  visibility: 'private' | 'unlisted' | 'public', shareToken?,
  latestVersionId?, latestVersionNumber: number, estimatedMinutes,
  forkedFrom?: { pathId, versionId }, status: 'active' | 'archived' | 'taken_down',
  stats: { followers, lessons, stages } }
```
Indexes: `{ownerId, updatedAt}`, `{visibility, categoryId, stats.followers}`, `{slug}`, `{shareToken}` (sparse unique), text index on `{title, description, tags}`.

### pathDrafts (1:1 with path)
```ts
{ pathId (unique), revision: number,
  stages: [{ stageId, title, rank, description?,
             lessons: [{ lessonKey, title, rank, summary?, objectives[], teaches: ConceptId[], requires: ConceptId[],
                         estimatedMinutes, blocks: Block[] }] }] }
```
Embedding the draft keeps a whole-draft read in one query. Size check: 30 lessons × ~40 KB blocks ≈ 1.2 MB, far under Mongo's 16 MB document limit. A hard cap of 200 lessons per path and 100 KB of blocks per lesson is enforced.

### pathVersions (immutable)
```ts
{ pathId, number, publishedBy, publishedAt, changelog,
  metadata: { title, description, objectives, difficulty, readingDepth, estimatedMinutes },
  manifest: [{ stageId, title, rank, lessons: [{ lessonKey, title, rank, contentHash, estimatedMinutes }] }],
  diffFromPrevious?: { added: string[], removed: string[], moved: string[], renamed: string[], contentChanged: string[] } }
```
Unique `{pathId, number}`. No update operations are permitted. The repository exposes only `insert` and `find`.

### lessonContents (content-addressed)
```ts
{ _id: contentHash (sha256 hex), lessonKey, summary, objectives, teaches, requires, blocks: Block[], quiz?: Quiz }
```

### Block (embedded union)
```ts
type Block =
 | { id, type: 'authored', section: LessonSection, markdown: string }
 | { id, type: 'source_excerpt', section, resourceId, html: string /*sanitized*/, licence, attribution, retrievedAt, sourceRevisionId?, contentHash }
 | { id, type: 'image', resourceId, url, caption?, licence, attribution }
 | { id, type: 'people_dates', items: [{ label, wikidataId?, date?: PartialDate, role? }] }
 | { id, type: 'resource_list', section: 'further_reading' | 'sources', attachments: [{ resourceId, role, note? }] }
 | { id, type: 'takeaways', items: string[] }
 | { id, type: 'callout', tone: 'info' | 'warning', markdown };
type LessonSection = 'introduction' | 'background' | 'explanation' | 'concepts' | 'people_dates'
                   | 'media' | 'takeaways' | 'further_reading' | 'sources' | 'knowledge_check';
```

### Quiz (embedded in lessonContents)
`{ questions: [{ qid, type: 'mcq'|'true_false'|'fill_blank', prompt, options?, correct: number|boolean|string[], explanation, origin: 'authored'|'wikidata'|'llm', sourceBlockIds[] }] }`

### pathMembers
`{ pathId, userId, role: 'editor'|'contributor'|'viewer', invitedBy }` — unique `{pathId, userId}`. The owner is stored on the path, not here.

### concepts
`{ label, wikidataId? (unique sparse), wikipediaTitle?, aliases[], prereqEdges: [{ conceptId, weight, origin: 'heuristic'|'editor_confirmed' }] }`

### resources (global cache of normalized resources)
`NormalizedResource` fields plus `{ canonicalResourceId?, status: 'ok'|'moved'|'gone'|'licence_changed', lastVerifiedAt, firstSeenAt }`
Indexes: unique `{provider, externalId}`, sparse `{identifiers.doi}`, `{identifiers.wikidata}`, `{identifiers.isbn}`, `{lastVerifiedAt}`.

### enrollments
`{ userId, pathId, versionId, versionNumber, status: 'active'|'completed'|'paused', startedAt, completedAt?, lastLessonKey?, progressPct }` — unique `{userId, pathId}`.

### lessonProgress
`{ userId, pathId, lessonKey, versionId, scrollPct, activeSeconds, completedAt?, archived: boolean }` — unique `{userId, pathId, lessonKey}`.

### bookmarks / notes / highlights
```ts
bookmark:  { userId, pathId, lessonKey, versionId, blockId?, label?, archived }
note:      { userId, pathId?, lessonKey?, versionId?, blockId?, highlightId?, markdown, archived }
highlight: { userId, pathId, lessonKey, versionId, blockId, contentHash,
             selector: { exact, prefix, suffix }, color, state: 'anchored'|'orphaned', archived }
```
Index on `{userId, pathId, lessonKey}`. Text index on notes `{markdown}` and highlights `{selector.exact}`. Queries always add `userId`.

### quizAttempts
`{ userId, pathId, lessonKey, contentHash, answers: [{qid, given, correct}], score, takenAt }`

### reviewCards / reviewLogs
```ts
reviewCard: { userId, source: { type: 'quiz_question'|'highlight'|'manual', refId?, pathId?, lessonKey? },
              front, back, ease: 2.5, intervalDays, reps, lapses, dueAt, suspended }
reviewLog:  { userId, cardId, grade, reviewedAt, prevInterval, nextInterval }
```
Index: `{userId, dueAt}`.

### readingSessions / dailyStats
`readingSession: { userId, pathId, lessonKey, date, activeSeconds }` (upserted by heartbeat; TTL after 400 days)
`dailyStat: { userId, date, minutes, lessonsCompleted, quizzesTaken, quizAccuracy, reviewsDone, byCategory: {categoryId: minutes} }` — unique `{userId, date}`.

### changeProposals
`{ pathId, authorId, type, baseRevision, payload, status: 'open'|'accepted'|'rejected'|'changes_requested'|'withdrawn', reviewerId?, reviewNote?, resolvedAt? }`

### activityLogs (append-only)
`{ pathId, actorId, action, refs: {...}, at }`

### reports
`{ reporterId, target: { type: 'path'|'lesson'|'resource'|'proposal'|'user', id, versionId? }, reason, details, status, handledBy?, resolution? }`

### auditLogs (append-only)
`{ actorId, action, target, before?, after?, at, ip }`

### generationJobs
`{ userId, input, status: 'queued'|'running'|'succeeded'|'failed', providerReport, proposal?, error?, startedAt, finishedAt }` with TTL of 30 days.

### jobs (worker queue), providerCache (TTL)
As defined in [05 §7–8](05-content-engine.md).

## 3. Deletion & cascade rules

| Event | Effect |
|---|---|
| Lesson removed from draft | Nothing else changes; overlays referencing older versions remain |
| Path archived / deleted by owner | `status: archived`; versions kept while enrollments reference them |
| Path taken down (moderation) | `status: taken_down`; content hidden; user overlays still visible to their owners as quotes |
| User deletes account | Overlays, sessions, cards, stats hard-deleted; owned paths transferred to an editor or archived; proposals/activity anonymized to "deleted user" |

## 4. Transactions

Mongo runs as a replica set (single node locally). The following operations are transactional:
- Publishing a version.
- Migrating an enrollment.
- Accepting a proposal (draft write plus proposal status plus activity log).
- Account deletion.
