# Texas Data Canvas Current Plan

Last updated: May 9, 2026

This plan tracks the active `feat/v0.7-public-hardening` branch. The v0.6 hosted-beta code hardening work remains complete but untagged because no public deployment URL is available. v0.7 focuses on public-surface hardening, MCP parity, deterministic prompt resilience, governed exports, explainability, and accessibility without adding auth, hosted persistence, LLM parsing, arbitrary generated UI, arbitrary SQL/SoQL, external map layers, or live Miro writes.

## Current State

- `main` has been fast-forwarded to `v0.5.0-public-beta`.
- Active branch: `feat/v0.7-public-hardening`.
- v0.6 local hosted-beta work is implemented, including the external review hardening backlog listed below.
- v0.6 is not tagged because there is no public Vercel URL, no Git remote, and no Vercel credential environment in this repo context.
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

## v0.7 Completed In This Pass

1. Replaced MCP regex-based error categorization with shared typed governed errors.
2. Mirrored structured shared query schemas in MCP query-related tool inputs.
3. Moved Miro export generation into `packages/shared` so web and MCP produce identical export specs.
4. Added Socrata adapter success-path tests with a fake fetcher returning realistic aggregate rows.
5. Expanded rule-based prompt synonyms while continuing to reject unsupported/sensitive prompts.
6. Added a collapsible "Why this dashboard?" inspector section with prompt intent, selected mode, safety decisions, and the active `BoundedQuerySpec`.
7. Added client-side CSV export for the current table, JSON export for the current `CanvasDocument`, and copy current `BoundedQuerySpec`.
8. Added axe-powered accessibility smoke coverage and fixed discovered contrast/keyboard-scroll issues.

## Remaining v0.7 Backlog

- Improve Miro preview from raw JSON into richer frame cards if more demo polish is needed.
- Add a third verified dataset only after Dallas/Austin hosted reliability is solid.
- Run the full release gate and tag `v0.7.0-public-hardening` only after the required hosted public URL checks pass.

## Release Gate

Do not tag `v0.6.0-hosted-beta` until:

- v0.6 must-fix items above are resolved or explicitly waived in docs.
- `pnpm verify` passes.
- A public hosted URL exists.
- `pnpm smoke:deploy -- --url <public-url> --expect-version v0.6.0-hosted-beta` passes.
- `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote` passes.
- `git status --short` is clean.
