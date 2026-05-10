# Texas Data Canvas v0.9 Public Reliability Plan

Last updated: May 9, 2026

## Summary

v0.9 public reliability starts from the locally closed-out v0.8 product-readiness work. Because no public hosted URL or Git remote is configured in this repo context, v0.6, v0.7, and v0.8 remain untagged until hosted smoke and remote Playwright pass against a real public deployment.

This milestone improves public-demo confidence without adding infrastructure. The project remains no-auth, no hosted database, no LLM dependency, no arbitrary generated HTML/JavaScript/SQL/SoQL, no external map layers, and no live Miro writes. Dashboards still render only validated `CanvasDocument` JSON through the allowlisted registry.

## Goals

- Make local and hosted reliability status visible to reviewers.
- Improve degraded-health and fallback messaging for public demos.
- Produce richer deployment smoke JSON for CI dashboards and release notes.
- Document known Dallas/Austin live/sample boundaries in the README.
- Extend client-side CSV/JSON export affordances to gallery and saved-canvas views.
- Keep exactly one third-dataset candidate in discovery mode until the full governance checklist passes.

## Implemented In This Pass

- Added `/demo-readiness`, a utility-focused release console with catalog health, hosted blockers, known sample/live boundaries, local/hosted gate commands, and the safety model.
- Added `Demo` navigation in the header.
- Improved `/sources` catalog health copy with a degraded-state callout if catalog/sample validation issues appear.
- Extended deploy smoke output with a summary object for JSON consumers and a human-readable pass count.
- Added `/demo-readiness` to deploy smoke page coverage.
- Added gallery-level CSV and CanvasDocument JSON downloads for checked-in validated canvases.
- Added saved-canvas table CSV downloads alongside open/share/duplicate/JSON/delete actions.
- Updated the README with `/demo-readiness` and known sample/live boundaries.

## Third Dataset Candidate Policy

Houston transportation incidents remains the default v0.9 candidate because it adds a map-forward civic story. It must stay in coming-later/suggestion mode until all of the following are complete:

- Approved catalog metadata.
- Field classification.
- Local fallback sample.
- Source/method caveats.
- Adapter mapping if live.
- Bounded query happy-path and rejection tests.
- Gallery fixture only if useful and fully validated.

Texas spending remains the alternate candidate if accountability/finance becomes the preferred story.

## Acceptance Criteria

- `/demo-readiness` renders without a marketing landing-page pattern.
- `/sources` communicates degraded catalog health if catalog/sample validation fails.
- `pnpm smoke:deploy:json -- --url <url>` includes `summary.total`, `summary.passed`, `summary.failed`, `summary.durationMs`, and per-check results.
- Gallery canvases provide table CSV and CanvasDocument JSON export buttons without server persistence.
- Saved canvases provide table CSV export when a table block is present.
- README explains Dallas ZIP sample fallback and Austin sample-first monthly aggregation.
- No third dataset is dashboard-generated until the governance checklist passes.

## Verification Plan

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm smoke:deploy -- --url http://localhost:<port>`
- `pnpm smoke:deploy:json -- --url http://localhost:<port>`
- `pnpm verify`

Local implementation verification passed on May 9, 2026:

- `pnpm verify` — includes lint, typecheck, 46 unit/API/MCP tests, build, live smoke, and 12 Playwright tests.
- `pnpm smoke:deploy -- --url http://localhost:3006` — 14/14 smoke checks passed.
- `pnpm smoke:deploy:json -- --url http://localhost:3006` — summary reported `passed: 14`, `failed: 0`.

Hosted tagging remains blocked until:

- `pnpm smoke:deploy -- --url <public-url> --expect-version <version>`
- `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote`
- Platform-level firewall/rate limiting is confirmed before broad public sharing.

## Release Status

v0.9 is an active public-reliability branch. No `v0.9.0-public-reliability` tag should be created until v0.8 is publicly verified or the release docs explicitly record why v0.9 is being verified from the current branch instead.
