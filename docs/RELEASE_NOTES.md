# Release Notes

## v1.0.0-public-pilot (active)

- Adds Houston transportation incidents as the single governed third dataset for the public pilot.
- Keeps Houston sample-first with no live adapter promotion until a stable source-owned API/schema is verified.
- Adds Houston field classification, local fallback sample data, ZIP centroid support, bounded-query tests, prompt generation, gallery fixture, and deployment smoke coverage.
- Keeps precise Houston locations hidden through `sensitive_hide` classification.
- Improves `/demo-readiness`, `/sources`, and canvas toolbar fallback messaging so Dallas, Austin, and Houston readiness is visible during demos.
- Local verification passed with lint, typecheck, 49 unit/API/MCP tests, build, `pnpm verify`, and 17/17 local deployment smoke checks.
- Keeps hosted release tags blocked until a real public URL passes hosted smoke and remote Playwright.

## v0.9.0-public-reliability (locally complete / untagged)

- Adds `/demo-readiness` as a utility release console for catalog health, known sample/live boundaries, hosted blockers, gate commands, and safety rules.
- Improves `/sources` degraded-health copy and deploy smoke JSON summaries for CI/release dashboards.
- Extends gallery and saved-canvas views with client-side table CSV and validated CanvasDocument JSON export affordances.
- Documents Dallas ZIP sample fallback, Austin sample-first monthly aggregation, and the Houston transportation candidate policy.
- Keeps hosted release tags blocked until a real public URL passes hosted smoke and remote Playwright.
- Hosted tag is not created because no public Vercel URL, Git remote, or Vercel project linkage is configured in this repo context.

## v0.8.0-product-readiness (locally complete / untagged)

- Adds cleaned CivicCanvas brand assets, repaired person mark, header integration, and app icon consistency.
- Adds `/gallery` with checked-in validated CanvasDocument fixtures for Dallas 311, Austin permits, and unsupported-sensitive prompt handling.
- Adds no-backend URL-hash saved-canvas share links using the existing `SavedCanvasBundle` validation path.
- Improves Miro preview with frame cards, item chips, excerpts, and a highlighted required Source & Method frame.
- Adds main canvas toolbar export affordances for save, share, CSV, Canvas JSON, active query spec, and Miro preview.
- Improves source catalog field-confidence copy for live-capable, sample-only, blocked, sample, mapped, and coming-later fields.
- Captures v0.8 demo screenshots under `docs/screenshots/v0.8/`.
- Local verification passed on May 9, 2026 with lint, typecheck, unit tests, build, `pnpm verify`, and local deploy smoke.
- Release tag remains blocked until public hosted smoke and remote Playwright pass.

## v0.7.0-public-hardening (locally complete / untagged)

- Starts from the completed local v0.6 hosted-beta hardening branch while v0.6 tagging remains blocked on a public deployment URL.
- Added typed governed errors, stricter MCP query input schemas, shared Miro export generation, deterministic prompt synonym expansion, dashboard reasoning inspector, client-side governed exports, and accessibility browser coverage.
- Added Socrata adapter success-path coverage with a mocked live aggregate response.
- Improved visual accessibility by darkening secondary/accent colors and making scrollable JSON previews keyboard focusable.
- Continues the no-auth, no-database, no-LLM, no arbitrary generated UI/query execution, and preview-only Miro model.

## v0.6.0-hosted-beta (in progress)

- Merge the tagged v0.5 public beta onto `main` and prepare a hosted beta branch.
- Add manual Vercel deployment documentation for the current no-remote repo state.
- Extend runtime health metadata for hosted deployments without exposing secrets.
- Expand deployment smoke checks to cover health, catalog health, pages, response headers, Dallas/Austin dashboard generation, unsupported prompt behavior, and expected app version.
- Support remote Playwright browser smoke tests through `PLAYWRIGHT_BASE_URL`.
- Add hosted-beta runtime copy while preserving the no-auth, no-database, no-LLM, validated-JSON product model.
- Add hosted runtime data tracing for catalog/sample files, CSP/HSTS headers, generic unexpected API errors, best-effort POST throttling, current runtime timestamps, unique generated canvas IDs, saved import size caps, MCP v0.6 metadata, and review-polish UI caveats.
- Release tag remains intentionally blocked until a public URL passes hosted smoke and remote browser checks.

## v0.5.0-public-beta

- Marked v0.4 production-pilot complete and prepared the no-auth public beta milestone.
- Added deployment smoke checks and production-safe web response headers.
- Deepened Dallas/Austin live verification metadata and public catalog transparency.
- Added explicit dashboard data-mode controls for Auto, Live public API, and Sample fallback.
- Improved portable saved-canvas bundle sharing, legacy canvas import migration, and validation messaging.
- Aligned MCP status/query behavior with web API data-mode and fallback reporting.
- Expanded unit, API, MCP, and browser coverage for public-beta flows.

## v0.4.0-production-pilot

- Added structured live smoke output, `pnpm smoke:live:json`, and documented Austin live promotion blocker.
- Added shared API error, catalog health, live smoke, and saved-canvas bundle schemas.
- Added `/api/health`, `/api/catalog/health`, bounded request parsing, 64 KiB body limits, request IDs, and structured route errors.
- Added portable saved-canvas bundle import/export, share-copy bundle behavior, and clear-all local saved canvases.
- Added prompt intent matched terms, reason codes, rejected fields, mode hints, top-N parsing, and relative date parsing.
- Added MCP status, catalog validation, and live-source tools.
- Added Playwright browser smoke tests and `pnpm verify`.

## v0.3.0-product-demo

- Verified Dallas 311 live Socrata metadata and enabled mapped non-ZIP live aggregates.
- Verified Austin issued building permits metadata while keeping Austin sample-first.
- Added data-mode indicators, governed filter state, prompt intent debug output, ZIP bubble geography, saved-canvas import validation, expanded Miro export templates, and MCP error hardening.
- Tagged from a clean `main` after preflight, live smoke, MCP smoke, and browser QA.

## v0.2.0-live-adapters

- Split shared modules into schemas, query, canvas, adapters, prompt, persistence, and Miro packages.
- Added static JSON and Socrata adapter boundaries, adapter routing, CI/preflight checks, local saved canvases, ZIP bubble geography, and deterministic dashboard generation.

## v0.1.0-hackathon-mvp

- Built the pnpm monorepo, shared Zod schemas, Next.js App Router shell, allowlisted CanvasDocument renderer, local bounded query layer, MCP server, prompt-to-dashboard flow, and preview-only Miro export spec.
