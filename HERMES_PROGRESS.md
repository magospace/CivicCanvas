# Hermes Progress

Last updated: May 10, 2026 05:18 CDT

## Current Cycle

- Task chosen: `TASKS.md` item 43, "Add Demo-Readiness Page Copy Test For Historical Release Evidence".
- Why this was next: The prior replenishment made item 43 the highest-priority safe task. It improves demo/release honesty without touching release evidence, deploy config, auth, persistence, secrets, billing, migrations, production config, or live-provider spend.
- Scope: `apps/web/app/demo-readiness/page.tsx`, `tests/e2e/product-demo.spec.ts`, `TASKS.md`, and `HERMES_PROGRESS.md`.
- Safety notes: Release evidence was not refreshed. The change only adds visible warning copy and e2e coverage for already-documented historical release-evidence behavior.

## Context Recovered

- Read `AGENTS.md`, `TASKS.md`, `HERMES_PROGRESS.md`, `QA_FINDINGS.md`, `REALNESS_AUDIT.md`, `README.md`, `CODEBASE_OVERVIEW.md`, `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, and `.agents/skills/texas-public-data-explorer/SKILL.md`.
- Ran `git status --short --branch`: branch `feat/v1.3-hosted-launch-readiness`; worktree was clean before task 43.
- Active risks from durable state: release evidence remains historical/stale for current HEAD until gated item 35 is explicitly approved; public hosted rate limiting still depends on platform-level controls outside the repo.

## Sequential Task Plan

1. Task 43, `Add Demo-Readiness Page Copy Test For Historical Release Evidence`.
   - Status: Complete.
   - Validation: RED/green Playwright product-demo route coverage, `pnpm lint`, `pnpm typecheck`, `git diff --check`.
2. Task 44, `Add No-Provider/No-Persistence Contract Tests For Public Metadata`.
   - Status: Complete.
   - Validation: RED/green health-route contract, full Vitest suite, `pnpm lint`, `pnpm typecheck`, `git diff --check`.
3. Task 45, `Add Sample Provenance Regression Test`.
   - Status: Complete.
   - Validation: RED/green release-scripts data-quality coverage, `pnpm data:quality`, `pnpm lint`, `pnpm typecheck`, `git diff --check`.

## Files Updated

- `apps/web/app/demo-readiness/page.tsx`: Shows a historical release-evidence warning when the checked-in evidence commit differs from the running commit, and tells presenters not to cite checked-in evidence as current proof until Task 35 reruns the full gate.
- `tests/e2e/product-demo.spec.ts`: Extends the demo-readiness Playwright coverage to assert the historical release-evidence warning and no-current-proof wording.
- `TASKS.md`: Marks item 43 complete with validation notes.
- `HERMES_PROGRESS.md`: Records item 43 scope, safety notes, validations, and next safe task.

## Validation

- RED: `pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "demo readiness route shows public release boundaries"` failed on the new `Historical release evidence` assertion before page copy existed.
- GREEN: `pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "demo readiness route shows public release boundaries"` passed after implementation. The script ran 15 product-demo tests, so the actual scope was the full product-demo spec rather than only the named test.
- `pnpm lint`: Passed.
- `pnpm typecheck`: Passed.
- `git diff --check`: Passed.

## Blockers

- None for task 43.
- Do not run item 35, `Refresh Release Evidence Only After Full Validation Gate`, without explicit approval and the full release gate.

## Recommended Next Task

- Task 47, `Add Platform Rate-Limit Readiness Note To Demo Checklist`, is the next safe task. Keep it docs-only and do not claim platform firewall/rate-limit controls are configured.

## Task 44 Update

- Task chosen: `TASKS.md` item 44, "Add No-Provider/No-Persistence Contract Tests For Public Metadata".
- Why this was next: Item 44 was the next safe test-focused task after task 43 and preserves real/mock/local/live boundaries in public metadata surfaces.
- Scope: `apps/web/app/api/health/route.ts`, `apps/web/test/api-contracts.test.ts`, `apps/web/test/canvas-save-route.test.ts`, `apps/web/test/miro-export-route.test.ts`, `TASKS.md`, and `HERMES_PROGRESS.md`.
- Safety notes: No architecture boundary changed. No LLM/provider integration, database persistence, Miro write path, auth, billing, migrations, production config, deploy scripts, secrets, live API spend, or release evidence refresh was added.

### Files Updated

- `apps/web/app/api/health/route.ts`: Added explicit `promptProcessing` metadata showing deterministic rule-based parsing, no provider secret, and no provider.
- `apps/web/test/api-contracts.test.ts`: Added health contract assertions for deterministic/no-provider metadata and no OpenAI/Anthropic leakage.
- `apps/web/test/canvas-save-route.test.ts`: Strengthened the validation-stub test so the response does not imply database/object-store/public-share persistence.
- `apps/web/test/miro-export-route.test.ts`: Strengthened preview-only assertions to exclude OAuth URL, board write URL, board ID, and provider metadata.
- `TASKS.md`: Marked item 44 complete with validation notes.
- `HERMES_PROGRESS.md`: Recorded item 44 scope, safety notes, and validation.

### Validation

- RED: `pnpm test -- apps/web/test/api-contracts.test.ts -t "returns health and catalog health reports"` failed because `healthBody.promptProcessing` was undefined before implementation. The command discovered the full Vitest suite and reported 1 failed / 88 passed.
- GREEN: `pnpm test -- apps/web/test/api-contracts.test.ts apps/web/test/canvas-save-route.test.ts apps/web/test/miro-export-route.test.ts` passed after implementation. The command ran the full Vitest suite: 15 files, 89 tests passed.
- `pnpm lint`: Passed.
- `pnpm typecheck`: Passed.
- `git diff --check`: Passed.

### Recommended Next Task

- Task 45, `Add Sample Provenance Regression Test`, is the next safe task if the cycle continues.

## Task 45 Update

- Task chosen: `TASKS.md` item 45, "Add Sample Provenance Regression Test".
- Why this was next: Item 45 was the next safe task after task 44 and adds local automated proof that sample files do not expose hidden catalog fields.
- Scope: `scripts/data-quality.mjs`, `apps/web/test/release-scripts.test.ts`, `TASKS.md`, and `HERMES_PROGRESS.md`.
- Safety notes: No catalog or sample data was changed. No live APIs, secrets, deploy config, release evidence, auth, billing, migrations, production config, generated media, or destructive operations were touched.

### Files Updated

- `scripts/data-quality.mjs`: Reports `hiddenFieldsChecked` and `hiddenFieldsAbsent` for sample-backed datasets and fails data quality if hidden catalog fields appear in sample rows.
- `apps/web/test/release-scripts.test.ts`: Asserts Houston sample provenance output checks and excludes `precise_address`.
- `TASKS.md`: Marks item 45 complete with validation notes.
- `HERMES_PROGRESS.md`: Records item 45 scope, safety notes, and validation.

### Validation

- RED: `pnpm test -- apps/web/test/release-scripts.test.ts -t "reports sample data quality for release handoff"` failed because `hiddenFieldsAbsent` was undefined before implementation. The command discovered the full Vitest suite and reported 1 failed / 88 passed.
- GREEN: `pnpm test -- apps/web/test/release-scripts.test.ts -t "reports sample data quality for release handoff"` passed after implementation. The command ran the full Vitest suite: 15 files, 89 tests passed.
- `pnpm data:quality`: Passed with 3 samples, 280 rows, 4 gallery canvases.
- `pnpm lint`: Passed.
- `pnpm typecheck`: Passed.
- `git diff --check`: Passed.

### Recommended Next Task

- Task 46, `Add Current Docs Cross-Link Consistency Check`, is the next safe task if a future cycle continues.

## Task 46 Update

- Task chosen: `TASKS.md` item 46, "Add Current Docs Cross-Link Consistency Check".
- Why this was next: Item 46 was the next safe task after item 45 and protects current-doc pointers from drifting while keeping historical milestone docs labeled correctly.
- Scope: `scripts/docs-consistency.mjs`, `apps/web/test/release-scripts.test.ts`, `TASKS.md`, and `HERMES_PROGRESS.md`.
- Safety notes: Local docs/test/script only. No historical docs were deleted or rewritten. No provider calls, schema/migration changes, database operations, media generation, release evidence refresh, deploy mutation, secrets, auth, billing, or production config changes were made.

### Files Updated

- `scripts/docs-consistency.mjs`: New local check for current docs existence, docs index current starting-point links, historical-doc labeling, root README current-doc links, and historical-doc warnings in the guide/overview.
- `apps/web/test/release-scripts.test.ts`: Added Vitest coverage for the docs consistency script.
- `TASKS.md`: Marks item 46 complete with validation notes.
- `HERMES_PROGRESS.md`: Records item 46 scope, safety notes, and validation.

### Validation

- RED: `pnpm test -- apps/web/test/release-scripts.test.ts -t "verifies current-doc links"` failed before `scripts/docs-consistency.mjs` existed. The command discovered the full Vitest suite and reported 1 failed / 89 passed.
- GREEN: `pnpm test -- apps/web/test/release-scripts.test.ts -t "verifies current-doc links"` passed after implementation. The command ran the full Vitest suite: 15 files, 90 tests passed.
- `node scripts/docs-consistency.mjs`: Passed, 5/5 checks.
- `pnpm lint`: Passed.
- `pnpm typecheck`: Passed.
- `git diff --check`: Passed.

### Recommended Next Task

- Task 47, `Add Platform Rate-Limit Readiness Note To Demo Checklist`, is the next safe task.

## Historical Sequential Progress

- Carry-over audit state committed as `a4f09c6` (`docs: add hackathon realness audit`).
- Task 28 committed as `bb42631` (`docs: add final judge demo script`).
- Task 29 committed as `2563468` (`docs: add local demo readiness checklist`).
- Task 30 committed as `7ef1ca8` (`docs: add public data fallback proof matrix`).
- Task 31 committed as `8667205` (`test: add core demo fallback proof`).
- Task 32 committed as `2585388` (`test: strengthen judge demo e2e path`).
- Task 33 committed as `2529af4` (`test: add governed workflow e2e smoke`).
- Task 34 committed as `2fbcf44` (`chore: migrate web lint to eslint cli`).
- Task 36 committed as `476143a` (`docs: clarify saved canvas persistence boundary`).
- Task 37 committed as `452e608` (`docs: align miro preview-only wording`).
- Task 38 committed as `43e900d` (`docs: document no media provider path`).
- Task 39 committed as `1987aa8` (`docs: warn release evidence is historical`).
- Task 40 committed as `82dcfd6` (`docs: add sample persistence realness matrix`).
- Task 41 committed as `7825404` (`docs: audit seed save api naming`).
- Task 42 committed as `446f81c` (`docs: clarify deterministic no-provider generation`).
- Safe-queue replenishment committed as `673d1da` (`docs: replenish safe stabilization queue`).
