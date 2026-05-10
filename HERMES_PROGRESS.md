# Hermes Progress

Last updated: May 10, 2026 05:09 CDT

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
   - Status: Next safe task.
   - Validation: focused Vitest command, `git diff --check`, `pnpm lint`, `pnpm test`.
3. Task 45, `Add Sample Provenance Regression Test`.
   - Status: Planned after task 44 if validation stays green and scope remains safe.
   - Validation: focused test or `pnpm data:quality`, `git diff --check`, `pnpm lint`, `pnpm test` if Vitest coverage is added.

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

- Task 44, `Add No-Provider/No-Persistence Contract Tests For Public Metadata`, is the next safe task. It should stay test-only unless a test exposes misleading public metadata that can be corrected safely without changing architecture boundaries.

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
