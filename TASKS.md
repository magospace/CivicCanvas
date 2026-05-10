# Tasks

The next executable Hermes/Codex tasks, ordered for safe progress. Each task is scoped for one agent and avoids broad refactors.

## Brainforge/Vicinity Final Readiness Pass

Status: P0 complete on May 10, 2026.


### Latest Reviewer Triage Mapping - May 10, 2026 at 10:00 CDT

Source: `HACKATHON_REVIEW_TRIAGE.md` is the latest reviewer handoff. The original dirty-tree finding in that file is now stale but preserved there with a follow-up reconciliation note.

- P0 reviewer findings are all represented above and currently complete for local submission readiness: dirty-tree reconciliation, CivicCanvas public naming, exact demo prompt proof, MCP/agent-skill proof, and visible dataset provenance/sample-live boundaries.
- P1 reviewer findings are represented and currently complete except optional hosted smoke: sanitized MCP proof/readme links and `/sources` narration legend are complete; hosted smoke remains gated until a deployment URL is intentionally in scope.
- P2 reviewer findings remain preserved as backlog/gated work: internal package rename only after hackathon approval, real backend persistence only behind an explicit local/dev database plan, live API expansion only after field-level verification, and release evidence refresh only through gated Task 35.
- P3 reviewer findings remain preserved as backlog/nice-to-have work: ignored screenshot artifacts if needed, optional architecture graphic, and concise Loom structure including MCP/agent-skill close.

### P0 - Airtable Submission Readiness

- Owner type: Product/Docs. Goal: Replace product-facing UI and submission-doc names with `CivicCanvas` while preserving internal package names such as `@texas-data-canvas/*` and the existing skill path when renaming would add risk. Scope: root README, hackathon submission docs, demo proof docs, web metadata/header, agent skill wording. Risk level: Low. Acceptance criteria: public demo surfaces say CivicCanvas; internal package commands remain stable. Validation commands: `pnpm lint`, `pnpm typecheck`, `pnpm test:e2e` if UI changed. Parallelization notes: Can run independently from backend/provider work.
- Owner type: QA. Goal: Verify the three exact demo prompts generate source-cited dashboards with maps/charts/tables/caveats, and unsupported prompts show approved suggestions. Scope: dashboard generation tests and Playwright demo flow. Risk level: Low. Acceptance criteria: Dallas, Austin, and Houston exact prompts each include `SourceMethodBlock`, `MapBlock`, `ChartBlock`, `TableBlock`, caveats, source attribution, and safe data-mode metadata. Validation commands: `pnpm test`, `pnpm test:e2e`. Parallelization notes: Can run after naming updates.
- Owner type: MCP. Goal: Verify MCP server builds and exposes safe discovery, query, summary, source/canvas, audit, visualization, and preview export tools. Scope: `apps/mcp-server`. Risk level: Low. Acceptance criteria: `build` and `inspect` pass without secrets or live-provider calls. Validation commands: `pnpm --filter @texas-data-canvas/mcp-server build`, `pnpm --filter @texas-data-canvas/mcp-server inspect`. Parallelization notes: Can run in parallel with docs checks.
- Owner type: Agent workflow. Goal: Ensure the agent skill is easy to find and describes safe CivicCanvas civic-data workflows. Scope: `.agents/skills/texas-public-data-explorer/SKILL.md`. Risk level: Low. Acceptance criteria: skill frontmatter and body mention CivicCanvas, approved datasets, bounded queries, SourceMethodBlock, caveats, hidden-field boundaries, sample/live honesty, and validation. Validation commands: `pnpm lint`. Parallelization notes: Docs-only.
- Owner type: Product trust. Goal: Verify live/sample boundaries remain visible and honest across `/sources`, `/explore`, `/saved`, `/gallery`, and `/demo-readiness`. Scope: UI/docs tests. Risk level: Low. Acceptance criteria: core routes render and visible copy distinguishes sample fallback, live promotion limits, browser-local saves, preview-only Miro, and historical release evidence. Validation commands: `pnpm test:e2e`, `pnpm governance:audit`, `pnpm data:quality`. Parallelization notes: Final pass after P0 patches.

### P1 - Submission Polish After P0

- Add a short `/sources` summary legend for Loom narration if not already done.
- Add an optional sanitized command transcript for MCP build/inspect output.
- Add a short docs cross-link from the root README to the agent skill and MCP proof checklist.
- Add current screenshot capture artifacts only under ignored `demo-artifacts/` if Airtable needs images.

### P2 - Post-Submission Hardening

- Rename internal package paths only after the hackathon if a full monorepo rename is approved.
- Add real backend persistence behind an explicit local/dev database plan, migrations, seeds, rollback, and UI honesty copy.
- Expand live API coverage only after field-level verification and fallback preservation.
- Refresh release evidence only after the gated full release validation task.

---

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

Status: Complete on May 10, 2026 at 05:29 CDT.

- Owner type: QA / MCP
- Goal: Strengthen MCP tests so tool outputs keep the same no-provider, preview-only Miro, and local/static data boundaries as the web docs.
- Why it matters: MCP is a demo/integration surface and should not overclaim storage, live data, or third-party side effects.
- Likely files: `apps/mcp-server/test/tools.test.ts`, optionally `apps/mcp-server/src/tools.ts` only if a test exposes misleading output.
- Risk level: Low to Medium.
- Dependencies: Current MCP tool handlers.
- Acceptance criteria: Tests cover status/source/canvas or Miro tool output and assert preview/local/static wording or JSON fields do not imply OAuth, board writes, database persistence, or model-provider execution.
- Validation commands: `pnpm test -- apps/mcp-server/test/tools.test.ts`, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Can run in parallel: Yes with web-only docs/tests. Do not parallelize with another MCP task.
- Completed notes: Added MCP server status metadata for deterministic no-provider prompt processing, browser-local/hash saved-canvas persistence, preview-only/no-OAuth/no-board-write Miro boundaries, no media providers, and catalog-gated live API fallback behavior. Strengthened MCP tests to assert these boundaries and Miro output does not include OAuth/token/board-write fields.
- Validation: RED MCP status assertion failed before the metadata existed; focused MCP test command passed after implementation and ran the full 90-test Vitest suite; `pnpm lint`, `pnpm typecheck`, and `git diff --check` passed.

## 49. Add Saved-Canvas Share-Link Size Boundary E2E Or Component Coverage

Status: Complete on May 10, 2026 at 05:31 CDT.

- Owner type: QA / Browser-local persistence
- Goal: Add focused coverage for the user-facing oversized or malformed share/import boundary on `/saved` or in saved-canvas helpers.
- Why it matters: Share links are URL-hash based and browser-local; demos should fail safely instead of implying public hosted storage.
- Likely files: `tests/e2e/product-demo.spec.ts`, `apps/web/test/saved-canvases.test.ts`, or `apps/web/components/saved-canvases.tsx` if accessible error copy needs improvement.
- Risk level: Low to Medium.
- Dependencies: Existing saved-canvas helper and e2e coverage.
- Acceptance criteria: Test proves malformed or oversized import/share data shows a safe local validation error and does not call a backend persistence path.
- Validation commands: focused Vitest or targeted Playwright command, `git diff --check`, `pnpm lint`, `pnpm test`; add targeted `pnpm test:e2e` if browser coverage changes.
- Can run in parallel: Yes, but not with another task editing saved-canvas tests/components.
- Completed notes: Added Playwright coverage for a malformed `/saved#canvasBundle=...` share-link hash. The test asserts the user sees `Shared link rejected`, no saved canvas is written to browser localStorage, and `/api/canvas/save` is not called.
- Validation: Targeted Playwright command passed and ran the full product-demo spec with 16 browser tests; `pnpm lint`, `pnpm test`, and `git diff --check` passed.

## 50. Consolidate Remaining Historical-Doc Warnings Into Docs Index

Status: Complete on May 10, 2026 at 05:33 CDT.

- Owner type: Docs
- Goal: Make `docs/README.md` the single clear entry point for current versus historical docs, including release evidence, Miro, live/fallback, and sample/persistence realness notes.
- Why it matters: Many milestone docs remain intentionally checked in; a stronger index lowers the chance that future agents cite old implementation plans as current facts.
- Likely files: `docs/README.md`, optionally `README.md` and `DEVELOPMENT_GUIDE.md`.
- Risk level: Low.
- Dependencies: Existing current-doc index and realness docs.
- Acceptance criteria: Index labels current operational docs, historical milestone docs, and release-gated evidence clearly; no historical doc text is deleted or rewritten.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with code/test tasks that do not edit docs index.
- Completed notes: Strengthened `docs/README.md` to identify current operational sections, warn that release proof remains gated, and explicitly say historical milestone docs must not be cited for current architecture, release proof, live-provider support, media generation, Miro board writes, or persistence behavior unless confirmed by current docs. Historical docs were not deleted or rewritten.
- Validation: `node scripts/docs-consistency.mjs`, `git diff --check`, and `pnpm lint` passed.


---

# Replenished Hackathon Submission Readiness Queue

Last replenished: May 10, 2026 at 05:35 CDT.

This queue follows completion of Tasks 46-50. It prioritizes hackathon submission readiness, real functionality proof, provider-gated media workflows, demo stability, and honest mock/live/local boundaries. Default local validation must remain no-spend and no-secret. Live/provider calls must be opt-in through env gates such as `RUN_LIVE_FAL_SMOKE=1`, must not print secrets, and must stop before production/deployment mutation or unclear billing risk.

## 51. Add Env-Gated Fal Media Proof Script

Status: Complete on May 10, 2026 at 05:38 CDT.

- Owner type: Media / QA
- Goal: Add a no-spend-by-default script that proves whether Fal image generation is configured and, only when explicitly env-gated, performs one minimal live proof call.
- Scope: `scripts/*`, `apps/web/test/release-scripts.test.ts`, `README.md` or `docs/HACKATHON_DEMO_READINESS.md` if command documentation is needed.
- Likely files: `scripts/fal-media-smoke.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`, `README.md`.
- Risk level: Medium because it documents a paid/live provider path, but safe if default behavior is skipped/no-spend and secrets are never printed.
- Acceptance criteria: Default run exits successfully with JSON/text saying live Fal proof is skipped unless `RUN_LIVE_FAL_SMOKE=1`; missing API key under the gate fails safely without printing the key; docs/tests say current app generation is still not wired to media output unless a later task implements it; optional live call is one minimal request only.
- Validation commands: `node scripts/fal-media-smoke.mjs --json`, focused Vitest command for script tests, `git diff --check`, `pnpm lint`, `pnpm test` if Vitest coverage changes.
- Can run in parallel: No with other package/script edits; yes with unrelated docs after command naming is stable.
- Completed notes: Added `scripts/fal-media-smoke.mjs` and `pnpm media:fal:smoke(:json)` commands. The default path is no-spend/no-provider-call and reports that app media generation is not wired into dashboard output. The live path requires `RUN_LIVE_FAL_SMOKE=1` plus `FAL_KEY`/`FAL_API_KEY`, fails safely without a key, and is designed for one minimal request only. README documents both paths and the billing/approval boundary.
- Validation: `node scripts/fal-media-smoke.mjs --json`, focused release-scripts Vitest command, `git diff --check`, `pnpm lint`, and full `pnpm test` passed. No live Fal call was made.

## 52. Add Media Provider Status API Boundary

Status: Complete on May 10, 2026 at 05:40 CDT.

- Owner type: API / Media honesty
- Goal: Add a small public status route or health metadata section that reports media generation as not wired by default and Fal live proof as env-gated/script-only unless explicitly configured.
- Scope: Web API health/status metadata and tests; no live provider call from request handlers.
- Likely files: `apps/web/app/api/health/route.ts`, `apps/web/test/api-contracts.test.ts`, `README.md`.
- Risk level: Low to Medium.
- Acceptance criteria: Public metadata states no media artifacts are generated by the app by default; if Fal smoke script exists, metadata labels it optional/env-gated and not part of normal dashboard generation; tests assert no secret/provider key leakage.
- Validation commands: focused API contract test, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Can run in parallel: Yes with docs-only tasks; avoid parallel edits to health route/tests.
- Completed notes: Added `mediaGeneration` metadata to `/api/health` stating app media generation is not implemented, default provider calls are false, optional Fal proof is script-only and gated by `RUN_LIVE_FAL_SMOKE=1`, and secrets are not echoed. API tests assert the contract and README documents the boundary.
- Validation: Focused health API contract command passed and ran the full 92-test Vitest suite; `pnpm lint`, `pnpm typecheck`, full `pnpm test`, and `git diff --check` passed. No live provider call was made.

## 53. Add Live Public API Proof Report For Supported Dallas Aggregate

Status: Complete on May 10, 2026 at 05:43 CDT.

