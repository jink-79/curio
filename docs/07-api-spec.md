# 07 — API Specification (REST, v1)

Base: `/api/v1`. JSON only. Every request body and query is validated by Zod schemas from `shared/`, so the frontend and backend use the same definitions.

## 1. Conventions

- **Auth:** session cookie `curio_sid`. State-changing methods also need the `X-CURIO-CSRF` header.
- **Errors:** every error uses this envelope.
  ```json
  { "error": { "code": "VALIDATION_FAILED", "message": "Human readable", "details": [{ "path": "title", "issue": "too_short" }], "requestId": "…" } }
  ```
  | HTTP | code examples |
  |---|---|
  | 400 | `VALIDATION_FAILED` |
  | 401 | `UNAUTHENTICATED` |
  | 403 | `FORBIDDEN` |
  | 404 | `NOT_FOUND` (also used for private resources the caller can't see, so their existence isn't leaked) |
  | 409 | `REVISION_CONFLICT`, `ALREADY_EXISTS` |
  | 422 | `PUBLISH_VALIDATION_FAILED`, `LICENCE_REJECTED` |
  | 429 | `RATE_LIMITED` (with `Retry-After`) |
  | 503 | `PROVIDER_UNAVAILABLE` |
- **Pagination:** cursor-based. Requests take `?limit=20&cursor=…`, and responses return `{ items, nextCursor }`.
- **Concurrency:** draft writes require `If-Match: <revision>`. A stale revision gets 409 with the current draft in the response.
- **IDs:** ObjectId strings, except `lessonKey` (UUID) and `contentHash` (hex).

Legend: 🔓 public · 🔐 authenticated · 👤 owner/role-checked · 🛡 moderator/admin

## 2. Auth & account
| Method | Path | | Body / Notes |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | `{email, password, displayName}` → 201 user + sets cookie |
| POST | `/auth/login` | 🔓 | `{email, password}` → 200 user + cookie |
| POST | `/auth/logout` | 🔐 | |
| POST | `/auth/logout-all` | 🔐 | revokes all sessions |
| GET | `/auth/me` | 🔐 | user + csrfToken |
| POST | `/auth/password` | 🔐 | `{currentPassword, newPassword}` |
| POST | `/auth/password-reset/request` · `/confirm` | 🔓 | depends on Q3 |
| PATCH | `/me/preferences` | 🔐 | reader preferences |
| GET | `/me/export` | 🔐 | JSON export of all own data |
| DELETE | `/me` | 🔐 | `{password}` confirmation |

## 3. Categories
| GET | `/categories` | 🔓 | tree |
|---|---|---|---|
| POST · PATCH · DELETE | `/admin/categories[/:id]` | 🛡 | |

## 4. Learning paths
| Method | Path | | Notes |
|---|---|---|---|
| GET | `/paths` | 🔓 | discover: `?q&category&difficulty&sort=popular|recent&cursor` — public only |
| GET | `/me/paths` | 🔐 | owned + member paths |
| POST | `/paths` | 🔐 | create (blank or `{fromTemplateId}`) → path + empty draft |
| GET | `/paths/:id` | 🔓/👤 | metadata + latest version summary; private → 404 unless member |
| GET | `/paths/shared/:shareToken` | 🔓 | unlisted access |
| PATCH | `/paths/:id` | 👤 owner/editor | metadata; visibility owner-only |
| DELETE | `/paths/:id` | 👤 owner | archives |
| POST | `/paths/:id/share-token` | 👤 owner | regenerate |
| POST | `/paths/:id/fork` | 🔐 | → new private path |

## 5. Draft & curriculum editing (owner/editor)
| Method | Path | Notes |
|---|---|---|
| GET | `/paths/:id/draft` | full draft with `revision` (ETag) |
| POST | `/paths/:id/draft/stages` | `{title, afterStageId?}` |
| PATCH | `/paths/:id/draft/stages/:stageId` | `{title?, description?}` |
| DELETE | `/paths/:id/draft/stages/:stageId` | must be empty or `?moveLessonsTo=` |
| POST | `/paths/:id/draft/stages/:stageId/lessons` | `{title, afterLessonKey?}` |
| PATCH | `/paths/:id/draft/lessons/:lessonKey` | `{title?, summary?, objectives?, teaches?, requires?, estimatedMinutes?}` |
| PUT | `/paths/:id/draft/lessons/:lessonKey/blocks` | full ordered block list (server sanitizes and validates licences) |
| DELETE | `/paths/:id/draft/lessons/:lessonKey` | |
| POST | `/paths/:id/draft/move` | `{lessonKey | stageId, toStageId?, beforeKey?, afterKey?}` reorder/move |
| POST | `/paths/:id/draft/validate` | returns publish checklist + prerequisite warnings |
| POST | `/paths/:id/draft/apply-proposal` | `{proposal: CurriculumProposal, selection}` (from generation) |

All draft mutations return `{ revision, draft? }` and require `If-Match`.

