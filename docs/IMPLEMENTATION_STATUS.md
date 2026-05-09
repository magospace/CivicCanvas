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

## Current Limitations

- Socrata/Tyler live adapter support is scaffolded and tested at the URL/fallback boundary, but current catalog entries keep `liveAvailable` disabled and use local samples for reliable demos.
- Prompt interpretation is deterministic with a typed `PromptIntent` layer for supported city/topic/date/grouping requests.
- ZIP geography uses bundled approximate centroid/bubble features, not full ZCTA boundaries or live tile layers.
- Saved canvases persist only in browser `localStorage`; no auth or hosted database is wired.
- Miro export generates a safe spec only; it does not write to Miro.

## Next Target

Verify the new adapter/filter/save/export flows in browser QA, then promote selected catalog entries to `liveAvailable` only after their portal metadata and field mappings are confirmed.