- Owner type: Data / Live API QA
- Goal: Add a deterministic report or test path showing the narrow real Dallas live aggregate support and the fallback behavior for unsupported ZIP views without overclaiming live support.
- Scope: Existing live smoke/query helpers, local tests, docs proof matrix.
- Likely files: `scripts/smoke-live.mjs`, `apps/web/test/demo-proof.test.ts`, `docs/LIVE_FALLBACK_PROOF.md`, `README.md`.
- Risk level: Medium because it may use network when explicitly run; default test path should remain deterministic and no-network.
- Acceptance criteria: No-network validation proves expected live/fallback metadata; optional network command remains explicit; docs identify exactly which Dallas path is live-capable and which demo prompt still falls back.
- Validation commands: focused Vitest test, `pnpm smoke:live:json` only if network is intentionally used, `git diff --check`, `pnpm lint`, `pnpm test`, `pnpm governance:audit` if docs/catalog assumptions change.
- Can run in parallel: No with catalog/adapter edits; yes with unrelated UI/docs.
- Completed notes: Added `scripts/live-fallback-proof.mjs` and `pnpm live:fallback-proof(:json)` for a no-network catalog-driven report. It proves Dallas has narrow live mapped fields but ZIP remains sample-only, Austin month grouping is not promoted live, and Houston is sample-first with `precise_address` hidden. Release-scripts coverage and the live/fallback proof doc now reference the command.
- Validation: `node scripts/live-fallback-proof.mjs --json`, focused release-scripts Vitest command, `git diff --check`, `pnpm lint`, and full `pnpm test` passed. `pnpm smoke:live:json` was skipped because no network/live proof was needed for this no-network task.

## 54. Add Local Backend Persistence Spike Plan With Rollback Assumptions

Status: Complete on May 10, 2026 at 05:45 CDT.