## 6. Versions & enrollment
| Method | Path | | Notes |
|---|---|---|---|
| POST | `/paths/:id/versions` | 👤 | publish `{changelog}` → `PathVersion` |
| GET | `/paths/:id/versions` | 🔓/👤 | list |
| GET | `/paths/:id/versions/:n` | 🔓/👤 | manifest + metadata |
| GET | `/paths/:id/versions/:n/lessons/:lessonKey` | 🔓/👤 | lesson content for reader |
| GET | `/paths/:id/versions/:a/diff/:b` | 🔓/👤 | structural diff |
| POST | `/paths/:id/enroll` | 🔐 | follow → pinned to latest |
| DELETE | `/paths/:id/enroll` | 🔐 | unfollow (overlays kept unless `?purge=true`) |
| GET | `/me/enrollments` | 🔐 | with `updateAvailable` |
| POST | `/me/enrollments/:pathId/migrate` | 🔐 | `{toVersion}` → migration report |

## 7. Reading & personal overlay (always scoped to caller)
| Method | Path | Notes |
|---|---|---|
| POST | `/me/progress/heartbeat` | `{pathId, lessonKey, versionId, scrollPct, activeSeconds}` (max 1 per 10 s) |
| PUT | `/me/progress/:pathId/:lessonKey` | `{completed: boolean}` |
| GET | `/me/progress/:pathId` | per-lesson progress |
| GET · POST · DELETE | `/me/bookmarks[/:id]` | filters `?pathId` |
| GET · POST · PATCH · DELETE | `/me/notes[/:id]` | |
| GET · POST · PATCH · DELETE | `/me/highlights[/:id]` | |
| GET | `/me/library` | unified feed `?type&pathId&category&q&cursor` |
| GET | `/me/search?q=` | full-text over own notes/highlights + enrolled lesson titles |

## 8. Content discovery
| Method | Path | | Notes |
|---|---|---|---|
| GET | `/discovery/search` | 🔐 | `?q&providers&kind` ad-hoc search |
| POST | `/paths/:id/draft/lessons/:lessonKey/discover` | 👤 | lesson-scoped ranked candidates + providerReport |
| GET | `/resources/:id` | 🔓 | normalized resource + cluster |
| POST | `/paths/:id/draft/lessons/:lessonKey/snapshot` | 👤 | `{resourceId, section}` → `source_excerpt` block (422 if link_only) |

## 9. Curriculum generation
| Method | Path | | Notes |
|---|---|---|---|
| POST | `/generation/resolve` | 🔐 | `{subject}` → candidates (disambiguation) |
| POST | `/generation/jobs` | 🔐 | `{subject, entityId?, categoryId?, depth, size, targetPathId?}` → 202 `{jobId}` |
| GET | `/generation/jobs/:id` | 🔐 | status, providerReport, proposal when done |

## 10. Quizzes & review (Phase 5)
| Method | Path | Notes |
|---|---|---|
| GET | `/paths/:id/versions/:n/lessons/:lessonKey/quiz` | questions without answers |
| POST | `/me/quiz-attempts` | `{pathId, lessonKey, contentHash, answers}` → graded + explanations |
| GET | `/me/review/queue` | due cards `?limit` |
| POST | `/me/review/cards` | manual card or `{fromHighlightId}` |
| POST | `/me/review/cards/:id/grade` | `{grade}` → next due |
| PATCH · DELETE | `/me/review/cards/:id` | edit/suspend |

## 11. Analytics
| GET | `/me/analytics/summary?range=7d|30d|all` | 🔐 | totals, streak |
|---|---|---|---|
| GET | `/me/analytics/daily?from&to` | 🔐 | dailyStats series |

## 12. Community (Phase 6)
| Method | Path | | Notes |
|---|---|---|---|
| GET · POST · PATCH · DELETE | `/paths/:id/members[/:userId]` | 👤 owner | roles |
| GET · POST | `/paths/:id/proposals` | 🔐 | submit (any user on public paths) |
| POST | `/paths/:id/proposals/:pid/review` | 👤 editor | `{decision, note}` |
| POST | `/paths/:id/proposals/:pid/withdraw` | 🔐 author | |
| GET | `/paths/:id/activity` | 🔓/👤 | contribution history |

## 13. Moderation & admin
| Method | Path | | |
|---|---|---|---|
| POST | `/reports` | 🔐 | |
| GET | `/admin/reports` · POST `/admin/reports/:id/resolve` | 🛡 | |
| POST | `/admin/users/:id/suspend` | 🛡 | |
| GET | `/admin/providers/health` · `/admin/jobs` | 🛡 | |
| GET · PATCH | `/admin/flags` | 🛡 admin | feature flags |

## 14. Rate limits (defaults)
| Scope | Limit |
|---|---|
| Auth endpoints | 5 / 15 min per IP + per account |
| Global per user | 300 / min |
| Discovery | 60 / hour per user |
| Generation jobs | 10 / day per user |
| Heartbeat | 6 / min per user |

## 15. Authorization implementation

A single `authorize(user, action, resource)` policy module holds the role table from F14. Route handlers never inline role checks. Unit tests cover every row of the matrix, and integration tests confirm that user A can't read or modify user B's overlays through any `/me/*` endpoint.
