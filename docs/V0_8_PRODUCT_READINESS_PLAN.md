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

- Public hosted verification remains blocked because no public URL, Git remote, or Vercel project linkage is available in this repo context.
- When a public URL exists, run hosted smoke and remote Playwright with the matching expected version.
- Do not tag v0.7 or v0.8 until the public hosted checks pass.
- Optional post-hosting work: choose exactly one third dataset candidate only after Dallas/Austin hosted reliability is settled.

## Local Verification Result

Local product-readiness verification passed on May 9, 2026:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` — 46 unit/API/MCP tests passed.
- `pnpm build`
- `pnpm verify` — includes preflight, live smoke, and 11 Playwright tests.
- `pnpm smoke:deploy -- --url http://localhost:3006`

Browser QA was performed with the Codex in-app Browser for the `/explore` shell and with Playwright for the responsive screenshot pass. The in-app Browser confirmed the page identity and rendered header/logo; Playwright was used for desktop/laptop/mobile screenshot capture because the Browser tab runtime did not expose viewport resizing in this session.

## Screenshot Evidence

Captured screenshots are checked in under `docs/screenshots/v0.8/`:

- `explore-shell-desktop.png`
- `dallas-dashboard-desktop.png`
- `austin-dashboard-laptop.png`
- `gallery-desktop.png`
- `miro-preview-desktop.png`
- `saved-share-workflow-desktop.png`
- `explore-mobile-390.png`

The screenshot pass covers `/explore`, Dallas generation, Austin generation, `/gallery`, Miro preview cards, `/saved`, and a 390px mobile viewport.

## Hosted Release Blocker

- No public Vercel URL is available yet.
- No Git remote is configured in this repo context.
- Do not tag `v0.7.0-public-hardening` or `v0.8.0-product-readiness` until the hosted checks pass:
  - `pnpm smoke:deploy -- --url <public-url> --expect-version v0.8.0-product-readiness`
  - `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote`
- When a public URL exists, run hosted smoke and remote Playwright with the matching expected version.

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
