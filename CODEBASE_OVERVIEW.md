# Codebase Overview

Last inspected: May 10, 2026

## What This App Does

Texas Data Canvas is a no-account, no-database public-data explorer for Texas civic datasets. Users type plain-English prompts about approved public datasets, and the app generates source-cited dashboards made from trusted React blocks: summaries, metrics, charts, ZIP bubble maps, tables, filters, dataset cards, and source/method cards.

The app is intentionally not a generic chatbot or arbitrary code generator. It parses supported prompts with deterministic local TypeScript rules rather than an LLM/provider call, turns them into validated `BoundedQuerySpec` objects, queries approved static samples or verified live public APIs, then renders a validated `CanvasDocument` through an allowlisted block registry.

Current supported dashboard workflows:

| Workflow | Current status | Key files |
|---|---|---|
| Dallas 311 service requests by category, status, month, and ZIP | Built. Live Socrata is promoted only for verified non-ZIP fields; ZIP dashboards fall back to samples. | `apps/web/lib/dashboard.ts`, `data/catalog/approved-datasets.json`, `data/samples/dallas-311.sample.json` |
| Austin building permits by permit type, status, month, and ZIP | Built as sample-first. Some live checks pass, but monthly live aggregation is blocked. | `apps/web/lib/dashboard.ts`, `data/samples/austin-building-permits.sample.json` |
| Houston transportation incidents by incident type, status, month, and ZIP | Built as sample-first. Precise locations are excluded. | `apps/web/lib/dashboard.ts`, `data/samples/houston-transportation-incidents.sample.json` |
| Unsupported or sensitive prompts | Built. Returns approved dataset suggestions instead of a hallucinated dashboard. | `packages/shared/src/prompt/index.ts`, `apps/web/lib/dashboard.ts` |
| Miro export | Preview/spec only. No live board writes. | `packages/shared/src/miro/index.ts`, `apps/web/app/api/export/miro-spec/route.ts` |

## Main User Flows

### Explore And Generate A Dashboard

1. User opens `/explore`.
2. `apps/web/app/explore/page.tsx` loads the approved dataset catalog and a seed canvas.
3. `apps/web/components/app-shell.tsx` owns prompt text, filters, data mode, active canvas, query audits, and Miro preview state.
4. User submits a prompt through `apps/web/components/prompt-bar.tsx`.
5. The client posts to `POST /api/canvas/generate`.
6. `apps/web/lib/dashboard.ts` parses the prompt, chooses a supported workflow, creates bounded queries, runs adapter-routed queries, builds a `CanvasDocument`, validates it, and returns it.
7. `apps/web/components/canvas/canvas-renderer.tsx` validates again and renders allowlisted block components from `apps/web/components/canvas-blocks.tsx`.

### Browse Sources

1. User opens `/sources`.
2. `apps/web/app/sources/page.tsx` reads catalog metadata and catalog health.
3. `apps/web/components/sources-catalog.tsx` shows source status, field confidence, live verification notes, hidden fields, sample fallbacks, and caveats.

### Save, Import, Share, And Export

1. User saves a generated canvas from `/explore`.
2. Client-side helpers in `apps/web/lib/saved-canvases.ts` validate and write `SavedCanvas` objects to browser `localStorage`.
3. `/saved` renders saved canvases through `apps/web/components/saved-canvases.tsx`.
4. Share links place a validated saved-canvas bundle in the URL hash. There is no backend share database.
5. CSV, `CanvasDocument` JSON, and `BoundedQuerySpec` exports are produced client-side from validated data.

### Curated Gallery

1. User opens `/gallery`.
2. `apps/web/lib/data.ts` loads checked-in canvas fixtures from `data/gallery`.
3. `apps/web/components/gallery-canvas-list.tsx` renders each fixture and can queue it to open in `/explore`.

### Demo Readiness And Release Checks

1. User opens `/demo-readiness`.
2. `apps/web/app/demo-readiness/page.tsx` reads catalog health, sample data quality, release metadata, and release evidence.
3. The page presents local gate commands, hosted blockers, sample/live boundaries, and copyable demo/release checklists.

### MCP Server Flow

