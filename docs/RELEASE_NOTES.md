# Release Notes

## v0.6.0-hosted-beta (planned)

- Merge the tagged v0.5 public beta onto `main` and prepare a hosted beta branch.
- Add manual Vercel deployment documentation for the current no-remote repo state.
- Extend runtime health metadata for hosted deployments without exposing secrets.
- Expand deployment smoke checks to cover health, catalog health, pages, response headers, Dallas/Austin dashboard generation, unsupported prompt behavior, and expected app version.
- Support remote Playwright browser smoke tests through `PLAYWRIGHT_BASE_URL`.
- Add hosted-beta runtime copy while preserving the no-auth, no-database, no-LLM, validated-JSON product model.

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
