# Hermes Progress

Last updated: May 10, 2026 04:22 CDT

## Current Cycle

- Task chosen: `TASKS.md` item 37, "Align Miro Export Docs With Preview-Only Implementation".
- Why this was next: Item 37 follows the saved-persistence honesty task and resolves the next realness-audit risk: historical Miro docs implying board workflows beyond the implemented preview JSON.
- Scope: `docs/MIRO_EXPORT_SPEC.md`, `README.md`, `REALNESS_AUDIT.md`, `TASKS.md`, and `HERMES_PROGRESS.md`.
- Safety notes: Documentation only. No product behavior, runtime source code, tests, package scripts, config, source data, secrets, auth, billing, migrations, production config, deploy scripts, release evidence, catalog data, samples, live API calls, or destructive operations were changed. Release evidence was not refreshed.

## Files Updated

- `docs/MIRO_EXPORT_SPEC.md`: Reframed Miro as preview-only JSON, aligned the type example to the implemented three-template schema, removed unsupported current `research_story_board` wording, and labeled board creation/OAuth/write behavior as future-only.
- `README.md`: Updated the short Miro description so it does not imply real board creation.
- `REALNESS_AUDIT.md`: Lowered the Miro-doc mismatch risk and pointed future work at the next media-provider wording task.
- `TASKS.md`: Marked item 37 complete with validation notes.
- `HERMES_PROGRESS.md`: Recorded item 37 scope, safety notes, and validation.

## Sequential Progress

- Carry-over audit state committed as `a4f09c6` (`docs: add hackathon realness audit`).
- Task 28 committed as `bb42631` (`docs: add final judge demo script`).
- Task 29 committed as `2563468` (`docs: add local demo readiness checklist`).
- Task 30 committed as `7ef1ca8` (`docs: add public data fallback proof matrix`).
- Task 31 committed as `8667205` (`test: add core demo fallback proof`).
- Task 32 committed as `2585388` (`test: strengthen judge demo e2e path`).
- Task 33 committed as `2529af4` (`test: add governed workflow e2e smoke`).
- Task 34 committed as `2fbcf44` (`chore: migrate web lint to eslint cli`).
- Task 36 committed as `476143a` (`docs: clarify saved canvas persistence boundary`).
- Task 37 completed and ready to commit as `docs: align miro preview-only wording`.

## Sequential Task Plan

1. Task 36, "Clarify Saved-Canvas Validation Stub Honesty".
   - Validation: `git diff --check`, `pnpm lint`.
   - Expected commit: `docs: clarify saved canvas persistence boundary`.
2. Task 37, "Align Miro Export Docs With Preview-Only Implementation".
   - Validation: `git diff --check`, `pnpm lint`.
   - Expected commit: `docs: align miro preview-only wording`.
3. Task 38, "Document No Image/Video/Media Provider Path".
   - Validation: `git diff --check`, `pnpm lint`.
   - Expected commit: `docs: document no media provider path`.
4. Task 39, "Add Current-HEAD Release Evidence Warning To Demo Handoff".
   - Validation: `git diff --check`, `pnpm lint`; optionally `pnpm governance:audit` to confirm the historical evidence warning remains expected.
   - Expected commit: `docs: warn release evidence is historical`.

## Dirty Worktree Reconciliation Plan

This plan is analysis-only. It did not stage, commit, delete, revert, clean, or rewrite any file. `TASKS.md` item 26 was already complete, so no task status change was needed.

### Current Dirty Tree Summary

- Branch: `feat/v1.3-hosted-launch-readiness`.
- Modified tracked files: `.env.example`, `AGENTS.md`, `README.md`, `apps/mcp-server/test/tools.test.ts`, `apps/web/README.md`, `apps/web/lib/dashboard.ts`, `apps/web/test/dashboard.test.ts`, `tests/e2e/product-demo.spec.ts`.
- Untracked files: `ARCHITECTURE_MAP.md`, `CODEBASE_OVERVIEW.md`, `DEVELOPMENT_GUIDE.md`, `GOVERNANCE_NOTE.md`, `HERMES_PROGRESS.md`, `QA_FINDINGS.md`, `ROADMAP.md`, `TASKS.md`, `docs/README.md`, focused web/shared/MCP/e2e test files listed below.
- Tracked diff stat inspected: 8 tracked files changed with 543 insertions and 519 deletions.

### Classification

1. Intentional product/code changes from completed tasks:
   - `apps/web/lib/dashboard.ts`: unsupported/sensitive prompts now return exact supported prompt suggestions and approved source cards.
   - `.env.example`: sample public runtime metadata and comments were aligned to the v1.3 hosted-launch-readiness label. This is not a real secrets file, but it is still env-adjacent and deserves review before commit.