1. The MCP server starts from `apps/mcp-server/src/index.ts` over stdio.
2. Registered tools call handlers in `apps/mcp-server/src/tools.ts`.
3. Handlers read the same catalog and sample files through `apps/mcp-server/src/data.ts` and use shared package contracts.
4. Tool outputs are validated before being returned as JSON text content.

## Tech Stack

| Area | Technology | Where configured |
|---|---|---|
| Package manager / workspace | pnpm 10.14 workspace | `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` |
| Web app | Next.js 15 App Router, React 18, TypeScript | `apps/web/package.json`, `apps/web/app` |
| Styling | Tailwind CSS, PostCSS, custom civic palette, lucide icons | `apps/web/tailwind.config.ts`, `apps/web/postcss.config.js`, `apps/web/app/globals.css` |
| Shared contracts | Zod schemas and TypeScript types | `packages/shared/src/schemas/index.ts` |
| Query/data logic | Typed adapters, bounded query executor, prompt parser | `packages/shared/src/query/index.ts`, `packages/shared/src/adapters/index.ts`, `packages/shared/src/prompt/index.ts` |
| MCP server | `@modelcontextprotocol/sdk` stdio server | `apps/mcp-server/src/index.ts` |
| Unit/API tests | Vitest | `vitest.config.ts`, `packages/shared/test`, `apps/web/test`, `apps/mcp-server/test` |
| Browser tests | Playwright plus axe accessibility checks | `playwright.config.ts`, `tests/e2e/product-demo.spec.ts` |
| Release checks | Node scripts | `scripts` |
| Agent instructions | Root agent instructions plus a repo skill | `AGENTS.md`, `.agents/skills/texas-public-data-explorer/SKILL.md` |
| CI/security automation | GitHub Actions, Dependabot, CodeQL, gitleaks | `.github/workflows`, `.github/dependabot.yml` |

## Folder-By-Folder Map

| Path | Owns |
|---|---|
| `apps/web/app` | Next.js App Router pages and API route handlers. `/` redirects to `/explore`; public pages are `/explore`, `/sources`, `/saved`, `/gallery`, and `/demo-readiness`. |
| `apps/web/app/api` | JSON APIs for dashboard generation, bounded query execution, datasets, health, catalog health, saved-canvas validation, seeded canvas lookup, and Miro export preview. |
| `apps/web/components` | React UI for header, prompt bar, app shell, source/sidebar panels, saved/gallery lists, inspector, and canvas block views. |
| `apps/web/components/canvas` | Canvas document validation and block registry rendering. |
| `apps/web/lib` | Web-side data loading, prompt-to-dashboard orchestration, API error helpers, saved-canvas localStorage helpers, exports, Miro re-export, and ZIP centroid helpers. |
| `apps/web/test` | Vitest coverage for dashboard generation, API contracts, middleware, exports, catalog health, and release utility behavior. |
| `apps/web/public/brand` | CivicCanvas logo assets used in header/gallery/app icon surfaces. |
| `apps/web/.eslintrc.json`, `apps/web/next.config.mjs`, `apps/web/tailwind.config.ts`, `apps/web/postcss.config.js`, `apps/web/tsconfig.json` | Web linting, Next.js headers/data tracing, Tailwind theme, PostCSS, and TypeScript configuration. |
| `apps/mcp-server/src` | MCP stdio server setup, tool registration, tool handlers, and catalog/sample loading for MCP. |
| `apps/mcp-server/test` | Vitest coverage for MCP tool handlers and shared release metadata/tool contracts. |
| `packages/shared/src` | Shared schemas, constants, governed errors, canvas validation, bounded query execution, adapters, prompt intent parsing, Miro spec generation, saved-canvas persistence helpers, and release metadata. |
| `packages/shared/test` | Vitest coverage for query execution, canvas validation, adapters, saved-canvas import, and prompt parsing. |
| `data/catalog` | Approved dataset catalog, live verification metadata, field classifications, caveats, and adapter settings. |
| `data/samples` | Local JSON fallback rows used for deterministic demo dashboards. |
| `data/gallery` | Checked-in validated `CanvasDocument` fixtures rendered in `/gallery`. |
| `docs` | Product, architecture, governance, release, deployment, demo, and historical milestone docs. |
| `.agents/skills/texas-public-data-explorer` | Repo-scoped Codex skill for safe public-data/dashboard/MCP work. |
| `scripts` | Preflight, governance audit, data quality, live smoke, deployment smoke, production-local verification, and Vercel output verification scripts. |
| `tests/e2e` | Playwright browser smoke and accessibility coverage for major public flows. |
| `.github/workflows`, `.github/dependabot.yml` | CI, CodeQL, secret scan, hosted deploy verification, and dependency update automation. |

