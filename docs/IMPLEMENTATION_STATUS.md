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
- v0.5 public-beta hardening is complete on branch `feat/v0.5-public-beta`: deployment smoke, production-safe headers, Dallas/Austin live verification registry, explicit data-mode controls, saved bundle migration, source-card transparency, MCP alignment, and expanded Playwright smoke tests.

## Current Milestone

`v0.5.0-public-beta` is ready to tag after final verification.

The next target should be chosen after deployment feedback. Recommended options are a hosted public beta deployment, deeper Austin live-month resolution, or a broader dataset expansion phase.
