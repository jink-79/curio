# 05 — Content Discovery & Ingestion Architecture

## 1. Responsibilities split

| Module | Responsibility |
|---|---|
| **content-sources** | Provider registry, adapter implementations, rate limiting, circuit breakers, HTTP cache |
| **content-discovery** | Query fan-out, normalization, dedup, relevance scoring, ranked results for a lesson |
| **content-ingestion** | Snapshotting licensed content into lesson blocks, re-verification jobs, licence checks, bulk imports (Gutenberg catalog) |

## 2. Provider adapter contract

```ts
type ResourceKind = 'article' | 'encyclopedia_entry' | 'book' | 'paper' | 'image' | 'dataset' | 'primary_source';

interface ProviderAdapter {
  readonly id: ProviderId;                  // 'wikipedia' | 'wikidata' | 'commons' | 'openalex' | 'crossref' | 'gutenberg' | 'loc'
  readonly capabilities: { search: boolean; fetchById: boolean; fullText: boolean; kinds: ResourceKind[] };
  readonly limits: { ratePerMinute: number; maxConcurrent: number };
  search(q: ProviderQuery, ctx: AdapterContext): Promise<NormalizedResource[]>;
  fetchById(externalId: string, ctx: AdapterContext): Promise<NormalizedResource | null>;
  fetchContent?(externalId: string, ctx: AdapterContext): Promise<ContentPayload>; // only if licence allows
  verify(externalId: string, ctx: AdapterContext): Promise<VerificationResult>;    // still exists? licence changed?
}

interface NormalizedResource {
  provider: ProviderId;
  externalId: string;               // provider-native id (QID, DOI, PG ebook number, page id…)
  kind: ResourceKind;
  title: string;
  originalUrl: string;
  authors: { name: string; id?: string }[];
  publisher?: string;
  publishedAt?: PartialDate;        // {year, month?, day?}
  language?: string;
  description?: string;             // only if licence permits display
  identifiers: { doi?: string; isbn?: string[]; wikidata?: string; openalex?: string; pg?: string; loc?: string };
  licence: Licence;
  attribution: string;              // pre-formatted human attribution line
  thumbnailUrl?: string;
  raw?: unknown;                    // trimmed provider payload for debugging (not exposed)
}

interface Licence {
  code: 'CC0' | 'PD' | 'PD-US' | 'CC-BY' | 'CC-BY-SA' | 'CC-BY-NC' | 'CC-BY-NC-SA' | 'CC-BY-ND' | 'ALL_RIGHTS_RESERVED' | 'UNKNOWN';
  version?: string;                 // '4.0'
  url?: string;
  reproduction: 'full' | 'excerpt' | 'link_only';  // derived by licence policy, not by adapter
}
```

`AdapterContext` provides an HTTP client with a User-Agent preset, a per-provider limiter, a cache, the abort signal, and the logger. Adapters never call `axios` directly, so limits cannot be bypassed.

## 3. Initial providers

| Provider | Endpoint family | Gives us | Licence handling | Constraints (Nov 2026) |
|---|---|---|---|---|
| Wikipedia | MediaWiki Action API + per-wiki REST (`/w/rest.php`, page summary/HTML) | Articles, sections, lead, links | Text CC BY-SA 4.0 → `excerpt` allowed with attribution + link + "modified" note | UA with contact required; ≤3 concurrent; 2026 rate limits, honor 429 + `Retry-After` |
| Wikidata | `wbsearchentities`, `wbgetentities`, SPARQL (WDQS) sparingly | Entities, dates, people, relations | CC0 → `full` | Same UA policy; WDQS has 60 s query timeout — keep queries small |
| Commons | `imageinfo` with `extmetadata` | Images | Per-file licence from `extmetadata.LicenseShortName`; non-free → reject | Never hotlink-only without attribution; reject files lacking licence metadata |
| OpenAlex | `/works`, `/concepts|topics` | Scholarly works | Metadata CC0; abstracts shown only if `open_access` licence is CC-BY*/CC0, else link-only | **Free API key required**; daily budget; key stored in env, adapter disabled if absent |
| Crossref | `/works` | DOI metadata, dedup authority | Metadata usable; abstracts link-only unless licence says otherwise | Polite pool via `mailto` param |
| Gutenberg | **Offline RDF catalog** (bulk import job) + mirror for text | Public-domain books | PD-US; strip PG header/footer when reproducing excerpts (trademark) | **Do not crawl gutenberg.org** — robot policy blocks IPs |
| Library of Congress | loc.gov JSON API (`?fo=json`) | Primary sources, images, maps | Per-item rights statement; default `link_only` unless "no known restrictions" | **20 req/min, 1-hour block on breach**; limiter set to 15/min |

New providers are added by implementing `ProviderAdapter` and registering it. No other code changes are needed.

## 4. Licence policy (single source of truth)

`licencePolicy(licence, kind) → reproduction` lives in one pure, unit-tested module:

| Licence | Reproduction | Requirements displayed |
|---|---|---|
| CC0, PD, PD-US | full | Source link (courtesy) |
| CC-BY | full/excerpt | Author, title, licence link, "changes made" |
| CC-BY-SA | excerpt | As CC-BY **and** the containing lesson must be CC BY-SA (see review A3) |
| CC-BY-NC* | link_only | (NC conflicts with an unrestricted platform licence — conservative) |
| CC-BY-ND | link_only | Excerpts may count as derivatives |
| ALL_RIGHTS_RESERVED / UNKNOWN | link_only | Title + link + metadata only |

