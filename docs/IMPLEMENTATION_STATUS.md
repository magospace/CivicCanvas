# Implementation Status

Last updated: May 9, 2026

## Completed

- P0 repo foundation: pnpm monorepo, Next.js web app, MCP server package, shared TypeScript/Zod package, catalog and sample data.
- P1 frontend shell: `/explore`, `/sources`, `/saved`, header, sidebar, prompt bar, canvas area, inspector/filter panel, source/method placeholder.
- P2 canvas system: allowlisted block registry, `CanvasDocument` validation, required `SourceMethodBlock`, unsafe markup rejection, route-safe validation state.
- P3 local query layer: approved catalog checks, bounded sample-data filters, grouping, metrics, row limits, source attribution, query audits.
- P4 MCP server: official SDK stdio server and typed handlers for dataset search, metadata, bounded query, visualization recommendation, canvas validation/generation, attribution, audit, and preview Miro export.
- P5 prompt flow: deterministic Dallas 311 and Austin permits prompt matching, API routes, generated dashboard rendering.
- P6 stretch preview: `MiroExportSpec` generation with required source/method frame and no board writes.
- P7 demo hardening: route smoke tests, source catalog filters, saved demo placeholders, tests, docs.
- Post-MVP hardening: shared package split into focused schema, query, canvas, adapter, prompt, persistence, and Miro modules while preserving the package export surface.
- Live adapter boundary: dataset adapter interface, static JSON adapter, Socrata URL builder, adapter router, catalog live metadata, and mandatory sample fallback.
- Dashboard state: prompt, filters, generated canvas, query audit, save action, and Miro preview are wired in the `/explore` client shell.
- Geography: `MapBlock` supports governed ZIP bubble feature data with an SVG renderer and fallback placeholder.
- Saved canvases: `/saved` reads browser-local saved canvases, validates imported specs, and supports open, duplicate, delete, and JSON preview actions.
- CI and quality gates: ESLint, GitHub Actions, and a preflight script validate lint, typecheck, tests, build, catalog, and fallback sample files.
- v0.3 product-demo pass: Dallas 311 live Socrata metadata verified and enabled for mapped fields, Austin permit live metadata verified but left sample-first, data-mode indicators added, inspector filters derive from `FilterBlock`, saved-canvas import validation added, and Miro export templates expanded.

## Current Limitations

- Dallas live 311 queries work for verified mapped fields, but ZIP-level Dallas dashboards still use sample fallback because the verified live view does not expose ZIP.
- Austin live permit metadata is verified against `quv8-5ckq`, but `liveAvailable` remains disabled pending final source approval.
- Prompt interpretation is deterministic with a typed `PromptIntent` layer for supported city/topic/date/grouping requests.
- ZIP geography uses bundled approximate centroid/bubble features, not full ZCTA boundaries or live tile layers.
- Saved canvases persist only in browser `localStorage`; no auth or hosted database is wired.
- Miro export generates a safe spec only; it does not write to Miro.
- v0.4 production-pilot hardening is complete on branch `feat/v0.4-production-pilot`: health routes, structured errors, saved-canvas bundles, prompt transparency, MCP status tools, and Playwright smoke tests.
- v0.5 public-beta hardening is complete and tagged `v0.5.0-public-beta`: deployment smoke, production-safe headers, Dallas/Austin live verification registry, explicit data-mode controls, saved bundle migration, source-card transparency, MCP alignment, and expanded Playwright smoke tests.

## Current Milestone

`v1.3.0-hosted-launch-readiness` is active on branch `feat/v1.3-hosted-launch-readiness`. The v0.6 through v1.2 code milestones remain locally implemented, but their public release tags are still blocked because this repo context has no public Vercel URL, Git remote, or Vercel project linkage/credentials.

The v0.6 release gate is a verified public deployment. The repo has no configured Git remote today, so the first supported deployment path is manual Vercel CLI deployment. Do not tag `v0.6.0-hosted-beta` until a public URL passes deployment smoke checks and remote browser smoke tests.

