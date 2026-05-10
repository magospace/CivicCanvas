# Development Roadmap

Prioritized roadmap for Texas Data Canvas, based on `CODEBASE_OVERVIEW.md`, `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, and `AGENTS.md`.

Current baseline:

- Texas Data Canvas is a no-account, no-database public-data explorer.
- Dashboards are generated only for approved workflows and rendered from validated `CanvasDocument` JSON through an allowlisted React registry.
- Saved canvases are browser-local through `localStorage` and portable JSON/hash bundles.
- Miro support is preview/spec-only.
- Live data is deliberately limited: Dallas has verified non-ZIP live aggregates; Austin and Houston dashboards remain sample-first for current generated flows.

## Phase 0: Stabilization / Repo Cleanup

Goal: remove stale onboarding signals and make the current repo state easy for agents and developers to trust before adding features.

### 0.1 Reconcile Current Onboarding Docs

| Field | Details |
|---|---|
| Goal | Align root onboarding docs after recent README and `.env.example` updates. |
| Why it matters | `CODEBASE_OVERVIEW.md`, `DEVELOPMENT_GUIDE.md`, and `AGENTS.md` still mention stale README/env-example gaps after those files have been refreshed. |
| Files likely involved | `CODEBASE_OVERVIEW.md`, `DEVELOPMENT_GUIDE.md`, `AGENTS.md`, `README.md`, `apps/web/README.md`, `.env.example` |
| Dependencies | Confirm the current README/env state first; do not update release evidence unless deliberately refreshing release proof. |
| Risk level | Low |
| Acceptance criteria | Current docs no longer tell agents to fix already-fixed README or env-example drift; no product behavior changes. |
| Suggested validation command | `pnpm lint` |

### 0.2 Add Current Docs Index For Historical Docs

| Field | Details |
|---|---|
| Goal | Add a small docs index that distinguishes current docs from historical milestone docs. |
| Why it matters | The `docs` folder contains historical plans that can conflict with the current architecture and confuse new agents. |
| Files likely involved | `docs/README.md`, optionally `README.md` |
| Dependencies | Keep historical docs intact; link to current authoritative docs instead of rewriting old milestones. |
| Risk level | Low |
| Acceptance criteria | A new developer can identify current docs, historical docs, release docs, and governance docs without opening multiple milestone files. |
| Suggested validation command | `pnpm lint` |

### 0.3 Document Release Evidence Warning Policy

| Field | Details |
|---|---|
| Goal | Keep the release evidence commit mismatch documented until the full release gate is intentionally rerun. |
| Why it matters | `docs/release-evidence.json` records historical gate evidence; changing its commit field without rerunning release gates weakens governance history. |
| Files likely involved | `GOVERNANCE_NOTE.md`, `docs/release-evidence.json`, `DEVELOPMENT_GUIDE.md`, `docs/V1_3_HOSTED_LAUNCH_READINESS_PLAN.md` |
| Dependencies | Do not refresh `docs/release-evidence.json` unless the full release evidence workflow has actually been rerun. |
| Risk level | Medium |
| Acceptance criteria | Governance warning cause and release-time remediation are documented; `pnpm governance:audit` still passes or reports only the known warning. |
| Suggested validation command | `pnpm governance:audit` |

### 0.4 Clarify Save And Seed API Boundaries

| Field | Details |
|---|---|
| Goal | Make `/api/canvas/save` and `/api/canvas/[id]` unmistakably validation/seed helpers, not persistence endpoints. |
| Why it matters | The current architecture has no database; confusing these routes for backend storage can lead to unsafe feature work. |
| Files likely involved | `apps/web/app/api/canvas/save/route.ts`, `apps/web/app/api/canvas/[id]/route.ts`, `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, `apps/web/test/*` |
| Dependencies | Preserve route behavior unless adding comments or tests only. |
| Risk level | Medium |
| Acceptance criteria | Docs or tests state validation-only save behavior, hardcoded seed lookup, and 404 behavior for unknown seed IDs. |
| Suggested validation command | `pnpm test` |

### 0.5 Record A Clean Local Baseline

