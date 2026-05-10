# Texas Data Canvas Current Plan

Last updated: May 9, 2026

This plan tracks the active `feat/v0.7-public-hardening` branch. The v0.6 hosted-beta and v0.7 public-hardening code work remain locally complete but untagged because no public deployment URL is available. v0.8 product-readiness is now locally closed out: CivicCanvas brand polish, no-backend sharing, curated demo canvases, richer Miro preview, catalog-confidence copy, screenshot evidence, and local verification are complete without adding auth, hosted persistence, LLM parsing, arbitrary generated UI, arbitrary SQL/SoQL, external map layers, or live Miro writes.

## Current State

- `main` has been fast-forwarded to `v0.5.0-public-beta`.
- Active branch: `feat/v0.7-public-hardening`.
- v0.6 local hosted-beta work is implemented, including the external review hardening backlog listed below.
- v0.7 local public-hardening work is implemented and verified locally, but v0.6/v0.7 are not tagged because there is no public Vercel URL, no Git remote, and no Vercel credential environment in this repo context.
- v0.8 product-readiness work is locally closed out on the same branch with screenshots and release-gate documentation.
- All dashboard output must remain validated `CanvasDocument` JSON rendered through the allowlisted React block registry.

## Implemented v0.6 Review Hardening

The May 9, 2026 external review was accepted where it applied to the hosted-beta release and converted into code/docs on `feat/v0.6-hosted-beta`.

### Completed Before v0.6 Tag

1. **Bundle `data/` for hosted runtime.**
   - Added Next output file tracing for the repo-level `data/**/*` directory.
   - Extended preflight to validate catalog/sample paths from the same root assumptions used by the web app.
   - Verified production build traces include catalog and sample files.

2. **Add public abuse controls for POST routes.**
   - Added best-effort middleware throttling for `/api/canvas/generate`, `/api/query`, `/api/export/miro-spec`, and `/api/canvas/save`.
   - Kept the existing 64 KiB request body cap.
   - Documented that broad public sharing should still use Vercel-native firewall/rate limiting in front of the no-auth app.

3. **Add CSP/HSTS and suppress the powered-by header.**
   - Added a conservative Content Security Policy, HSTS, and `poweredByHeader: false`.
   - Preserved `nosniff`, referrer policy, frame denial, and permissions policy.
   - Extended deployment smoke header checks for CSP and HSTS.

4. **Replace frozen audit/source timestamps.**
   - Runtime web canvases now use one current ISO timestamp per generation for `createdAt`, `updatedAt`, and source `accessedAt`.
   - MCP canvas/source attribution also uses current ISO timestamps.
   - Fixed timestamps remain only in tests/static fixtures where intentional.

5. **Bump MCP runtime version metadata.**
   - MCP server/status metadata now reports `0.6.0-hosted-beta`.

6. **Extend deployment smoke coverage.**
   - Deployment smoke now covers `/api/datasets`, `/api/datasets/dallas_311_requests`, and a known-safe Dallas aggregate `/api/query` POST.
   - Existing health, catalog health, page, response-header, Dallas/Austin canvas, and unsupported prompt checks remain.

7. **Add deploy verification workflow after remote/credentials exist.**
   - Added a manual `workflow_dispatch` deploy verification workflow that accepts `base_url` and `expected_version`.
   - The workflow verifies an already-deployed URL; it does not require committing secrets or `.vercel/project.json`.

8. **Fix generated canvas ID collisions.**
   - Generated canvases now use unique IDs with dataset, timestamp, and short random suffixes.
   - Repeated Dallas/Austin saves no longer silently overwrite prior saved canvases.

9. **Prevent oversized saved-bundle imports in the browser.**
   - Added a shared saved import byte limit.
   - `/saved` displays the limit and rejects oversized pasted JSON before `JSON.parse`.

10. **Sanitize public API errors.**
   - Zod validation issues remain user-fixable and structured.
   - Unexpected internal errors return generic messages without local paths or stack details.

11. **Apply small hosted-beta UX polish.**
   - Added visible tooltips to icon-only inspector and saved-canvas controls.
   - Marked stretch datasets with empty `fields[]` as "Coming later" in the explore sidebar.
   - Clarified ZIP-map caveats when aggregate rows cannot be plotted because no bundled centroid exists.

### Remaining Operational Release Blockers

- Run the full local release gate after the final doc updates.
- Deploy to a public Vercel URL once project linkage/credentials exist.
- Run `pnpm smoke:deploy -- --url <public-url> --expect-version v0.6.0-hosted-beta`.
- Run `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote`.
- Confirm Vercel-native firewall/rate limiting is configured before broad public sharing.
- Tag `v0.6.0-hosted-beta` only after hosted checks pass and `git status --short` is clean.

## Reviewed Feedback: Qualified Or Not Immediate