Because no public URL is available in this repo context, v0.7 starts from the completed local v0.6 hardening branch while preserving the v0.6 tag blocker in release docs.

## v0.6 Target

- Merge the v0.5 public beta onto `main` and keep the existing `v0.5.0-public-beta` tag intact.
- Add hosted-beta deployment documentation for manual Vercel CLI deployment without committing `.vercel` project metadata, tokens, organization IDs, project IDs, or secret deployment URLs.
- Extend health and smoke checks for public hosted validation.
- Make Playwright smoke tests reusable against an already deployed public URL.
- Add subtle hosted-beta runtime copy while keeping the app no-auth, no-database, no-LLM, and governed by validated `CanvasDocument` JSON rendered through the allowlisted block registry.
- Apply the accepted external review hardening items before tagging: hosted data tracing, CSP/HSTS, sanitized API errors, best-effort POST throttling, runtime timestamps, unique generated canvas IDs, saved import size caps, expanded deploy smoke, and small demo UX polish.

## v0.6 Verification Status

Local hosted-beta implementation checks passed on May 9, 2026:

- `pnpm verify`
- `pnpm smoke:deploy -- --url http://localhost:3004 --expect-version v0.6.0-hosted-beta`
- `PLAYWRIGHT_BASE_URL=http://localhost:3004 pnpm test:e2e:remote`

The local hosted-style production smoke rebuilt `apps/web` with `NEXT_PUBLIC_APP_ENV=hosted-beta` and `NEXT_PUBLIC_APP_VERSION=v0.6.0-hosted-beta` before `next start`, matching how Next public env metadata is captured for hosted builds.

Release remains blocked until a public Vercel URL is available and the same hosted checks pass against that URL. No `v0.6.0-hosted-beta` tag has been created.

## External Review Backlog

The May 9, 2026 external review was triaged into `PLAN.md`. The code-level v0.6 hardening items have been implemented locally: hosted data bundling, no-auth POST abuse controls, CSP/HSTS headers, runtime timestamps instead of frozen demo timestamps, MCP version metadata, broader deploy smoke coverage, deploy verification workflow setup, generated canvas ID collision fixes, saved-bundle import size limits, public API error sanitization, and small UX caveats/tooltips.

Remaining release work is operational: obtain a public Vercel URL, run deployment smoke and remote Playwright against it, verify platform-level firewall/rate limiting for broad sharing, and then tag `v0.6.0-hosted-beta`.

## v0.7 Target

- Add typed governed errors and use them for MCP error categorization.
- Tighten MCP query input schemas while preserving tool names and valid-input behavior.
- Share Miro export generation between web and MCP.
- Expand deterministic prompt synonyms without adding an LLM dependency.
- Add a collapsible "Why this dashboard?" inspector section and client-side governed exports.
- Add browser accessibility smoke coverage and fix discovered accessibility issues.

## v0.7 Implementation Status

Completed locally on branch `feat/v0.7-public-hardening`:

- Shared typed governed errors for unsupported datasets, unsupported fields, row-limit failures, unsafe canvas specs, live adapter failures, and validation errors.
- MCP query-related tool inputs use structured shared query schemas instead of permissive `z.any()` arrays.
- Shared Miro export generation is used by both web and MCP.
- Socrata adapter success-path tests cover live aggregate normalization without network.
- Deterministic prompt synonyms cover Dallas service-request/complaint phrasing and Austin permit/building-activity phrasing.
- `/explore` inspector includes a collapsible "Why this dashboard?" section with matched terms, reason codes, selected mode, safety decisions, and active `BoundedQuerySpec` JSON.
- Client-side exports support table CSV, validated `CanvasDocument` JSON, and active `BoundedQuerySpec` copy.
- Playwright includes axe-powered serious/critical accessibility smoke checks, with contrast and keyboard-scroll fixes applied.

## v0.8 Product Readiness Status

Locally closed out on branch `feat/v0.7-public-hardening`:

