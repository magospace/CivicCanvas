# QA Findings

Last audited: May 10, 2026 03:11 CDT

## Scope

Read `AGENTS.md`, `TASKS.md`, `HERMES_PROGRESS.md`, `README.md`, `GOVERNANCE_NOTE.md`, `DEVELOPMENT_GUIDE.md`, and the current git status. This update reconciles QA findings after completed coverage, test-organization, dirty-worktree handoff, and lint-migration-spike tasks. It does not change product behavior.

## Command Audit

Latest relevant validation from completed Hermes cycles:

- `git status --short --branch`: captured the dirty worktree on branch `feat/v1.3-hosted-launch-readiness`; see `HERMES_PROGRESS.md` for categorized handoff.
- `pnpm lint`: passed. Warning: the script still invokes deprecated `next lint`.
- `pnpm typecheck`: passed across shared, MCP server, and web packages.
- `pnpm test`: passed, 87 tests across 14 files.
- `pnpm governance:audit`: earlier audit passed 19/19 checks. Warning remains that `docs/release-evidence.json` records commit `a5ce07a`, while current `HEAD` is `2021b47`.
- `pnpm data:quality`: earlier audit passed, 3 samples, 280 rows, 4 gallery canvases.

## Active Findings

### Medium: release evidence is not aligned with current HEAD

Evidence:

- `docs/release-evidence.json` records commit `a5ce07a81ee932bdf7a37724af0e7aab3a3d9f0f`.
- Current `HEAD` is `2021b47806547d89760065dd13dc290b840c39f6` (`2021b47`).
- `pnpm governance:audit` previously passed but warned about this mismatch.

Recommended fix:

Refresh `docs/release-evidence.json` only during an intentional release-evidence update after rerunning the full release gate for the intended release commit. Until then, avoid treating checked-in release evidence as proof for the current working tree.

### Medium: dirty worktree must be reviewed before release evidence refresh

Evidence:

- `git status --short --branch` shows modified tracked files and many untracked docs/test artifacts from prior safe cycles.
- `HERMES_PROGRESS.md` item 26 handoff groups those files into durable workflow docs, architecture/readiness docs, focused route/unit tests, e2e tests, and web/MCP behavior-touching changes.
- The dirty tree includes one behavior-touching tracked file, `apps/web/lib/dashboard.ts`, plus validation proof and handoff files that must be intentionally reviewed before commit or release evidence refresh.

Recommended fix:

Review and intentionally commit or otherwise reconcile the dirty tree before running release-evidence refresh work. Do not clean, revert, stage, or commit implicitly during unrelated safe-cycle tasks.

### Low: lint command depends on deprecated Next.js lint entrypoint

Evidence:

- `package.json:13` runs `pnpm --filter @texas-data-canvas/web lint`.
- `apps/web/package.json:10` runs `next lint`.
- Current lint output says `next lint` is deprecated and will be removed in Next.js 16.

Recommended fix:

The documentation spike for `TASKS.md` item 24 is complete. `DEVELOPMENT_GUIDE.md` now records the current `next lint` wiring, confirms `eslint` and `eslint-config-next` are already present in `apps/web/package.json`, and recommends running the official `npx @next/codemod@canary next-lint-to-eslint-cli .` migration in a dedicated package/config task. Treat implementation as a separate package/config change requiring `pnpm lint`, `pnpm typecheck`, and `pnpm test`.

### Low: hosted rate limiting still depends on platform controls

Evidence:

- `apps/web/middleware.ts` uses in-memory request throttling as defense in depth.
- `README.md`, `DEVELOPMENT_GUIDE.md`, and `HERMES_PROGRESS.md` all note that public hosted deployments need platform-level firewall/rate limiting before broad sharing.

Recommended fix:

Keep this as a release-readiness note until a deployment/platform task configures external rate limiting. Do not treat the in-repo middleware as sufficient distributed/serverless protection.

