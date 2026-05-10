# Tasks

The next executable Hermes/Codex tasks, ordered for safe progress. Each task is scoped for one agent and avoids broad refactors.

## 0. Adapt Development Workflow For Hermes

Status: Complete on May 10, 2026; re-verified by Hermes at 01:08 CDT.

- Goal: Adapt the bounded Codex `/goal` development workflow for Hermes while keeping durable state in repository files instead of chat memory.
- Files: `AGENTS.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Do not touch: product source code, secrets, production config, auth, billing, migrations, deploy scripts, or release evidence.
- Acceptance criteria: `AGENTS.md` documents the Hermes safe cycle and durable state files; `TASKS.md` records this completed workflow-adaptation task; `HERMES_PROGRESS.md` exists with session state and validation notes.
- Suggested validation: `pnpm lint`
- Latest validation: `pnpm lint` passed on May 10, 2026 at 01:08 CDT.

## 1. Reconcile Stale Onboarding References

Status: Complete on May 10, 2026.

- Goal: Update onboarding docs that still describe `apps/web/README.md` and `.env.example` as stale after the recent refresh.
- Files: `CODEBASE_OVERVIEW.md`, `DEVELOPMENT_GUIDE.md`, optionally `AGENTS.md`.
- Do not touch: app source code, runtime env parsing, release evidence.
- Acceptance criteria: Current docs no longer tell agents to fix already-current README/env examples; docs still mention real risks such as release evidence and hosted rate limiting.
- Suggested validation: `pnpm lint`

## 2. Add Current Docs Index For Historical Docs

Status: Complete on May 10, 2026.

- Goal: Add a small docs index that points agents to current docs and labels milestone docs as historical.
- Files: `docs/README.md` if absent, optionally `README.md`.
- Do not touch: existing historical docs.
- Acceptance criteria: New developers can identify current architecture, development, governance, release, and historical docs without opening multiple milestone files.
- Suggested validation: `pnpm lint`

## 3. Add Saved Canvas Hash Import/Export Unit Tests

Status: Complete on May 10, 2026.

- Goal: Add focused tests for web saved-canvas share-link creation and hash import.
- Files: `apps/web/lib/saved-canvases.ts`, `apps/web/test/*`, `packages/shared/test/*` only if shared helpers need coverage.
- Do not touch: storage architecture; keep browser `localStorage` and URL-hash bundles.
- Acceptance criteria: Tests cover valid share-link round trip, missing hash key, malformed payload, and oversized hash/import guard.
- Suggested validation: `pnpm test`

## 4. Add API Tests For `/api/canvas/save`

Status: Complete on May 10, 2026.

- Goal: Test that `/api/canvas/save` validates canvases but does not imply backend persistence.
- Files: `apps/web/app/api/canvas/save/route.ts`, `apps/web/test/*`.
- Do not touch: persistence model or route behavior unless a test exposes a real bug.
- Acceptance criteria: Tests cover valid canvas validation and invalid canvas rejection; test names or assertions make validation-only behavior clear.
- Suggested validation: `pnpm test`

## 5. Add API Tests For `/api/query`

Status: Complete on May 10, 2026.

- Goal: Add route-level tests for direct bounded query execution.
- Files: `apps/web/app/api/query/route.ts`, `apps/web/lib/api.ts`, `apps/web/test/*`.
- Do not touch: query semantics unless a test exposes a real bug.
- Acceptance criteria: Tests cover valid `BoundedQuerySpec`, invalid request body, and governed public error behavior.
- Suggested validation: `pnpm test`

## 6. Add Seed Canvas API Tests

Status: Complete on May 10, 2026.

- Goal: Test `/api/canvas/[id]` as a hardcoded seed/demo helper, not a persistence endpoint.
- Files: `apps/web/app/api/canvas/[id]/route.ts`, `apps/web/test/*`, optionally `ARCHITECTURE_MAP.md` if docs need one sentence.
- Do not touch: route behavior except comments/tests.
- Acceptance criteria: Tests cover a known seed ID returning a generated canvas and an unknown ID returning 404; test names state seed/demo behavior.
- Suggested validation: `pnpm test`

## 7. Improve Unsupported Prompt Guidance

Status: Complete on May 10, 2026 at 01:14 CDT.

- Goal: Make unsupported prompt output suggest exact supported prompts and approved sources.
- Files: `packages/shared/src/prompt/index.ts`, `apps/web/lib/dashboard.ts`, `apps/web/components/prompt-bar.tsx`, `apps/web/test/dashboard.test.ts`.
- Do not touch: arbitrary prompt generation, unsupported dataset access, or hidden field exposure.
- Acceptance criteria: Unsupported/sensitive prompts remain safe and include actionable examples; tests cover the new response shape or copy.
- Suggested validation: `pnpm lint && pnpm test`
- Completed notes: Unsupported and sensitive prompt suggestion canvases now use the exact three supported demo prompts and show approved source names through ordered dataset cards. The dashboard test asserts exact prompt bullets and approved source names.
- Validation: Focused RED test failed first; focused test passed after implementation; `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed.

## 8. Add Data Mode/Fallback Visibility Test Coverage

Status: Complete on May 10, 2026 at 01:15 CDT.

- Goal: Add tests verifying generated dashboards preserve requested/rendered data mode, fallback reasons, caveats, and source attribution.
- Files: `apps/web/lib/dashboard.ts`, `apps/web/test/dashboard.test.ts`, `packages/shared/test/query-and-canvas.test.ts`.
- Do not touch: live adapter promotion, catalog fields, or data samples unless a test exposes a documented mismatch.
- Acceptance criteria: Dallas, Austin, and Houston paths each have at least one assertion for data mode or fallback/source metadata.
- Suggested validation: `pnpm test`
- Completed notes: Added focused dashboard coverage for Dallas fallback ZIP metadata, Austin live-request fallback metadata, and Houston sample-first source attribution/caveats.
- Validation: Focused dashboard test passed; `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed.

## 9. Split Broad Web Tests Into Focused Files

Status: Complete on May 10, 2026 at 01:17 CDT.

- Goal: Split `apps/web/test/dashboard.test.ts` into clearer focused tests without changing assertions.
- Files: `apps/web/test/dashboard.test.ts`, new files under `apps/web/test`.
- Do not touch: app behavior.
- Acceptance criteria: Test cases are grouped by dashboard generation, API routes, exports, middleware, and release scripts; total test count and assertions are preserved or improved.
- Suggested validation: `pnpm test`
- Completed notes: Split broad dashboard tests into focused dashboard generation, dashboard export, API/middleware contract, and release/governance script files. Total test count remained 71.
- Validation: `pnpm test`, `pnpm lint`, and `pnpm typecheck` passed.

## 10. Document Daily Checks Versus Release Gates

Status: Complete on May 10, 2026 at 01:18 CDT.

- Goal: Clarify which validation commands are routine development checks and which are release/deployment gates.
- Files: `DEVELOPMENT_GUIDE.md`, `GOVERNANCE_NOTE.md`, optionally `README.md`.
- Do not touch: `docs/release-evidence.json` unless intentionally refreshing release evidence after full gates.
- Acceptance criteria: Docs clearly distinguish `pnpm lint/typecheck/test` from `preflight`, `verify:prod-local`, `release:check`, smoke checks, and release evidence refresh steps.
- Suggested validation: `pnpm lint`
- Completed notes: `DEVELOPMENT_GUIDE.md` and `GOVERNANCE_NOTE.md` now separate daily checks, focused local checks, release/deployment gates, environment-dependent smoke checks, and release-evidence refresh rules.
- Validation: `pnpm lint` passed.

---

# Replenished Safe Implementation Queue

Last replenished: May 10, 2026 at 01:23 CDT.

These are the next safe, scoped implementation tasks. They prioritize validation/test gaps, reliability, documentation consistency, core user workflows, and UX polish. Do not touch secrets, auth, billing, migrations, production config, deploy scripts, release evidence, or destructive data operations unless a future task explicitly says so.

## 11. Refresh QA Findings After Completed Coverage Work

Status: Complete on May 10, 2026 at 01:41 CDT.

- Owner type: QA
- Goal: Update `QA_FINDINGS.md` so it no longer lists completed coverage gaps as active findings.
- Why it matters: The current QA findings still describe missing `/api/canvas/save`, seed canvas, saved-canvas hash, and broad-test-file coverage even though those tasks are now complete.
- Likely files: `QA_FINDINGS.md`, optionally `HERMES_PROGRESS.md`.
- Risk level: Low.
- Dependencies: Completed tasks 3 through 9.
- Acceptance criteria: Completed findings are moved to a resolved section or annotated as resolved; active findings still include release-evidence mismatch and `next lint` deprecation; current test count/file count is updated from the latest `pnpm test` output.
- Validation commands: `pnpm lint`.
- Can run in parallel: Yes, with docs-only tasks. Do not parallelize with another task editing `QA_FINDINGS.md`.
- Completed notes: `QA_FINDINGS.md` now separates active findings from resolved coverage/test-organization findings and records the latest 71-test/10-file validation baseline.
- Validation: `pnpm lint` passed.

## 12. Align README Verification Guidance With Daily Checks Versus Release Gates

Status: Complete on May 10, 2026 at 01:48 CDT.

- Owner type: Docs
- Goal: Clarify the root `README.md` verification section so routine checks are separated from release/deployment gates and network-dependent checks.
- Why it matters: `DEVELOPMENT_GUIDE.md` and `GOVERNANCE_NOTE.md` now distinguish these categories, but `README.md` still presents a long undifferentiated command list.
- Likely files: `README.md`, optionally `apps/web/README.md` if it repeats the same guidance.
- Risk level: Low.
- Dependencies: Completed task 10.
- Acceptance criteria: `README.md` has separate sections for daily local checks, data/catalog checks, release/deployment gates, and smoke/remote checks; it preserves all real commands and does not ask readers to refresh release evidence casually.
- Validation commands: `pnpm lint`.
- Can run in parallel: Yes, with code/test tasks that do not edit README files.
- Completed notes: Root `README.md` now separates daily local checks, focused checks, release/deployment gates, network-dependent checks, and cleanup; it also says not to refresh release evidence as part of daily checks.
- Validation: `pnpm lint` passed.

## 13. Add Focused API Tests For Dataset Catalog Routes

Status: Complete on May 10, 2026 at 01:49 CDT.

- Owner type: QA
- Goal: Add route-level tests for `GET /api/datasets` and `GET /api/datasets/[id]`.
- Why it matters: Catalog routes are central to source browsing and public-data boundaries, but the current focused route tests emphasize query, canvas save, seed canvas, and health behavior.
- Likely files: `apps/web/app/api/datasets/route.ts`, `apps/web/app/api/datasets/[id]/route.ts`, new or existing file under `apps/web/test/*`.
- Risk level: Low.
- Dependencies: None.
- Acceptance criteria: Tests cover catalog list success, known dataset lookup success, unknown dataset 404/error response, and no hidden/sensitive fields being exposed beyond approved catalog metadata.
- Validation commands: `pnpm test -- apps/web/test/<new-or-existing-dataset-route-test>.test.ts`, then `pnpm test`.
- Can run in parallel: Yes, with docs-only tasks. Avoid parallel edits to the same route-test file.
- Completed notes: Added `apps/web/test/dataset-routes.test.ts` covering catalog list metadata, known Dallas dataset lookup, unknown dataset 404, and no sample-row/raw precise-address leakage in catalog responses.
- Validation: Focused test command passed; `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed with 74 tests across 11 files.

## 14. Add Focused API Tests For Miro Export Route Success And Validation Failures

Status: Complete on May 10, 2026 at 01:51 CDT.

- Owner type: QA
- Goal: Add route-level tests for `POST /api/export/miro-spec` valid preview output and invalid request handling.
- Why it matters: Miro must remain preview-only and governed; current tests cover shared spec generation and one invalid route case, but not a focused valid route contract.
- Likely files: `apps/web/app/api/export/miro-spec/route.ts`, `apps/web/test/api-contracts.test.ts` or `apps/web/test/miro-export-route.test.ts`.
- Risk level: Low.
- Dependencies: Existing dashboard fixture/generation helpers.
- Acceptance criteria: Tests assert a valid canvas returns a `MiroExportSpec`, source/method frame is required, no board write/OAuth fields are implied, and malformed/invalid canvases return governed errors.
- Validation commands: focused Vitest command for the route test, then `pnpm test`.
- Can run in parallel: Yes, unless another task is editing Miro export tests.
- Completed notes: Added `apps/web/test/miro-export-route.test.ts` covering valid preview-only route output, no OAuth/board-write metadata, invalid canvas errors, and malformed template errors.
- Validation: Focused test command passed; `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed with 77 tests across 12 files.

## 15. Add E2E Coverage For Unsupported Prompt Suggestions

Status: Complete on May 10, 2026 at 01:54 CDT.

- Owner type: QA
- Goal: Extend Playwright coverage so unsupported or sensitive prompts show exact supported prompt examples and approved source cards in the UI.
- Why it matters: Unit tests now cover the response shape, but the core user workflow should also prove the guidance is visible and accessible in `/explore`.
- Likely files: `tests/e2e/product-demo.spec.ts`, possibly `apps/web/components/canvas-blocks.tsx` only if a test exposes an accessibility label issue.
- Risk level: Low.
- Dependencies: Completed task 7.
- Acceptance criteria: Playwright test submits an unsupported prompt, verifies the "Choose an approved dataset" state, exact supported prompt text, and at least the Dallas/Austin/Houston approved source names.
- Validation commands: `pnpm test:e2e` or targeted Playwright command for `product-demo.spec.ts`; run `pnpm test` if any shared helper changes.
- Can run in parallel: Yes, with unit-test/docs tasks. Do not parallelize with another task editing `tests/e2e/product-demo.spec.ts`.
- Completed notes: Extended the unsupported sensitive prompt Playwright test to verify exact Dallas/Austin/Houston supported prompt text and approved source names are visible.
- Validation: `pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "unsupported sensitive prompt"`, `pnpm lint`, and `pnpm test` passed.

## 16. Add E2E Coverage For Data Mode Fallback Visibility

Status: Complete on May 10, 2026 at 01:57 CDT.

- Owner type: QA
- Goal: Add browser-level coverage for data-mode selector behavior and fallback/status messaging.
- Why it matters: Data-mode transparency is a core trust feature; unit tests cover generated metadata, but the UI should visibly communicate sample/fallback state.
- Likely files: `tests/e2e/product-demo.spec.ts`, optionally `apps/web/components/inspector-panel.tsx` only if labels are not testable.
- Risk level: Low to Medium.
- Dependencies: Existing data-mode UI in `/explore`.
- Acceptance criteria: Test selects Live public API or Sample fallback, generates a supported dashboard, and verifies visible data-mode/fallback copy and source/method attribution without changing generation behavior.
- Validation commands: `pnpm test:e2e`; run `pnpm lint` and `pnpm test` only if code changes are needed for accessible labels.
- Can run in parallel: Yes, but not with another task editing the same e2e spec.
- Completed notes: Added Playwright coverage for a Live public API request on Austin permits that verifies fallback status copy, inspector requested mode, rendered fallback mode, and source/method attribution visibility.
- Validation: `pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "live data mode"`, `pnpm lint`, and `pnpm test` passed.

## 17. Add Focused Saved-Page Interaction Coverage

Status: Complete on May 10, 2026 at 01:59 CDT.

- Owner type: QA
- Goal: Add tests for user-visible saved-canvas actions such as duplicate, delete, import error, and share-link affordances.
- Why it matters: Saved canvases are browser-local and important for handoff/demo workflows; hash import/export helpers have unit tests, but user-facing interactions still have limited coverage.
- Likely files: `tests/e2e/product-demo.spec.ts` or a new e2e spec under `tests/e2e`, optionally `apps/web/components/saved-canvases.tsx` if accessibility labels are missing.
- Risk level: Low to Medium.
- Dependencies: Existing `/saved` page and localStorage helpers.
- Acceptance criteria: Browser test covers saving/opening a canvas, duplicate/delete behavior, and an invalid import path without requiring a backend or external service.
- Validation commands: targeted Playwright command or `pnpm test:e2e`; run `pnpm lint` if component labels change.
- Can run in parallel: Yes, but not with other e2e tasks touching saved-page tests.
- Completed notes: Extended the saved-page Playwright flow to cover opening a saved canvas in `/explore`, duplicating a saved card, confirming delete for the duplicate, bundle/share-link affordances, and invalid import rejection.
- Validation: `pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "saved bundle"`, `pnpm lint`, and `pnpm test` passed.

## 18. Add Focused Source Catalog UI Coverage

Status: Complete on May 10, 2026 at 02:04 CDT.

- Owner type: QA
- Goal: Add browser coverage for `/sources` showing field classifications, live/sample confidence notes, and hidden-field warnings.
- Why it matters: Source transparency and hidden-field governance are core safety promises, but most current tests focus on dashboard generation and route contracts.
- Likely files: `tests/e2e/product-demo.spec.ts` or a new `tests/e2e/sources.spec.ts`, optionally `apps/web/components/sources-catalog.tsx` if accessible names need improvement.
- Risk level: Low.
- Dependencies: Existing `/sources` page.
- Acceptance criteria: Test verifies the approved datasets render, live/sample boundary copy is visible, and hidden/sensitive field messaging is present without exposing private raw fields in generated dashboards.
- Validation commands: targeted Playwright command or `pnpm test:e2e`.
- Can run in parallel: Yes, with unit-test/docs tasks. Avoid parallel edits to the same e2e file.
- Completed notes: Added `tests/e2e/sources.spec.ts` covering approved dataset titles, live/sample confidence labels, hidden precise-address warning copy, absence of raw private address values, and city filtering.
- Validation: `pnpm test:e2e -- tests/e2e/sources.spec.ts`, `pnpm lint`, and `pnpm test` passed.

## 19. Add MCP Coverage For Canvas Generation Or Validation Tools

Status: Complete on May 10, 2026 at 02:06 CDT.

- Owner type: QA
- Goal: Extend MCP tests to cover at least one canvas-generation or canvas-validation tool path if exposed by the current MCP handlers.
- Why it matters: The MCP server is a core integration surface and should preserve the same governed canvas/data boundaries as the web app.
- Likely files: `apps/mcp-server/src/tools.ts`, `apps/mcp-server/test/tools.test.ts`.
- Risk level: Medium.
- Dependencies: Existing MCP tool exports and test helpers.
- Acceptance criteria: Test exercises an MCP canvas-related handler, validates returned JSON shape, asserts source/method attribution, and confirms invalid/unsupported input returns governed failure behavior.
- Validation commands: `pnpm test -- apps/mcp-server/test/tools.test.ts`, then `pnpm test`.
- Can run in parallel: Yes, with web-only tasks. Do not parallelize with another MCP test task.
- Completed notes: Strengthened the MCP canvas-spec test to assert source/method attribution details, validate the generated canvas, and confirm unsupported dataset canvas generation fails with a governed `UnsupportedDatasetError`.
- Validation: `pnpm test -- apps/mcp-server/test/tools.test.ts`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed.

## 20. Add Unit Coverage For Prompt Intent Edge Cases

Status: Complete on May 10, 2026 at 02:08 CDT.

- Owner type: QA
- Goal: Add focused tests for `parsePromptIntent` edge cases such as month ranges, "last year"/"this year", sensitive field rejection, and synonym matching.
- Why it matters: Prompt parsing is deterministic and narrow; explicit tests reduce regression risk without expanding arbitrary prompt behavior.
- Likely files: `packages/shared/src/prompt/index.ts`, `packages/shared/test/query-and-canvas.test.ts` or a new `packages/shared/test/prompt-intent.test.ts`.
- Risk level: Low.
- Dependencies: None.
- Acceptance criteria: Tests cover date-range parsing, sensitive terms, dataset candidate confidence, and supported synonyms for Dallas/Austin/Houston without adding unsupported datasets.
- Validation commands: focused Vitest command for the prompt test, then `pnpm test`.
- Can run in parallel: Yes, with UI/docs tasks. Avoid parallel edits to shared prompt tests.
- Completed notes: Added `packages/shared/test/prompt-intent.test.ts` covering month ranges, relative years, sensitive rejected fields/safety warnings, dataset confidence, and supported Dallas/Austin/Houston synonyms.
- Validation: `pnpm test -- packages/shared/test/prompt-intent.test.ts`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed with 80 tests across 13 files.

## 21. Add Unit Coverage For Query Audit Safety Decisions

Status: Complete on May 10, 2026 at 02:10 CDT.

- Owner type: QA
- Goal: Assert that bounded query execution records data mode, row limits, aggregation status, fields used, and safety decisions for representative sample/fallback queries.
- Why it matters: Query audits power trust/explainability in the inspector and MCP surfaces.
- Likely files: `packages/shared/src/query/index.ts`, `packages/shared/src/adapters/index.ts`, `packages/shared/test/query-and-canvas.test.ts` or a focused new shared test file.
- Risk level: Low to Medium.
- Dependencies: Existing sample datasets and query helpers.
- Acceptance criteria: Tests cover Dallas/Austin/Houston query audit metadata and at least one rejected hidden/unknown field path.
- Validation commands: focused shared Vitest command, then `pnpm test`.
- Can run in parallel: Yes, but not with another shared query test task.
- Completed notes: Added `packages/shared/test/query-audit.test.ts` covering Dallas sample aggregate audit metadata, Austin fallback audit metadata, Houston sample audit metadata, and hidden-field rejection.
- Validation: `pnpm test -- packages/shared/test/query-audit.test.ts`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed with 83 tests across 14 files.

## 22. Add Middleware Rate-Limit Boundary Tests

Status: Complete on May 10, 2026 at 02:19 CDT.

- Owner type: QA
- Goal: Add focused tests for middleware allowing safe GET/public routes and limiting only configured write-like POST routes.
- Why it matters: Middleware is defense-in-depth and easy to over- or under-apply; focused coverage prevents accidental breakage of public read pages.
- Likely files: `apps/web/middleware.ts`, `apps/web/test/api-contracts.test.ts` or new `apps/web/test/middleware.test.ts`.
- Risk level: Low.
- Dependencies: Existing middleware test coverage.
- Acceptance criteria: Tests verify public GET navigation is not rate-limited, configured POST routes receive rate-limit headers, and unrelated paths are passed through.
- Validation commands: focused Vitest command, then `pnpm test`.
- Can run in parallel: Yes, unless another task edits middleware tests.
- Completed notes: Extended middleware contract tests to verify public GET navigation passes without rate-limit headers, configured write-like POST routes receive rate-limit headers, unrelated POST paths pass through without rate-limit headers, and repeated configured POST requests still return 429.
- Validation: `pnpm test -- apps/web/test/api-contracts.test.ts`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed with 86 tests across 14 files.

## 23. Add Gallery Fixture Regression Coverage

Status: Complete on May 10, 2026 at 02:21 CDT.

- Owner type: QA
- Goal: Add focused tests asserting every checked-in gallery canvas is valid, contains source/method attribution, avoids hidden fields, and renders through allowed block types.
- Why it matters: Gallery fixtures are demo surfaces and can drift as schemas evolve.
- Likely files: `data/gallery/*.canvas.json`, `apps/web/test/dashboard.test.ts` or new `apps/web/test/gallery-fixtures.test.ts`, possibly `packages/shared/test/*`.
- Risk level: Low.
- Dependencies: Existing gallery fixtures and canvas validation helpers.
- Acceptance criteria: Tests iterate all gallery canvases, validate schema, assert `SourceMethodBlock`, assert no hidden field names, and assert source dataset IDs are approved.
- Validation commands: focused Vitest command, then `pnpm test` and `pnpm governance:audit` if data/gallery checks are touched.
- Can run in parallel: Yes, with docs and web route tests. Avoid parallel edits to gallery fixtures.
- Completed notes: Extended `apps/web/test/dashboard.test.ts` to enumerate every checked-in `data/gallery/*.canvas.json` fixture, validate each with `validateCanvasDocument`, assert allowed block types, require source/method attribution, ensure hidden catalog field names such as `precise_address` are absent, and confirm fixture sources/attribution reference approved datasets or the governed catalog-suggestions refusal fixture.
- Validation: `pnpm test -- apps/web/test/dashboard.test.ts`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm governance:audit` passed with 87 tests across 14 files and 19/19 governance checks.

## 24. Investigate Safe Migration From `next lint` To ESLint CLI

Status: Complete on May 10, 2026 at 02:23 CDT.

- Owner type: DevOps
- Goal: Create a small non-invasive migration note or spike for replacing deprecated `next lint` before Next.js 16.
- Why it matters: `pnpm lint` passes but emits a deprecation notice that will eventually become a maintenance issue.
- Likely files: `QA_FINDINGS.md`, `DEVELOPMENT_GUIDE.md`, optionally `apps/web/package.json` only if the task explicitly chooses to implement the migration after a successful spike.
- Risk level: Medium if package scripts change; Low if documentation/spike only.
- Dependencies: Current lint passing baseline.
- Acceptance criteria: Document the recommended migration path, expected command, risks, and validation plan. If implementation is attempted, `pnpm lint`, `pnpm typecheck`, and `pnpm test` must pass with no new warnings beyond pre-existing dependency/tool notices.
- Validation commands: docs-only `pnpm lint`; implementation `pnpm lint && pnpm typecheck && pnpm test`.
- Can run in parallel: Documentation spike can run in parallel; implementation should not run in parallel with package/config changes.
- Completed notes: Added a non-invasive `next lint` deprecation migration spike to `DEVELOPMENT_GUIDE.md`, documented current lint wiring and existing ESLint dependencies, recommended the official `npx @next/codemod@canary next-lint-to-eslint-cli .` path, and updated `QA_FINDINGS.md` with current test count plus the implementation validation plan. Package scripts/config were not changed.
- Validation: `pnpm lint` passed with the existing Next.js deprecation notice and no ESLint warnings or errors.

## 25. Create A Lightweight Architecture Diagram Or Mermaid Flow For Current Docs

Status: Complete on May 10, 2026 at 02:25 CDT.

- Owner type: Docs
- Goal: Add a simple architecture/data-flow diagram for the current no-auth/no-database governed dashboard architecture.
- Why it matters: Existing docs are thorough but text-heavy; a diagram can reduce onboarding time without changing behavior.
- Likely files: `ARCHITECTURE_MAP.md`, `docs/README.md`, optionally a new doc under `docs/` if the diagram is too long.
- Risk level: Low.
- Dependencies: Current architecture docs.
- Acceptance criteria: Diagram shows `/explore`, API routes, shared query/canvas validation, catalog/sample data, MCP server, and preview-only Miro export; it explicitly labels no database/auth and no arbitrary HTML/SQL.
- Validation commands: `pnpm lint`; manually verify referenced paths exist.
- Can run in parallel: Yes, with code/test tasks that do not edit architecture docs.
- Completed notes: Added a Mermaid governed data-flow diagram to `ARCHITECTURE_MAP.md` covering `/explore`, API routes, shared query/canvas validation, catalog/sample/live fallback data, MCP server reuse, saved localStorage, preview-only Miro export, and guardrails for no auth, no database, no arbitrary HTML, no raw SQL, and no Miro writes. Updated `docs/README.md` to call out the architecture diagram.
- Validation: Manually verified 11 referenced paths exist with a Python path check, and `pnpm lint` passed with the existing Next.js deprecation notice and no ESLint warnings or errors.

---

# Replenished Safe Implementation Queue

Last replenished: May 10, 2026 at 02:28 CDT.

This hackathon-stabilization queue is planning-only until a future safe cycle selects exactly one task. The queue is based on the remaining known risks: deprecated `next lint`, release evidence commit mismatch (`a5ce07a` recorded vs `2021b47` current `HEAD`), dirty working tree from prior development cycles, final judge-demo confidence, honest public-data/live-fallback proof, and governed stability for source, MCP, Miro preview, and saved-canvas workflows.

Do not refresh release evidence, touch secrets/auth/billing/migrations/production config/deploy scripts, or run destructive data operations unless a selected future task explicitly requires it.

## 26. Add Dirty-Worktree Handoff Summary

Status: Complete on May 10, 2026 at 03:07 CDT.

- Owner type: Docs / Release coordination
- Goal: Add a durable handoff summary that explains the current dirty worktree, which files are expected prior-cycle artifacts, and what should be reviewed before commit or release evidence refresh.
- Why it matters: The working tree contains many intentional docs/test changes plus existing modified files. Future agents need to distinguish expected stabilization work from accidental drift before implementing more code.
- Likely files: `HERMES_PROGRESS.md`, `QA_FINDINGS.md`, optionally a new `docs/HACKATHON_HANDOFF.md` if the summary is too long.
- Risk level: Low.
- Dependencies: Current `git status --short --branch` output.
- Acceptance criteria: Handoff lists modified tracked files, untracked files, known expected prior-cycle artifacts, unknowns needing human/reviewer attention, and explicitly says not to refresh `docs/release-evidence.json` from a dirty tree.
- Validation commands: `git status --short --branch`; `pnpm lint` if markdown docs are changed.
- Can run in parallel: Yes, with test-only tasks. Do not parallelize with another task editing `HERMES_PROGRESS.md` or `QA_FINDINGS.md`.
- Completed notes: Expanded `HERMES_PROGRESS.md` with a categorized dirty-worktree handoff covering durable workflow docs, architecture/readiness docs, focused route/unit tests, e2e tests, web/MCP behavior-touching changes, known release/governance risks, and files requiring extra caution before release-evidence refresh.
- Validation: `git status --short --branch` captured the expected dirty worktree; `pnpm lint` passed with the existing Next.js `next lint` deprecation notice and no ESLint warnings or errors.

## 27. Reconcile QA Findings With Latest Completed Tasks And Risks

Status: Complete on May 10, 2026 at 03:11 CDT.

- Owner type: QA / Docs
- Goal: Refresh `QA_FINDINGS.md` so command counts, resolved coverage work, dirty-worktree risk, `next lint` deprecation, and release-evidence mismatch are current.
- Why it matters: `QA_FINDINGS.md` still contains older resolved-test counts in some sections and should be the durable reliability handoff before final demo work.
- Likely files: `QA_FINDINGS.md`, `HERMES_PROGRESS.md`, optionally `TASKS.md` only to mark completion.
- Risk level: Low.
- Dependencies: Current validation outputs and dirty-worktree summary from item 26, if completed first.
- Acceptance criteria: Active findings include only current unresolved risks; resolved findings mention the latest test/file counts; release evidence mismatch and `next lint` deprecation remain active until intentionally fixed; no stale claim says a completed coverage gap is still missing.
- Validation commands: `pnpm lint`.
- Can run in parallel: Yes, with code/test tasks that do not edit `QA_FINDINGS.md`; avoid parallel docs work touching the same file.
- Completed notes: Refreshed `QA_FINDINGS.md` with the dirty-worktree risk from item 26, current command baselines, release-evidence mismatch, `next lint` deprecation, hosted rate-limiting caveat, and resolved coverage summaries using the latest 87-test/14-file baseline.
- Validation: `pnpm lint` passed with the existing Next.js `next lint` deprecation notice and no ESLint warnings or errors.

## 28. Write Final Judge Demo Script Covering Core Workflows

Status: Complete on May 10, 2026 at 03:43 CDT.

- Owner type: Docs / Demo
- Goal: Add a concise final demo script for judges covering `/sources`, `/explore` canvas generation, saved canvases, MCP, and Miro preview-only export.
- Why it matters: The app has several governed workflows; a scripted demo reduces last-minute mistakes and keeps claims honest about live/sample boundaries.
- Likely files: `docs/DEMO_SCRIPT.md`, `README.md`, optionally `docs/README.md`.
- Risk level: Low.
- Dependencies: Current routes and known MVP prompts in `README.md`.
- Acceptance criteria: Script includes exact demo prompts, expected visible data-mode/fallback copy, source attribution checkpoints, saved-canvas open/export/import/share flow, MCP talking points, Miro preview-only wording, and explicit no-auth/no-database/no-Miro-write caveats.
- Validation commands: Manual path/link check for referenced docs and routes; `pnpm lint`.
- Can run in parallel: Yes, with test-only tasks. Avoid parallel edits to `docs/DEMO_SCRIPT.md` or `README.md`.
- Completed notes: Replaced the older broad walkthrough with a judge-facing script that starts at `/sources`, runs exact Dallas/Austin/Houston prompts, names expected fallback/sample copy, covers unsupported prompt safety, browser-local saved-canvas handoff, preview-only Miro output, and MCP talking points without claiming auth, database, LLM, or Miro writes.
- Validation: Manual referenced-path check passed; `git diff --check` passed; `pnpm lint` passed with the existing `next lint` deprecation notice.

## 29. Add Final Local Demo Readiness Checklist Without Release Evidence Refresh

Status: Complete on May 10, 2026 at 03:51 CDT.

- Owner type: Docs / QA
- Goal: Add a lightweight local checklist that a presenter can run before a judge demo without refreshing `docs/release-evidence.json`.
- Why it matters: Final confidence needs repeatable local checks, but release evidence must remain gated behind a separate full validation task.
- Likely files: `DEVELOPMENT_GUIDE.md`, `GOVERNANCE_NOTE.md`, `docs/README.md`, optionally new `docs/HACKATHON_DEMO_READINESS.md`.
- Risk level: Low.
- Dependencies: Current validation guidance in `README.md`, `DEVELOPMENT_GUIDE.md`, and `GOVERNANCE_NOTE.md`.
- Acceptance criteria: Checklist separates quick local checks (`pnpm lint`, `pnpm typecheck`, `pnpm test`, targeted `pnpm test:e2e`) from optional network checks (`pnpm smoke:live`) and explicitly states not to update release evidence in this task.
- Validation commands: Manual path/link check; `pnpm lint`.
- Can run in parallel: Yes, with test-only tasks. Avoid parallel docs edits to the same checklist files.
- Completed notes: Added `docs/HACKATHON_DEMO_READINESS.md` with quick local gate commands, manual route smoke flow, optional Playwright/data-governance checks, network/hosted checks to skip unless needed, and a clear release-evidence no-refresh boundary. Linked it from `docs/README.md`.
- Validation: Manual referenced-path check passed; `git diff --check` passed; `pnpm lint` passed with the existing `next lint` deprecation notice.

## 30. Add Public-Data Live/Fallback Proof Matrix

Status: Complete on May 10, 2026 at 04:01 CDT.

- Owner type: Docs / Data governance
- Goal: Add or update a concise proof matrix for Dallas, Austin, and Houston showing which demo paths are live, sample fallback, or live-disabled and why.
- Why it matters: Judge-demo claims must be honest: Dallas has limited live aggregates, Austin monthly grouping is sample-first, and Houston remains sample-first with precise locations excluded.
- Likely files: `README.md`, `GOVERNANCE_NOTE.md`, `docs/DATA_GOVERNANCE.md`, optionally new `docs/LIVE_FALLBACK_PROOF.md`.
- Risk level: Low.
- Dependencies: Current `data/catalog/approved-datasets.json` live metadata and known boundaries in `README.md`.
- Acceptance criteria: Matrix names each core dataset, demo prompt, requested data mode, actual rendered mode, fallback reason, hidden-field boundary, and source/caveat proof point. It must not claim unverified live support.
- Validation commands: Manual path/link check; `pnpm governance:audit`; `pnpm lint`.
- Can run in parallel: Yes, with app/test tasks that do not edit the same docs.
- Completed notes: Added `docs/LIVE_FALLBACK_PROOF.md` with a Dallas/Austin/Houston proof matrix covering exact demo prompts, requested modes, rendered live/sample/fallback status, fallback reasons, hidden-field boundaries, source/caveat proof, data-mode definitions, and validation commands. Linked it from `README.md` and `docs/README.md`.
- Validation: Manual referenced-path check passed; `git diff --check` passed; `pnpm governance:audit` passed with the known historical release-evidence warning; `pnpm lint` passed with the existing `next lint` deprecation notice.

## 31. Add Public-Data Live/Fallback Proof Coverage For Core Demo Path

Status: Complete on May 10, 2026 at 04:11 CDT.

- Owner type: QA
- Goal: Add focused automated coverage proving the three core demo prompts preserve honest live/sample/fallback metadata and source caveats end-to-end.
- Why it matters: Existing unit and e2e tests cover many pieces, but final demo confidence benefits from a purpose-built proof test for the exact judge-demo prompts.
- Likely files: `apps/web/test/dashboard.test.ts`, `packages/shared/test/query-audit.test.ts`, or a new `apps/web/test/demo-proof.test.ts`.
- Risk level: Low to Medium.
- Dependencies: Current dashboard generation helpers and sample/catalog metadata.
- Acceptance criteria: Tests cover Dallas, Austin, and Houston demo prompts; assert rendered `dataMode`, requested mode/fallback reason where applicable, `SourceMethodBlock`, caveats, and absence of hidden fields such as `precise_address`.
- Validation commands: Focused Vitest command for the new/updated test file, then `pnpm test`; add `pnpm governance:audit` if catalog/sample/gallery assumptions are touched.
- Can run in parallel: Yes, with docs-only tasks. Avoid parallel edits to the same dashboard/query test files.
- Completed notes: Added `apps/web/test/demo-proof.test.ts` covering the exact Dallas, Austin, and Houston judge-demo prompts, source/method attribution, rendered data modes, fallback reasons where applicable, sample/fallback caveats, hidden `precise_address` absence, and explicit live-request fallback behavior for Austin and Houston.
- Validation: `git diff --check` passed; `pnpm test -- apps/web/test/demo-proof.test.ts` passed; `pnpm test` passed.

## 32. Strengthen Main Judge-Demo E2E Path

Status: Complete on May 10, 2026 at 04:13 CDT.

- Owner type: QA / E2E
- Goal: Add or strengthen Playwright coverage for the exact judge-demo path from `/explore` prompt entry through generated dashboard inspection.
- Why it matters: Unit tests cannot fully prove the visible judge flow; a stable browser test protects the final narrated demo.
- Likely files: `tests/e2e/product-demo.spec.ts`, optionally a new `tests/e2e/judge-demo.spec.ts`.
- Risk level: Low to Medium.
- Dependencies: Current accessible labels and stable text in `/explore`.
- Acceptance criteria: Test runs the primary Dallas prompt, verifies generated title/blocks, source/method attribution, data-mode/fallback indicators, inspector query/audit visibility, and no unsupported prompt state for supported input.
- Validation commands: Targeted Playwright command for the new/updated spec, then `pnpm test:e2e` if runtime permits; run `pnpm lint` if component labels/copy are changed.
- Can run in parallel: Yes, but not with another task editing `tests/e2e/product-demo.spec.ts` or the new judge-demo spec.
- Completed notes: Added `tests/e2e/judge-demo.spec.ts` for the exact primary Dallas judge prompt, asserting generated dashboard title and blocks, source/method attribution, fallback copy, inspector reason codes, safety decisions, active bounded query JSON, and absence of the unsupported-prompt state.
- Validation: `pnpm test:e2e -- tests/e2e/judge-demo.spec.ts` passed after tightening duplicate text locators in the new spec.

## 33. Add Governed Workflow E2E Coverage For Sources, Saved, And Miro Preview

Status: Complete on May 10, 2026 at 04:16 CDT.

- Owner type: QA / E2E
- Goal: Add a focused browser smoke covering `/sources`, saved-canvas handoff, and Miro preview-only export staying governed.
- Why it matters: Final demo stability depends on secondary workflows not drifting into unsupported claims about hidden fields, server persistence, or real Miro writes.
- Likely files: `tests/e2e/product-demo.spec.ts`, `tests/e2e/sources.spec.ts`, or a new `tests/e2e/governed-workflows.spec.ts`.
- Risk level: Low to Medium.
- Dependencies: Existing `/sources`, `/saved`, and Miro preview UI.
- Acceptance criteria: Test verifies source catalog hidden-field warning, saves a generated canvas locally, opens or imports it from `/saved`, requests Miro preview, and asserts preview-only/no OAuth/no board-write language or JSON shape.
- Validation commands: Targeted Playwright command for the new/updated spec; `pnpm test:e2e` if runtime permits; `pnpm lint` if UI copy/accessibility changes are needed.
- Can run in parallel: Yes, with non-e2e tasks. Avoid parallel edits to the same e2e spec files.
- Completed notes: Added `tests/e2e/governed-workflows.spec.ts` covering `/sources` hidden-field warning copy, local save status, saved-canvas open from `/saved`, the no-account/no-hosted-database saved-page boundary, Miro preview UI, and the preview route response note/no OAuth/no board-write JSON shape.
- Validation: `pnpm test:e2e -- tests/e2e/governed-workflows.spec.ts` passed; `pnpm test:e2e` passed with 18 browser tests.

## 34. Migrate From Deprecated `next lint` To ESLint CLI In Isolation

Status: Complete on May 10, 2026 at 04:18 CDT.

- Owner type: DevOps / Tooling
- Goal: Replace deprecated `next lint` with the ESLint CLI using the documented migration path, without changing unrelated packages or product behavior.
- Why it matters: `pnpm lint` passes but warns that `next lint` will be removed in Next.js 16; removing the warning improves final maintenance confidence.
- Likely files: `apps/web/package.json`, `apps/web/.eslintrc.json` or generated ESLint config, root `package.json` only if needed, `DEVELOPMENT_GUIDE.md`, `QA_FINDINGS.md`.
- Risk level: Medium.
- Dependencies: Completed documentation spike in item 24 and current lint passing baseline.
- Acceptance criteria: `pnpm lint` runs through the ESLint CLI without the Next.js deprecation warning; lint coverage still uses Next core-web-vitals rules; no dependency upgrades or broad package changes are bundled unless required by the official codemod and reviewed.
- Validation commands: `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Can run in parallel: No. Do not parallelize with package/config/tooling changes or another task editing lint config/scripts.
- Completed notes: Switched the web lint script to `eslint . --ext .js,.jsx,.ts,.tsx --max-warnings=0`, preserved the existing `next/core-web-vitals` config, and converted `apps/web/postcss.config.js` to a named export object to satisfy the direct ESLint CLI pass. No dependencies were upgraded.
- Validation: `pnpm lint`, `pnpm typecheck`, and `pnpm test` passed. `pnpm lint` no longer emits the deprecated `next lint` warning.

## 35. Refresh Release Evidence Only After Full Validation Gate

- Owner type: Release / Governance
- Goal: Refresh `docs/release-evidence.json` for the intended final demo/release commit only after the required full validation gate has passed from a clean, reviewed tree.
- Why it matters: The current evidence records `a5ce07a` while the May 10, 2026 realness audit inspected `HEAD` at `05145a59ac40`; blindly editing evidence would break the audit trail and overstate release readiness.
- Likely files: `docs/release-evidence.json`, `GOVERNANCE_NOTE.md`, `QA_FINDINGS.md`, `HERMES_PROGRESS.md`, optionally `README.md` if public release status changes.
- Risk level: High.
- Dependencies: Clean or intentionally reviewed working tree; completed dirty-worktree handoff; passing `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm preflight`, and any required hosted/local release checks for the intended commit.
- Acceptance criteria: Evidence records the verified commit, branch, timestamps, gate results, hosted status, and screenshot paths for the intended release; `pnpm governance:audit` passes without the commit-mismatch warning; docs explain exactly which gate was rerun.
- Validation commands: `git status --short --branch`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm preflight`, `pnpm verify:prod-local` if local release evidence is claimed, `pnpm governance:audit`.
- Can run in parallel: No. This is a final gated release task and must not run alongside unrelated changes.

---

# Hackathon Realness Audit Follow-Up Queue

Last replenished: May 10, 2026.

These tasks come from `REALNESS_AUDIT.md`. They are intentionally scoped to keep demo claims honest without adding new infrastructure. Do not implement server persistence, auth, Miro writes, paid media generation, live provider spend, deploy changes, release-evidence refresh, secrets, billing, migrations, or destructive cleanup unless a future selected task explicitly allows it.

## 36. Clarify Saved-Canvas Validation Stub Honesty

Status: Complete on May 10, 2026 at 04:20 CDT.

- Owner type: Docs / API honesty
- Goal: Make the local-only saved-canvas boundary impossible to misread, especially around `/api/canvas/save`.
- Why it matters: The route returns `saved: true` after validation, but the implementation has no backend store; browser `localStorage` does the real save.
- Likely files: `README.md`, `apps/web/README.md`, `ARCHITECTURE_MAP.md`, `REALNESS_AUDIT.md`, optionally `apps/web/test/canvas-save-route.test.ts` if assertions need clearer wording.
- Risk level: Low if docs/tests only; Medium if route response shape changes.
- Dependencies: Current no-database architecture.
- Acceptance criteria: Docs and tests explicitly call `/api/canvas/save` a validation stub; no copy implies server persistence or public share service; product behavior is unchanged unless separately approved.
- Validation commands: `git diff --check`, `pnpm lint`; run focused canvas-save route tests only if test files change.
- Can run in parallel: Yes with tasks not editing the same docs/tests.
- Completed notes: Strengthened `README.md`, `apps/web/README.md`, `ARCHITECTURE_MAP.md`, and `REALNESS_AUDIT.md` to say `/api/canvas/save` is a validation stub only, that `saved: true` does not mean server persistence, and that `/saved` writes only to browser `localStorage`/hash bundles. Existing route tests already assert the validation-stub note, so no product behavior or test files changed.
- Validation: `git diff --check` passed; `pnpm lint` passed.

## 37. Align Miro Export Docs With Preview-Only Implementation

Status: Complete on May 10, 2026 at 04:22 CDT.

- Owner type: Docs / Integration honesty
- Goal: Reconcile Miro docs with the current preview-only `MiroExportSpec` implementation and supported templates.
- Why it matters: Historical/spec docs describe future board workflows and an extra template, while current code performs no OAuth or board writes.
- Likely files: `docs/MIRO_EXPORT_SPEC.md`, `docs/README.md`, `README.md`, `REALNESS_AUDIT.md`.
- Risk level: Low.
- Dependencies: Current Miro route and shared schema.
- Acceptance criteria: Current docs clearly distinguish implemented preview JSON from future write integration; template list matches the current schema or is labeled future; no docs imply real Miro board creation.
- Validation commands: `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with non-Miro docs/tests.
- Completed notes: Rewrote `docs/MIRO_EXPORT_SPEC.md` around the implemented preview-only `MiroExportSpec` JSON contract, removed the unsupported `research_story_board` template from the current type example, labeled board/OAuth/write behavior as future-only, and updated `README.md`/`REALNESS_AUDIT.md` to avoid implying real Miro board creation.
- Validation: `git diff --check` passed; `pnpm lint` passed.

## 38. Document No Image/Video/Media Provider Path

Status: Complete on May 10, 2026 at 04:24 CDT.

- Owner type: Docs / Demo honesty
- Goal: Add a concise statement that no image, video, upload, storage-bucket, or paid media-generation provider path is implemented.
- Why it matters: The app has visual dashboards and Miro preview specs, but no generated media artifact ownership or credit-spending gate exists.
- Likely files: `README.md`, `ARCHITECTURE_MAP.md`, `REALNESS_AUDIT.md`, optionally `docs/DEMO_SCRIPT.md`.
- Risk level: Low.
- Dependencies: Current package/env audit.
- Acceptance criteria: Current docs say visual output is validated dashboard UI, static brand assets, client downloads, and Miro spec JSON; no media provider/API claim is introduced.
- Validation commands: `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with tasks not editing the same docs.
- Completed notes: Added explicit no image/video/media-generation, upload, storage-bucket, paid creative-provider, or credit-spending path wording to `README.md`, `ARCHITECTURE_MAP.md`, `docs/DEMO_SCRIPT.md`, and `REALNESS_AUDIT.md`. Docs now state visual output is limited to validated dashboard UI, static brand assets, client-side CSV/JSON downloads, checked-in gallery canvases, and preview-only MiroExportSpec JSON.
- Validation: `git diff --check` passed; `pnpm lint` passed.

## 39. Add Current-HEAD Release Evidence Warning To Demo Handoff

Status: Complete on May 10, 2026 at 04:27 CDT.

- Owner type: Release / Docs
- Goal: Make it obvious in demo handoff docs that checked-in release evidence is historical until Task 35 reruns the full gate.
- Why it matters: `docs/release-evidence.json` records `a5ce07a81ee932bdf7a37724af0e7aab3a3d9f0f`, while the audited HEAD is `05145a59ac40`.
- Likely files: `GOVERNANCE_NOTE.md`, `docs/DEMO_SCRIPT.md`, `docs/README.md`, `REALNESS_AUDIT.md`.
- Risk level: Low.
- Dependencies: Do not refresh `docs/release-evidence.json`.
- Acceptance criteria: Demo/release docs warn not to cite release evidence as current proof; Task 35 remains the only evidence-refresh path.
- Validation commands: `git diff --check`, `pnpm lint`, optionally `pnpm governance:audit` to confirm the warning remains expected.
- Can run in parallel: Yes with non-release-evidence tasks.
- Completed notes: Updated `GOVERNANCE_NOTE.md`, `docs/DEMO_SCRIPT.md`, `docs/README.md`, and `REALNESS_AUDIT.md` to say checked-in release evidence records `a5ce07a81ee932bdf7a37724af0e7aab3a3d9f0f`, the branch has advanced beyond it, and it must not be cited as current proof until Task 35 reruns the full release gate and refreshes evidence.
- Validation: `git diff --check` passed; `pnpm lint` passed; `pnpm governance:audit` passed 19/19 checks while preserving the expected release-evidence commit mismatch warning.

## 40. Add Sample Data Provenance And Persistence Realness Matrix

Status: Complete on May 10, 2026 at 04:46 CDT.

- Owner type: Docs / Data governance
- Goal: Add a compact matrix showing synthetic sample provenance, local browser persistence, checked-in gallery fixtures, and release evidence status.
- Why it matters: The data samples are synthetic/schema-aligned local files, not complete live extracts; saved canvases are local, not multi-user durable objects.
- Likely files: `docs/DATA_GOVERNANCE.md`, `README.md`, `REALNESS_AUDIT.md`, optionally a new `docs/SAMPLE_AND_PERSISTENCE_REALNESS.md`.
- Risk level: Low.
- Dependencies: Current sample files and no-database architecture.
- Acceptance criteria: Matrix names each sample file, row count, provenance note, live/fallback status, hidden-field boundary, and validation command; saved/share persistence is labeled browser-local/hash-based.
- Validation commands: `git diff --check`, `pnpm lint`, `pnpm data:quality`.
- Can run in parallel: Yes with tasks not editing the same governance docs.
- Completed notes: Added `docs/SAMPLE_AND_PERSISTENCE_REALNESS.md` with sample row counts, date ranges, synthetic provenance notes, live/fallback status, Houston hidden-field boundary, saved/localStorage and URL-hash share-link boundaries, seed/save API boundaries, gallery fixture status, and historical release-evidence status. Linked it from `README.md`, `docs/README.md`, `docs/DATA_GOVERNANCE.md`, and `REALNESS_AUDIT.md`.
- Validation: `git diff --check`, `pnpm lint`, and `pnpm data:quality` passed.

## 41. Add Seed/Save API Naming Honesty Audit

Status: Complete on May 10, 2026 at 04:49 CDT.

- Owner type: QA / API docs
- Goal: Audit route names and tests for `/api/canvas/[id]` and `/api/canvas/save` so future agents do not infer server-side storage.
- Why it matters: Both route names resemble durable persistence APIs, but one is a hardcoded seed helper and the other is a validation stub.
- Likely files: `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, `apps/web/test/canvas-seed-route.test.ts`, `apps/web/test/canvas-save-route.test.ts`, `REALNESS_AUDIT.md`.
- Risk level: Low if docs/tests only.
- Dependencies: Current route behavior.
- Acceptance criteria: Docs/tests describe exact behavior and non-persistence boundaries; no route behavior changes; existing tests still pass.
- Validation commands: focused Vitest commands for the two route tests if touched, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: Yes with non-API-doc tasks.
- Completed notes: Updated `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, and `REALNESS_AUDIT.md` to audit `/api/canvas/save` and `/api/canvas/[id]` as persistence-looking route names with non-persistence behavior. Existing focused tests already describe the validation-stub and hardcoded seed/demo helper behavior, so no route behavior or tests changed.
- Validation: `git diff --check`, `pnpm lint`, and `pnpm test` passed.

## 42. Add No-LLM/No-Secret Provider Demo Wording Pass

Status: Complete on May 10, 2026 at 04:52 CDT.

- Owner type: Docs / Demo honesty
- Goal: Ensure current demo script and public docs describe natural-language support as deterministic/rule-based and do not imply LLM/provider-backed generation.
- Why it matters: The app accepts prompts, but current generation uses local TypeScript parsing and no OpenAI/Anthropic/provider secret path.
- Likely files: `docs/DEMO_SCRIPT.md`, `README.md`, `CODEBASE_OVERVIEW.md`, `REALNESS_AUDIT.md`.
- Risk level: Low.
- Dependencies: Current rule-based prompt parser.
- Acceptance criteria: Demo wording says "rule-based" or "deterministic" where relevant; no docs imply paid AI inference, hidden API keys, or model-generated dashboards; natural-language UI copy remains accurate.
- Validation commands: `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with non-demo-doc tasks.
- Completed notes: Updated `README.md`, `docs/DEMO_SCRIPT.md`, `CODEBASE_OVERVIEW.md`, `ARCHITECTURE_MAP.md`, and `REALNESS_AUDIT.md` to explain that plain-English prompts are parsed locally by deterministic TypeScript rules; there is no LLM/model provider SDK, hidden prompt API key, paid inference path, or model-generated dashboard execution in the current app. Also corrected the codebase overview lint command description to the current ESLint CLI.
- Validation: `git diff --check` passed; `pnpm lint` passed.

---

# Replenished Safe Hackathon-Stabilization Queue

Last replenished: May 10, 2026 at 05:03 CDT.

This queue was added because all safe non-release realness-audit follow-up tasks were complete and the only prior remaining item was the high-risk gated release-evidence refresh. These tasks are deliberately scoped to docs/tests/local validation and must not refresh release evidence, change deploy scripts, add auth/persistence/provider integrations, touch secrets/billing/migrations/production config, run paid APIs, or perform destructive cleanup.

## 43. Add Demo-Readiness Page Copy Test For Historical Release Evidence

Status: Complete on May 10, 2026 at 05:09 CDT.

- Owner type: QA / Docs
- Goal: Add focused coverage proving `/demo-readiness` presents checked-in release evidence as historical when it does not match the current commit.
- Why it matters: The demo handoff warns not to cite stale release evidence; the utility page should preserve the same honest boundary.
- Likely files: `apps/web/app/demo-readiness/page.tsx`, `apps/web/test/*` or a focused Playwright spec if route-level rendering is easier.
- Risk level: Low to Medium.
- Dependencies: Current release metadata and historical `docs/release-evidence.json`; do not refresh that evidence.
- Acceptance criteria: Test asserts the page shows a historical/stale evidence warning or equivalent wording when evidence commit differs from current metadata, and does not instruct users to refresh evidence casually.
- Validation commands: focused test for the touched file/spec, `git diff --check`, `pnpm lint`, `pnpm test` if unit/API coverage changes, or targeted `pnpm test:e2e` if Playwright coverage is used.
- Can run in parallel: Yes with docs-only tasks. Avoid parallel edits to `demo-readiness` tests or page copy.
- Completed notes: Added a visible historical release-evidence warning to `/demo-readiness` when the checked-in evidence commit differs from the running commit, and extended the existing demo-readiness Playwright coverage to assert the warning and no-current-proof wording. Release evidence was not refreshed.
- Validation: RED Playwright assertion failed before the page warning existed; `pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "demo readiness route shows public release boundaries"` passed after implementation, running 15 tests because the project script forwarded the arguments as a full product-demo spec run; `pnpm lint`, `pnpm typecheck`, and `git diff --check` passed.

## 44. Add No-Provider/No-Persistence Contract Tests For Public Metadata

Status: Complete on May 10, 2026 at 05:12 CDT.

- Owner type: QA / API honesty
- Goal: Add tests that public metadata surfaces do not imply LLM providers, server-side saved-canvas persistence, or Miro board writes.
- Why it matters: Recent docs made these boundaries explicit; small contract tests can prevent future copy or route metadata drift.
- Likely files: `apps/web/test/api-contracts.test.ts`, `apps/web/test/canvas-save-route.test.ts`, `apps/web/test/miro-export-route.test.ts`, possibly `apps/mcp-server/test/tools.test.ts`.
- Risk level: Low.
- Dependencies: Existing route/MCP tests.
- Acceptance criteria: Tests assert `/api/canvas/save` remains a validation stub, Miro output remains preview-only/no OAuth/no board ID, and health/status metadata does not advertise model-provider requirements.
- Validation commands: focused Vitest command for changed tests, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: Yes with docs-only tasks. Avoid parallel edits to the same test files.
- Completed notes: Added explicit health metadata for deterministic rule-based prompt processing with no provider secret and expanded route tests so health, canvas-save, and Miro-preview responses do not advertise model providers, database/object-store/public-share persistence, OAuth, board IDs, or board-write URLs.
- Validation: RED health contract failed before `promptProcessing` metadata existed; focused route-test command passed after implementation and ran the full 89-test Vitest suite; `pnpm lint`, `pnpm typecheck`, and `git diff --check` passed.

## 45. Add Sample Provenance Regression Test

Status: Complete on May 10, 2026 at 05:14 CDT.

- Owner type: QA / Data governance
- Goal: Add a focused local test or script assertion that sample files remain synthetic/schema-aligned fallback data and do not expose hidden fields such as Houston precise addresses.
- Why it matters: The sample/persistence realness matrix is only useful if future sample edits preserve the documented boundaries.
- Likely files: `scripts/data-quality.mjs`, `apps/web/test/*`, `packages/shared/test/*`, or a new focused test under `packages/shared/test`.
- Risk level: Low to Medium.
- Dependencies: Existing sample files and data-quality script.
- Acceptance criteria: Automated check covers Dallas/Austin/Houston sample row counts or minimum shape, confirms Houston precise-address fields are absent, and keeps existing `pnpm data:quality` behavior green.
- Validation commands: focused test or `pnpm data:quality`, `git diff --check`, `pnpm lint`, `pnpm test` if Vitest coverage is added.
- Can run in parallel: Yes with docs-only tasks. Do not parallelize with catalog/sample edits.
- Completed notes: Extended `scripts/data-quality.mjs` to report hidden catalog fields checked per sample dataset, fail if hidden fields appear in sample rows, and expose `hiddenFieldsAbsent` in JSON output. Strengthened the release-scripts test to assert Houston sample rows exclude `precise_address`.
- Validation: RED release-scripts test failed before hidden-field provenance metadata existed; focused release-scripts command passed after implementation and ran the full 89-test Vitest suite; `pnpm data:quality`, `pnpm lint`, `pnpm typecheck`, and `git diff --check` passed.

## 46. Add Current Docs Cross-Link Consistency Check

Status: Complete on May 10, 2026 at 05:18 CDT.

- Owner type: Docs / QA
- Goal: Add a lightweight docs consistency test or script check for current-doc links in `README.md`, `docs/README.md`, `DEVELOPMENT_GUIDE.md`, and `CODEBASE_OVERVIEW.md`.
- Why it matters: The repo has many historical docs; current-doc pointers reduce future agent and demo confusion.
- Likely files: `scripts/*`, `apps/web/test/release-scripts.test.ts`, `README.md`, `docs/README.md`, `DEVELOPMENT_GUIDE.md`, `CODEBASE_OVERVIEW.md`.
- Risk level: Low.
- Dependencies: Current docs index.
- Acceptance criteria: Check verifies referenced current docs exist and historical docs are not presented as the first-stop architecture source. If implemented as docs-only, manually verify referenced paths instead.
- Validation commands: focused script/test if added, `git diff --check`, `pnpm lint`, `pnpm test` if Vitest coverage changes.
- Can run in parallel: Yes with code/test tasks that do not edit current docs.
- Completed notes: Added `scripts/docs-consistency.mjs` to verify current docs exist, docs index current starting-point links are present, historical docs are labeled away from current starting points, root README links current developer docs, and development guide/codebase overview warn about historical docs. Added release-scripts Vitest coverage for the new check.
- Validation: RED release-scripts test failed before the script existed; focused release-scripts command passed after implementation and ran the full 90-test Vitest suite; `node scripts/docs-consistency.mjs`, `pnpm lint`, `pnpm typecheck`, and `git diff --check` passed.

## 47. Add Platform Rate-Limit Readiness Note To Demo Checklist

Status: Complete on May 10, 2026 at 05:20 CDT.

- Owner type: Docs / Release coordination
- Goal: Ensure local demo checklist and public docs distinguish in-repo middleware throttling from required platform firewall/rate limiting before broad hosted sharing.
- Why it matters: Hosted rate limiting remains the main active QA finding besides release evidence.
- Likely files: `docs/HACKATHON_DEMO_READINESS.md`, `README.md`, `DEVELOPMENT_GUIDE.md`, `QA_FINDINGS.md`.
- Risk level: Low.
- Dependencies: Existing active QA finding; do not edit deployment config.
- Acceptance criteria: Docs say local judge demos can use in-repo checks, but public hosted sharing needs platform controls; no Vercel/firewall config is claimed as implemented.
- Validation commands: `git diff --check`, `pnpm lint`; optionally manual path/link check.
- Can run in parallel: Yes with test-only tasks. Avoid parallel edits to the same docs.
- Completed notes: Added hosted rate-limit boundary wording to the local demo checklist, README, development guide, and QA findings. Docs now distinguish local in-repo middleware defense-in-depth from unimplemented provider/platform firewall, WAF, bot-protection, or edge rate-limit controls.
- Validation: `git diff --check` and `pnpm lint` passed.

## 48. Add MCP Realness Smoke For Preview-Only And Local-Only Boundaries

- Owner type: QA / MCP
- Goal: Strengthen MCP tests so tool outputs keep the same no-provider, preview-only Miro, and local/static data boundaries as the web docs.
- Why it matters: MCP is a demo/integration surface and should not overclaim storage, live data, or third-party side effects.
- Likely files: `apps/mcp-server/test/tools.test.ts`, optionally `apps/mcp-server/src/tools.ts` only if a test exposes misleading output.
- Risk level: Low to Medium.
- Dependencies: Current MCP tool handlers.
- Acceptance criteria: Tests cover status/source/canvas or Miro tool output and assert preview/local/static wording or JSON fields do not imply OAuth, board writes, database persistence, or model-provider execution.
- Validation commands: `pnpm test -- apps/mcp-server/test/tools.test.ts`, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Can run in parallel: Yes with web-only docs/tests. Do not parallelize with another MCP task.

## 49. Add Saved-Canvas Share-Link Size Boundary E2E Or Component Coverage

- Owner type: QA / Browser-local persistence
- Goal: Add focused coverage for the user-facing oversized or malformed share/import boundary on `/saved` or in saved-canvas helpers.
- Why it matters: Share links are URL-hash based and browser-local; demos should fail safely instead of implying public hosted storage.
- Likely files: `tests/e2e/product-demo.spec.ts`, `apps/web/test/saved-canvases.test.ts`, or `apps/web/components/saved-canvases.tsx` if accessible error copy needs improvement.
- Risk level: Low to Medium.
- Dependencies: Existing saved-canvas helper and e2e coverage.
- Acceptance criteria: Test proves malformed or oversized import/share data shows a safe local validation error and does not call a backend persistence path.
- Validation commands: focused Vitest or targeted Playwright command, `git diff --check`, `pnpm lint`, `pnpm test`; add targeted `pnpm test:e2e` if browser coverage changes.
- Can run in parallel: Yes, but not with another task editing saved-canvas tests/components.

## 50. Consolidate Remaining Historical-Doc Warnings Into Docs Index

- Owner type: Docs
- Goal: Make `docs/README.md` the single clear entry point for current versus historical docs, including release evidence, Miro, live/fallback, and sample/persistence realness notes.
- Why it matters: Many milestone docs remain intentionally checked in; a stronger index lowers the chance that future agents cite old implementation plans as current facts.
- Likely files: `docs/README.md`, optionally `README.md` and `DEVELOPMENT_GUIDE.md`.
- Risk level: Low.
- Dependencies: Existing current-doc index and realness docs.
- Acceptance criteria: Index labels current operational docs, historical milestone docs, and release-gated evidence clearly; no historical doc text is deleted or rewritten.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with code/test tasks that do not edit docs index.