- Cleaned CivicCanvas logo assets are committed under `apps/web/public/brand/`, with the duplicate dark head overlay removed and an explicit white person mark added.
- The web header and app icon now use the CivicCanvas mark while keeping the app named `Texas Data Canvas`.
- `/gallery` renders checked-in validated `CanvasDocument` fixtures for Dallas 311, Austin permits, and an unsupported/sensitive prompt example.
- Saved-canvas sharing now supports URL-hash bundles using the existing `SavedCanvasBundle` shape and validation path.
- The main canvas toolbar exposes save, share link, CSV, Canvas JSON, active query spec, and Miro preview actions.
- Miro preview now shows frame cards with item chips and a highlighted required Source & Method frame.
- `/sources` field badges show live-capable, sample-only, blocked, mapped/sample, and coming-later statuses.
- Demo screenshots are captured under `docs/screenshots/v0.8/` for `/explore`, Dallas, Austin, `/gallery`, Miro preview, `/saved`, and mobile.
- Local verification passed on May 9, 2026:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm verify`
  - `pnpm smoke:deploy -- --url http://localhost:3006`

Release remains blocked on public hosted verification. No `v0.7.0-public-hardening` or `v0.8.0-product-readiness` tag has been created in this repo context.

## v0.9 Public Reliability Status

Started on branch `feat/v0.9-public-reliability` from the locally closed-out v0.8 branch:

- `/demo-readiness` provides catalog health, hosted blockers, known Dallas/Austin sample/live boundaries, release gate commands, and safety rules.
- Deploy smoke JSON includes a summary for release dashboards and now covers `/demo-readiness`.
- `/sources` includes a degraded-health callout if catalog/sample validation fails.
- Gallery canvases and saved canvases expose client-side CSV/JSON export affordances where table data is present.
- README now documents known sample/live boundaries and the Houston transportation third-dataset candidate policy.
- Local verification passed on May 9, 2026:
  - `pnpm verify`
  - `pnpm smoke:deploy -- --url http://localhost:3006`
  - `pnpm smoke:deploy:json -- --url http://localhost:3006`

The Houston transportation candidate moved from coming-later to governed sample-first work on the v1.0 branch. Release tags remain blocked on public hosted verification.

## v0.9 Hosted Release Closeout

Hosted tagging remains blocked as of May 9, 2026 because this repo context has no public Vercel URL, no Git remote, and no Vercel project linkage/credentials. No deployment secrets or `.vercel` project metadata are committed. Tag `v0.9.0-public-reliability` only after public deployment smoke, remote Playwright, and platform-level firewall/rate-limit checks pass.

## v1.0 Public Pilot Status

Started on branch `feat/v1-public-pilot` from locally verified `feat/v0.9-public-reliability`:

- Added `docs/V1_PUBLIC_PILOT_PLAN.md`.
- Added Houston transportation incidents as the single governed third dataset for the public pilot.
- Houston is sample-first and live-disabled until a stable source-owned API/schema is verified.
- Catalog metadata classifies public incident fields and keeps `precise_address` hidden with `sensitive_hide`.
- Added local Houston fallback sample data and ZIP centroid support for governed map rendering.
- Deterministic Houston prompt handling now generates a validated dashboard with a required `SourceMethodBlock`.
- `/demo-readiness`, `/sources`, deploy smoke, unit tests, and Playwright coverage now include Houston readiness and governance checks.
- Local verification passed on May 9, 2026:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test` — 49 tests passed.
  - `pnpm build`
  - `pnpm verify` — 13 Playwright checks passed.
  - `pnpm smoke:deploy -- --url http://localhost:3007` — 17/17 checks passed.
  - `pnpm smoke:deploy:json -- --url http://localhost:3007` — `passed: 17`, `failed: 0`.

The v1.0 release remains subject to the same hosted gate: no `v1.0.0-public-pilot` tag until public deployment smoke, remote Playwright, and platform-level firewall/rate-limit checks pass.

## v1.1 Product Depth Status

Started on branch `feat/v1.1-product-depth` from locally verified `feat/v1-public-pilot`:

