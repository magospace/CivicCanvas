# Sample And Persistence Realness

Last updated: May 10, 2026

This matrix keeps demo claims honest about what is checked-in, browser-local, live-capable, synthetic, or historical. It does not change product behavior.

## Sample Data Matrix

| Dataset | Sample file | Rows | Date range | Provenance note | Live/fallback status | Hidden-field boundary | Validation |
|---|---|---:|---|---|---|---|---|
| Dallas 311 Service Requests | `data/samples/dallas-311.sample.json` | 120 | 2024-01-01 to 2024-12-26 | Checked-in synthetic development sample aligned to the approved Dallas 311 schema. It is not a complete live extract. | Dallas has limited live Socrata support for verified non-ZIP aggregate fields; the core ZIP demo uses sample fallback because the verified live source does not expose `zip_code`. | No hidden field is approved for this dataset; all queried fields still pass catalog validation and row limits. | `pnpm data:quality`, `pnpm governance:audit` |
| Austin Building Permits | `data/samples/austin-building-permits.sample.json` | 120 | 2024-01-03 to 2024-12-27 | Checked-in synthetic development sample aligned to the approved Austin permits schema. It is not a complete live extract. | Austin monthly/ZIP demo remains sample-first until source-owned month grouping is safely verified. | No hidden field is approved for this dataset; all queried fields still pass catalog validation and row limits. | `pnpm data:quality`, `pnpm governance:audit` |
| Houston Transportation Incidents and Road Projects | `data/samples/houston-transportation-incidents.sample.json` | 40 | 2024-01-04 to 2024-12-30 | Checked-in synthetic development sample aligned to the approved Houston transportation schema. It is not a complete live extract. | Houston remains sample-first/live-disabled until live feed access, terms, aggregate-safe fields, and precise-location handling are approved. | `precise_address` is classified `sensitive_hide` and must stay out of queries, dashboards, CSV/JSON exports, gallery fixtures, saved bundles, and Miro preview specs. | `pnpm data:quality`, `pnpm governance:audit` |

`pnpm data:quality:json` last reported 280 total sample rows, 12 distinct months for each sample-backed dataset, zero missing ZIP rows, and four checked-in gallery canvases.

## Persistence And Artifact Matrix

| Surface | Where it lives | Real/mock/local status | What to say in demos | What not to claim | Validation |
|---|---|---|---|---|---|
| Approved catalog | `data/catalog/approved-datasets.json` | Checked-in static governance metadata. | The app only works with approved catalog datasets and fields. | Do not claim users can connect arbitrary datasets at runtime. | `pnpm governance:audit` |
| Sample rows | `data/samples/*.sample.json` | Checked-in synthetic/schema-aligned local samples. | Samples make the demo deterministic and preserve field/caveat boundaries. | Do not claim samples are complete source-owned production extracts. | `pnpm data:quality` |
| Gallery canvases | `data/gallery/*.canvas.json` | Checked-in validated `CanvasDocument` fixtures. | Gallery items are curated fixtures rendered through the trusted registry. | Do not claim gallery canvases are user-created records from a backend. | `pnpm governance:audit`, `pnpm test` |
| Saved canvases | Browser `localStorage` through `apps/web/lib/saved-canvases.ts` and `packages/shared/src/persistence/index.ts` | Browser-local only. | Saved canvases are local to the current browser profile. | Do not claim multi-user persistence, account sync, or backend storage. | `pnpm test`, `pnpm test:e2e` |
| Share links | URL hash containing a validated saved-canvas bundle | Browser/hash based handoff. | Share links are portable demo bundles that import after schema validation. | Do not claim public database-backed URLs or hosted share services. | `pnpm test`, `pnpm test:e2e` |
| `/api/canvas/save` | `apps/web/app/api/canvas/save/route.ts` | Server validation stub only. | The route validates `CanvasDocument` JSON and returns metadata. | Do not claim it writes to a database, object store, account, or public share service. | `pnpm test -- apps/web/test/canvas-save-route.test.ts` |
| `/api/canvas/[id]` | `data/seed-canvases.json` loaded by `apps/web/lib/data.ts`, then regenerated through `apps/web/app/api/canvas/[id]/route.ts` | Fixture-backed seed/demo helper. | The route regenerates known seed canvases for demos from validated seed fixture prompts. | Do not claim it retrieves arbitrary saved user canvases or database records. | `pnpm test -- apps/web/test/canvas-seed-route.test.ts`, `pnpm data:realism:json` |
| Release evidence | `docs/release-evidence.json` | Historical checked-in release proof for commit `a5ce07a81ee932bdf7a37724af0e7aab3a3d9f0f`. | Treat it as historical until Task 35 reruns the full gate. | Do not cite it as current branch proof. | `pnpm governance:audit` |

## Safe Validation Set

```bash
git diff --check
pnpm lint
pnpm data:quality
pnpm data:realism:json
pnpm governance:audit
```
