# Texas Data Canvas Current Plan

Last updated: May 9, 2026

This plan incorporates the external senior review feedback against the current `feat/v0.6-hosted-beta` branch. It is intentionally conservative: items that affect hosted reliability, safety, auditability, or public abuse resistance are promoted ahead of the `v0.6.0-hosted-beta` tag; product polish and broader capability work move to v0.7+.

## Current State

- `main` has been fast-forwarded to `v0.5.0-public-beta`.
- Active branch: `feat/v0.6-hosted-beta`.
- v0.6 local hosted-beta work is implemented and local gates previously passed.
- v0.6 is not tagged because there is no public Vercel URL, no Git remote, and no Vercel credential environment in this repo context.
- All dashboard output must remain validated `CanvasDocument` JSON rendered through the allowlisted React block registry.

## Reviewed Feedback: Applies Now

These findings are valid against the current branch and should be worked before or during the v0.6 hosted-beta release pass.

### Must Fix Before v0.6 Tag

1. **Bundle `data/` for hosted runtime.**
   - Current code reads `data/catalog` and `data/samples` from filesystem paths outside `apps/web`.
   - Add and verify Next/Vercel output file tracing for `../../data/**/*`, or switch catalog/sample loading to deterministic bundled imports.
   - Verify with a local Vercel build if credentials/project linkage are available.

2. **Add public abuse controls for POST routes.**
   - Public no-auth routes include `/api/canvas/generate`, `/api/query`, `/api/export/miro-spec`, and `/api/canvas/save`.
   - Keep the 64 KiB body cap, but add a rate-limit strategy before public launch.
   - Preferred options, in order: Vercel Firewall/rate limiting if available; lightweight edge middleware; external KV-backed rate limit only if that infrastructure choice is explicitly accepted.

3. **Add CSP/HSTS and suppress the powered-by header.**
   - Current headers include `nosniff`, referrer policy, frame denial, and permissions policy.
   - Add a conservative CSP compatible with Next.js and Socrata fetches.
   - Add `Strict-Transport-Security` for hosted HTTPS.
   - Set `poweredByHeader: false`.
   - Extend deployment smoke header checks accordingly.

4. **Replace frozen audit/source timestamps.**
   - Runtime-generated canvases and MCP outputs still use `2026-05-09T00:00:00.000Z` in several places.
   - Replace runtime source `accessedAt`, `createdAt`, and `updatedAt` with current ISO timestamps.
   - Keep deterministic timestamps only in fixtures/tests where needed.

5. **Bump MCP runtime version metadata.**
   - MCP server status still reports `0.5.0-public-beta`.
   - Bump MCP status and server version to `0.6.0-hosted-beta` before tagging v0.6.

6. **Extend deployment smoke coverage.**
   - Current smoke covers health, catalog health, pages, headers, Dallas/Austin canvas generation, and unsupported prompt behavior.
   - Add `/api/datasets`, `/api/datasets/[id]`, and `/api/query`.
   - Add `/api/canvas/save` only if it is expected to be public-write safe in hosted mode; otherwise document its current role and protect it.

7. **Add deploy verification workflow after remote/credentials exist.**
   - Current CI covers lint/typecheck/test/build and manual live smoke.
   - Add a manual deploy verification workflow for hosted URLs once a Git remote and Vercel secrets are configured.
   - Do not commit secrets or `.vercel/project.json`.

8. **Fix generated canvas ID collisions.**
   - Generated Dallas/Austin canvases use stable IDs such as `canvas_dallas_311_requests`.
   - Local save currently replaces an existing saved canvas with the same `canvasId`.
   - Add per-generation IDs for user-generated canvases while preserving separate stable IDs for seeded/demo lookups.

9. **Prevent oversized saved-bundle imports in the browser.**
   - Saved canvas import validates JSON shape after parsing, but the textarea path has no client-side length cap.
   - Add a visible limit and reject oversized pasted JSON before `JSON.parse`.

### Should Fix If Time Before v0.6

- Sanitize generic API error responses so internal filesystem paths or unexpected messages are not returned to clients.
- Add `title` tooltips to icon-only inspector controls.
- Add a visible "coming soon" treatment or filtering for stretch datasets with empty `fields[]` in the explore sidebar.
- Raise `maxDashboardBlocks` only if a v0.6 change adds blocks; otherwise keep the documented limit at 10.
- Add a warning when ZIP rows are dropped because no bundled centroid is available.

## Reviewed Feedback: Qualified Or Not Immediate

- **Upstash/Vercel KV rate limiting:** useful, but not automatically accepted because v0.6 intentionally avoids hosted persistence. Choose explicit infrastructure before adding it.
- **Governance limits drift:** current docs and code both state `maxDashboardBlocks: 10`; no immediate drift found. If the value changes, update docs and tests together.
- **MCP simpler generated canvas:** acceptable for now. MCP `generate_canvas_spec` can stay simpler than the web dashboard if documented.
- **CORS:** no change required unless the app deliberately exposes cross-origin API access.
- **Commit SHA in health:** acceptable for hosted smoke diagnostics, but reconsider if branch names or commit metadata become sensitive.

## v0.7 Backlog

- Replace MCP regex-based error categorization with typed query/domain errors.
- Mirror structured shared query schemas in MCP tool input schemas instead of `z.any()` arrays.
- Move Miro export generation into `packages/shared` so web and MCP produce identical export specs.
- Add Socrata adapter success-path tests with a fake fetcher returning realistic aggregate rows.
- Expand rule-based prompt synonyms while continuing to reject unsupported/sensitive prompts.
- Add "Why this dashboard?" UI that shows parsed `PromptIntent` and the chosen `BoundedQuerySpec`.
- Add CSV export for query results.
- Add accessibility testing with axe or equivalent browser checks.
- Improve Miro preview from raw JSON into frame cards.
- Add a third verified dataset only after Dallas/Austin hosted reliability is solid.

## Release Gate

Do not tag `v0.6.0-hosted-beta` until:

- v0.6 must-fix items above are resolved or explicitly waived in docs.
- `pnpm verify` passes.
- A public hosted URL exists.
- `pnpm smoke:deploy -- --url <public-url> --expect-version v0.6.0-hosted-beta` passes.
- `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote` passes.
- `git status --short` is clean.