- Added `docs/V1_1_PRODUCT_DEPTH_PLAN.md`.
- Verified the Houston live-source boundary against official/source-owned pages: Houston TranStar documents sample JSON feeds, but live feed access requires contacting TranStar.
- Kept Houston sample-first and live-disabled; no scraping of the City Active Incidents page is used.
- Updated Houston catalog verification metadata, gallery attribution, dashboard caveats, `/sources`, and `/demo-readiness` with the TranStar boundary.
- Expanded sensitive/raw prompt detection for exact address and exact-location requests.
- Improved Houston dashboard depth with a status breakdown chart while preserving the 10-block governance limit.
- Local verification passed on May 9, 2026:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test` — 52 tests passed.
  - `pnpm build`
  - `pnpm verify` — includes preflight, live smoke, and 14 Playwright checks.
  - `pnpm smoke:deploy -- --url http://127.0.0.1:3008` — 17/17 checks passed.
  - `pnpm smoke:deploy:json -- --url http://127.0.0.1:3008` — `passed: 17`, `failed: 0`.
  - `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3008 pnpm test:e2e:remote` — 14 checks passed.

The v1.1 release remains subject to the same hosted gate: no `v1.1.0-product-depth` tag until local gates pass and public deployment smoke, remote Playwright, and platform-level firewall/rate-limit checks pass or are explicitly documented as blocked.

## v1.2 Hosted Trust Status

Started on branch `feat/v1.2-hosted-trust` from locally verified `feat/v1.1-product-depth`:

- Added `docs/V1_2_HOSTED_TRUST_PLAN.md`.
- Centralized release metadata in `@texas-data-canvas/shared`: `v1.2.0-hosted-trust`, `v1.2.0-hosted-trust-dev`, release channel `hosted-trust`, and package version `1.2.0`.
- Aligned root, web, MCP, and shared package versions to `1.2.0`.
- Updated `/api/health` and MCP `get_server_status` to consume shared release metadata while still honoring hosted env vars.
- Added `pnpm verify:prod-local` for production-local hosted verification against `next start`.
- Added `pnpm governance:audit` and `pnpm governance:audit:json`; preflight now runs the governance audit before lint/typecheck/test/build.
- Added release-proof and v1.2 gate-copy surfaces to `/demo-readiness`.
- Added an `/explore` known-boundaries accordion for Dallas ZIP sample fallback, Austin monthly aggregation blocker, and Houston TranStar live-access blocker.
- Local verification passed on May 9, 2026:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test` — 54 tests passed.
  - `pnpm build`
  - `pnpm governance:audit` — 8/8 checks passed.
  - `pnpm verify` — preflight, live smoke, and 14 Playwright checks passed.
  - `pnpm verify:prod-local` — production build, `next start`, 17/17 deploy smoke checks, and 14 remote-mode Playwright checks passed against localhost.

The v1.2 release remains subject to the same hosted gate: no `v1.2.0-hosted-trust` tag until public deployment smoke, remote Playwright, and platform-level firewall/rate-limit checks pass.

## v1.3 Hosted Launch Readiness Status

Started on branch `feat/v1.3-hosted-launch-readiness` from locally verified `feat/v1.2-hosted-trust`:

- Added `docs/V1_3_HOSTED_LAUNCH_READINESS_PLAN.md`.
- Updated shared release metadata to `v1.3.0-hosted-launch-readiness` with package version `1.3.0`.
- Added `docs/release-evidence.json` as the checked-in release evidence surface.
- Added Vercel output verification and `pnpm release:check`.
- Added `pnpm data:quality` and surfaced sample quality on `/demo-readiness`.
- Extended governance audit coverage for source caveats, sample dataset IDs, gallery source references, and SourceMethodBlock caveats.
- Added hosted handoff checklist copy action on `/demo-readiness`.
- Added first-run prompt chips on `/explore` and gallery “open in explore” using the existing validated saved-canvas path.
- Added `docs/HOUSTON_TRANSTAR_ACCESS_PACKET.md`.

The v1.3 release remains subject to the same hosted gate: no `v1.3.0-hosted-launch-readiness` tag until public deployment smoke, remote Playwright, and platform-level firewall/rate-limit checks pass.