2. Intentional tests:
   - `apps/mcp-server/test/tools.test.ts`
   - `apps/web/test/dashboard.test.ts`
   - `tests/e2e/product-demo.spec.ts`
   - `tests/e2e/sources.spec.ts`
   - `apps/web/test/api-contracts.test.ts`
   - `apps/web/test/canvas-save-route.test.ts`
   - `apps/web/test/canvas-seed-route.test.ts`
   - `apps/web/test/dashboard-exports.test.ts`
   - `apps/web/test/dataset-routes.test.ts`
   - `apps/web/test/miro-export-route.test.ts`
   - `apps/web/test/query-route.test.ts`
   - `apps/web/test/release-scripts.test.ts`
   - `apps/web/test/saved-canvases.test.ts`
   - `packages/shared/test/prompt-intent.test.ts`
   - `packages/shared/test/query-audit.test.ts`
3. Intentional docs/handoff/governance files:
   - `AGENTS.md`
   - `README.md`
   - `apps/web/README.md`
   - `ARCHITECTURE_MAP.md`
   - `CODEBASE_OVERVIEW.md`
   - `DEVELOPMENT_GUIDE.md`
   - `GOVERNANCE_NOTE.md`
   - `ROADMAP.md`
   - `docs/README.md`
   - `TASKS.md`
   - `HERMES_PROGRESS.md`
   - `QA_FINDINGS.md`
4. Generated files that should probably be ignored:
   - `apps/web/.next/`
   - `apps/mcp-server/dist/`
   - `packages/shared/dist/`
   - `test-results/`
   - `apps/web/tsconfig.tsbuildinfo`
   - `apps/mcp-server/tsconfig.build.tsbuildinfo`
   - `packages/shared/tsconfig.build.tsbuildinfo`
   - `packages/shared/tsconfig.tsbuildinfo`
5. Local-only artifacts that may be deleted only with user approval:
   - `node_modules/`
   - `apps/web/node_modules/`
   - `apps/mcp-server/node_modules/`
   - `packages/shared/node_modules/`
   - the generated build/test artifacts listed above if the user explicitly wants a clean local workspace.
6. Risky/ambiguous changes needing review:
   - `apps/web/lib/dashboard.ts` because it changes generated fallback/suggestion behavior.
   - `.env.example` because env-adjacent files deserve review even when they contain only public sample values.
   - `apps/web/test/dashboard.test.ts` because it is both a large test split and a gallery-fixture regression expansion.
   - `tests/e2e/product-demo.spec.ts` because browser workflows can be sensitive to copy/accessibility changes.
   - `apps/mcp-server/test/tools.test.ts` because MCP contract proof is release-relevant.
   - `docs/release-evidence.json` should not be refreshed or committed as part of this dirty-tree reconciliation; it is currently unmodified but remains release-gated.
7. Files suitable for a first commit group:
   - `AGENTS.md`, `README.md`, `apps/web/README.md`, `ARCHITECTURE_MAP.md`, `CODEBASE_OVERVIEW.md`, `DEVELOPMENT_GUIDE.md`, `GOVERNANCE_NOTE.md`, `ROADMAP.md`, `docs/README.md`, `TASKS.md`, `HERMES_PROGRESS.md`, `QA_FINDINGS.md`.
8. Files that should not be committed yet:
   - Ignored generated/local artifacts: `apps/web/.next/`, `apps/mcp-server/dist/`, `packages/shared/dist/`, `test-results/`, all `node_modules/`, and all `*.tsbuildinfo` files listed above.
   - `docs/release-evidence.json` should remain untouched until the full release-evidence task runs from a clean or intentionally reviewed tree.
   - Consider holding `.env.example` until the public v1.3 label is reviewed, even though no real secret value is present.

### Proposed Commit Groups

1. `docs: add durable handoff and current repo guidance`
   - Files: `AGENTS.md`, `README.md`, `apps/web/README.md`, `ARCHITECTURE_MAP.md`, `CODEBASE_OVERVIEW.md`, `DEVELOPMENT_GUIDE.md`, `GOVERNANCE_NOTE.md`, `ROADMAP.md`, `docs/README.md`, `TASKS.md`, `HERMES_PROGRESS.md`, `QA_FINDINGS.md`.
   - Validation before commit: `git diff --check`, `pnpm lint`. Optional manual link/path spot check for docs references.
2. `test: add focused governed API and shared coverage`
   - Files: `apps/web/test/api-contracts.test.ts`, `apps/web/test/canvas-save-route.test.ts`, `apps/web/test/canvas-seed-route.test.ts`, `apps/web/test/dashboard-exports.test.ts`, `apps/web/test/dataset-routes.test.ts`, `apps/web/test/miro-export-route.test.ts`, `apps/web/test/query-route.test.ts`, `apps/web/test/release-scripts.test.ts`, `apps/web/test/saved-canvases.test.ts`, `packages/shared/test/prompt-intent.test.ts`, `packages/shared/test/query-audit.test.ts`, `apps/mcp-server/test/tools.test.ts`, `apps/web/test/dashboard.test.ts`.
   - Validation before commit: focused Vitest commands for touched tests if time allows, then `pnpm test`; `pnpm lint` and `pnpm typecheck` before merging with product changes.