| Field | Details |
|---|---|
| Goal | Capture the latest local validation status after docs cleanup and known governance warnings are understood. |
| Why it matters | Future feature agents need a trustworthy starting point and should not confuse known release-evidence warnings with product failures. |
| Files likely involved | `QA_FINDINGS.md`, `GOVERNANCE_NOTE.md`, `DEVELOPMENT_GUIDE.md`, `docs/IMPLEMENTATION_STATUS.md` |
| Dependencies | Run safe local commands; skip network/deployment checks unless a target URL or credentials exist. |
| Risk level | Low |
| Acceptance criteria | Current local command results and skipped environment-dependent checks are documented with dates and known warnings. |
| Suggested validation command | `pnpm lint && pnpm typecheck && pnpm test && pnpm governance:audit && pnpm data:quality` |

## Phase 1: Core Product Flow

Goal: strengthen prompt-to-dashboard generation, saved canvases, source transparency, and route boundaries while preserving the governed no-database model.

### 1.1 Add Saved Canvas Import/Export Unit Tests

| Field | Details |
|---|---|
| Goal | Add focused tests for saved-canvas bundle import/export and invalid import handling. |
| Why it matters | Saved canvases are local-only, but import/export/share is the portability path and must reject malformed or unsafe bundles. |
| Files likely involved | `apps/web/lib/saved-canvases.ts`, `apps/web/test/*`, `packages/shared/src/persistence/index.ts`, `packages/shared/test/*` |
| Dependencies | Keep `localStorage` architecture; do not add backend storage. |
| Risk level | Medium |
| Acceptance criteria | Tests cover a valid bundle round trip and at least one malformed or invalid import path. |
| Suggested validation command | `pnpm test` |

### 1.2 Add API Tests For `/api/canvas/save`

| Field | Details |
|---|---|
| Goal | Test that the save route validates canvases without implying backend persistence. |
| Why it matters | The route returns a save-like response, but actual persistence is browser-local. |
| Files likely involved | `apps/web/app/api/canvas/save/route.ts`, `apps/web/test/*` |
| Dependencies | Reuse existing valid `CanvasDocument` fixtures or generated canvases. |
| Risk level | Medium |
| Acceptance criteria | Tests cover valid canvas validation and invalid canvas rejection; names/assertions make validation-only behavior clear. |
| Suggested validation command | `pnpm test` |

### 1.3 Add API Tests For `/api/query`

| Field | Details |
|---|---|
| Goal | Add route-level tests for direct bounded query execution. |
| Why it matters | `/api/query` is a public write-like route that must preserve strict schema parsing, bounded fields, and governed error output. |
| Files likely involved | `apps/web/app/api/query/route.ts`, `apps/web/lib/api.ts`, `apps/web/test/*` |
| Dependencies | Do not change query semantics unless tests expose a real bug. |
| Risk level | Medium |
| Acceptance criteria | Tests cover a valid `BoundedQuerySpec`, invalid request body, and governed public error behavior. |
| Suggested validation command | `pnpm test` |

### 1.4 Improve Unsupported Prompt Guidance

| Field | Details |
|---|---|
| Goal | Make unsupported and sensitive prompt responses include exact supported examples and approved source suggestions. |
| Why it matters | Prompt parsing is intentionally narrow; better recovery copy keeps users inside approved data flows. |
| Files likely involved | `packages/shared/src/prompt/index.ts`, `apps/web/lib/dashboard.ts`, `apps/web/components/prompt-bar.tsx`, `apps/web/test/dashboard.test.ts` |
| Dependencies | Do not add arbitrary prompt generation or unsupported dataset access. |
| Risk level | Medium |
| Acceptance criteria | Unsupported/sensitive prompts remain safe and include actionable examples; tests cover the new response shape or copy. |
| Suggested validation command | `pnpm lint && pnpm test` |

### 1.5 Add Data Mode And Fallback Visibility Coverage

| Field | Details |
|---|---|
| Goal | Verify generated dashboards preserve requested/rendered data mode, fallback reasons, caveats, and source attribution. |
| Why it matters | Live/sample boundaries are central to user trust and current product safety. |
| Files likely involved | `apps/web/lib/dashboard.ts`, `apps/web/test/dashboard.test.ts`, `packages/shared/test/query-and-canvas.test.ts` |
| Dependencies | Do not promote live adapters or change catalog fields unless a real mismatch is exposed. |
| Risk level | Medium |
| Acceptance criteria | Dallas, Austin, and Houston paths each assert data mode or fallback/source metadata. |
| Suggested validation command | `pnpm test` |

