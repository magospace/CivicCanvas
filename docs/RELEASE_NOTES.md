# Release Notes

## v0.4.0-production-pilot

Planned production-pilot release focused on live-source reliability, runtime health checks, structured API/MCP errors, portable saved-canvas bundles, governed prompt transparency, browser smoke tests, and release hardening.

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