- **Upstash/Vercel KV rate limiting:** useful, but not automatically accepted because v0.6 intentionally avoids hosted persistence. Choose explicit infrastructure before adding it.
- **Governance limits drift:** current docs and code both state `maxDashboardBlocks: 10`; no immediate drift found. If the value changes, update docs and tests together.
- **MCP simpler generated canvas:** acceptable for now. MCP `generate_canvas_spec` can stay simpler than the web dashboard if documented.
- **CORS:** no change required unless the app deliberately exposes cross-origin API access.
- **Commit SHA in health:** acceptable for hosted smoke diagnostics, but reconsider if branch names or commit metadata become sensitive.

## v0.7 Completed Before This Pass

1. Replaced MCP regex-based error categorization with shared typed governed errors.
2. Mirrored structured shared query schemas in MCP query-related tool inputs.
3. Moved Miro export generation into `packages/shared` so web and MCP produce identical export specs.
4. Added Socrata adapter success-path tests with a fake fetcher returning realistic aggregate rows.
5. Expanded rule-based prompt synonyms while continuing to reject unsupported/sensitive prompts.
6. Added a collapsible "Why this dashboard?" inspector section with prompt intent, selected mode, safety decisions, and the active `BoundedQuerySpec`.
7. Added client-side CSV export for the current table, JSON export for the current `CanvasDocument`, and copy current `BoundedQuerySpec`.
8. Added axe-powered accessibility smoke coverage and fixed discovered contrast/keyboard-scroll issues.

## v0.8 Product Readiness Implemented In This Pass

1. Added cleaned CivicCanvas brand assets under `apps/web/public/brand/`.
   - The source download was left unchanged.
   - The duplicate dark head path was removed.
   - The person mark now has explicit white head and body geometry.
   - The compact mark is used in the app header and `apps/web/app/icon.svg`.
2. Added a curated demo gallery route at `/gallery`.
   - Gallery canvases live as checked-in JSON fixtures under `data/gallery/`.
   - Dallas, Austin, and unsupported-sensitive prompt examples validate as `CanvasDocument` and render through the existing allowlisted registry.
3. Added no-backend saved-canvas share links.
   - Share links encode the existing `SavedCanvasBundle` shape in a URL hash.
   - Hash imports are decoded, size-capped, and schema-validated before storage/rendering.
   - `/saved` still supports portable JSON bundle import/export.
4. Improved main canvas export affordances.
   - The main dashboard toolbar now exposes save, share link, CSV, Canvas JSON, active query spec, and Miro preview actions.
   - Exports remain client-side and schema-backed.
5. Improved Miro preview cards.
   - Frame cards now show item-type chips, content excerpts, and a highlighted required Source & Method frame, while keeping JSON preview available.
6. Improved source catalog confidence copy.
   - Field badges now distinguish live-capable, sample-only, blocked, mapped/sample, and coming-later statuses.
   - Dallas ZIP sample fallback and Austin live monthly aggregation blockers remain visible.
7. Extended tests for branded header rendering, curated gallery validation, gallery route rendering, and saved share-link output.
8. Captured screenshot evidence under `docs/screenshots/v0.8/` for `/explore`, Dallas, Austin, `/gallery`, Miro preview, `/saved`, and mobile.
9. Verified locally on May 9, 2026 with `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm verify`, and `pnpm smoke:deploy -- --url http://localhost:3006`.

## Remaining v0.8 Backlog

- Run hosted smoke and remote Playwright when a public URL exists.
- Record public verification results before tagging.
- Add a third verified dataset only after Dallas/Austin hosted reliability is solid.
- Keep `v0.7.0-public-hardening` and future `v0.8.0-product-readiness` tags blocked until the required hosted public URL checks pass.

## v0.9 Public Reliability Active

Active branch: `feat/v0.9-public-reliability`. This pass focuses on public reliability rather than infrastructure expansion:

1. Added `docs/V0_9_PUBLIC_RELIABILITY_PLAN.md`.
2. Added clearer degraded-health UI and a utility-focused `/demo-readiness` route.
3. Improved deploy smoke JSON output for CI dashboards.
4. Documented known Dallas/Austin sample/live boundaries in the README.
5. Extended CSV/JSON export affordances to gallery and saved canvases.
6. Keep Houston transportation as the default third-dataset candidate, but do not wire it into dashboard generation until catalog metadata, field classification, local fallback sample, source caveats, adapter mapping, and bounded query tests are complete.
7. Verified locally on May 9, 2026 with `pnpm verify`, `pnpm smoke:deploy -- --url http://localhost:3006`, and `pnpm smoke:deploy:json -- --url http://localhost:3006`.

## Release Gate

Do not tag `v0.6.0-hosted-beta`, `v0.7.0-public-hardening`, or a future `v0.8.0-product-readiness` milestone until:

- v0.6 must-fix items above are resolved or explicitly waived in docs.
- `pnpm verify` passes.
- A public hosted URL exists.
- `pnpm smoke:deploy -- --url <public-url> --expect-version <release-version>` passes.
- `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote` passes.
- `git status --short` is clean.