- Owner type: Backend / Architecture
- Goal: Document a concrete local-only persistence spike plan for saved canvases, including schema choices, migration/rollback assumptions, tests, and UI boundary changes, without implementing persistence yet.
- Scope: Planning docs only unless a future task explicitly implements the spike.
- Likely files: `docs/LOCAL_PERSISTENCE_SPIKE.md`, `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, `TASKS.md`.
- Risk level: Low as docs; future implementation would be High/Medium.
- Acceptance criteria: Plan names local/dev database target, schema/migration strategy, seed/reset commands, rollback assumptions, test matrix, and copy changes needed to keep browser-local vs backend persistence honest.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with code tasks that do not edit architecture docs.
- Completed notes: Added `docs/LOCAL_PERSISTENCE_SPIKE.md` as a planning-only SQLite/local-dev saved-canvas persistence spike with env gate, draft schema, migration/rollback assumptions, seed/reset guardrails, API/UI honesty requirements, and test matrix. Linked it from README and docs index, and pointed the development guide backend section at the plan.
- Validation: Manual path check with `python3`, `git diff --check`, and `pnpm lint` passed. No persistence implementation, database file, migration, or schema change was added.

## 55. Add Real Backend Persistence Prototype Behind Local Env Gate

- Owner type: Backend / Persistence
- Goal: Prototype local-only saved-canvas server persistence behind an explicit env gate while preserving browser-local default behavior.
- Scope: API route, storage adapter, tests, docs; local/dev database only.
- Likely files: `apps/web/app/api/canvas/save/route.ts`, `apps/web/lib/*`, `packages/shared/src/schemas/index.ts`, migration/config files if selected, `apps/web/test/*`, docs.
- Risk level: High; requires explicit approval if it introduces a database, migrations, or new env vars.
- Acceptance criteria: Default local demo remains browser-local; env-gated local backend path has tests, migration/seed/reset/rollback docs, no production data access, and honest UI/API metadata.
- Validation commands: migration/schema tests, local seed/reset validation, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `git diff --check`.
- Can run in parallel: No.

## 56. Add Demo Video Capture Checklist Without Generated Media Claims

Status: Complete on May 10, 2026 at 05:53 CDT.

- Owner type: Demo / Submission
- Goal: Add a concise checklist for recording a hackathon demo video using the current app without implying generated video/media provider output.
- Scope: Docs only.
- Likely files: `docs/DEMO_VIDEO_CHECKLIST.md`, `docs/README.md`, `README.md`.
- Risk level: Low.
- Acceptance criteria: Checklist names exact route sequence, prompts, timing, fallback/live wording, screen recording tips, and explicit no generated-media/provider claim unless Task 51 live proof is separately run.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with non-doc-index code tasks.
- Completed notes: Added `docs/DEMO_VIDEO_CHECKLIST.md` with a 2-3 minute route sequence, exact demo prompts, fallback/live narration, capture settings, post-capture secret/media-claim checks, and explicit wording that the recording is not generated media and normal app generation does not call Fal. Linked it from README and the docs index.
- Validation: Manual path check passed; `git diff --check` passed; `pnpm lint` passed.

## 57. Add Submission Metadata Checklist

Status: Complete on May 10, 2026 at 05:55 CDT.

- Owner type: Submission / Docs
- Goal: Add a hackathon submission readiness checklist covering project description, install/run command, demo URL caveats, license, screenshots, and honest real/mock/live claims.
- Scope: Docs only.
- Likely files: `docs/HACKATHON_SUBMISSION_CHECKLIST.md`, `README.md`, `docs/README.md`.
- Risk level: Low.
- Acceptance criteria: Checklist separates local demo proof, hosted proof, live API proof, media proof, and release evidence; no unchecked claim is presented as complete.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with test/code tasks not editing docs index.
- Completed notes: Added `docs/HACKATHON_SUBMISSION_CHECKLIST.md` covering project metadata, exact demo prompts, install/run commands, route references, local/hosted/live/media/release-evidence proof sections, asset hygiene, and safe claim wording for mock/live/local boundaries. Linked it from README and the docs index.
- Validation: Manual path/link check passed; `git diff --check` passed; `pnpm lint` passed.

## 58. Add Demo Readiness JSON Snapshot Export

Status: Complete on May 10, 2026 at 05:57 CDT.

- Owner type: QA / Demo tooling
- Goal: Add a local script that emits a single JSON snapshot of current demo readiness: tests baseline, sample counts, live/fallback matrix pointers, release evidence status, and known blockers.
- Scope: Script and tests; no release evidence refresh.
- Likely files: `scripts/demo-readiness-snapshot.mjs`, `apps/web/test/release-scripts.test.ts`, `docs/HACKATHON_DEMO_READINESS.md`.
- Risk level: Low to Medium.
- Acceptance criteria: Script is no-network by default, returns machine-readable JSON, labels release evidence as historical if mismatched, and does not mutate files.
- Validation commands: `node scripts/demo-readiness-snapshot.mjs --json`, focused Vitest command, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: No with release script edits; yes with UI-only tasks.
- Completed notes: Added `scripts/demo-readiness-snapshot.mjs` plus `pnpm demo:readiness:snapshot(:json)` commands. The script emits no-network, non-mutating JSON with repo status, validation baseline, sample counts, gallery count, live/fallback proof pointer, media proof boundary, historical/current release-evidence status, and known blockers. Added release-script test coverage and documented the command in the demo-readiness checklist.
- Validation: `node scripts/demo-readiness-snapshot.mjs --json`, focused release-scripts Vitest command, `git diff --check`, `pnpm lint`, and full `pnpm test` passed. No network/provider/live calls were made.

## 59. Add Gallery Screenshot Capture Script For Submission Assets

Status: Complete on May 10, 2026 at 05:59 CDT.

- Owner type: Demo / Media tooling
- Goal: Add a local Playwright script or documented command to capture deterministic screenshots of `/sources`, `/explore`, `/saved`, and `/demo-readiness` for submission assets.
- Scope: Local script/docs; generated screenshots must not be committed unless explicitly approved.
- Likely files: `scripts/capture-demo-screenshots.mjs`, `docs/DEMO_VIDEO_CHECKLIST.md`, package scripts optionally.
- Risk level: Medium because it creates generated media artifacts locally.
- Acceptance criteria: Script writes to an ignored/local artifact directory, does not require hosted deployment, uses deterministic sample prompts, and docs say generated screenshots are local artifacts not release evidence unless Task 35 runs.
- Validation commands: dry-run/help command, `git diff --check`, `pnpm lint`; run capture only if local browser/server flow is stable and generated files remain unstaged.
- Can run in parallel: No with other Playwright tooling edits.
- Completed notes: Added `scripts/capture-demo-screenshots.mjs` with a no-file default dry-run plan and explicit `--run` capture mode for a running local/hosted app. Added `pnpm demo:screenshots(:json)`, ignored `demo-artifacts/`, documented the flow in the demo video checklist, and added release-script coverage for the dry-run contract. No screenshots were generated or committed.
- Validation: `node scripts/capture-demo-screenshots.mjs --json`, `node scripts/capture-demo-screenshots.mjs --help`, focused release-scripts Vitest command, `git diff --check`, and `pnpm lint` passed. Capture mode was intentionally not run; no generated media artifacts were created.

## 60. Add Source Freshness And Terms Review Checklist

Status: Complete on May 10, 2026 at 06:01 CDT.

- Owner type: Data governance
- Goal: Add a checklist for reviewing public-data source freshness, terms, live availability, and hidden-field boundaries before making stronger live-data claims.
- Scope: Docs/scripts optional; no live API mutation.
- Likely files: `docs/DATA_GOVERNANCE.md`, `docs/LIVE_ADAPTERS.md`, `docs/LIVE_FALLBACK_PROOF.md`.
- Risk level: Low.
- Acceptance criteria: Checklist names Dallas/Austin/Houston current limitations, what evidence is needed to promote live support, and validation commands.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`, `pnpm governance:audit` if governance docs are touched.
- Can run in parallel: Yes with non-governance tasks.
- Completed notes: Added `docs/SOURCE_FRESHNESS_CHECKLIST.md` covering Dallas/Austin/Houston current live/fallback limits, terms/freshness review steps, field-classification and hidden-field boundaries, evidence needed before live promotion, validation commands, and safe/unsafe claim language. Linked it from docs index and current governance/live-proof docs.
- Validation: Manual path/link check passed; `git diff --check` passed; `pnpm lint` passed; `pnpm governance:audit` passed 19/19 with the expected historical release-evidence warning.

## 61. Add Optional Remote Hosted Smoke Evidence Template

Status: Complete on May 10, 2026 at 06:06 CDT.

- Owner type: Release / Hosted QA
- Goal: Add a template for recording hosted smoke results without mutating deployment config or release evidence.
- Scope: Docs only.
- Likely files: `docs/HOSTED_SMOKE_TEMPLATE.md`, `docs/HACKATHON_DEMO_READINESS.md`, `docs/README.md`.
- Risk level: Low.
- Acceptance criteria: Template records URL, timestamp, commands, expected version, rate-limit/platform caveat, screenshots path if any, and says it is not release evidence until Task 35 refreshes evidence.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with code/test tasks.
- Completed notes: Added `docs/HOSTED_SMOKE_TEMPLATE.md` with hosted URL/session metadata, smoke commands, manual route checks, command-result placeholders, screenshot/artifact references, platform rate-limit caveat, and explicit no-release-evidence/no-deploy-mutation boundaries. Linked it from docs index and local demo readiness notes.
- Validation: Manual path/link check passed; `git diff --check` passed; `pnpm lint` passed.

## 62. Add Provider Secret Redaction Regression Test

Status: Complete on May 10, 2026 at 06:06 CDT.

- Owner type: Security / QA
- Goal: Add a regression test or script check that provider-related smoke scripts and status outputs do not print API keys or common secret env values.
- Scope: Script tests only; no real secrets.
- Likely files: `apps/web/test/release-scripts.test.ts`, `scripts/fal-media-smoke.mjs`, possibly `scripts/lib/*`.
- Risk level: Medium if touching provider smoke scripts; low if tests only.
- Acceptance criteria: Test injects fake secret-like env values and asserts output redacts or omits them; no real env files are read or committed.
- Validation commands: focused Vitest command, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: No with Task 51 if both edit the same script/tests.
- Completed notes: Added a release-scripts regression test that runs the Fal smoke script in no-spend mode with fake FAL/OpenAI/Anthropic secret-like environment values and asserts the JSON output uses `[REDACTED]`, reports zero live calls, and omits every fake secret value. No real env files or provider calls were used.
- Validation: Focused release-scripts Vitest command passed; `git diff --check` passed; `pnpm lint` passed; full `pnpm test` passed with 96 tests across 15 files. No live provider/media calls were made.


---

# Replenished Hackathon Proof And Integration Queue

Last replenished: May 10, 2026 at 06:07 CDT.

This queue follows completion of Tasks 61-62. The only older remaining items are high-risk Task 55 (backend persistence prototype) and gated Task 35 (release evidence refresh). The tasks below prioritize real backend/data/media readiness, provider-gated proof hygiene, demo stability, and honest mock/live/local boundaries while keeping default validation no-secret, no-spend, no-production-mutation, and non-destructive.

## 63. Add Local Persistence Readiness Check Script

Status: Complete on May 10, 2026 at 06:09 CDT.

- Owner type: Backend / QA
- Goal: Add a no-database-mutation script that reports whether local backend persistence prerequisites are present, confirms browser-local fallback remains default, and points to the persistence spike plan.
- Scope: Script/tests/docs only; no migrations or DB files.
- Likely files: `scripts/local-persistence-readiness.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`, `docs/LOCAL_PERSISTENCE_SPIKE.md`.
- Risk level: Low to Medium because it touches backend-readiness messaging but must not implement persistence.
- Acceptance criteria: Default command reports persistence implementation as not enabled, no database file required, browser-local fallback preserved, and Task 55/plan references; JSON output is machine-readable and non-mutating.
- Validation commands: `node scripts/local-persistence-readiness.mjs --json`, focused Vitest command, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: No with other release-script edits; yes with unrelated docs.
- Completed notes: Added `scripts/local-persistence-readiness.mjs` plus `pnpm persistence:readiness(:json)`. The read-only script reports browser-local/hash sharing as the default, `/api/canvas/save` as a validation stub, the local persistence plan as present, no runtime DB files found, and Task 55 approval requirements. Added release-script coverage with a fake `DATABASE_URL` that is never echoed, and documented the command in the persistence spike plan.
- Validation: `node scripts/local-persistence-readiness.mjs --json`, focused release-scripts Vitest command, `git diff --check`, `pnpm lint`, and full `pnpm test` passed with 97 tests across 15 files. No database files, migrations, or schema changes were created.

## 64. Add Fal Live Proof Result Template And Redaction Checklist

Status: Complete on May 10, 2026 at 06:10 CDT.

- Owner type: Media / Provider QA
- Goal: Add a structured template for recording an approved one-call Fal smoke result without committing secrets or generated media.
- Scope: Docs/tests optional; no live provider call by default.
- Likely files: `docs/FAL_LIVE_PROOF_TEMPLATE.md`, `docs/DEMO_VIDEO_CHECKLIST.md`, `docs/README.md`.
- Risk level: Low if docs only; Medium if script behavior changes.
- Acceptance criteria: Template records gate, model, prompt class, approximate call count, artifact handling, cost caveat, redaction checks, and app-wiring status; clearly states normal dashboard generation still does not call Fal.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with tasks not editing docs index.
- Completed notes: Added `docs/FAL_LIVE_PROOF_TEMPLATE.md` with dry-run/live-gated commands, result metadata, redaction checklist, artifact handling, sanitized output summary, cost/approval caveats, and explicit `not_implemented_dashboard_ui_only` app-wiring status. Linked it from docs index and demo video checklist.
- Validation: Manual path/link check passed; `git diff --check` passed; `pnpm lint` passed. No live Fal call was made.

## 65. Add Hosted Smoke Template Consistency Check

Status: Complete on May 10, 2026 at 06:12 CDT.

- Owner type: Release / QA
- Goal: Add a local no-network check that hosted smoke template docs preserve required caveats and command placeholders.
- Scope: Script/test only; no hosted network call.
- Likely files: `scripts/docs-consistency.mjs` or a new script, `apps/web/test/release-scripts.test.ts`, `docs/HOSTED_SMOKE_TEMPLATE.md`.
- Risk level: Low.
- Acceptance criteria: Check verifies the hosted template mentions `pnpm smoke:deploy`, `PLAYWRIGHT_BASE_URL`, platform rate limiting, not release evidence, and no secret pasting.
- Validation commands: focused script/test, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: No with other release-script/docs-consistency edits.
- Completed notes: Extended `scripts/docs-consistency.mjs` to require hosted smoke template phrases for `pnpm smoke:deploy`, `PLAYWRIGHT_BASE_URL`, platform rate limiting, not-release-evidence boundary, and secret warning. Updated release-scripts coverage to assert the new check and required phrase list. Tightened `docs/HOSTED_SMOKE_TEMPLATE.md` wording to include the exact caveats.
- Validation: RED docs-consistency run failed before template wording included the exact required phrases; after fixing wording, `node scripts/docs-consistency.mjs --json`, focused release-scripts Vitest command, `git diff --check`, `pnpm lint`, and full `pnpm test` passed with 97 tests across 15 files. No hosted network calls were made.

## 66. Add Sample Data Freshness Snapshot Script

Status: Complete on May 10, 2026 at 06:15 CDT.

- Owner type: Data / QA
- Goal: Emit a local JSON snapshot of sample date ranges, row counts, hidden fields checked, and source freshness checklist link.
- Scope: Script/tests; no catalog/sample mutation.
- Likely files: `scripts/sample-freshness-snapshot.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`, `docs/SOURCE_FRESHNESS_CHECKLIST.md`.
- Risk level: Low.
- Acceptance criteria: JSON output is no-network, includes Dallas/Austin/Houston sample ranges and hidden-field boundaries, and does not claim source-owned live freshness.
- Validation commands: script JSON command, focused Vitest command, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: No with release-script edits; yes with UI-only tasks.
- Completed notes: Added `scripts/sample-freshness-snapshot.mjs` and `pnpm sample:freshness(:json)` to report checked-in sample row counts, date ranges, distinct months, live/fallback metadata, hidden-field checks, and source freshness checklist link. Output is no-network/non-mutating and labels all samples as synthetic/schema-aligned rather than source-owned live freshness. Added release-script coverage and referenced the command from the source freshness checklist.
- Validation: `node scripts/sample-freshness-snapshot.mjs --json`, focused release-scripts Vitest command, `git diff --check`, `pnpm lint`, and full `pnpm test` passed with 98 tests across 15 files. No catalog/sample data changed and no live API calls were made.

## 67. Add Local Saved-Canvas Persistence Boundary UI Snapshot Test

Status: Complete on May 10, 2026 at 06:17 CDT.

- Owner type: QA / Browser-local persistence
- Goal: Strengthen browser/E2E coverage that `/saved` still says browser-local and does not imply backend persistence after new persistence planning docs.
- Scope: Playwright test only unless copy is missing.
- Likely files: `tests/e2e/product-demo.spec.ts` or `tests/e2e/governed-workflows.spec.ts`.
- Risk level: Low to Medium.
- Acceptance criteria: Test verifies local-only copy, no-account/no-hosted-database wording, import validation rejection, and no `/api/canvas/save` call for malformed share hash.
- Validation commands: targeted Playwright command, `git diff --check`, `pnpm lint` if test/code changes.
- Can run in parallel: No with other e2e saved-page edits.
- Completed notes: Strengthened `tests/e2e/governed-workflows.spec.ts` so the governed workflow smoke intercepts `/api/canvas/save`, confirms normal local save/open flow does not call the persistence-looking API route, and asserts `/saved` visibly says browser-local, no hosted database, and URL-hash share-link validation.
- Validation: Initial targeted Playwright run failed on an over-strict share-link text assertion; after matching current UI copy, `pnpm test:e2e -- tests/e2e/governed-workflows.spec.ts`, `git diff --check`, and `pnpm lint` passed.

## 68. Add Miro Preview Artifact Template

Status: Complete on May 10, 2026 at 06:36 CDT.

- Owner type: Integration / Docs
- Goal: Add a template for saving or sharing Miro preview JSON manually without claiming board writes.
- Scope: Docs only.
- Likely files: `docs/MIRO_PREVIEW_ARTIFACT_TEMPLATE.md`, `docs/MIRO_EXPORT_SPEC.md`, `docs/README.md`.
- Risk level: Low.
- Acceptance criteria: Template records source dashboard, template type, validation status, no OAuth/no board-write caveat, and artifact handling; not release evidence unless Task 35 runs.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with non-Miro tasks.
- Completed notes: Reconciled the pre-existing untracked `docs/MIRO_PREVIEW_ARTIFACT_TEMPLATE.md`, linked it from `docs/README.md` and `docs/MIRO_EXPORT_SPEC.md`, and kept wording explicit that preview artifacts are no-OAuth/no-board-write and not release evidence unless gated Task 35 reruns the full release gate.
- Validation: Manual path/link/caveat check passed; `pnpm lint` passed; `git diff --check` passed.

## 69. Add Release Evidence Dry-Run Precheck Script

Status: Complete on May 10, 2026 at 06:45 CDT.

- Owner type: Release / QA
- Goal: Add a no-mutation precheck that reports whether release evidence is current or historical and lists the commands required before Task 35.
- Scope: Script/tests only; must not edit `docs/release-evidence.json`.
- Likely files: `scripts/release-evidence-precheck.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`.
- Risk level: Medium because it touches release-evidence workflow; safe only if read-only.
- Acceptance criteria: Command reports current HEAD, recorded evidence commit, mismatch status, required full-gate commands, and exits 0 without modifying evidence.
- Validation commands: script JSON command, focused Vitest command, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: No with release-script edits.
- Completed notes: Added `scripts/release-evidence-precheck.mjs` and package scripts `release:evidence:precheck` / `release:evidence:precheck:json`. The script is read-only, reports current HEAD, recorded evidence commit, current/historical status, and required Task 35 gate commands without editing `docs/release-evidence.json`. Added focused release-script regression coverage.
- Validation: RED focused test failed before the script existed. GREEN `pnpm release:evidence:precheck:json`, focused release-script test, `pnpm lint`, full `pnpm test`, `pnpm typecheck`, and `git diff --check` passed. The precheck reported `historical_not_current_head`, which is expected because Task 35 was not run.

## 70. Add Provider Output Redaction Utility

Status: Complete on May 10, 2026 at 06:51 CDT.

- Owner type: Security / Tooling
- Goal: Extract small shared redaction helper for provider smoke scripts if more provider proof scripts are added.
- Scope: Script utility/tests; no real provider calls.
- Likely files: `scripts/lib/redaction.mjs`, `scripts/fal-media-smoke.mjs`, `apps/web/test/release-scripts.test.ts`.
- Risk level: Medium because it touches existing provider smoke script.
- Acceptance criteria: Existing Fal smoke output remains unchanged except implementation uses shared helper; fake secret tests pass.
- Validation commands: focused Vitest command, `node scripts/fal-media-smoke.mjs --json`, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: No with provider script edits.
- Completed notes: Added reusable `scripts/lib/redaction.mjs` helpers for provider output redaction, switched Fal smoke to use the helper, redacted signed artifact URLs, and added focused coverage for secrets, bearer tokens, signed URLs, sensitive request IDs, and raw provider-response fields. No live provider call was made.
- Validation: RED focused test failed before the utility existed; GREEN focused provider redaction/Fal tests passed. `pnpm media:fal:smoke:json` passed in skipped/no-spend mode; `pnpm lint`, `pnpm typecheck`, full `pnpm test`, and `git diff --check` passed.

## 71. Add Local Backend Persistence Approval Checklist

Status: Complete on May 10, 2026 at 06:52 CDT.

- Owner type: Backend / Governance
- Goal: Add a checklist of explicit approvals, rollback commands, seed/reset scope, and validation gates needed before starting Task 55.
- Scope: Docs only.
- Likely files: `docs/LOCAL_PERSISTENCE_SPIKE.md`, `docs/README.md`, `TASKS.md`.
- Risk level: Low.
- Acceptance criteria: Checklist makes approval boundaries for migrations, DB files, env vars, seed/reset, and browser-local fallback explicit.
- Validation commands: manual path/link check, `git diff --check`, `pnpm lint`.
- Can run in parallel: Yes with non-persistence tasks.
- Completed notes: Strengthened `docs/LOCAL_PERSISTENCE_SPIKE.md` with an explicit approval checklist covering local/dev-only scope, storage target, env gate, migration/seed/reset scope, rollback, UI/API honesty, and validation gates before any backend persistence implementation. No persistence code, migrations, database files, or env files were added.
- Validation: Manual checklist/path check passed; `pnpm persistence:readiness:json` passed in read-only/no-network mode; `pnpm lint` and `git diff --check` passed.

## 72. Add Demo Artifact Git Hygiene Check

Status: Complete on May 10, 2026 at 06:59 CDT.

- Owner type: QA / Tooling
- Goal: Add a local check that generated demo artifacts such as screenshots/videos are ignored and not staged accidentally.
- Scope: Script/tests; no generated artifact commits.
- Likely files: `scripts/demo-artifact-hygiene.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`, `.gitignore`.
- Risk level: Low to Medium.
- Acceptance criteria: Check verifies `demo-artifacts` is ignored and reports staged generated media extensions if present; default repo state passes.
- Validation commands: script command, focused Vitest command, `git diff --check`, `pnpm lint`, `pnpm test`.
- Can run in parallel: No with package/script edits.
- Completed notes: Added `scripts/demo-artifact-hygiene.mjs` plus `pnpm demo:artifact-hygiene(:json)` scripts. The check is read-only/no-network, verifies `demo-artifacts` is git-ignored, and reports staged generated media extensions so screenshots/videos/GIFs are not accidentally committed. Added focused release-script coverage.
- Validation: RED focused test failed before the script existed; GREEN `pnpm demo:artifact-hygiene:json`, focused release-script test, `pnpm lint`, full `pnpm test`, `pnpm typecheck`, and `git diff --check` passed. No generated media artifacts were created or committed.


---

# Verified Claude Recommendations Queue

Last reconciled: May 10, 2026 at 06:20 CDT.

`clauderecommends.md` was reviewed as external feedback and checked against the current repo before accepting findings. Existing dirty work was preserved: untracked `clauderecommends.md` and untracked `docs/MIRO_PREVIEW_ARTIFACT_TEMPLATE.md` were not staged as part of this queue.

Reconciliation summary:

- Confirmed and still relevant before hackathon submission: route-boundary CanvasDocument validation for Miro/save APIs (#1; save route already validates after request parsing but the request schema still accepts unknown), rate-limiter bucket eviction (#2), client-only/localStorage hardening and quota/import errors (#3/#18/#19), dashboard partial-query fallback and fallback reason surfacing (#4/#10; high impact but touches risky dashboard/shared schema surfaces), fixed dataset filter allowlists (#5; high impact but touches risky dashboard/query validation), and empty catalog guard (#26).
- Already fixed or partly stale: shared `parseSavedCanvasImport` already performs a pre-parse byte limit (#20); README already documents `/api/canvas/save` and `/api/canvas/[id]` boundaries (#44) and Houston/Dallas live/sample boundaries beyond the MVP bullet list (#39/#40); hash-import sad paths and saved workflows have existing unit/e2e coverage (#31/#32) though more malformed round-trip coverage remains useful.
- High impact but deferred until after submission or explicit approval: Sentry/analytics/telemetry/health runtime metrics (#6-#9), CI required-check changes (#11-#13), broad formatting hooks (#14/#16), CODEOWNERS/PR template (#15), sample data expansion (#17, data mutation), large dashboard/module refactors (#21/#24), catalog schema/onboarding changes (#27/#29), and real backend/Miro/Houston/Austin integration roadmap items (#47-#50).
- Risky or approval-needed: release evidence refresh remains gated Task 35; backend persistence/migrations remain gated Task 55; provider spend, production deployment config, auth hardening, billing, and destructive database operations remain out of scope without explicit approval.

## 73. Tighten CanvasDocument Route Boundary Validation

Status: Complete on May 10, 2026 at 06:24 CDT.

- Owner type: API / Validation
- Goal: Replace route-level `z.unknown()` canvas request fields with `canvasDocumentSchema` so malformed canvases are rejected at the API boundary before business logic.
- Scope: `apps/web/app/api/export/miro-spec/route.ts`, `apps/web/app/api/canvas/save/route.ts`, focused route tests.
- Risk level: Low to Medium because API validation behavior changes, but only to reject malformed payloads earlier.
- Acceptance criteria: Valid canvas save/export still works; malformed Miro/save canvas payloads return structured 400 errors; Miro remains preview-only and save remains browser-local validation stub.
- Validation commands: focused Vitest route/API tests, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Can run in parallel: No with API route validation edits.
- Completed notes: Changed both Miro export and canvas-save request schemas to parse `canvasDocumentSchema` at the request boundary. The save route now uses the boundary-validated canvas directly, while Miro export still only returns preview-only `MiroExportSpec` JSON. Updated canvas-save validation test expectations for nested `canvas.*` issue paths.
- Validation: Focused API/route Vitest command passed with 98 tests across 15 files; `pnpm lint` passed; `pnpm typecheck` passed across shared, MCP server, and web; full `pnpm test` passed with 98 tests across 15 files; `git diff --check` passed.

## 74. Add Middleware Rate-Limit Bucket Eviction

Status: Complete on May 10, 2026 at 06:26 CDT.

- Owner type: API / Reliability
- Goal: Keep in-memory middleware throttling bounded for long-running local/demo processes by evicting expired buckets.
- Scope: `apps/web/middleware.ts`, middleware contract tests.
- Risk level: Low to Medium because middleware is high-impact; keep behavior identical for active windows.
- Acceptance criteria: Expired buckets are culled after their reset window, active buckets still rate-limit, headers are unchanged, and docs still state platform firewall/rate limiting is required for broad hosted sharing.
- Validation commands: focused middleware Vitest test, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Can run in parallel: No with middleware edits.
- Completed notes: Added stale bucket cleanup before middleware rate-limit checks, preserving current rate-limit headers and active-window behavior. Added test-only bucket reset/count helpers and focused Vitest coverage proving stale buckets are evicted after the configured window horizon.
- Validation: Focused middleware Vitest command passed with 99 tests across 15 files; `pnpm lint` passed; `pnpm typecheck` passed; full `pnpm test` passed with 99 tests across 15 files; `git diff --check` passed.

## 75. Harden Browser-Local Saved-Canvas Client Boundaries

Status: Complete on May 10, 2026 at 06:30 CDT.

- Owner type: Frontend / Persistence
- Goal: Make saved-canvas client helpers explicitly client-only and improve user-facing handling for oversized imports or localStorage quota failures without adding backend persistence.
- Scope: `apps/web/lib/saved-canvases.ts`, `apps/web/components/saved-canvases.tsx`, saved-canvas tests as needed.
- Risk level: Low to Medium because it touches the reliable browser-local demo path.
- Acceptance criteria: Client helper has a `use client` boundary; import size checks happen before parsing in the UI path; localStorage write failures surface as clear import/save/share errors; browser-local and URL-hash behavior remains unchanged.
- Validation commands: focused saved-canvas Vitest/E2E where relevant, `git diff --check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Can run in parallel: No with saved-canvas component/helper edits.
- Completed notes: Added an explicit client boundary to the saved-canvas helper, centralized import byte-length checks, wrapped localStorage writes with browser-local quota/clear-space error messages, added component-side oversized import precheck, and surfaced duplicate/delete/open storage failures without changing browser-local/hash behavior.
- Validation: Focused saved-canvas Vitest command passed with 100 tests across 15 files; `pnpm lint` passed; `pnpm typecheck` passed; full `pnpm test` passed with 100 tests across 15 files; `pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "saved"` passed with 16 browser tests; `git diff --check` passed.

## 76. Add Dashboard Partial-Query Fallback And Runtime Fallback Reasons

Status: Complete on May 10, 2026 at 06:38 CDT.

- Owner type: Dashboard / Data honesty
- Goal: Prevent one failed dashboard sub-query from killing the whole dashboard and surface specific fallback/failure reasons in source/method output.
- Scope: `apps/web/lib/dashboard.ts`, shared `QueryAudit` schema if needed, dashboard tests.
- Risk level: Medium to High because `dashboard.ts` and shared schemas are risky files.
- Acceptance criteria: One failed aggregate produces a visible caveat or omitted block instead of full dashboard failure; fallback reasons remain honest and tested.
- Validation commands: focused dashboard tests, `pnpm typecheck`, `pnpm test`, `git diff --check`, and likely `pnpm test:e2e` for the core demo path.
- Can run in parallel: No.
- Completed notes: Added testable dashboard query-runner injection, switched the five dashboard aggregate queries to `Promise.allSettled`, and synthesize fallback query results/audits/caveats when one bounded aggregate fails so the remaining validated dashboard blocks still render. Fallback reason and Source/Method caveats now include failed query details.
- Validation: RED focused dashboard test failed before implementation; GREEN focused dashboard test passed with 101 tests across 15 files; `pnpm lint`, `pnpm typecheck`, full `pnpm test`, focused product-demo Playwright command, and `git diff --check` passed.

## 77. Replace Runtime-Derived Filter Allowlist With Dataset Field Allowlists

Status: Complete on May 10, 2026 at 06:40 CDT.

- Owner type: Query / Safety
- Goal: Ensure dashboard filters are checked against fixed approved dataset field allowlists rather than values derived from runtime intent.
- Scope: `apps/web/lib/dashboard.ts`, dashboard/query tests.
- Risk level: Medium to High because it touches query construction and protected dashboard logic.
- Acceptance criteria: Supported prompts/filters still work; disallowed fields fail before query execution; allowlists are readable and dataset-specific.
- Validation commands: focused dashboard/query tests, `pnpm typecheck`, `pnpm test`, `pnpm governance:audit`, `git diff --check`.
- Can run in parallel: No.
- Completed notes: Replaced runtime-intent-derived filter allowlist with fixed dataset-specific filter allowlists for Dallas, Austin, and Houston. Added regression coverage that a cross-dataset field is rejected with the dataset ID before query execution while existing supported filters continue to pass.
- Validation: RED focused dashboard test failed on old generic allowlist error; GREEN focused dashboard test passed with 102 tests across 15 files; `pnpm typecheck`, focused dashboard test file, `pnpm governance:audit`, `pnpm lint`, full `pnpm test`, and `git diff --check` passed.

## 78. Guard Unsupported-Prompt Suggestions For Empty Catalog

Status: Complete on May 10, 2026 at 06:42 CDT.

- Owner type: Frontend / Resilience
- Goal: Avoid `datasets[0]` crashes if catalog loading ever returns no supported suggestion datasets.
- Scope: `apps/web/lib/dashboard.ts`, focused dashboard test.
- Risk level: Medium because it touches dashboard fallback behavior; small scope.
- Acceptance criteria: Empty catalog/suggestion list returns a valid governed fallback canvas or structured error instead of throwing from undefined source metadata.
- Validation commands: focused dashboard test, `pnpm typecheck`, `pnpm test`, `git diff --check`.
- Can run in parallel: No with dashboard edits.
- Completed notes: `createDatasetSuggestionCanvas` now accepts an optional catalog for deterministic testing, handles an empty supported-suggestion list with a valid `catalog_suggestions` source, omits dataset cards when no approved suggestions exist, and shows explicit governed guidance instead of crashing or implying unavailable datasets.
- Validation: RED focused test failed on the old behavior because the fallback source still dereferenced the default Dallas suggestion path; after implementation/fix, the focused test passed with 103 tests across 15 files. `pnpm typecheck`, focused dashboard test file, `pnpm lint`, full `pnpm test`, and `git diff --check` passed.


---

# Hackathon Finalization Queue

Last replenished: May 10, 2026 after Task 72. Existing untracked input preserved: `clauderecommends.md`; existing untracked submission guide input detected at repo root and should be adopted or intentionally left untracked without staging unrelated files.

## 79. Adopt Hackathon Submission Guide As Current Docs

Status: Complete on May 10, 2026 at 07:02 CDT.

- Owner type: Docs / Submission
- Goal: Convert the existing root-level hackathon submission guide input into a current linked docs page without staging unrelated external feedback.
- Scope: Docs/index links only; preserve the untracked root input unless explicitly archiving it.
- Likely files: `docs/HACKATHON_SUBMISSION_GUIDE.md`, `docs/README.md`, `README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Current docs link to the submission guide; guide copy preserves honest local/sample/browser-local/MCP boundaries; untracked external feedback remains unstaged.
- Validation commands: manual path/link check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-doc tasks.
- Completed notes: Adopted the root-level submission guide input into `docs/HACKATHON_SUBMISSION_GUIDE.md`, added a source/boundary note, and linked it from `README.md` and `docs/README.md`. The original root untracked input and `clauderecommends.md` remain unstaged.
- Validation: Manual path/link/boundary check passed; `pnpm lint` and `git diff --check` passed.

## 80. Add README Architecture Diagram For Submission Reviewers

Status: Complete on May 10, 2026 at 07:04 CDT.

- Owner type: Docs / Architecture
- Goal: Add a compact architecture diagram to README so judges can understand the deterministic prompt, catalog, bounded query, canvas, and MCP flow quickly.
- Scope: README only; no product behavior changes.
- Likely files: `README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: README diagram does not claim LLM/media/backend/Miro write support; sample/live boundaries remain unchanged.
- Validation commands: manual README check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with script tasks.
- Completed notes: Added a compact Mermaid architecture diagram to README showing deterministic prompt parsing, approved catalog, BoundedQuerySpec validation, sample/live adapters, source attribution/query audit, validated CanvasDocument rendering, and MCP tools. Added explicit boundary copy for no LLM-generated dashboard code, no arbitrary SQL, no backend saved-canvas database, and no app-run live media generation.
- Validation: Manual README diagram/honesty check passed; `pnpm lint` and `git diff --check` passed.

## 81. Add MCP Demo Proof Checklist

Status: Complete on May 10, 2026 at 07:06 CDT.

- Owner type: MCP / Submission Docs
- Goal: Add a short checklist for showing the MCP server and agent skill in the Loom without implying unsafe live/provider behavior.
- Scope: Docs only.
- Likely files: `docs/MCP_DEMO_PROOF.md`, `docs/README.md`, `README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Checklist includes build/inspect commands, safe tool examples, no secrets, no arbitrary SQL, and preview-only Miro caveat.
- Validation commands: manual path/link check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-doc tasks.
- Completed notes: Added `docs/MCP_DEMO_PROOF.md` with safe setup commands, MCP/agent narration points, safe tool examples, demo boundary phrases, anti-claims, and local validation commands. Linked it from `README.md` and `docs/README.md`.
- Validation: Manual path/link/boundary check passed; `pnpm lint` and `git diff --check` passed.

## 82. Add Submission Bundle Readiness Script

Status: Complete on May 10, 2026 at 07:08 CDT.

- Owner type: QA / Tooling
- Goal: Add a no-network script that reports whether submission docs, README links, package scripts, and known blockers are present before Airtable/Loom submission.
- Scope: Script/tests only; no generated media or release evidence refresh.
- Likely files: `scripts/submission-readiness.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Acceptance criteria: JSON command reports required docs, local commands, known gated blockers, and exits 0 without mutating files.
- Validation commands: script JSON command, focused Vitest command, `pnpm lint`, `pnpm test`, `git diff --check`.
- Can run in parallel: No with release-script edits.
- Completed notes: Added `scripts/submission-readiness.mjs` plus `pnpm submission:readiness(:json)` scripts. The no-network/no-mutation report checks required submission docs, no-spend/readiness scripts, local validation commands, and gated blockers for Task 35, hosted proof, live provider spend, and backend persistence. Added focused release-script coverage.
- Validation: RED focused test failed before the script existed; GREEN `pnpm submission:readiness:json`, focused release-script test, `pnpm lint`, `pnpm typecheck`, full `pnpm test`, and `git diff --check` passed.

## 83. Add Supported Prompt Grammar Doc

Status: Complete on May 10, 2026 at 07:10 CDT.

- Owner type: Product Docs / Prompt Parser
- Goal: Document supported prompt patterns, synonyms, unsupported/sensitive prompt behavior, and data-mode expectations.
- Scope: Docs only.
- Likely files: `docs/SUPPORTED_PROMPTS.md`, `docs/README.md`, `README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Examples match deterministic parser support and avoid claiming generic natural-language coverage.
- Validation commands: manual examples check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with script tasks.
- Completed notes: Added `docs/SUPPORTED_PROMPTS.md` documenting exact supported prompts, bounded synonyms, recognized parameters, unsupported/sensitive prompt behavior, and data-mode boundaries. Linked it from `README.md` and `docs/README.md`.
- Validation: Manual examples/path/link check passed; `pnpm lint` and `git diff --check` passed.

## 84. Add Catalog Onboarding Checklist

Status: Complete on May 10, 2026 at 07:11 CDT.

- Owner type: Data Governance / Docs
- Goal: Add a new-dataset onboarding checklist for field classification, live verification, sample fallback, hidden fields, and validation gates.
- Scope: Docs only; no catalog mutation.
- Likely files: `docs/CATALOG_ONBOARDING_CHECKLIST.md`, `docs/README.md`, `README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Checklist requires safe field classifications, fallback samples, live proof or sample-first flag, and governance/data-quality validation.
- Validation commands: manual path/link check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-doc tasks.
- Completed notes: Added `docs/CATALOG_ONBOARDING_CHECKLIST.md` with source/terms review, safe field classifications, live API verification, sample fallback requirements, dashboard/MCP/export boundaries, validation gates, claim language, and rollback notes. Linked it from `README.md` and `docs/README.md`.
- Validation: Manual path/link/content check passed; `pnpm lint` and `git diff --check` passed.

## 85. Add No-Spend Provider Proof Notes To Submission Checklist

Status: Complete on May 10, 2026 at 07:13 CDT.

- Owner type: Provider / Submission Docs
- Goal: Clarify in submission docs how to explain Fal/provider proof as optional script-level no-spend/live-gated proof, not app media generation.
- Scope: Docs only.
- Likely files: `docs/HACKATHON_SUBMISSION_CHECKLIST.md`, `docs/FAL_LIVE_PROOF_TEMPLATE.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Docs distinguish app-generated media, no-spend Fal smoke, and RUN_LIVE_FAL_SMOKE live proof.
- Validation commands: manual wording check, `pnpm media:fal:smoke:json`, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-provider script tasks.
- Completed notes: Strengthened submission checklist and Fal proof template wording so no-spend script proof, one-call live Fal proof, and future app media integration are clearly separate states. Added redaction and safe-submission wording reminders.
- Validation: Manual wording check passed; `pnpm media:fal:smoke:json`, `pnpm lint`, and `git diff --check` passed.

## 86. Add Release Evidence Warning To Submission Guide

Status: Complete on May 10, 2026 at 07:15 CDT.

- Owner type: Release / Docs
- Goal: Ensure the submission guide prominently warns that release evidence is historical until gated Task 35 reruns full validation.
- Scope: Docs only; must not edit `docs/release-evidence.json`.
- Likely files: `docs/HACKATHON_SUBMISSION_GUIDE.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Guide tells submitters not to cite release evidence as current proof; points to `pnpm release:evidence:precheck:json`.
- Validation commands: manual wording check, `pnpm release:evidence:precheck:json`, `git diff --check`.
- Can run in parallel: Yes with non-release tasks.
- Completed notes: Added a prominent release-evidence warning near the top of the submission guide, including Task 35 gating, the safe precheck command, and instructions not to edit or cite stale `docs/release-evidence.json` as current proof.
- Validation: Manual wording check passed; `pnpm release:evidence:precheck:json` and `git diff --check` passed.

## 87. Add Local Demo Smoke Command Checklist

Status: Complete on May 10, 2026 at 07:17 CDT.

- Owner type: QA / Docs
- Goal: Add a concise command checklist for final local demo verification that avoids deploy, live spend, and release evidence refresh by default.
- Scope: Docs only.
- Likely files: `docs/HACKATHON_DEMO_READINESS.md`, `README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Checklist includes lint/typecheck/test/governance/data-quality/no-spend media/precheck commands and labels optional live/deploy checks.
- Validation commands: manual path/link check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes.
- Completed notes: Expanded the demo readiness quick gate into a no-deploy/no-live-spend/no-release-refresh command checklist and linked it from the README current docs. The checklist includes lint, typecheck, test, governance, data quality, no-network live/fallback proof, no-spend Fal smoke, read-only release-evidence precheck, demo artifact hygiene, and `git diff --check`.
- Validation: Manual path/link/checklist command check passed; `pnpm lint` and `git diff --check` passed.

## 88. Add Public URL Smoke Evidence Placeholder

Status: Complete on May 10, 2026 at 07:19 CDT.

- Owner type: Hosted Readiness / Docs
- Goal: Add a template section for recording a public URL smoke check without mutating deployment config or release evidence.
- Scope: Docs only; no deploy.
- Likely files: `docs/HOSTED_SMOKE_TEMPLATE.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Template captures URL, command, version expectation, firewall/rate-limit caveat, and says not release evidence unless Task 35 runs.
- Validation commands: manual wording check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes.
- Completed notes: Added a public URL smoke placeholder to the hosted smoke template with URL, deploy smoke command, remote browser command, expected version/commit, platform firewall/rate-limit caveat, and not-release-evidence status unless Task 35 runs.
- Validation: Manual wording check passed; `pnpm lint` and `git diff --check` passed.


---

# Hackathon Submission Hardening Queue

Last replenished: May 10, 2026 after Task 88. Existing untracked input preserved: `clauderecommends.md`. Gated work remains blocked unless explicitly approved: Task 35 release-evidence refresh, Task 55 local backend persistence/migrations, hosted deployment mutation/proof, live provider spend, production data operations, secrets/auth/billing, and platform configuration changes.

## 89. Add Public Repo/Remote Readiness To Submission Script

Status: Complete on May 10, 2026.

- Owner type: QA / Submission Tooling
- Goal: Make `pnpm submission:readiness:json` report git remote/public repo readiness without network calls or leaking credentials.
- Scope: No-network script/test only; do not configure remotes.
- Likely files: `scripts/submission-readiness.mjs`, `apps/web/test/release-scripts.test.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Acceptance criteria: JSON reports current branch, whether a remote URL is configured, redacted remote host/path metadata, and a submission TODO if no public repo URL is configured; no remote mutation or network call occurs.
- Validation commands: `pnpm submission:readiness:json`, focused Vitest command, `pnpm lint`, `pnpm test`, `git diff --check`.
- Can run in parallel: No with submission readiness script edits.
- Completed notes: Added no-network git branch/origin inspection to `submission-readiness` output with redacted host/path metadata and no credential echo. Added release-script regression assertions for remote metadata shape and redaction.
- Validation: `pnpm submission:readiness:json`, focused release-script Vitest, `pnpm lint`, full `pnpm test`, and `git diff --check` passed.

## 90. Add Readme Submission Link Consistency Check

Status: Complete on May 10, 2026.

- Owner type: Docs / QA Tooling
- Goal: Extend docs consistency checks so README and docs index retain links to key submission/demo docs.
- Scope: Script/test only, with docs wording fix only if the check reveals drift.
- Likely files: `scripts/docs-consistency.mjs`, `apps/web/test/release-scripts.test.ts`, `README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Consistency JSON includes submission-doc link checks for README and docs index; current repo passes.
- Validation commands: `node scripts/docs-consistency.mjs --json`, focused Vitest command, `pnpm lint`, `pnpm test`, `git diff --check`.
- Can run in parallel: No with docs consistency script edits.
- Completed notes: Added submission/demo doc link expectations to `scripts/docs-consistency.mjs`, including submission guide/checklist, demo readiness, MCP proof, Fal proof, and hosted smoke template. Added missing README links for Fal proof and hosted smoke templates and test assertions for the new contract.
- Validation: docs-consistency JSON, focused release-script Vitest, `pnpm lint`, full `pnpm test`, and `git diff --check` passed.

## 91. Add No-Spend Media Proof Contract To Submission Readiness

Status: Complete on May 10, 2026.

- Owner type: Provider / QA Tooling
- Goal: Make submission readiness explicitly require the no-spend Fal proof script and classify live Fal proof as gated/not run.
- Scope: Script/test only; no live Fal call.
- Likely files: `scripts/submission-readiness.mjs`, `apps/web/test/release-scripts.test.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: JSON includes media proof status, no-spend command, live gate command name, app media wiring caveat, and no live call count.
- Validation commands: `pnpm submission:readiness:json`, `pnpm media:fal:smoke:json`, focused Vitest command, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with submission readiness script edits.
- Completed notes: Added `mediaProof` metadata to submission readiness output for no-spend Fal command, `RUN_LIVE_FAL_SMOKE` gate, not-run live status, dashboard-not-wired caveat, and expected zero default live calls. Added regression assertions.
- Validation: `pnpm submission:readiness:json`, `pnpm media:fal:smoke:json`, focused release-script Vitest, `pnpm lint`, and `git diff --check` passed.

## 92. Add Backend Persistence Gate To Health/Readiness Docs

Status: Complete on May 10, 2026.

- Owner type: Persistence / Docs
- Goal: Ensure current submission/demo docs point future real backend work to the local persistence readiness script and approval checklist.
- Scope: Docs only; no persistence implementation.
- Likely files: `docs/HACKATHON_SUBMISSION_GUIDE.md`, `docs/HACKATHON_SUBMISSION_CHECKLIST.md`, `docs/LOCAL_PERSISTENCE_SPIKE.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Docs tell reviewers saved canvases are browser-local today and future backend persistence requires Task 55 approval, local/dev DB scope, rollback/seed assumptions, and `pnpm persistence:readiness:json`.
- Validation commands: manual wording check, `pnpm persistence:readiness:json`, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-doc tasks.
- Completed notes: Added backend persistence gate language to submission guide/checklist and local persistence spike docs. The docs preserve browser-local saved-canvas claims and point future real backend work to Task 55, local/dev-only approval, migration/seed/reset/rollback assumptions, UI/API honesty, and `pnpm persistence:readiness:json`.
- Validation: Manual wording check, `pnpm persistence:readiness:json`, `pnpm lint`, and `git diff --check` passed.

## 93. Add Live Public Data Optional Smoke Evidence Template

Status: Complete on May 10, 2026.

- Owner type: Data / Live Smoke Docs
- Goal: Add a template for recording optional `pnpm smoke:live:json` evidence without changing catalog mappings or overclaiming unsupported live fields.
- Scope: Docs only; no live call by default.
- Likely files: `docs/LIVE_API_SMOKE_TEMPLATE.md`, `docs/LIVE_FALLBACK_PROOF.md`, `docs/README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Template captures command, date, Dallas non-ZIP live fields, Dallas ZIP fallback, Austin/Houston sample-first caveats, and no-release-evidence boundary.
- Validation commands: manual path/link check, `pnpm live:fallback-proof:json`, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes.
- Completed notes: Added `docs/LIVE_API_SMOKE_TEMPLATE.md` for optional network live smoke notes, linked it from docs index, and pointed `LIVE_FALLBACK_PROOF.md` to the template for approved smoke runs while preserving no-network default proof and Dallas/Austin/Houston fallback boundaries.
- Validation: Manual path/link/boundary check, `pnpm live:fallback-proof:json`, `pnpm lint`, and `git diff --check` passed.

## 94. Add MCP Inspect No-Secret Submission Note

Status: Complete on May 10, 2026.

- Owner type: MCP / Docs
- Goal: Add a safe note for demonstrating MCP inspect/build in Loom without dumping env vars or implying arbitrary SQL/provider access.
- Scope: Docs only.
- Likely files: `docs/MCP_DEMO_PROOF.md`, `docs/HACKATHON_SUBMISSION_GUIDE.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Docs include exact safe commands, safe narration, no-secret/no-arbitrary-SQL caveat, and preview-only Miro boundary.
- Validation commands: manual wording check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes.
- Completed notes: Added no-secret MCP inspect demo guidance with exact build/inspect/test commands, safe narration, no env/secrets/provider dashboard caveats, arbitrary SQL disclaimer, and preview-only Miro boundary. Updated submission guide Loom step to point to the safe MCP proof doc.
- Validation: Manual wording check, `pnpm lint`, and `git diff --check` passed.

## 95. Add Submission Readiness Known-Blockers Doc Snapshot

Status: Complete on May 10, 2026.

- Owner type: QA / Docs
- Goal: Add a concise checked-in doc explaining the current submission blockers emitted by `pnpm submission:readiness:json`.
- Scope: Docs only.
- Likely files: `docs/SUBMISSION_BLOCKERS.md`, `docs/README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Doc lists public repo URL, Loom URL, team roster, optional hosted URL, historical release evidence, platform rate limit, and backend/media boundaries without implying they are fixed.
- Validation commands: manual path/link check, `pnpm submission:readiness:json`, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes.
- Completed notes: Added `docs/SUBMISSION_BLOCKERS.md` and linked it from the docs index. The snapshot records public repo/Loom/team/hosted form items plus historical release evidence, platform rate-limit, backend persistence, media, and live-data boundaries without claiming they are fixed.
- Validation: Manual path/link/boundary check, `pnpm submission:readiness:json`, `pnpm lint`, and `git diff --check` passed.

## 96. Add Safe Submission Command Transcript Template

Status: Complete on May 10, 2026.

- Owner type: Submission / Docs
- Goal: Add a paste-safe transcript template for final validation commands that redacts local paths/secrets and separates optional live/deploy evidence.
- Scope: Docs only.
- Likely files: `docs/SUBMISSION_COMMAND_TRANSCRIPT_TEMPLATE.md`, `docs/HACKATHON_SUBMISSION_CHECKLIST.md`, `docs/README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Template has sections for local no-spend commands, optional hosted/live commands, redaction rules, and not-release-evidence caveat.
- Validation commands: manual path/link check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes.
- Completed notes: Added `docs/SUBMISSION_COMMAND_TRANSCRIPT_TEMPLATE.md`, linked it from the docs index, and referenced it from the submission checklist final review. The template separates local no-spend commands from optional hosted/live/provider evidence and includes path/secret/signed-URL redaction plus not-release-evidence caveats.
- Validation: Manual path/link/redaction check, `pnpm lint`, and `git diff --check` passed.

## 97. Add Demo Readiness Snapshot Blocker Assertions

Status: Complete on May 10, 2026.

- Owner type: QA / Tests
- Goal: Strengthen tests for `demo-readiness-snapshot` so release-evidence and hosted-rate-limit blockers stay visible.
- Scope: Test only unless script output is missing required fields.
- Likely files: `apps/web/test/release-scripts.test.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Acceptance criteria: Focused test asserts known blockers include historical release evidence and platform firewall/rate-limit wording, and snapshot remains no-network/non-mutating.
- Validation commands: focused Vitest command, `pnpm test`, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with release-script tests.
- Completed notes: Strengthened the existing demo-readiness snapshot test to assert release-evidence, platform firewall/rate-limit, no app media generation, and no server-side saved-canvas persistence blockers remain visible, while avoiding secret/env-name leakage in blocker text.
- Validation: Focused release-script Vitest, full `pnpm test`, `pnpm lint`, and `git diff --check` passed.

## 98. Add Final No-Artifact Submission Hygiene Checklist

Status: Complete on May 10, 2026.

- Owner type: Submission / Artifact Hygiene
- Goal: Ensure final submission docs remind agents not to commit screenshots/videos/provider artifacts or `.env` files.
- Scope: Docs only.
- Likely files: `docs/HACKATHON_SUBMISSION_CHECKLIST.md`, `docs/DEMO_VIDEO_CHECKLIST.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Docs point to `pnpm demo:artifact-hygiene:json`, mention ignored `demo-artifacts/`, and prohibit `.env`, screenshots/videos, generated provider artifacts unless a task explicitly approves them.
- Validation commands: manual wording check, `pnpm demo:artifact-hygiene:json`, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes.
- Completed notes: Added final artifact hygiene reminders to submission and demo video checklists, including `pnpm demo:artifact-hygiene:json`, ignored `demo-artifacts/`, and prohibitions on committing `.env`, screenshots/videos/GIFs, Fal/provider outputs, signed URLs, or generated artifacts unless explicitly scoped.
- Validation: Manual wording check, `pnpm demo:artifact-hygiene:json`, `pnpm lint`, and `git diff --check` passed.


---

# Loom Demo Polish And Realness Queue

Last replenished: May 10, 2026 after the Loom visual UI/UX audit and localized dashboard polish. Existing untracked input preserved: `clauderecommends.md`. Gated work remains blocked unless explicitly approved: Task 35 release-evidence refresh, Task 55 local backend persistence/migrations, hosted deployment mutation/proof, live provider spend, production data operations, secrets/auth/billing, and platform configuration changes.

## 99. Add Visual Polish Regression Coverage For Generated Dashboard

Status: Complete on May 10, 2026.

- Owner type: QA / UI
- Goal: Add browser-level regression coverage that protects the Loom-polished generated dashboard surfaces.
- Scope: Test only; no visual snapshot artifacts committed.
- Likely files: `tests/e2e/product-demo.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: E2E coverage asserts the Dallas generated dashboard shows the new sample/fallback status strip, visible trend/bar chart labels or values, friendly `Request count` sort label, and `Apply filters` copy without relying on screenshots.
- Validation commands: `PLAYWRIGHT_BASE_URL=http://localhost:<port> pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "visual polish"`, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with other edits to `tests/e2e/product-demo.spec.ts`.
- Completed notes: Added a product-demo Playwright regression covering the generated Dallas dashboard status strip, governed fields summary, trend/bar chart labels, `Request count` table sort label, and `Apply filters` copy without committing screenshots.
- Validation: Targeted Playwright command ran the product-demo spec and passed 17 browser tests; `pnpm lint` and `git diff --check` passed.

## 100. Add Saved Empty-State Explore CTA

Status: Complete on May 10, 2026.

- Owner type: UI / Demo UX
- Goal: Make `/saved` clearer in a fresh browser by offering a primary route back to the core `/explore` demo loop.
- Scope: Local UI copy/link only; do not change browser-local persistence, import validation, share-link hashing, or backend behavior.
- Likely files: `apps/web/components/saved-canvases.tsx`, `tests/e2e/product-demo.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Empty/fresh `/saved` state includes a visible `Go to Explore` or `Create a canvas` CTA linking to `/explore`, while browser-local/no-backend copy remains visible.
- Validation commands: targeted Playwright saved-flow test or `PLAYWRIGHT_BASE_URL=http://localhost:<port> pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "saved"`, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with saved-page UI/test edits.
- Completed notes: Empty `/saved` now keeps browser-local/import guidance and adds a primary `Go to Explore` link to `/explore`. Saved share-link rejection coverage asserts the CTA remains visible without backend persistence.
- Validation: Targeted saved Playwright command ran the product-demo spec and passed 17 browser tests; `pnpm lint`, `pnpm typecheck`, and `git diff --check` passed.

## 101. Add Visual Audit To Submission Readiness Outputs

Status: Complete on May 10, 2026.

- Owner type: Submission / QA Tooling
- Goal: Make the no-network submission readiness script report the Loom visual audit and localized polish status as part of final recording readiness.
- Scope: Script/test/docs only; no screenshots committed and no browser launch required.
- Likely files: `scripts/submission-readiness.mjs`, `apps/web/test/release-scripts.test.ts`, `docs/SUBMISSION_BLOCKERS.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Acceptance criteria: `pnpm submission:readiness:json` includes visual audit metadata, committed audit doc path, ignored screenshot artifact path guidance, and remaining visual risks without claiming screenshots are release evidence.
- Validation commands: `pnpm submission:readiness:json`, focused release-script Vitest, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with submission readiness script edits.
- Completed notes: Submission readiness output now includes `visualAudit` metadata for the committed audit doc, ignored screenshot artifact directory/policy, localized polish status, and remaining visual risks. Submission blockers snapshot records the visual-polish boundary without treating screenshots as release evidence.
- Validation: `pnpm submission:readiness:json`, focused release-script Vitest, `pnpm lint`, and `git diff --check` passed.

## 102. Add Mobile Prompt-First Explore Layout

Status: Complete on May 10, 2026.

- Owner type: UI / Responsive UX
- Goal: Make the mobile `/explore` first viewport show the prompt loop before source discovery so the demo action is obvious within 15 seconds.
- Scope: Layout ordering only on small screens; preserve desktop three-column layout, source catalog details, and all data-mode honesty copy.
- Likely files: `apps/web/components/app-shell.tsx`, `apps/web/components/dataset-sidebar.tsx`, `tests/e2e/product-demo.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Medium.
- Acceptance criteria: At mobile width, prompt card appears before Cities/Topics/Datasets; no horizontal overflow; desktop layout remains unchanged; data-mode and sample fallback copy remain visible.
- Validation commands: targeted mobile Playwright test, `pnpm lint`, `pnpm typecheck`, `git diff --check`.
- Can run in parallel: No with app-shell/sidebar layout edits.
- Completed notes: Reordered `/explore` grid children so the prompt/canvas column appears before source discovery on small screens while preserving desktop order at `lg`. Mobile Playwright coverage now asserts the prompt appears above the Cities section and no horizontal overflow occurs after dashboard generation.
- Validation: Targeted mobile Playwright command ran the product-demo spec and passed 17 browser tests; `pnpm lint`, `pnpm typecheck`, and `git diff --check` passed.

## 103. Add Sources Page Summary Legend

Status: Complete on May 10, 2026.

- Owner type: UI / Demo UX
- Goal: Make `/sources` communicate approved/live/sample boundaries faster for the opening Loom scene.
- Scope: Add concise summary/legend only; do not alter catalog data, live mappings, source verification claims, or cards' detailed caveats.
- Likely files: `apps/web/app/sources/page.tsx`, `tests/e2e/sources.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Acceptance criteria: `/sources` above-the-fold shows counts/legend such as approved sources, live-promoted sources, sample-first/fallback sources, and coming-later sources; labels stay honest with current catalog metadata.
- Validation commands: `PLAYWRIGHT_BASE_URL=http://localhost:<port> pnpm test:e2e -- tests/e2e/sources.spec.ts`, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with sources-page UI/test edits.
- Completed notes: `/sources` now shows an above-the-fold readiness legend with approved source count, live-promoted count, sample fallback count, and coming-later count, while preserving detailed catalog caveats and hidden-field warnings.
- Validation: `pnpm test:e2e -- tests/e2e/sources.spec.ts`, `pnpm lint`, and `git diff --check` passed.

## 104. Add Header Active Navigation State

Status: Complete on May 10, 2026.

- Owner type: UI / Navigation Polish
- Goal: Improve orientation during the Loom by making the current route visibly active in the header.
- Scope: Header/nav styling only; preserve route labels and no-account/runtime labels.
- Likely files: `apps/web/components/header.tsx` or a small client nav subcomponent, `tests/e2e/product-demo.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Acceptance criteria: Header visibly marks active `Explore`, `Sources`, `Saved`, `Gallery`, and `Demo` routes with accessible current-page semantics; no hydration or layout regressions.
- Validation commands: targeted Playwright route/header assertions, `pnpm lint`, `pnpm typecheck`, `git diff --check`.
- Can run in parallel: No with header/nav edits.
- Completed notes: Header navigation is now client-aware via `usePathname`, marks the current route with `aria-current="page"`, and applies visible active styling while preserving route labels, runtime label, logo, and no-account mode.
- Validation: Targeted product-demo Playwright command ran the full product-demo spec with 17 browser tests; `pnpm lint`, `pnpm typecheck`, and `git diff --check` passed.

## 105. Add No-Spend Loom Screenshot Capture Helper

Status: Complete on May 10, 2026.

- Owner type: Demo Tooling
- Goal: Provide a repeatable local script for capturing ignored Loom prep screenshots without committing generated artifacts.
- Scope: Script/docs/test only; no screenshot artifacts committed.
- Likely files: `scripts/capture-demo-screenshots.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`, `docs/DEMO_VIDEO_CHECKLIST.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Acceptance criteria: Script requires an explicit local `--url`, writes only under ignored `demo-artifacts/`, redacts no secrets because it captures local pages only, and has a dry-run or help mode covered by tests.
- Validation commands: script help/dry-run, focused Vitest, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with package/script/release-script edits.
- Completed notes: Verified existing `scripts/capture-demo-screenshots.mjs` and `pnpm demo:screenshots:json` dry-run behavior. The script defaults to no-browser/no-file dry run, reports `generatedMediaArtifact: false`, requires `--run` for intentional capture, writes captures under ignored `demo-artifacts/screenshots`, and is covered by release-script tests. No screenshot artifacts were created or committed.
- Validation: `pnpm demo:screenshots:json`, focused release-script Vitest for dry-run screenshot capture, `pnpm lint`, and `git diff --check` passed.

## 106. Add Optional Live Public API Smoke Transcript Stub

Status: Complete on May 10, 2026.

- Owner type: Live Data / Submission Docs
- Goal: Add a paste-safe transcript stub for optional `pnpm smoke:live:json` evidence if the user explicitly chooses to run live public API checks before submission.
- Scope: Docs only; no live call by default and no release-evidence refresh.
- Likely files: `docs/LIVE_API_SMOKE_TEMPLATE.md`, `docs/SUBMISSION_COMMAND_TRANSCRIPT_TEMPLATE.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Acceptance criteria: Template includes command, date, row/count summary, Dallas non-ZIP live caveat, Dallas ZIP fallback caveat, Austin/Houston sample-first caveats, and says optional network smoke is not release evidence unless Task 35 runs.
- Validation commands: manual wording/path check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-doc tasks.
- Completed notes: Added `docs/LIVE_API_SMOKE_TEMPLATE.md` with paste-safe fields for optional `pnpm smoke:live:json` output, including Dallas non-ZIP live caveat, Dallas ZIP fallback caveat, Austin monthly sample-first caveat, Houston sample-first/no-precise-location caveat, and release-evidence warning. Linked it from the submission command transcript template.
- Validation: Path/wording checks, `pnpm lint`, and `git diff --check` passed. No live API smoke was run.

## 107. Add Provider-Gated Media Honesty Note To Health UI

Status: Complete on May 10, 2026.

- Owner type: Provider / UI Honesty
- Goal: Make app-visible health/demo surfaces state that Fal media proof is script-only and not wired into dashboard generation.
- Scope: UI/docs only; no Fal call and no media generation.
- Likely files: `apps/web/app/demo-readiness/page.tsx`, `tests/e2e/product-demo.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Acceptance criteria: `/demo-readiness` visibly says normal dashboard generation does not call Fal or create image/video, while `RUN_LIVE_FAL_SMOKE=1` remains optional/script-level proof; E2E asserts the boundary.
- Validation commands: targeted Playwright demo-readiness test, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with demo-readiness route/test edits.
- Completed notes: `/demo-readiness` safety model now explicitly says Fal media proof is optional script-only and normal dashboard generation does not call Fal or create image/video artifacts. Product-demo E2E asserts this boundary.
- Validation: Targeted demo-readiness Playwright command ran the full product-demo spec with 17 browser tests; `pnpm lint` and `git diff --check` passed.

## 108. Reconcile Remaining Visual Audit Risks Into Queue

Status: Complete on May 10, 2026.

- Owner type: Planning / QA
- Goal: Convert any remaining unresolved `docs/VISUAL_UI_UX_AUDIT.md` P1/P2 items into scoped future tasks after the first polish fixes land.
- Scope: Planning/docs only; no product source changes.
- Likely files: `TASKS.md`, `HERMES_PROGRESS.md`, optionally `docs/VISUAL_UI_UX_AUDIT.md`.
- Risk level: Low.
- Acceptance criteria: Remaining mobile prompt ordering, source-card density, nav active state, saved empty CTA, and technical-label polish risks are either completed, deferred, or represented as scoped tasks with validation commands.
- Validation commands: manual audit/queue consistency check, `git diff --check`.
- Can run in parallel: Yes with implementation tasks if it does not edit the same task/progress files.
- Completed notes: Reconciled the visual audit after Tasks 99-107. Chart rendering, dashboard status strip, filter label polish, saved empty CTA, mobile prompt-first layout, sources summary legend, active nav state, screenshot helper, live-smoke template, and Fal media honesty are complete. Remaining lower-priority visual risk is source-card density/lower-card whitespace, captured in the replenished data-realism/demo-stability queue below.
- Validation: Manual audit/queue consistency check and `git diff --check` passed.

## 109. Add Server-Only OpenAI Assist Wrapper

Status: Complete on May 10, 2026.

- Owner type: Provider / Governance / QA
- Goal: Standardize optional OpenAI use for CivicCanvas prompt-assist and source-aware summary wording while preserving deterministic public-data authority and key-missing fallback.
- Scope: Server-only provider wrapper, shared structured-output schemas, health/readiness metadata, guided-vs-AI-assisted UI copy, docs/env examples, and tests.
- Likely files: `apps/web/lib/openai-provider.ts`, `packages/shared/src/schemas/index.ts`, `apps/web/app/api/health/route.ts`, `apps/web/app/explore/page.tsx`, `apps/web/components/app-shell.tsx`, `apps/web/components/prompt-bar.tsx`, `apps/web/test/openai-provider.test.ts`, `apps/web/test/api-contracts.test.ts`, `tests/e2e/product-demo.spec.ts`, `.env.example`, `README.md`, `CODEBASE_OVERVIEW.md`, `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Medium.
- Acceptance criteria: `OPENAI_API_KEY` is checked only through server env without printing; readiness reports present/missing only; structured output schemas validate PromptAssistResult, SourceAwareSummary, and UnsupportedPromptSuggestion; invalid/missing-key OpenAI output falls back deterministically; tests cover key-missing fallback, invalid schema fallback, no secret leakage, mocked happy path, unsupported prompt boundaries, hidden-field safety, and non-catalog dataset rejection; UI says "Guided suggestions" when no key is active.
- Validation commands: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm governance:audit`, `pnpm data:quality`, `pnpm --filter @texas-data-canvas/mcp-server build`, `pnpm test:e2e` if UI changed, `git diff --check`.
- Can run in parallel: No with schema/provider/API/UI test edits.
- Completed notes: Added `apps/web/lib/openai-provider.ts` using fetch-based server-side OpenAI calls with JSON response validation and deterministic fallbacks; added shared structured schemas/types; health metadata now exposes OpenAI readiness without key values or env var names; `/explore` shows "Guided suggestions" unless the server-side key is active; docs and `.env.example` document `OPENAI_API_KEY=` without a real value.
- Validation: Focused OpenAI/API Vitest passed; `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm governance:audit`, `pnpm data:quality`, MCP server build, targeted product-demo Playwright run, and `git diff --check` passed. No live OpenAI calls were made.
---

# Data Realism And Demo Stability Queue

Last replenished: May 10, 2026 after Task 108 visual-risk reconciliation and Task 109 OpenAI boundary work. This queue prioritizes real demo data paths, fixture/data-loader realism, local/editable browser demo records, live/API proof where safe, and honest mock/live boundaries. Gated work remains blocked unless explicitly approved: Task 35 release-evidence refresh, Task 55 backend persistence/migrations, production data operations, external deployment mutation, secrets/auth/billing, destructive database work, and paid live provider calls without the relevant env gate.

## 110. Move Seed Canvas Lookup To Data Loader Fixture

Status: Complete on May 10, 2026.

- Owner type: Backend/API / Data realism
- Goal: Replace hardcoded seed canvas prompt mapping inside `/api/canvas/[id]` with a checked-in fixture loaded through `apps/web/lib/data.ts`.
- Scope: API seed lookup only; preserve generated seed canvas behavior and no-backend-persistence honesty.
- Likely files: `data/seed-canvases.json`, `apps/web/lib/data.ts`, `apps/web/app/api/canvas/[id]/route.ts`, `apps/web/test/canvas-seed-route.test.ts`, docs if route wording changes, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Data realism classification: Current route-level object is hardcoded UI/API mock-like seed mapping and should be replaced with fixture file through normal data loader.
- Acceptance criteria: Seed IDs/prompts live in validated fixture data; route reads via data loader/repository helper; tests prove known seed IDs and unknown IDs use the same route path; docs/copy still state this is a seed/demo helper, not database persistence.
- Validation commands: focused seed route Vitest, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `git diff --check`.
- Can run in parallel: No with seed route/data-loader edits.
- Completed notes: Added validated `data/seed-canvases.json`, added `getSeedCanvasPrompts()`/`getSeedCanvasPrompt()` data-loader helpers, and changed `/api/canvas/[id]` to read fixture-backed seed prompts instead of route-local hardcoded prompt objects. Route behavior remains a seed/demo helper that regenerates governed canvases and does not imply backend persistence.
- Validation: RED focused seed-loader test failed before helper implementation; GREEN focused seed route Vitest passed; `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `git diff --check` passed.

## 111. Add Data Realism Audit Script

Status: Complete on May 10, 2026.

- Owner type: QA / Data governance
- Goal: Add a no-network script that classifies demo data sources as fixture-loader, deterministic fallback, browser-local, hardcoded route seed, fake provider metadata, or blocked.
- Scope: Audit/report only; no product behavior changes.
- Likely files: `scripts/data-realism-audit.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`, `docs/SAMPLE_AND_PERSISTENCE_REALNESS.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Data realism classification: Converts current manual policy into repeatable proof.
- Acceptance criteria: Script reports catalog samples, gallery fixtures, seed canvas fixtures, browser-local saved canvases, OpenAI readiness fallback, Fal script-only proof, and flags any remaining hardcoded demo arrays requiring review; output is no-network/non-mutating and redacts env values.
- Validation commands: script JSON run, focused release-script Vitest, `pnpm lint`, `pnpm test`, `git diff --check`.
- Can run in parallel: No with release-script/package edits.
- Completed notes: Added `scripts/data-realism-audit.mjs` plus `pnpm data:realism`/`pnpm data:realism:json`. The report classifies catalog/sample/gallery/seed fixture paths, browser-local saved canvases, optional OpenAI assist, Fal script-only media proof, and remaining hardcoded UI review items without using network, mutating files, or reading/printing env values. Updated realness docs and release-script tests.
- Validation: RED focused release-script test failed before the script existed; `pnpm data:realism:json`, focused release-script Vitest, `pnpm lint`, `pnpm test`, and `git diff --check` passed.

## 112. Add API-Backed Prompt Example Source

Status: Complete on May 10, 2026.

- Owner type: UI/API / Data realism
- Goal: Move hardcoded `/explore` prompt example chips into a shared seed/read-model helper or API-backed metadata path.
- Scope: Prompt examples only; do not change dashboard generation semantics.
- Likely files: `apps/web/lib/data.ts` or shared prompt helper, optional `apps/web/app/api/*`, `apps/web/components/app-shell.tsx`, `apps/web/test/*`, `tests/e2e/product-demo.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Medium.
- Data realism classification: Current `promptExamples` is hardcoded UI config; acceptable as navigation config but should move to a fixture/read model if treated as demo records.
- Acceptance criteria: Prompt examples are loaded from a validated fixture/helper also used by unsupported suggestion copy; tests prove UI examples and suggestion fallbacks stay aligned and route through the shared source.
- Validation commands: focused Vitest, `pnpm lint`, `pnpm typecheck`, targeted product-demo Playwright, `git diff --check`.
- Can run in parallel: No with app-shell/prompt helper edits.
- Completed notes: Added validated `data/prompt-examples.json`, loaded prompt examples through `getPromptExamples()`, passed them from `/explore` into `AppShell`, and reused the same fixture-backed examples for deterministic/OpenAI fallback prompt suggestions. Updated the data-realism audit so prompt examples are classified as fixture file through data loader; remaining hardcoded review is only static header navigation config.
- Validation: RED prompt-example loader test failed before `getPromptExamples()` existed; focused prompt/OpenAI/release-script Vitest passed; `pnpm lint`, `pnpm typecheck`, targeted product-demo Playwright, `pnpm data:realism:json`, and `git diff --check` passed.

## 113. Strengthen Gallery Fixture Read Path Proof

Status: Complete on May 10, 2026.

- Owner type: QA / Data realism
- Goal: Prove checked-in gallery canvases are loaded through the normal data loader and rendered through `/gallery`, not imported directly by UI components.
- Scope: Tests/docs only unless a drift is found.
- Likely files: `apps/web/lib/data.ts`, `apps/web/test/gallery-fixtures.test.ts` or `dashboard.test.ts`, `tests/e2e/product-demo.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Data realism classification: Fixture files through data loader are acceptable.
- Acceptance criteria: Tests assert gallery route/card count matches data-loader fixture count, fixtures validate with source/method attribution, and hidden fields remain absent.
- Validation commands: focused Vitest, targeted gallery Playwright, `pnpm lint`, `pnpm test`, `git diff --check`.
- Can run in parallel: Yes unless editing the same gallery tests.
- Completed notes: Strengthened data-loader proof for checked-in gallery canvases. Unit coverage now asserts `getCuratedGalleryCanvases()` count matches `data/gallery/*.canvas.json`, validates source/method attribution, and guards `/gallery` route/component files against direct fixture JSON imports. Browser coverage now asserts the gallery route renders four normal "Open in explore" actions from the loaded canvases.
- Validation: `pnpm test -- apps/web/test/dashboard.test.ts`, targeted gallery Playwright command (project script ran full product-demo spec with 17 browser tests), and `git diff --check` passed.

## 114. Add Browser-Local Saved Canvas Edit Proof

Status: Complete on May 10, 2026.

- Owner type: UI / Data realism
- Goal: Demonstrate saved demo records are editable/replaceable through normal product flows rather than fake immutable state.
- Scope: Browser-local saved canvas title/prompt metadata editing or focused test proof if already possible.
- Likely files: `apps/web/components/saved-canvases.tsx`, `apps/web/lib/saved-canvases.ts`, `apps/web/test/saved-canvases.test.ts`, `tests/e2e/product-demo.spec.ts`, docs, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Medium.
- Data realism classification: Browser-local persistence is acceptable if editable and clearly local.
- Acceptance criteria: User can update saved canvas metadata locally or tests prove existing duplicate/delete/import/export flows cover replaceability; UI copy remains browser-local/no-backend.
- Validation commands: focused saved-canvas Vitest, targeted saved Playwright, `pnpm lint`, `pnpm typecheck`, `git diff --check`.
- Can run in parallel: No with saved-page edits.
- Completed notes: Added browser-local saved-canvas metadata editing for title and prompt. Edits update the normal saved-canvas localStorage record, the nested CanvasDocument title/prompt used when opening back into `/explore`, and exported/share bundles; UI copy says this is browser-local and not backend persistence. Added unit and Playwright proof.
- Validation: `pnpm test -- apps/web/test/saved-canvases.test.ts`, `pnpm typecheck`, `pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "saved bundle"`, `pnpm lint`, and `git diff --check` passed. The first saved-flow Playwright run failed on a stale duplicate-title assertion, then passed after updating the assertion to the edited title.

## 115. Add OpenAI No-Key And Mocked-Live Route Smoke

Status: Complete on May 10, 2026.

- Owner type: Provider / QA
- Goal: Add an API-level smoke route or script proving OpenAI assist remains server-only, no-key deterministic by default, and schema-validated with mocked live-shaped output.
- Scope: No live OpenAI call by default; use mocked provider output unless `RUN_LIVE_OPENAI_SMOKE=1` is deliberately added in a later task.
- Likely files: `apps/web/lib/openai-provider.ts`, `apps/web/test/openai-provider.test.ts`, optional script/docs, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Medium.
- Data realism classification: Provider-gated fallback metadata is acceptable only when labeled and tested.
- Acceptance criteria: No-key and mocked-valid/mocked-invalid paths are covered through the same wrapper used by app code; no secrets/env var values leak in output.
- Validation commands: focused OpenAI provider Vitest, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `git diff --check`.
- Can run in parallel: No with OpenAI provider tests.
- Completed notes: Added `/api/provider/openai-smoke`, a no-network route that proves the no-key deterministic fallback and mocked OpenAI-shaped structured-output path through the same server-only wrapper. The route returns readiness, provider mode, catalog dataset candidates, boundaries, and zero live calls without echoing keys or env var names. Added API contract coverage.
- Validation: Focused API/OpenAI Vitest, `pnpm typecheck`, `pnpm lint`, and `git diff --check` passed. No live OpenAI call was made.

## 116. Add Optional Live OpenAI Smoke Gate

Status: Complete on May 10, 2026.

- Owner type: Provider / Live proof
- Goal: Add a tiny env-gated `RUN_LIVE_OPENAI_SMOKE=1` proof script that makes one minimal server-side OpenAI structured-output call when credentials are available.
- Scope: Script/docs/test; default path must be no-spend and no-network.
- Likely files: `scripts/openai-smoke.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`, `README.md`, docs, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Medium to High due to live provider spend; run live only if credentials and env gate are present.
- Data realism classification: Live provider proof is acceptable if gated, purposeful, redacted, and fallback remains deterministic.
- Acceptance criteria: Default script reports skipped/no-key without network; live mode makes one minimal call, validates schema, writes no committed artifact, and redacts all secrets; tests cover no-key and redaction.
- Validation commands: no-key script JSON, focused release-script Vitest, `pnpm lint`, `pnpm test`; optional live run only with `RUN_LIVE_OPENAI_SMOKE=1` and key present; `git diff --check`.
- Can run in parallel: No with provider smoke script edits.
- Completed notes: Added `scripts/openai-smoke.mjs` plus `pnpm provider:openai:smoke`/`:json`. Default mode is no-spend/no-network and reports skipped fallback proof. Live mode requires `RUN_LIVE_OPENAI_SMOKE=1` plus a server-side OpenAI key, makes at most one structured-output call, validates provider/catalog/safety shape, redacts secret values, and writes no artifacts. In this environment the shell key was missing, so live proof was blocked at the missing-key gate and no OpenAI request was made.
- Validation: Initial no-spend script run failed because the catalog JSON is an array rather than an object with `datasets`; fixed the loader, then `pnpm provider:openai:smoke:json`, missing-key live-gate check, focused OpenAI smoke release-script tests, `pnpm lint`, focused release-script Vitest, and `git diff --check` passed. Live OpenAI call count: 0 due missing key.

## 117. Reconcile Realness Audit After OpenAI Boundary Change

Status: Complete on May 10, 2026.

- Owner type: Docs / Realness
- Goal: Update `REALNESS_AUDIT.md` so OpenAI is no longer described as absent while preserving no-LLM-dashboard-generation honesty.
- Scope: Docs only.
- Likely files: `REALNESS_AUDIT.md`, `QA_FINDINGS.md` if active risks change, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Data realism classification: Provider metadata must be labeled optional/server-only and not default-local.
- Acceptance criteria: Audit says OpenAI is optional server-side prompt/summary assist, disabled without key, schema-validated, and not dashboard/code/SQL generation; no secret values or live proof overclaims.
- Validation commands: manual wording check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-doc tasks that do not edit the same files.
- Completed notes: Updated `REALNESS_AUDIT.md` so OpenAI is described as optional server-side prompt/summary assist rather than absent, while preserving the deterministic dashboard-generation boundary, no-key fallback, schema validation, catalog allowlists, no secret echo, and no live proof overclaims.
- Validation: Manual wording check, `pnpm lint`, and `git diff --check` passed.

## 118. Improve Source Card Density Without Hiding Caveats

Status: Complete on May 10, 2026.

- Owner type: UI / Demo polish
- Goal: Address remaining visual audit source-card density/lower whitespace while keeping catalog caveats and hidden-field warnings visible.
- Scope: `/sources` layout/copy only; do not change catalog facts.
- Likely files: `apps/web/app/sources/page.tsx`, `tests/e2e/sources.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Data realism classification: Catalog fixture through data loader remains acceptable; UI must not turn sample/live metadata into fake claims.
- Acceptance criteria: Source cards are easier to scan, Dallas live-promoted status remains honest, sample-first sources remain labeled, hidden-field warnings remain visible, and E2E covers the key labels.
- Validation commands: targeted sources Playwright, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with sources page/test edits.

- Completed notes: Reworked source cards so live verification and field confidence share a compact two-column evidence panel on wider screens. Dallas live-promoted labels, sample-first labels, hosted-beta caveats, hidden-field warnings, source caveats, and filters remain visible; no catalog facts or live/sample classifications changed.
- Validation: `pnpm test:e2e -- tests/e2e/sources.spec.ts`, `pnpm lint`, and `git diff --check` passed.

## 119. Add Live Public API Smoke If Network Proof Is Available

Status: Complete on May 10, 2026.

- Owner type: Live data / QA
- Goal: Run or strengthen an approved live public API proof for the narrow Dallas aggregate path while preserving sample fallback for ZIP/Austin/Houston.
- Scope: Existing live smoke/proof scripts and docs; no catalog promotion unless evidence supports it.
- Likely files: `scripts/smoke-live.mjs`, `docs/LIVE_API_SMOKE_TEMPLATE.md`, tests/docs, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Medium due to network dependency.
- Data realism classification: Live public API proof is preferred for supported Dallas aggregate; deterministic fallback remains acceptable and clearly labeled for unsupported shapes.
- Acceptance criteria: If network is available, run the existing live smoke and record sanitized counts/caveats; if not, preserve no-network proof and report the blocker. No unsupported dataset/field is promoted from smoke alone.
- Validation commands: `pnpm live:fallback-proof:json`, optional `pnpm smoke:live:json`, focused tests if script changes, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes if no script edits; no with live-smoke script changes.
- Completed notes: Ran the existing no-network live/fallback proof and optional live public API smoke. The live smoke made one approved public Dallas Socrata aggregate check for 2024 category counts, returned 3 live aggregate rows, and did not promote Dallas ZIP, Austin monthly, or Houston sample-first dashboards. Added paste-safe evidence to the live API smoke template.
- Validation: `pnpm live:fallback-proof:json`, `pnpm smoke:live:json`, `pnpm lint`, and `git diff --check` passed. Live public API call count: 1.

---

# Final Submission And GitHub Readiness Queue

Last replenished: May 10, 2026 after Tasks 116 and 118 completed and no pending tasks remained. This queue keeps CivicCanvas public naming, Brainforge/Vicinity Texas Open Data fit, MCP/agent skill proof, dataset provenance, sample/live boundary honesty, and local-only submission readiness. Do not push without explicit instruction. Gated/high-risk work remains blocked unless selected with approval: production deployment mutation, release-evidence refresh, backend persistence/database migrations, auth/billing, destructive data operations, and paid provider calls beyond env-gated smoke proof.

## 120. Add MCP Demo Transcript Fixture

Status: Pending.

- Owner type: MCP / Submission Proof
- Goal: Add a paste-safe, no-secret transcript template showing the exact MCP commands/tools judges should see for Brainforge proof.
- Scope: Docs/template only; do not run external MCP clients or mutate generated release evidence.
- Likely files: `docs/MCP_DEMO_TRANSCRIPT_TEMPLATE.md`, `README.md`, `docs/README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Data realism classification: MCP catalog/query proof should read approved catalog/sample/live adapters through existing tool paths; no hardcoded UI mock data.
- Acceptance criteria: Template includes source discovery, bounded query, catalog health, canvas spec generation, Miro preview-only caveat, no secret fields, and sample/live labels; README/docs index link it.
- Validation commands: manual path/wording check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-doc tasks that do not edit README/docs index.

## 121. Add Submission Readiness Script OpenAI Smoke Coverage

Status: Pending.

- Owner type: QA / Provider Readiness
- Goal: Include the no-spend OpenAI smoke command in the submission readiness report so judges/developers can see provider proof status without spending credits.
- Scope: Readiness script/report/tests only; default must remain no-network.
- Likely files: `scripts/submission-readiness.mjs`, `apps/web/test/release-scripts.test.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Data realism classification: Provider-gated fallback metadata is acceptable if clearly labeled and replaceable by env-gated live proof.
- Acceptance criteria: `pnpm submission:readiness:json` reports OpenAI no-spend command, live gate env, default expected live call count 0, and missing/present key status without values or env file reads.
- Validation commands: `pnpm submission:readiness:json`, focused release-script Vitest, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with submission-readiness script edits.

## 122. Add Demo Readiness UI Link To OpenAI Smoke

Status: Pending.

- Owner type: UI / Provider Honesty
- Goal: Surface the new OpenAI smoke gate on `/demo-readiness` without implying dashboards are LLM-generated.
- Scope: Demo-readiness UI and browser assertion only.
- Likely files: `apps/web/app/demo-readiness/page.tsx`, `tests/e2e/product-demo.spec.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Data realism classification: Fake provider metadata must be labeled; default local demo remains deterministic.
- Acceptance criteria: UI lists `pnpm provider:openai:smoke:json`, live gate `RUN_LIVE_OPENAI_SMOKE=1`, default zero-call mode, and states OpenAI does not generate dashboard code/SQL.
- Validation commands: targeted demo-readiness Playwright, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with demo-readiness route/test edits.

## 123. Add README MCP Quick-Proof Commands

Status: Pending.

- Owner type: Docs / Submission Readiness
- Goal: Make the README judge-scannable for MCP/agent-skill proof without rebranding internal packages.
- Scope: README docs only; no code behavior changes.
- Likely files: `README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Data realism classification: Docs must say MCP tools use approved catalog/query paths, not hardcoded demo arrays.
- Acceptance criteria: README includes concise MCP server run/test commands, agent skill path, and honest preview-only Miro note in the submission checklist or verification section.
- Validation commands: manual path/command check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-README tasks.

## 124. Add Data Realism CI Guard For Component Demo Arrays

Status: Pending.

- Owner type: QA / Data Realism
- Goal: Strengthen `pnpm data:realism:json` so future hardcoded demo arrays inside UI components are detected as review items.
- Scope: Audit script/test only; do not rewrite product data paths unless a confirmed blocker appears.
- Likely files: `scripts/data-realism-audit.mjs`, `apps/web/test/release-scripts.test.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Medium.
- Data realism classification: Hardcoded UI mock arrays should be flagged unless classified as static nav/config.
- Acceptance criteria: Audit explicitly scans known component paths for prompt/demo/gallery/seed arrays, keeps header nav classified as static navigation config, and tests prove no secret/env values are printed.
- Validation commands: `pnpm data:realism:json`, focused release-script Vitest, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with data-realism audit script edits.

## 125. Add Local Demo Smoke Checklist For Browser Saved Edits

Status: Pending.

- Owner type: Docs / Demo Reliability
- Goal: Add a concise manual checklist for recording the saved-canvas edit/export/share path added in Task 114.
- Scope: Docs only.
- Likely files: `docs/LOCAL_DEMO_SMOKE_CHECKLIST.md`, `HACKATHON_SUBMISSION_GUIDE.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Data realism classification: Browser-local persistence is acceptable if documented as local-only and editable through normal product flow.
- Acceptance criteria: Checklist covers save, edit title/prompt, reopen, export, share hash, delete, and no-backend-persistence narration.
- Validation commands: manual wording/path check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-doc tasks that do not edit submission guide.

## 126. Add Public URL Smoke Placeholder To Submission Guide

Status: Pending.

- Owner type: Docs / Hosted Readiness
- Goal: Make the submission guide clearer about what to fill in if a hosted URL is available versus local-only Loom.
- Scope: Docs only; no deployment or push.
- Likely files: `HACKATHON_SUBMISSION_GUIDE.md`, `docs/HOSTED_SMOKE_TEMPLATE.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Data realism classification: Hosted smoke must not turn sample fallback or historical release evidence into current live proof.
- Acceptance criteria: Guide has a fill-in placeholder for hosted URL smoke result, command, date, firewall/rate-limit caveat, and fallback if no hosted URL exists.
- Validation commands: manual wording/path check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-submission-guide tasks.

## 127. Add Source Provenance Mini Table To README

Status: Pending.

- Owner type: Docs / Data Provenance
- Goal: Add a compact README table classifying Dallas, Austin, Houston, and Texas spending source status for judges.
- Scope: README docs only; do not change catalog facts.
- Likely files: `README.md`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low.
- Data realism classification: Fixture/catalog metadata and deterministic samples are acceptable if clearly labeled; live Dallas aggregate proof must remain narrow.
- Acceptance criteria: Table distinguishes live-promoted Dallas aggregate fields, Dallas ZIP fallback, Austin/Houston sample-first, Texas spending coming-later metadata, source URLs/catalog path, and caveats.
- Validation commands: manual catalog/README consistency check, `pnpm lint`, `git diff --check`.
- Can run in parallel: Yes with non-README tasks.

## 128. Add No-Push Local Branch Readiness Snapshot

Status: Pending.

- Owner type: Release Hygiene / GitHub Readiness
- Goal: Add a local-only command/template that reports branch, ahead count, untracked external recommendations, and no-push status before final handoff.
- Scope: Script/docs/test; must not push or mutate remotes.
- Likely files: `scripts/local-git-readiness.mjs`, `package.json`, `apps/web/test/release-scripts.test.ts`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Data realism classification: Not data-path-related; supports safe local GitHub readiness handoff.
- Acceptance criteria: JSON report shows current branch/ahead state, preserved untracked external files by name only, whether working tree has tracked changes, and warns that push is intentionally not run.
- Validation commands: script JSON run, focused release-script Vitest, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with package/release-script test edits.

## 129. Add Submission Copy Boundary Assertions

Status: Pending.

- Owner type: QA / Demo Honesty
- Goal: Add tests that key README/submission guide phrases do not overclaim production auth, durable backend persistence, hosted readiness, live broad data, or LLM-generated dashboards.
- Scope: Docs assertion test only.
- Likely files: `apps/web/test/release-scripts.test.ts`, maybe `scripts/docs-consistency.mjs`, `TASKS.md`, `HERMES_PROGRESS.md`.
- Risk level: Low to Medium.
- Data realism classification: Ensures docs keep mock/live/local/provider boundaries honest.
- Acceptance criteria: Tests assert required honest phrases and reject common overclaim phrases in current submission docs; no network or file mutation.
- Validation commands: focused release-script Vitest, `pnpm lint`, `git diff --check`.
- Can run in parallel: No with release-script/docs-consistency test edits.