3. `fix: improve governed unsupported prompt suggestions`
   - Files: `apps/web/lib/dashboard.ts`, plus the relevant assertions already in `apps/web/test/dashboard.test.ts` and `tests/e2e/product-demo.spec.ts`.
   - Validation before commit: focused dashboard Vitest command, targeted Playwright unsupported-prompt test, then `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
4. `test: strengthen demo browser coverage`
   - Files: `tests/e2e/product-demo.spec.ts`, `tests/e2e/sources.spec.ts`.
   - Validation before commit: targeted Playwright commands for changed specs, then `pnpm test:e2e` if runtime permits.
5. `chore: align sample runtime env metadata`
   - Files: `.env.example`.
   - Validation before commit: manual review that values are public placeholders only; `pnpm lint`; optionally `pnpm test` if release metadata behavior is being claimed.

### Approval Boundaries

- User approval is required before deleting ignored artifacts, local dependency folders, or test/build output.
- User approval is required before reverting any tracked or untracked change.
- User approval is required before staging or committing any group.
- Release evidence refresh remains blocked until the dirty tree is clean or intentionally reviewed and the full release gate is rerun for the intended commit.

## QA Reconciliation Summary

- Active findings now include release-evidence mismatch, dirty-worktree review before release-evidence refresh, deprecated `next lint`, and hosted rate-limiting reliance on platform controls.
- Resolved findings now group the completed API route, saved-canvas, public-data transparency, MCP, prompt, query audit, middleware, onboarding, and dirty-worktree handoff work.
- The latest completed unit/API test baseline remains 87 tests across 14 files; this docs-only cycle did not rerun `pnpm test`.

## New Queue Summary

- Items 26-30 are low-risk docs/handoff/proof tasks intended to stabilize the dirty worktree handoff, QA findings, demo script, local readiness checklist, and public-data live/fallback proof matrix before more code changes.
- Items 31-33 are focused automated proof/e2e tasks for public-data fallback metadata, the main judge-demo path, and governed sources/saved/Miro-preview workflows.
- Item 34 is the isolated medium-risk `next lint` to ESLint CLI migration.
- Item 35 is the high-risk gated release-evidence refresh task and must wait for a clean or intentionally reviewed tree plus the full validation gate.

## Dirty Worktree Handoff

Current `git status --short --branch` shows branch `feat/v1.3-hosted-launch-readiness` with existing modified tracked files and many untracked docs/test artifacts from prior safe cycles. This task did not clean, revert, stage, commit, or otherwise reconcile the worktree.

### Modified Tracked Files

- `.env.example`
- `AGENTS.md`
- `README.md`
- `apps/mcp-server/test/tools.test.ts`
- `apps/web/README.md`
- `apps/web/lib/dashboard.ts`
- `apps/web/test/dashboard.test.ts`
- `tests/e2e/product-demo.spec.ts`

### Untracked Files

- `ARCHITECTURE_MAP.md`, `CODEBASE_OVERVIEW.md`, `DEVELOPMENT_GUIDE.md`, `GOVERNANCE_NOTE.md`, `HERMES_PROGRESS.md`, `QA_FINDINGS.md`, `ROADMAP.md`, `TASKS.md`, `docs/README.md`
- `apps/web/test/api-contracts.test.ts`, `apps/web/test/canvas-save-route.test.ts`, `apps/web/test/canvas-seed-route.test.ts`, `apps/web/test/dashboard-exports.test.ts`, `apps/web/test/dataset-routes.test.ts`, `apps/web/test/miro-export-route.test.ts`, `apps/web/test/query-route.test.ts`, `apps/web/test/release-scripts.test.ts`, `apps/web/test/saved-canvases.test.ts`
- `packages/shared/test/prompt-intent.test.ts`, `packages/shared/test/query-audit.test.ts`, `tests/e2e/sources.spec.ts`

### Grouped Purpose

- Durable workflow docs: `AGENTS.md`, `TASKS.md`, `HERMES_PROGRESS.md`, and `QA_FINDINGS.md` document the Hermes/Codex safe cycle, ordered task queue, reliability findings, and durable handoff state.
- Architecture/readiness docs: `ARCHITECTURE_MAP.md`, `CODEBASE_OVERVIEW.md`, `DEVELOPMENT_GUIDE.md`, `GOVERNANCE_NOTE.md`, `ROADMAP.md`, `README.md`, `apps/web/README.md`, `docs/README.md`, and `.env.example` align current setup, no-auth/no-database architecture, verification guidance, release caution, and v1.3 public runtime labels.
- Focused route/unit tests: the new files under `apps/web/test`, `packages/shared/test/prompt-intent.test.ts`, `packages/shared/test/query-audit.test.ts`, and modified `apps/web/test/dashboard.test.ts` represent prior safe-cycle coverage for route contracts, saved-canvas hash import/export, Miro preview validation, release/governance scripts, prompt intent edges, query audits, and gallery fixture boundaries.
- E2E tests: `tests/e2e/product-demo.spec.ts` and `tests/e2e/sources.spec.ts` cover visible fallback/status messaging, unsupported prompt suggestions, saved-card actions, source catalog governance, and related demo flows.
- Web/MCP behavior-touching changes: `apps/web/lib/dashboard.ts` changes unsupported/sensitive prompt suggestions to exact supported prompts and approved source cards; `apps/mcp-server/test/tools.test.ts` strengthens MCP canvas/audit validation coverage but does not change MCP source code.

### Known Expected Prior-Cycle Artifacts

- The docs/readiness files and split test files align with completed `TASKS.md` items 0-25 and the replenished queue.
- The `apps/web/lib/dashboard.ts` diff aligns with completed item 7, "Improve Unsupported Prompt Guidance".
- The modified and new tests align with completed items 3-23 covering saved canvases, API routes, Miro preview, data-mode/fallback visibility, source catalog UI, MCP canvas validation, prompt parsing, query audits, middleware, and gallery fixtures.
- `.env.example` and README updates align with the v1.3 hosted-launch-readiness docs and release-guidance refreshes.

### Unknowns Or Reviewer Attention Before Commit

- Review all modified tracked files together before commit because they include both docs/test-only changes and one behavior-touching file, `apps/web/lib/dashboard.ts`.
- Review untracked durable docs and tests before commit so intended prior-cycle artifacts are intentionally added instead of accidentally omitted.
- Confirm `QA_FINDINGS.md` counts are reconciled after the latest completed tasks; `TASKS.md` item 27 is reserved for that follow-up.
- Confirm no generated output directories or local build artifacts are being committed; none are currently listed by `git status --short --branch`.

### Known Release/Governance Risks

- Do not refresh `docs/release-evidence.json` from this dirty tree. Review and intentionally commit or otherwise reconcile the dirty worktree before any release-evidence refresh.
- Existing release evidence records commit `a5ce07a`, while the current branch HEAD is `2021b47`; treat the evidence as historical until item 35 runs the full gated refresh.
- `pnpm lint` still uses deprecated `next lint`; item 34 is the isolated migration task.
- Public hosted abuse protection still needs platform-level firewall/rate limiting; in-repo middleware remains defense in depth.
- Demo claims must preserve current live/sample truth: Dallas ZIP dashboards fall back to samples, Austin monthly grouping remains sample-first/fallback, and Houston remains sample-first with precise locations excluded.

### Extra Caution Before Release Evidence Refresh

- Do not touch or refresh `docs/release-evidence.json` until the tree is clean or intentionally reviewed and the full release gate has passed for the intended commit.
- Give extra review to `.env.example`, `apps/web/lib/dashboard.ts`, `apps/web/test/dashboard.test.ts`, `tests/e2e/product-demo.spec.ts`, `apps/mcp-server/test/tools.test.ts`, `QA_FINDINGS.md`, `TASKS.md`, and `HERMES_PROGRESS.md` because these files affect release labels, core generated output, validation proof, or future-agent handoff state.

## Validation

- `pnpm test:e2e -- tests/e2e/judge-demo.spec.ts`: Passed after tightening duplicate-text locators in the new spec.
- `pnpm test:e2e`: Passed with 17 browser tests after adding the judge-demo spec.
- `pnpm test:e2e -- tests/e2e/governed-workflows.spec.ts`: Passed.
- `pnpm test:e2e`: Passed with 18 browser tests after adding the governed-workflows spec.
- `pnpm lint`: Passed through the ESLint CLI with no deprecated `next lint` warning.
- `pnpm typecheck`: Passed.
- `pnpm test`: Passed with 89 tests across 15 files.
- `git diff --check`: Passed for Task 36 docs.
- `pnpm lint`: Passed for Task 36 docs.
- `git diff --check`: Passed for Task 37 docs.
- `pnpm lint`: Passed for Task 37 docs.

## Blockers

- None.

## Recommended Next Task

- Do not run `TASKS.md` item 35, "Refresh Release Evidence Only After Full Validation Gate", without explicit approval. The next safe non-release task is item 36, "Clarify Saved-Canvas Validation Stub Honesty".
