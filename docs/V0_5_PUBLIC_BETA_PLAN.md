# v0.5 Public Beta Plan

Status: complete pending final verification and tag.

## Summary

`v0.5.0-public-beta` moves Texas Data Canvas from production-pilot hardening into a deployable, no-auth public demo. The milestone deepens Dallas 311 and Austin permits reliability instead of adding broad new dataset coverage.

Dashboards continue to render only through validated `CanvasDocument` JSON and the allowlisted React block registry. The app still does not execute arbitrary generated HTML, JavaScript, SQL, SoQL, external scripts, model-provided map layers, dynamic React components, or live Miro board writes.

## Acceptance Criteria

- `v0.4.0-production-pilot` is marked complete in implementation docs and release notes.
- Vercel deployment path is documented for `apps/web`, including sample-mode defaults and optional live adapter behavior.
- Production-safe response headers are configured for the web app.
- A deployment smoke script accepts a base URL and checks `/api/health`, `/api/catalog/health`, `/explore`, `/sources`, and `/saved`.
- Dallas and Austin live verification status is visible in catalog metadata and source cards.
- Dallas remains live-enabled only for verified mapped fields; ZIP dashboards keep sample fallback.
- Austin remains sample-first unless live month aggregation is safely verified.
- The dashboard exposes explicit data-mode controls: Auto, Live public API, and Sample fallback.
- API, web, and MCP behavior report actual data mode and fallback reasons consistently.
- Saved-canvas share/export uses portable validated JSON bundles.
- Tests cover Socrata URL safety, live fallback, explicit data mode, saved bundle validation, API/MCP status, and browser smoke flows.

## Release Checklist

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preflight
pnpm smoke:live
pnpm test:e2e
pnpm verify
```

Optional deployed-app smoke:

```bash
pnpm smoke:deploy -- --url https://your-deployment.example
```

Before tagging:

- Confirm `git status --short` is clean.
- Confirm no build artifacts are staged.
- Browser-check `/explore`, `/sources`, `/saved`, Dallas prompt, Austin prompt, unsupported prompt, filter changes, saved bundle import/export, and Miro preview.
- Tag `v0.5.0-public-beta`.
