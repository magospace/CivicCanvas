# Development Guide

Last inspected: May 10, 2026

## Local Setup

Prerequisites inferred from repo configuration:

- Node.js 22 is used in CI at `.github/workflows/ci.yml`.
- pnpm 10.14.0 is declared in `package.json`.

Install and run:

```bash
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000/explore
```

Useful local routes:

| Route | Use |
|---|---|
| `/explore` | Main prompt-to-dashboard workflow. |
| `/sources` | Catalog and live/sample verification state. |
| `/saved` | Browser-local saved canvases and import/export/share links. |
| `/gallery` | Checked-in validated canvas fixtures. |
| `/demo-readiness` | Release utility and current hosted blockers. |

## Read These Files First

| File | Why read it |
|---|---|
| `README.md` | Current product scope, commands, data modes, deployment notes, and known live/sample boundaries. |
| `AGENTS.md` | Repo-specific constraints for agents and product safety rules. |
| `.agents/skills/texas-public-data-explorer/SKILL.md` | Repo-scoped workflow guidance for public-data/dashboard/MCP/Miro-spec work. |
| `SECURITY.md` | Current security boundaries and reporting expectations. |
| `packages/shared/src/schemas/index.ts` | Authoritative contracts for datasets, queries, canvases, saved bundles, and Miro specs. |
| `apps/web/lib/dashboard.ts` | Main prompt-to-dashboard orchestration. |
| `packages/shared/src/query/index.ts` | Query validation and static sample aggregation. |
| `packages/shared/src/adapters/index.ts` | Static JSON/Socrata adapter routing and live fallback behavior. |
| `data/catalog/approved-datasets.json` | Approved sources, field classifications, live metadata, caveats, and sample files. |
| `apps/web/components/app-shell.tsx` | Client-side state and user actions for `/explore`. |
| `apps/web/components/canvas/canvas-renderer.tsx` | Trusted block registry entry point. |
| `apps/web/components/canvas-blocks.tsx` | Actual rendered dashboard block components. |
| `apps/mcp-server/src/index.ts` | MCP tool registration and input/output validation. |
| `apps/mcp-server/src/tools.ts` | MCP tool behavior. |
| `tests/e2e/product-demo.spec.ts` | Browser-level expectations for major public flows. |
| `apps/web/test/dashboard.test.ts` | Web/API/dashboard unit coverage. |
| `packages/shared/test/query-and-canvas.test.ts` | Query/canvas/schema behavior coverage. |
| `apps/mcp-server/test/tools.test.ts` | MCP tool contract coverage. |
| `.github/workflows/ci.yml` | CI gate and expected Node/pnpm setup. |

## Safe Feature Workflow

1. Identify whether the change is UI-only, API/data logic, shared schema, MCP, or release/governance.
2. Prefer adding or updating shared Zod schemas first if the data shape changes.
3. Keep business logic out of React components where possible. Put reusable logic in `apps/web/lib` or `packages/shared/src`.
4. Validate at boundaries: API request body, catalog input, query spec, canvas document, saved import/export, MCP input/output.
5. Update tests close to the changed behavior.
6. Run at least `pnpm lint`, `pnpm typecheck`, and `pnpm test`.
7. For UI changes, also run `pnpm test:e2e` or a targeted Playwright check.
8. For catalog/sample/live changes, also run `pnpm governance:audit` and `pnpm data:quality`.

## How To Safely Add A New Dashboard Dataset

Use this only for public, approved datasets.

1. Add or update catalog metadata in `data/catalog/approved-datasets.json`.
2. Classify every field as `safe_public`, `safe_with_aggregation`, `sensitive_hide`, or `unknown_review`.
3. Add a fallback sample under `data/samples` and point `fallbackSampleFile` to it.
4. If live access is safe, add adapter metadata and `liveFieldMap`; keep sample fallback available.
5. Extend prompt intent logic in `packages/shared/src/prompt/index.ts` if natural-language support is needed.
6. Extend dashboard workflow logic in `apps/web/lib/dashboard.ts`.
7. Add tests in `packages/shared/test/query-and-canvas.test.ts`, `apps/web/test/dashboard.test.ts`, and possibly `tests/e2e/product-demo.spec.ts`.
8. Run `pnpm governance:audit`, `pnpm data:quality`, `pnpm typecheck`, and `pnpm test`.

Do not expose precise addresses, personal contact details, private fields, or unreviewed raw rows in generated canvases or exports.

Before adding a new dataset, read `.agents/skills/texas-public-data-explorer/SKILL.md`; it captures the repo-specific safety workflow expected for public-data features.

## How To Safely Modify An Existing Screen

For route-level changes:

1. Find the page in `apps/web/app`.
2. Find the supporting component in `apps/web/components`.
3. Keep page files mostly as data-loading/composition surfaces.
4. Keep interactive state in client components like `apps/web/components/app-shell.tsx` or a new focused client component.
5. Use existing Tailwind palette and spacing from `apps/web/tailwind.config.ts` and adjacent components.
6. Keep dashboard block rendering inside the allowlisted registry unless adding a validated new block type.
7. Update Playwright tests when changing visible workflow text, roles, labels, or navigation.

