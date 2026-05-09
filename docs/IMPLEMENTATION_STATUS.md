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

`v0.6.0-hosted-beta` is in progress on branch `feat/v0.6-hosted-beta`.

The v0.6 release gate is a verified public deployment. The repo has no configured Git remote today, so the first supported deployment path is manual Vercel CLI deployment. Do not tag `v0.6.0-hosted-beta` until a public URL passes deployment smoke checks and remote browser smoke tests.

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