## Resolved Findings

### Resolved: focused API route coverage gaps

Resolution:

- `apps/web/test/canvas-save-route.test.ts` now covers valid canvas validation and invalid canvas rejection.
- `apps/web/test/canvas-seed-route.test.ts` now covers a known seed ID and an unknown ID.
- `apps/web/test/query-route.test.ts`, `apps/web/test/dataset-routes.test.ts`, and `apps/web/test/miro-export-route.test.ts` cover direct query, dataset catalog, and preview-only Miro route contracts.
- `TASKS.md` items 4, 5, 6, 13, and 14 are complete.

### Resolved: saved-canvas and browser workflow coverage gaps

Resolution:

- `apps/web/test/saved-canvases.test.ts` covers share-link/hash import behavior and guard paths.
- `tests/e2e/product-demo.spec.ts` covers saved-card open, duplicate, delete, export bundle, share-link, and invalid import behavior.
- `TASKS.md` items 3 and 17 are complete.

### Resolved: API tests were concentrated in one broad web test file

Resolution:

- Broad web tests were split into focused files including `apps/web/test/dashboard.test.ts`, `apps/web/test/dashboard-exports.test.ts`, `apps/web/test/api-contracts.test.ts`, and `apps/web/test/release-scripts.test.ts`.
- Latest completed `pnpm test` baseline passed with 87 tests across 14 files.
- `TASKS.md` item 9 is complete.

### Resolved: public-data transparency and governance coverage gaps

Resolution:

- Unsupported prompt guidance now has unit and e2e coverage for exact supported prompts and approved sources.
- Data-mode/fallback visibility now has unit and e2e coverage.
- Source catalog UI coverage verifies field classifications, live/sample confidence, hidden-field warnings, and city filtering.
- Gallery fixture regression coverage validates checked-in canvases, source/method attribution, allowed block types, and hidden-field absence.
- `TASKS.md` items 7, 8, 15, 16, 18, and 23 are complete.

### Resolved: MCP, prompt intent, query audit, and middleware coverage gaps

Resolution:

- `apps/mcp-server/test/tools.test.ts` now strengthens MCP canvas/audit validation and unsupported dataset failure behavior.
- `packages/shared/test/prompt-intent.test.ts` covers prompt intent edge cases.
- `packages/shared/test/query-audit.test.ts` covers query audit safety decisions.
- `apps/web/test/api-contracts.test.ts` covers middleware rate-limit boundaries.
- `TASKS.md` items 19, 20, 21, and 22 are complete.

### Resolved: onboarding docs contained stale cleanup items

Resolution:

- `CODEBASE_OVERVIEW.md` and `DEVELOPMENT_GUIDE.md` were refreshed so agents do not chase already-current `apps/web/README.md` and `.env.example` cleanup.
- `TASKS.md` item 1 is complete.

### Resolved: dirty worktree lacked a durable handoff

Resolution:

- `HERMES_PROGRESS.md` now groups modified and untracked files by purpose, identifies expected prior-cycle artifacts, calls out reviewer attention before commit, and explicitly blocks release-evidence refresh from the dirty tree.
- `TASKS.md` item 26 is complete.

## Risky File Watchlist

Treat these files as high-impact and require focused tests or explicit review before changing them:

- `packages/shared/src/schemas/index.ts`
- `packages/shared/src/query/index.ts`
- `packages/shared/src/adapters/index.ts`
- `packages/shared/src/prompt/index.ts`
- `apps/web/lib/dashboard.ts`
- `apps/web/middleware.ts`
- `data/catalog/approved-datasets.json`
- `data/gallery/*.canvas.json`
- `docs/release-evidence.json`

Current known risk: `apps/web/middleware.ts` is defense-in-depth only. Public deployments still need platform-level firewall/rate limiting before broad sharing. Release evidence remains historical until item 35 runs the full gated refresh from a clean or intentionally reviewed tree.
