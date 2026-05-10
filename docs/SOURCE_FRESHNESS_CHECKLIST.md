# Source Freshness And Terms Review Checklist

Use this checklist before making stronger live-data claims, promoting a dataset from sample/fallback to live, or recording hosted/public submission language that depends on source freshness. It is a review checklist only; it does not mutate source portals, production data, deployment config, or release evidence.

## Current Dataset Status

| Dataset | Current live/fallback status | Freshness/terms note | Hidden-field boundary |
|---|---|---|---|
| Dallas 311 Service Requests | Limited live Socrata support for verified non-ZIP aggregate fields; ZIP dashboard remains sample fallback. | Confirm Dallas Open Data endpoint availability, metadata timestamp, and terms before expanding live fields. | Do not promote unverified fields; ZIP is currently sample-only for the core dashboard because the verified live view does not expose it. |
| Austin Building Permits | Sample-first for the monthly ZIP dashboard; live promotion is blocked for source-owned month grouping. | Confirm Austin portal terms and safe month grouping before enabling live dashboard paths. | No hidden field is used in the current core demo; keep administrative caveats attached. |
| Houston Transportation Incidents | Sample-first; no promoted live feed adapter. | Confirm Houston TranStar or other official feed access terms, rate limits, and aggregate-safe mappings before any live promotion. | `precise_address` is `sensitive_hide` and must stay out of queries, dashboards, exports, saved bundles, gallery fixtures, and Miro previews. |

## Review Steps Before Stronger Live Claims

1. Identify the exact source-owned endpoint, dataset ID, documentation URL, and terms/license page.
2. Confirm access is public and does not require credentials, scraping behind authentication, or prohibited redistribution.
3. Record the source review date and reviewer in a durable doc or catalog note.
4. Inspect source metadata for field names, data types, update cadence, deprecation notices, rate limits, and pagination constraints.
5. Map only catalog-owned fields into `liveFieldMap`; never pass prompt/model-provided SQL, SoQL, URLs, or expressions through to adapters.
6. Reclassify every candidate field as `safe_public`, `safe_with_aggregation`, `sensitive_hide`, or `unknown_review` before use.
7. Keep precise addresses, phone numbers, emails, names, coordinates for sensitive contexts, and unreviewed raw details hidden or aggregated.
8. Add or update deterministic fallback samples before enabling any live path so demos remain reliable when the portal is slow or unavailable.
9. Add tests for live-mapping boundaries, sample fallback, hidden-field rejection, source caveats, and query audit metadata.
10. Keep UI/docs wording honest: live-capable for the reviewed path only, sample/fallback for every unsupported field or grouping.

## Evidence Needed To Promote A Live Path

A future task may promote a path only when all of these are recorded:

- Official source URL and machine endpoint.
- Terms/license and any attribution requirement.
- Verified field map from canonical app fields to source-owned fields/expressions.
- Hidden-field review covering every source field touched by the app.
- Minimum successful smoke query for each promoted grouping/metric.
- Expected fallback reason when a required field is missing or a network request fails.
- Updated docs in `docs/LIVE_ADAPTERS.md` and `docs/LIVE_FALLBACK_PROOF.md`.
- Tests proving hidden fields remain unavailable and fallback behavior remains visible.

## Validation Commands

Run these after source/freshness docs or catalog assumptions change:

```bash
pnpm live:fallback-proof:json
pnpm governance:audit
pnpm data:quality
pnpm test -- packages/shared/test/query-audit.test.ts
pnpm test -- apps/web/test/demo-proof.test.ts
```

Run the broader local baseline before claiming implementation readiness:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Optional network check, only when intentionally reviewing live source availability:

```bash
pnpm smoke:live:json
```

Do not use a passing live smoke to imply unsupported fields, unreviewed groupings, Austin monthly promotion, Houston live promotion, hosted rate limiting, media generation, persistence, or release readiness.

## Claim Language

Safe language:

- "Dallas has limited live support for verified non-ZIP aggregate fields."
- "The Dallas ZIP demo uses visible sample fallback because ZIP is not exposed by the verified live view."
- "Austin monthly and Houston transportation demos are sample-first today."
- "Live public APIs are used only through catalog-owned mappings with deterministic sample fallback."

Unsafe language unless future evidence exists:

- "All dashboards are live."
- "Austin monthly permits are live-backed."
- "Houston traffic incidents use a live feed."
- "The app can query arbitrary city data."
- "Release evidence proves the current commit" unless Task 35 has refreshed it after the full release gate.
