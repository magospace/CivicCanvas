# v0.4 Production Pilot Plan

Target tag: `v0.4.0-production-pilot`

## Summary

Texas Data Canvas v0.4 moves the project from a product-demo milestone into a deployable production pilot. The milestone focuses on live-source reliability, runtime health, governed API/MCP errors, portable local saved-canvas bundles, prompt transparency, browser smoke tests, and release hygiene.

## Acceptance Criteria

- Dallas 311 remains live-enabled only for verified mapped non-ZIP aggregates.
- Austin permits remain sample-first unless `permit_type`, `zip_code`, and generated month live smoke checks all pass.
- Every live-enabled dataset keeps a sample fallback file.
- API errors use structured responses without raw stack traces.
- `/api/health` and `/api/catalog/health` report catalog and sample readiness.
- Saved canvases can be exported/imported as validated portable bundles.
- Prompt intent shows matched terms, reason codes, rejected fields, and mode hints.
- Browser smoke covers Dallas, Austin, unsupported prompt, filters, saved bundle rejection, Miro preview, and mobile overflow.
- MCP exposes status/catalog/live-source tools with structured output.

## Release Checklist

- `pnpm install --frozen-lockfile`
- `pnpm verify`
- Browser QA on desktop and 390px mobile.
- `git status --short` is clean.
- Tag `v0.4.0-production-pilot`.

## Non-Goals

- No hosted database, auth, or multi-user sharing.
- No LLM dependency.
- No Miro board writes.
- No arbitrary SQL, SoQL, HTML, JavaScript, external scripts, map URLs, or dynamic React components.
