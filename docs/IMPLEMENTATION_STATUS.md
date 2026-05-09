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

## Current Limitations

- Live public API adapters are not implemented; MVP uses local sample JSON for reliability.
- Prompt interpretation is deterministic and supports the two demo workflows.
- ZIP geography is a static visual placeholder rather than MapLibre/GeoJSON.
- Saved canvases are preview placeholders; no persistent database is wired.
- Miro export generates a safe spec only; it does not write to Miro.

## Next Target

After MVP review, add live Socrata/Tyler adapters behind the same `BoundedQuerySpec` validation and replace the ZIP placeholder with a real aggregate geography layer.
