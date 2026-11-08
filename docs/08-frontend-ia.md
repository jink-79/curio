# 08 — Frontend Information Architecture

## 1. Navigation model

**Primary nav** (left rail on desktop ≥1024 px, bottom tab bar on mobile):
`Discover · My Learning · Library · Review · (Create +)`
**Secondary** (avatar menu): Profile, Analytics, Settings, Admin (role-gated), Log out.

## 2. Route map (React Router)

| Route | Screen | Auth | Module |
|---|---|---|---|
| `/` | Redirect: signed in → `/learn`, else `/discover` | — | — |
| `/discover` | Search, categories, featured & popular paths | public | discover |
| `/discover/c/:categorySlug` | Category listing | public | discover |
| `/p/:pathId` | Path detail (overview, stages, versions, sources, follow/fork) | public* | learning-paths |
| `/s/:shareToken` | Unlisted path detail | public | learning-paths |
| `/read/:pathId/:lessonKey` | Reader (uses enrollment's version, or latest for non-followers) | public* | reading |
| `/learn` | Dashboard: continue reading, due reviews, weekly activity | auth | dashboard |
| `/learn/paths` | My Learning: enrollments, owned paths, drafts | auth | my-learning |
| `/create` | New path: blank / from subject / from template | auth | learning-paths |
| `/create/generate/:jobId` | Generation progress → proposal review | auth | learning-paths |
| `/edit/:pathId` | Curriculum editor (tree + lesson editor) | owner/editor | learning-paths |
| `/edit/:pathId/lesson/:lessonKey` | Lesson block editor + Find sources panel | owner/editor | learning-paths |
| `/edit/:pathId/publish` | Validation checklist + changelog | owner/editor | learning-paths |
| `/edit/:pathId/proposals` | Proposal review (Phase 6) | owner/editor | community |
| `/update/:pathId` | Version diff & migrate | auth | learning-paths |
| `/library` | Knowledge library (tabs: All, Highlights, Notes, Bookmarks, Cards) | auth | library |
| `/review` | Spaced-repetition session | auth | review |
| `/analytics` | Personal analytics | auth | analytics |
| `/u/:handle` | Public profile (public paths, contributions) | public | profile |
| `/settings` | Account, reader preferences, export, delete | auth | profile |
| `/admin/*` | Reports, categories, providers, jobs, users, flags | 🛡 | admin |
| `/login`, `/register`, `/reset` | Auth | public | auth |

\* "Public" here still means private paths return 404 to non-members.

## 3. Key screens (wireframe level)

**Path detail:** title, category chip, difficulty, total time, version number, last updated date, owner. Objectives list. A collapsible stage list with lesson titles and minutes. A sources summary ("42 sources: 30 Wikipedia, 8 OpenAlex, 4 Gutenberg"). Primary CTA is *Follow* or *Continue*; secondary actions are *Fork*, *Share*, *Report*.

**Reader:**
```
┌─────────┬────────────────────────────────────┬──────────┐
│ Stage / │  Lesson title · 8 min · Stage 2/9  │ Outline  │
│ lesson  │  ────────────────────────────────  │ (blocks) │
│ nav     │  [prereq notice]                   │ Notes    │
│ (✓ ● ○) │  Introduction …                    │ panel    │
│         │  > excerpt ── attribution footer   │ (toggle) │
│         │  People & dates (timeline chips)   │          │
│         │  Key takeaways                     │          │
│         │  Sources · Further reading         │          │
│         │  [Mark complete]  [Next lesson →]  │          │
└─────────┴────────────────────────────────────┴──────────┘
  top bar: progress bar · Aa (font, width, theme) · bookmark
```
On mobile, both side panels become drawers. Selecting text shows a popover with *Highlight (4 colours) · Note · Card · Copy with citation*.

**Curriculum editor:** on the left, a drag-and-drop tree of stages and lessons with a confidence or warning badge on each. On the right, the lesson form and block list. The top bar shows "Draft · rev 14 · Unpublished changes" and a Publish button. Conflicts (409) open a "Someone else edited this draft — reload / view their changes" dialog.

**Proposal review (generation):** a two-column tree with checkboxes. Each item shows a provenance chip and its candidate resources, and lessons can be renamed inline. At the bottom: "Accept 14 of 17 lessons."

## 4. Frontend code structure

```
client/src/
  app/            router.tsx, providers.tsx (QueryClient, Theme, Auth), layout/
  lib/            api-client.ts (axios instance + CSRF + error mapping), query-keys.ts, format.ts
  components/ui/  shadcn/ui generated primitives (Button, Dialog, Sheet, Tabs, Tooltip…)
  components/     shared composites (PathCard, LicenceBadge, AttributionFooter, EmptyState, ErrorState)
  features/
    auth/  discover/  dashboard/  learning-paths/  editor/  reading/
    my-learning/  library/  review/  analytics/  profile/  community/  admin/
      └─ each: api.ts (TanStack hooks), components/, routes/, hooks/, *.test.tsx
```

**Rules**
- Server state lives only in TanStack Query. UI-only state lives in component state or a tiny context (theme, reader prefs). No Redux.
- All API types are imported from `shared/`. No hand-written duplicate types.
- Every query has explicit loading, empty and error states, using the shared `<QueryBoundary>` component.
- Forms use controlled inputs validated with the shared Zod schemas. The `react-hook-form` + `@hookform/resolvers` dependencies are **[PROPOSED]** because they are standard with shadcn forms. The alternative is hand-rolled forms.
- Optimistic updates are used only for overlays (bookmark, highlight, progress). Curriculum edits wait for the server's revision.
- Routes are code-split per feature (`lazy()`). The reader is the top-priority bundle.
- Accessibility: everything in the editor tree works with the keyboard, including reordering with buttons as a non-drag alternative. Drag-and-drop uses `@dnd-kit` **[PROPOSED dependency]**.