## Important Commands

Run commands from the repo root unless noted.

| Command | Purpose | Notes |
|---|---|---|
| `pnpm install` | Install workspace dependencies. | Requires network if dependencies are not already installed. |
| `pnpm dev` | Start the Next.js app through the workspace filter. | Opens the main app at `http://localhost:3000/explore` by default. |
| `pnpm start:web` | Start a previously built web app. | Requires `apps/web/.next` from a prior build. |
| `pnpm lint` | Run the ESLint CLI for `apps/web`. | Safe check; uses Next core-web-vitals rules through `.eslintrc.json`. |
| `pnpm typecheck` | Typecheck all workspace packages. | Safe check. |
| `pnpm test` | Run Vitest unit/API tests. | Safe check. |
| `pnpm build` | Build all workspace packages. | Writes generated build output under ignored build directories. |
| `pnpm test:e2e` | Run Playwright e2e with a local Next dev server on port 3002. | Starts a local server if `PLAYWRIGHT_BASE_URL` is unset. |
| `pnpm preflight` | Run preflight, governance audit, lint, typecheck, tests, and build. | Longer local gate. |
| `pnpm governance:audit` | Validate data governance and release metadata expectations. | Reads catalog, samples, gallery, docs, and git metadata. |
| `pnpm data:quality` | Summarize sample row quality. | Checks row counts, months, ZIP gaps, and top categories/statuses. |
| `pnpm smoke:live` | Hit verified live public API checks for live-enabled datasets. | Network-dependent; optional for local work. |
| `pnpm smoke:deploy -- --url <url>` | Smoke-check a running local or hosted deployment. | Requires a running app or public URL. |
| `pnpm verify:prod-local` | Build web, run `next start`, deployment-smoke it, and run remote-mode Playwright. | Longer; starts/stops a local server and writes build output. |
| `pnpm release:check` | Governance audit, data quality, production-local verification, and Vercel output checks. | Full release-style local gate. |

## Environment Variables

Only public/runtime metadata variables are required for hosted-style builds. Sample mode requires no secrets.

| Variable | Where used | What it controls |
|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | `apps/web/components/header.tsx`, `apps/web/app/api/health/route.ts`, release docs/scripts | Runtime label such as `hosted-beta`; shown in header and health metadata. |
| `NEXT_PUBLIC_APP_VERSION` | `apps/web/components/header.tsx`, `apps/web/app/api/health/route.ts`, `apps/web/lib/saved-canvases.ts`, scripts | Version displayed in UI/health and stored in saved-canvas bundle metadata. |
| `NEXT_PUBLIC_SITE_URL` | `apps/web/app/api/health/route.ts`, `apps/web/app/demo-readiness/page.tsx`, `scripts/verify-prod-local.mjs` | Optional public deployment URL metadata and smoke-test expectation. Not a secret. |
| `PLAYWRIGHT_BASE_URL` | `playwright.config.ts`, `scripts/require-playwright-base-url.mjs`, `scripts/verify-prod-local.mjs` | Makes Playwright target an existing local/remote URL instead of starting the local dev server. |
| `VERCEL`, `VERCEL_URL`, `VERCEL_ENV` | `apps/web/app/api/health/route.ts` | Vercel runtime provider/environment metadata. |
| `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF` | `apps/web/app/api/health/route.ts`, `apps/web/app/demo-readiness/page.tsx` | Hosted git metadata shown in health/demo readiness. |
| `GITHUB_SHA`, `GITHUB_REF_NAME` | `apps/web/app/api/health/route.ts`, `apps/web/app/demo-readiness/page.tsx` | CI fallback for commit/branch metadata. |
| `NODE_ENV` | `apps/web/next.config.mjs` | Controls whether CSP includes `unsafe-eval` for development only. |