## Phase 2: Data Persistence And Integrations

Goal: make deliberate architecture decisions before adding durable storage or external side effects.

### 2.1 Write A Persistence Architecture Decision

| Field | Details |
|---|---|
| Goal | Decide whether saved canvases remain local-only or move to a backend store. |
| Why it matters | Persistence changes auth, privacy, schemas, API behavior, tests, deployment, and security boundaries. |
| Files likely involved | `docs/*`, `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, `AGENTS.md`, `SECURITY.md` |
| Dependencies | Product decision on accountless sharing versus user-owned saved canvases. |
| Risk level | High |
| Acceptance criteria | Decision records storage model, auth requirement, data retention, migration/test plan, env vars, and rollback approach. |
| Suggested validation command | `pnpm lint` |

### 2.2 Implement Durable Saved Canvas Storage If Approved

| Field | Details |
|---|---|
| Goal | Add database-backed or service-backed saved canvas persistence only after Phase 2.1 approval. |
| Why it matters | Durable sharing can improve reuse but introduces abuse, privacy, auth, and operational risk. |
| Files likely involved | New database/migration/config files if approved, `apps/web/app/api/canvas/save/route.ts`, `apps/web/app/api/canvas/[id]/route.ts`, `apps/web/lib/saved-canvases.ts`, `packages/shared/src/schemas/index.ts`, `SECURITY.md` |
| Dependencies | Explicit architecture approval, test database strategy, env variable docs, and security update. |
| Risk level | High |
| Acceptance criteria | Durable save/load works through validated schemas; local import/export remains available or has a documented migration path; security docs are updated. |
| Suggested validation command | `pnpm lint && pnpm typecheck && pnpm test && pnpm build` |

### 2.3 Design Miro Write Integration Before Building It

| Field | Details |
|---|---|
| Goal | Produce a Miro write-integration design before adding OAuth or board writes. |
| Why it matters | Current Miro support is preview-only; writes would add authenticated third-party side effects. |
| Files likely involved | `packages/shared/src/miro/index.ts`, `apps/web/app/api/export/miro-spec/route.ts`, `apps/web/components/inspector-panel.tsx`, `SECURITY.md`, docs under `docs` |
| Dependencies | Miro OAuth/API decision and explicit user confirmation UX. |
| Risk level | High |
| Acceptance criteria | Design covers OAuth, env vars, confirmation, safe output, source preservation, failure behavior, and tests; no board writes are added without approval. |
| Suggested validation command | `pnpm lint` |

### 2.4 Promote Live Data Only After Source Verification

| Field | Details |
|---|---|
| Goal | Resolve Dallas ZIP, Austin monthly, or Houston live access only through verified source-owned fields/views. |
| Why it matters | Current fallback boundaries prevent unsafe field exposure and misleading live dashboards. |
| Files likely involved | `data/catalog/approved-datasets.json`, `packages/shared/src/adapters/index.ts`, `packages/shared/src/query/index.ts`, `apps/web/lib/dashboard.ts`, `scripts/smoke-live.mjs`, tests under `packages/shared/test` and `apps/web/test` |
| Dependencies | External source verification, updated field classifications, fallback samples, and smoke coverage. |
| Risk level | High |
| Acceptance criteria | Live promotion includes source URL, safe field map, sample fallback, smoke test, dashboard caveats, and governance coverage. |
| Suggested validation command | `pnpm governance:audit && pnpm data:quality && pnpm smoke:live && pnpm test` |

### 2.5 Add Platform-Level Rate Limiting Plan

| Field | Details |
|---|---|
| Goal | Define production-grade rate limiting for public write-like routes. |
| Why it matters | `apps/web/middleware.ts` is in-memory defense-in-depth and not reliable as distributed/serverless abuse protection. |
| Files likely involved | `apps/web/middleware.ts`, `apps/web/next.config.mjs`, deployment docs under `docs`, hosting configuration if used |
| Dependencies | Hosting platform decision and deployment access. |
| Risk level | High |
| Acceptance criteria | Public POST routes have documented production rate-limit controls; local behavior remains predictable; deployment docs state the boundary. |
| Suggested validation command | `pnpm lint && pnpm test && pnpm smoke:deploy -- --url <url>` |

## Phase 3: UX Polish

Goal: improve clarity, scanning, responsiveness, and accessibility without weakening the validated canvas model.

### 3.1 Improve Responsive Layout For Dense Dashboards

| Field | Details |
|---|---|
| Goal | Make tables, maps, metrics, source cards, and inspector controls work cleanly across mobile and desktop widths. |
| Why it matters | Civic dashboards are dense; layout failures reduce trust and accessibility. |
| Files likely involved | `apps/web/components/canvas-blocks.tsx`, `apps/web/components/inspector-panel.tsx`, `apps/web/components/app-shell.tsx`, `apps/web/app/globals.css`, `tests/e2e/product-demo.spec.ts` |
| Dependencies | Preserve existing accessible labels and route flows. |
| Risk level | Medium |
| Acceptance criteria | No horizontal overflow, overlapping text, or unusable controls at common mobile/tablet/desktop sizes. |
| Suggested validation command | `pnpm lint && pnpm test:e2e` |

### 3.2 Polish Saved And Gallery Workflows

| Field | Details |
|---|---|
| Goal | Improve saved-canvas and gallery empty states, import/export errors, and open-in-explore transitions. |
| Why it matters | These flows are central to demos, handoffs, and repeatable exploration. |
| Files likely involved | `apps/web/components/saved-canvases.tsx`, `apps/web/components/gallery-canvas-list.tsx`, `apps/web/app/saved/page.tsx`, `apps/web/app/gallery/page.tsx`, `apps/web/lib/saved-canvases.ts` |
| Dependencies | Add or keep saved-canvas tests before changing behavior. |
| Risk level | Medium |
| Acceptance criteria | Clear empty/error states; gallery fixtures open in `/explore`; import/export/share remains local-only and validated. |
| Suggested validation command | `pnpm lint && pnpm test && pnpm test:e2e` |

### 3.3 Strengthen Accessibility For Generated Dashboards

| Field | Details |
|---|---|
| Goal | Improve keyboard and screen-reader behavior for dashboard blocks, filters, exports, and source/caveat panels. |
| Why it matters | Accessibility is product correctness for civic data tools. |
| Files likely involved | `apps/web/components/canvas-blocks.tsx`, `apps/web/components/prompt-bar.tsx`, `apps/web/components/inspector-panel.tsx`, `tests/e2e/product-demo.spec.ts` |
| Dependencies | Keep Playwright accessible names stable or update tests deliberately. |
| Risk level | Medium |
| Acceptance criteria | No keyboard traps; controls have useful accessible names; axe checks pass for primary flows. |
| Suggested validation command | `pnpm test:e2e` |

### 3.4 Improve Chart And Map Readability Within Existing Blocks

| Field | Details |
|---|---|
| Goal | Improve chart labels, legends, map fallback display, and responsive dimensions within the existing block registry. |
| Why it matters | Better visualization clarity improves trust without adding arbitrary generated UI. |
| Files likely involved | `apps/web/components/canvas-blocks.tsx`, `packages/shared/src/schemas/index.ts` only if display props are added, `data/gallery/*.canvas.json` if fixtures change |
| Dependencies | Preserve `CanvasDocument` validation and required source/method blocks. |
| Risk level | Medium |
| Acceptance criteria | Existing canvases render clearer labels/legends and remain valid; no executable dashboard code is introduced. |
| Suggested validation command | `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e` |

### 3.5 Improve Recovery Copy And Demo Guidance

| Field | Details |
|---|---|
| Goal | Make generation failures, unsupported prompts, fallback states, saved import errors, and demo blockers clearer. |
| Why it matters | Users need honest recovery paths when live APIs are unavailable or prompts are unsupported. |
| Files likely involved | `apps/web/components/app-shell.tsx`, `apps/web/components/inspector-panel.tsx`, `apps/web/components/sources-catalog.tsx`, `apps/web/app/demo-readiness/page.tsx`, `apps/web/test/dashboard.test.ts`, `tests/e2e/product-demo.spec.ts` |
| Dependencies | Coordinate with unsupported prompt guidance work. |
| Risk level | Low |
| Acceptance criteria | Copy is specific, truthful about supported datasets/modes, and covered by tests where visible assertions change. |
| Suggested validation command | `pnpm lint && pnpm test && pnpm test:e2e` |

## Phase 4: Testing, Reliability, And Deployment Readiness

Goal: make the app safer to ship and easier to verify after every meaningful change.

### 4.1 Split Broad Web Tests Into Focused Files

| Field | Details |
|---|---|
| Goal | Separate dashboard, API route, export, middleware, and script checks into clearer Vitest files. |
| Why it matters | `apps/web/test/dashboard.test.ts` currently covers many unrelated concerns, making failures harder to localize. |
| Files likely involved | `apps/web/test/dashboard.test.ts`, new files under `apps/web/test` |
| Dependencies | Keep test behavior identical while moving cases. |
| Risk level | Medium |
| Acceptance criteria | Tests are organized by concern; total coverage is preserved or improved; no product behavior changes. |
| Suggested validation command | `pnpm test` |

### 4.2 Add MCP Integration Smoke Coverage

| Field | Details |
|---|---|
| Goal | Add lightweight MCP smoke coverage for tool registration and validated tool output. |
| Why it matters | MCP is part of the public product contract and shares safety logic with the web app. |
| Files likely involved | `apps/mcp-server/src/index.ts`, `apps/mcp-server/src/tools.ts`, `apps/mcp-server/test/*`, `apps/mcp-server/README.md` |
| Dependencies | Preserve stdio compatibility with MCP clients. |
| Risk level | Medium |
| Acceptance criteria | Smoke coverage exercises representative catalog, query, canvas validation, and Miro preview tools. |
| Suggested validation command | `pnpm test && pnpm --filter @texas-data-canvas/mcp-server build` |

### 4.3 Migrate Away From Deprecated `next lint`

| Field | Details |
|---|---|
| Goal | Replace the deprecated Next.js lint command with the ESLint CLI. |
| Why it matters | Current lint passes, but Next.js warns that `next lint` will be removed in Next.js 16. |
| Files likely involved | `apps/web/package.json`, root `package.json`, ESLint config files, docs mentioning lint |
| Dependencies | Confirm ESLint CLI behavior matches current Next lint expectations. |
| Risk level | Medium |
| Acceptance criteria | `pnpm lint` runs without the Next.js deprecation warning and still catches web lint issues. |
| Suggested validation command | `pnpm lint` |

### 4.4 Keep Release Verification Fast And Documented

| Field | Details |
|---|---|
| Goal | Clarify when to run daily checks, preflight, production-local verification, Vercel output checks, and release checks. |
| Why it matters | Release scripts are valuable but heavier than routine development checks; evidence must be updated deliberately. |
| Files likely involved | `scripts/*`, `DEVELOPMENT_GUIDE.md`, `README.md`, `GOVERNANCE_NOTE.md`, `docs/release-evidence.json`, release docs |
| Dependencies | Do not update release evidence accidentally. |
| Risk level | Medium |
| Acceptance criteria | Docs distinguish daily checks from release gates; release evidence refresh steps are explicit. |
| Suggested validation command | `pnpm preflight` |

### 4.5 Prepare Hosted Deployment Runbook

| Field | Details |
|---|---|
| Goal | Produce a current runbook for deployment env vars, health checks, smoke checks, live-data boundaries, rate limits, and rollback. |
| Why it matters | Hosted readiness depends on operational configuration outside the current no-database app code. |
| Files likely involved | `README.md`, `DEVELOPMENT_GUIDE.md`, `docs/HOSTED_BETA_DEPLOYMENT.md`, `docs/V1_3_HOSTED_LAUNCH_READINESS_PLAN.md`, `scripts/smoke-deploy.mjs`, `scripts/verify-prod-local.mjs` |
| Dependencies | Hosting target and public URL. |
| Risk level | Medium |
| Acceptance criteria | A developer can deploy, validate `/api/health`, run smoke checks, and identify sample/live limitations from the runbook. |
| Suggested validation command | `pnpm verify:prod-local && pnpm smoke:deploy -- --url <url>` |