"Publicly accessible" ≠ licensed. `UNKNOWN` is always link-only.

## 5. Discovery flow (for a lesson)

```
lesson(title, concepts[], path.category, path.subject)
  └─► QueryBuilder → per-provider ProviderQuery (category decides which providers run)
       └─► fan-out with per-provider timeout (8 s) + circuit breaker
            └─► normalize → canonicalize ids → DEDUP → RELEVANCE → rank
                 └─► upsert into `resources` (global cache) → return ranked list + providerReport
```

### Deduplication
1. **Exact id match**, in priority order: DOI → Wikidata QID → ISBN-13 → OpenAlex ID → (provider, externalId). Crossref and OpenAlex both carry DOIs, so they merge on DOI.
2. **Fuzzy match** for items that have no shared id: same kind, normalized title similarity ≥ 0.92 (trigram), the first author's surname matches, and the year is within ±1. Such items are grouped into a **cluster** with one canonical record (the richest metadata, with the most permissive licence preferred).
3. The `resources` collection has a unique index on `(provider, externalId)`. `canonicalResourceId` links duplicates to their canonical record.

### Relevance scoring (0–1)
```
score = 0.40 * entityMatch      // resource linked to a lesson concept QID (Wikidata "main subject" P921, OpenAlex topics, Wikipedia page = concept)
      + 0.25 * titleTermOverlap // BM25-lite on lesson title + concept labels vs resource title/description
      + 0.15 * categoryFit      // provider/kind suits category (papers for AI, PD books for History)
      + 0.10 * authority        // e.g., cited_by_count percentile (OpenAlex), featured article (Wikipedia)
      + 0.10 * licenceBonus     // reproducible content preferred
```
Thresholds: ≥ 0.70 pre-selected (generation only), 0.40–0.70 candidate, < 0.40 hidden. Weights are config, and they are tuned against the M7 evaluation set. This is the concrete meaning of "validate relevance": no resource is shown to a reader unless an editor attached it.

## 6. Ingestion: snapshots

- **Attach** only links a lesson to a `resourceId`, with a role.
- **Snapshot excerpt** (only if `reproduction ≠ link_only`) fetches the content, sanitizes it (an allow-list of HTML tags, links rewritten to absolute, no scripts or iframes), trims it to a max length (default 1,500 words for excerpts), and stores it as a `source_excerpt` block with `{resourceId, licence, attribution, retrievedAt, sourceRevisionId, contentHash}`.
- A snapshot never changes after creation. The reader shows `retrievedAt` with the excerpt.

## 7. Re-verification jobs (worker, node-cron)

| Job | Schedule | Action |
|---|---|---|
| `verify-resources` | nightly, batched by `lastVerifiedAt` oldest-first, budgeted per provider | Calls `verify()`; updates `lastVerifiedAt`, `status: ok | moved | gone | licence_changed` |
| `flag-stale-snapshots` | nightly after verify | If the source revision is newer than the snapshot, set `updateAvailable` on the block in **drafts only** (the editor sees a badge) |
| `gutenberg-catalog-import` | weekly | Download RDF catalog tarball from an official location, upsert book metadata |
| `aggregate-daily-stats` | nightly | Analytics roll-up |
| `srs-queue-maintenance` | hourly | Precompute due counts |

Rules:
- Jobs **never** modify published versions or user overlays.
- If a resource becomes `gone` or `licence_changed` to something more restrictive, the excerpt stays in published versions (it was valid when captured), but an admin report is created and the editor is notified. This rule needs legal review: a takedown request overrides it and goes through moderation.

Job execution uses a Mongo `jobs` collection with `{type, payload, status, runAt, lockedUntil, attempts}`. Workers claim jobs with `findOneAndUpdate` lease semantics. node-cron only enqueues jobs, so running several workers never double-runs anything.

## 8. Rate limiting, caching, failure

- **Limiter:** a token bucket per provider, held in memory per worker or API process, with conservative per-process limits. The MVP runs a single API process and a single worker. To scale out, move the buckets to Mongo or accept splitting the budget across processes.
- **Circuit breaker:** opens after 5 failures or 429s within 60 s. It stays open for 60 s, doubling each time up to 15 min, and lets one probe request through when half-open.
- **HTTP cache:** a `providerCache` collection keyed by `hash(provider, url, params)` with a TTL index (search results 24 h, entity fetches 7 d). It honors `ETag` / `Last-Modified` when available.
- **Per-user quotas:** discovery is limited to 60 requests per user per hour, and generation as in F6.
- **Errors:** adapters throw typed errors (`ProviderUnavailable`, `RateLimited{retryAfter}`, `NotFound`, `LicenceRejected`). The discovery service never fails the whole request because one provider failed; it returns a `providerReport`.

## 9. Security

- Fetched HTML is untrusted. It is sanitized server-side when snapshotted and rendered through a block renderer, never with `dangerouslySetInnerHTML` on raw provider HTML.
- Outbound fetches go only to an **allow-list of provider hosts**. That prevents SSRF through user-supplied URLs.
- A user-added external link (personal resource) stores only its URL and title. It is never fetched server-side in the MVP.
