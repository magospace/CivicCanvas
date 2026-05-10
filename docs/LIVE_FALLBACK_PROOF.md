# Public Data Live/Fallback Proof Matrix

Last reviewed: May 10, 2026

This matrix is the quick truth source for judge-demo data claims. It names what each core prompt requests, what the current implementation renders, and which file proves the boundary.

| Dataset | Demo prompt | Requested data mode | Current rendered mode | Why | Hidden-field boundary | Source/caveat proof |
|---|---|---|---|---|---|---|
| Dallas 311 Service Requests | `Show Dallas 311 service requests by category and ZIP code for 2024.` | Auto by default; optional Live public API request from the UI. | Fallback/sample for the core ZIP dashboard. Narrow non-ZIP Dallas aggregates can use live Socrata when the query uses only verified live fields. | The approved Dallas live view does not expose `zip_code`; the dashboard requires ZIP geography, so `dashboardMode()` selects sample fallback and records the missing live field. | No hidden field is promoted for the demo. ZIP is allowed only from the approved sample fallback for this dashboard. | `data/catalog/approved-datasets.json` lists `liveAvailable: true`, omits `zip_code` from `liveFieldMap`, and records `sampleOnlyFields: ["zip_code", "response_days"]`; `apps/web/lib/dashboard.ts` requires ZIP for the core dashboard and returns fallback metadata. |
| Austin Building Permits | `Show Austin building permits by month and ZIP code for 2024.` | Auto by default; optional Live public API request from the UI. | Sample/fallback for the core monthly dashboard. | Austin metadata and some live aggregate checks are verified, but source-owned month grouping remains blocked, so `liveAvailable` is false for dashboards. Explicit live requests return approved sample fallback with a visible caveat. | No hidden field is used in the core demo. Permit records are presented as administrative public data, not construction starts. | `data/catalog/approved-datasets.json` lists `liveAvailable: false`, `promotionStatus: "blocked"`, and `sampleOnlyFields: ["month"]`; `apps/web/test/dashboard.test.ts` asserts Austin live requests render fallback and keep approved sample caveats. |
| Houston Transportation Incidents | `Show Houston transportation incidents by ZIP and incident type for 2024.` | Auto by default; optional Live public API request from the UI. | Sample-first local data. Explicit live requests fall back because the dataset is not live-enabled. | Houston TranStar sample feed documentation exists, but live feed access and aggregate-safe mappings are not promoted. The pilot sample is intentionally local and excludes precise locations. | `precise_address` is classified `sensitive_hide`; precise locations must stay out of queries, dashboards, gallery fixtures, saved bundles, CSV/JSON exports, and Miro specs. | `data/catalog/approved-datasets.json` lists `adapter: "static_json"`, `liveAvailable: false`, `promotionStatus: "sample_first"`, and hidden `precise_address`; `packages/shared/test/query-audit.test.ts` rejects hidden-field queries and verifies Houston sample audit metadata. |

## Data-Mode Definitions

| UI label | Query mode | Meaning |
|---|---|---|
| Auto | `auto` | Use live public APIs only when the approved catalog marks the dataset and required fields as live-ready; otherwise use approved samples. |
| Live public API | `live_if_available` | Request live data, then visibly fall back to approved samples when the dataset, field mapping, or network path is unavailable or unsafe. |
| Sample fallback | `sample_only` | Force deterministic local sample data for repeatable demos. |

## Validation Proof

Run these local checks before claiming the matrix is current:

```bash
pnpm live:fallback-proof:json
pnpm governance:audit
pnpm data:quality
pnpm test -- apps/web/test/dashboard.test.ts
pnpm test -- packages/shared/test/query-audit.test.ts
```

`pnpm live:fallback-proof:json` is no-network and catalog-driven. It proves the narrow Dallas live-capable mapping, the Dallas ZIP fallback boundary, Austin sample-first/month limitation, and Houston sample-first/hidden-address boundary.

For a full local test baseline:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

`pnpm smoke:live` is optional and network-dependent. It checks only catalog entries with `liveAvailable: true`; it is not required for the local judge demo and should not be used to promote Austin or Houston live claims.

## Demo Claim Rules

- Say "limited live support" for Dallas, not "all Dallas dashboards are live".
- Say "sample fallback" for the Dallas ZIP dashboard.
- Say "sample-first" for Austin monthly dashboards and Houston transportation.
- Say "synthetic/schema-aligned local samples" when describing checked-in sample rows.
- Say "preview-only Miro spec" for Miro output.
- Do not cite `docs/release-evidence.json` as current proof until Task 35 refreshes it after the full release gate.