Screen ownership:

| Screen | Primary files |
|---|---|
| Explore | `apps/web/app/explore/page.tsx`, `apps/web/components/app-shell.tsx`, `apps/web/components/prompt-bar.tsx`, `apps/web/components/inspector-panel.tsx` |
| Canvas blocks | `apps/web/components/canvas/canvas-renderer.tsx`, `apps/web/components/canvas-blocks.tsx` |
| Sources | `apps/web/app/sources/page.tsx`, `apps/web/components/sources-catalog.tsx` |
| Saved | `apps/web/app/saved/page.tsx`, `apps/web/components/saved-canvases.tsx`, `apps/web/lib/saved-canvases.ts` |
| Gallery | `apps/web/app/gallery/page.tsx`, `apps/web/components/gallery-canvas-list.tsx` |
| Demo readiness | `apps/web/app/demo-readiness/page.tsx`, `apps/web/components/demo-checklist-actions.tsx` |

## How To Safely Modify An API Or Data Flow

There is no database-backed API flow. Current API work is file-backed, localStorage-backed, or live-public-API-backed.

1. Start with the route handler in `apps/web/app/api`.
2. Check request parsing in `apps/web/lib/api.ts`.
3. If the shape changes, update `packages/shared/src/schemas/index.ts`.
4. If query behavior changes, update `packages/shared/src/query/index.ts`.
5. If live API behavior changes, update `packages/shared/src/adapters/index.ts` and catalog live metadata.
6. If MCP should expose the same behavior, update `apps/mcp-server/src/tools.ts` and tool registration/output schemas in `apps/mcp-server/src/index.ts`.
7. Add or update unit tests before relying on browser tests.

API routes to know:

| Route file | Risk |
|---|---|
| `apps/web/app/api/canvas/generate/route.ts` | Main generation entry point; keep request validation strict. |
| `apps/web/app/api/query/route.ts` | Direct bounded query entry point; do not bypass query validation. |
| `apps/web/app/api/export/miro-spec/route.ts` | Must remain preview-only unless a real Miro auth/write flow is deliberately added. |
| `apps/web/app/api/canvas/save/route.ts` | Validation stub only; do not imply server persistence unless implementing storage. |
| `apps/web/app/api/canvas/[id]/route.ts` | Hardcoded seed/demo helper only; do not imply arbitrary saved-canvas lookup. |
| `apps/web/app/api/health/route.ts` | Release/smoke scripts depend on this output. |

If you add database-backed behavior later, first introduce explicit schema/migration docs and a test database strategy. Do not quietly repurpose `packages/shared/src/schemas/index.ts` as if it were a persistence schema.

## Risky Files To Change Casually

| File | Why risky |
|---|---|
| `packages/shared/src/schemas/index.ts` | Changes can affect web, MCP, tests, saved imports, gallery fixtures, and governance scripts. |
| `packages/shared/src/query/index.ts` | Core safety and row-limit enforcement. |
| `packages/shared/src/adapters/index.ts` | Live public API URL generation and fallback behavior. |
| `apps/web/lib/dashboard.ts` | Main dashboard generation logic and current supported workflows. |
| `data/catalog/approved-datasets.json` | Drives governance, UI, APIs, MCP, live checks, and data quality. |
| `data/gallery/*.canvas.json` | Must remain valid `CanvasDocument` JSON and avoid hidden fields. |
| `apps/web/middleware.ts` | Public POST rate limiting behavior. |
| `apps/web/next.config.mjs` | CSP, security headers, data file tracing, shared package transpilation. |
| `docs/release-evidence.json` | Governance audit validates version, branch, commit, and screenshot paths. |
| `packages/shared/src/release/index.ts` | Release version metadata consumed by health, MCP, docs, and scripts. |
| `AGENTS.md`, `.agents/skills/texas-public-data-explorer/SKILL.md` | Agent safety instructions; keep these aligned with architecture changes. |
| `SECURITY.md` | Public safety boundary documentation; update if auth, persistence, Miro writes, uploads, or new external services are introduced. |
| `.github/workflows/*`, `.github/dependabot.yml` | CI/security/dependency automation; small YAML edits can affect release trust. |

Avoid editing generated output directories directly when present:

- `apps/web/.next`
- `apps/mcp-server/dist`
- `packages/shared/dist`
- `test-results`
- `playwright-report`
- `.vercel/output`

## Checks Before Committing

### Daily Development Checks

Use these routine checks for normal feature, test, and docs-adjacent work. They are safe to run locally and do not require secrets, production data, deploy credentials, or hosted URLs.

```bash
pnpm lint
pnpm typecheck
pnpm test
```

For frontend behavior or accessibility changes, add the local browser check:

```bash
pnpm test:e2e
```

For data/catalog/sample/gallery changes, add governance and sample-quality checks:

```bash
pnpm governance:audit
pnpm data:quality
```

### Release And Deployment Gates