`.env.example` currently uses `NEXT_PUBLIC_APP_VERSION=v1.3.0-hosted-launch-readiness`, matching the active release metadata in `packages/shared/src/release/index.ts`. The public runtime label may still use `hosted-beta` for deployment context; do not treat that label as a release-version mismatch.

No `DATABASE_URL`, Supabase, Prisma, OAuth, OpenAI/Anthropic/model-provider API key, or app-secret environment variable is used by current runtime code. Vercel token/org/project values are mentioned only in deployment docs and are explicitly checked so they are not committed.

## External Services And APIs

| Service | Current use |
|---|---|
| City of Dallas Open Data / Socrata | Live-enabled for verified non-ZIP Dallas 311 aggregate fields. Configured in `data/catalog/approved-datasets.json`. |
| City of Austin Open Data / Socrata | Live metadata and some live checks exist, but dashboards remain sample-first because monthly grouping is blocked. |
| Houston TranStar Traffic Data Feeds | Documented boundary only; sample-first local data. Live access requires contacting TranStar, and precise locations are excluded. |
| Vercel | Intended hosting target and smoke/deployment docs. No committed Vercel secrets or `.vercel/project.json`. |
| Miro | Preview-only `MiroExportSpec` generation. No Miro API writes are implemented. |
| MCP clients | The stdio MCP server exposes safe tools for dataset search, query, canvas generation, validation, audit, and Miro preview specs. |
| LLM/model providers | Not implemented. Prompt support is deterministic/rule-based local TypeScript with no provider SDK, model secret, or paid inference path. |

## Current Risks, Incomplete Areas, And Confusing Patterns

| Area | Status / risk |
|---|---|
| Auth/accounts | No authentication or authorization exists. UI says "No account mode". |
| Database | No database, migrations, ORM, SQL schema, Supabase config, Prisma config, or `DATABASE_URL` usage was found. `packages/shared/src/schemas/index.ts` contains Zod API/data contracts, not a database schema. Persistence is local JSON plus browser `localStorage`. |
| Prompt parsing | Deterministic and narrow. Only Dallas 311, Austin permits, and Houston transportation workflows generate dashboards. |
| Live data | Live adapters are deliberately limited. Dallas ZIP, Austin monthly trends, and all Houston dashboards rely on sample fallback. |
| Middleware rate limiting | `apps/web/middleware.ts` uses an in-memory map. This is defense-in-depth only and is not reliable as a distributed/serverless rate limit. |
| Saved sharing | Share links encode validated saved-canvas bundles in URL hashes. Large canvases can hit hash/import size limits. |
| Miro | Export is only a JSON preview. There is no board creation or OAuth flow. |
| Release evidence | `docs/release-evidence.json` is tied to a specific branch/commit and governance checks. Change deliberately. |
| Seed canvas API | `/api/canvas/[id]` has hardcoded Dallas/Austin seed IDs, not a general saved-canvas backend. Do not treat it as database persistence. |
| Documentation drift | Some milestone docs describe past versions. Prefer root `README.md`, `apps/web/README.md`, this overview, `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, `docs/IMPLEMENTATION_STATUS.md`, and active release docs for current state. |
| Historical docs | Many milestone docs describe past versions. Prefer `README.md`, this overview, `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, `docs/IMPLEMENTATION_STATUS.md`, and active release docs for current work. |
| Generated folders | `.next`, `dist`, `test-results`, and `.vercel/output` when present are build/test outputs. Do not edit them manually. |

## Reviewer Verification Notes

- Referenced source, route, config, data, script, and test paths in these onboarding docs were checked against the filesystem.
- The absence of auth/database is based on inspected package dependencies, route structure, env usage, repository file search for database/migration/schema terms, and the existing no-auth/no-database product docs.
- The only "schema" files found are TypeScript/Zod contracts under `packages/shared/src/schemas/index.ts`, not persistent database schema files.
