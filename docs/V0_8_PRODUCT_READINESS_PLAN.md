# Texas Data Canvas v0.8 Product Readiness Plan

Last updated: May 9, 2026

## Summary

v0.8 product readiness starts from the locally complete `feat/v0.7-public-hardening` branch. Because this repo context still has no public hosted URL or Git remote, v0.6 and v0.7 release tags remain blocked on operational deployment verification. v0.8 work should improve public-demo confidence without changing the core safety contract: dashboards are validated `CanvasDocument` JSON rendered through the allowlisted React block registry.

No auth, hosted database, LLM dependency, arbitrary HTML/JavaScript/SQL/SoQL, external map layers, or live Miro writes are introduced in this milestone.

## Implemented In This Pass

- Cleaned and committed CivicCanvas logo assets:
  - `apps/web/public/brand/civiccanvas-logo.svg`
  - `apps/web/public/brand/civiccanvas-mark.svg`
  - `apps/web/app/icon.svg`
- Fixed the person/head issue by removing the duplicate dark head overlay and adding explicit white head/body geometry.
- Replaced the generic header dashboard icon with the CivicCanvas mark while preserving the product label `Texas Data Canvas`.
- Added `/gallery` with checked-in validated demo canvases from `data/gallery/`.
- Added URL-hash saved-canvas bundle sharing using the existing `SavedCanvasBundle` schema and import validation path.
- Added main canvas toolbar actions for save, share link, CSV export, Canvas JSON, active query spec, and Miro preview.
- Improved Miro preview from a frame list plus raw JSON into frame cards with item chips, excerpts, and a highlighted required Source & Method frame.
- Improved `/sources` field confidence copy for live-capable, sample-only, blocked, sample, mapped, and coming-later fields.

## Acceptance Criteria

- The cleaned CivicCanvas mark renders in the `/explore` header at desktop and mobile widths.
- `apps/web/app/icon.svg` builds successfully and uses the cleaned mark.
- `/gallery` renders all checked-in gallery canvases through `CanvasRenderer`.
- Gallery fixture JSON validates as `CanvasDocument` and includes `SourceMethodBlock`.
- Share links use URL hash payloads and import only after bundle/canvas validation.
- Oversized or unsafe saved bundle payloads remain rejected before rendering.
- Miro preview always includes the required Source & Method frame.
- Dallas ZIP sample fallback and Austin live monthly blocker remain visible in source/catalog copy.

## Remaining Work

- Run full local gates after this pass:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm verify`
- Run local browser smoke and screenshot review for `/explore`, `/sources`, `/saved`, and `/gallery`.
- When a public URL exists, run hosted smoke and remote Playwright with the matching expected version.
- Do not tag v0.7 or v0.8 until the public hosted checks pass.
- Optional post-hosting work: choose exactly one third dataset candidate only after Dallas/Austin hosted reliability is settled.

## Release Checklist

- Clean git status.
- No `.vercel/project.json`, tokens, organization IDs, project IDs, or secret-bearing URLs committed.
- Local gates pass.
- Hosted smoke passes against a public URL.
- Remote Playwright passes against the same public URL.
- Vercel-native firewall/rate limiting is configured before broad public sharing.
- Tag only after hosted verification:
  - `v0.7.0-public-hardening` for the current public-hardening milestone.
  - `v0.8.0-product-readiness` only after product-readiness acceptance is verified.