Use these only when intentionally checking build, hosted, or release readiness. They are broader than daily checks and may write local build/test output or require a running production-style server.

```bash
pnpm build
pnpm preflight
pnpm verify:prod-local
pnpm release:check
```

Release evidence refresh is not a daily check. Do not update `docs/release-evidence.json` unless the task explicitly asks for a release-evidence refresh after the relevant release gate has been rerun for the intended commit.

### Network Or Environment Dependent Checks

Treat these as situational checks, not routine validation:

- `pnpm smoke:live` hits public live APIs.
- `pnpm smoke:deploy -- --url <url>` requires a running local or hosted app.
- `PLAYWRIGHT_BASE_URL=<url> pnpm test:e2e:remote` requires a public or separately started local URL.
- Optional OpenAI prompt-assist/source-summary work must keep `OPENAI_API_KEY` server-side in `.env.local` or hosting secrets only, report readiness as present/missing without echoing the key, and preserve deterministic fallback when the key is absent or model output fails schema validation. Do not make OpenAI mandatory for the default local demo.

### Hosted Rate-Limit Readiness

The in-repo middleware is local defense-in-depth for write-like POST routes, not proof of distributed hosted abuse protection. Local judge demos can proceed with the local gates above, but broad public hosted sharing needs platform firewall/rate limiting configured outside the repo.

Do not document Vercel firewall, WAF, bot protection, or edge rate-limit controls as implemented until a dedicated hosted-readiness task records provider-specific proof. Keep this boundary visible in `QA_FINDINGS.md` and demo handoff docs.

### ESLint CLI Linting

Current state:

- Root `package.json` runs `pnpm --filter @texas-data-canvas/web lint`.
- `apps/web/package.json` maps `lint` to `eslint . --ext .js,.jsx,.ts,.tsx --max-warnings=0`.
- `apps/web/.eslintrc.json` extends `next/core-web-vitals`.
- `apps/web/package.json` already includes `eslint` and `eslint-config-next` dev dependencies.
- `pnpm lint` runs through the ESLint CLI directly, preserving Next core-web-vitals coverage without the deprecated `next lint` entrypoint.

Maintenance rules:

1. Avoid upgrading Next.js, React, TypeScript, or ESLint during unrelated work.
2. Validate package/config changes with:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

3. If the ESLint CLI flags new issues, fix only lint-scope issues in the same task or record blockers in `QA_FINDINGS.md`.

## Suggested Next Improvements

### Frontend

- Split `apps/web/components/app-shell.tsx` into smaller focused hooks/components for generation, exports, Miro preview, and saved/share actions.
- Add stronger responsive coverage for dense dashboard tables and inspector controls.
- Consider richer chart/map libraries only if they preserve the allowlisted CanvasDocument safety model.

### Backend/API

- Replace in-memory middleware throttling with platform-level rate limiting for public hosted deployments.
- Add route-level tests for all API handlers that currently rely mostly on broader dashboard tests.
- If server persistence is introduced, start from `docs/LOCAL_PERSISTENCE_SPIKE.md`, add explicit migrations/schema docs, keep saved-canvas import validation at the boundary, and preserve browser-local fallback unless explicitly replacing it.
- Keep Miro as preview-only until auth, user confirmation, and safe write boundaries are designed.
- Keep `/api/canvas/save` and `/api/canvas/[id]` docs/tests explicit if route naming changes; they are not backend persistence today.

### Data

- Resolve Dallas ZIP live limitations only if a source-owned ZIP-capable field/view is verified.
- Resolve Austin monthly live aggregation by finding a source-approved month expression or pre-grouped field.
- Promote Houston only after TranStar live access, terms, aggregate-safe mappings, and precise-location handling are approved.
- Add automated checks for new sample files before they enter the catalog.

### Tests

- Add focused tests for `apps/web/lib/saved-canvases.ts` hash import/export behavior.
- Add tests for any new `CanvasBlock` type before wiring it into the renderer.
- Add MCP integration smoke if future changes alter stdio server behavior.
- Keep Playwright labels stable; tests rely heavily on accessible names.

### Product Polish

- Keep root `README.md`, `apps/web/README.md`, and `.env.example` aligned when release labels, routes, or saved-canvas behavior change.
- Consolidate historical milestone docs or add a "current docs" pointer to reduce onboarding confusion.
- Improve unsupported prompt guidance with exact supported prompt examples and source cards.
- Add a lightweight architecture diagram image or Mermaid diagram if docs rendering supports it.

## Before Adding New Features

Fix or consciously accept these first:

1. Public hosted rate limiting is not fully solved in app code; platform controls are required before broad sharing.
2. `docs/release-evidence.json` is commit-specific evidence; refresh it only after intentionally rerunning the release gate.
3. `/api/canvas/save` and `/api/canvas/[id]` can be mistaken for backend persistence; current docs/tests label them validation-stub and seed-demo helper only. Rename or redesign them before introducing real persistence.
4. Historical milestone docs can confuse new agents; link this guide and `CODEBASE_OVERVIEW.md` from `README.md` or a current docs index.
