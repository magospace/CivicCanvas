# AGENTS.md

## Paperclip Control Plane

If this run is launched from Paperclip, assigned through Paperclip, or needs cross-agent coordination, read `PAPERCLIP.md` before selecting work. Paperclip issues are the visible work envelopes; `TASKS.md` and `HERMES_PROGRESS.md` remain the detailed repo-local queue and run log.

## Official OpenAI Docs

Use the OpenAI developer documentation MCP server named `openaiDeveloperDocs` before implementing or advising on OpenAI API, Responses API, Agents SDK, ChatGPT Apps SDK, Codex, MCP, skills, model selection, or prompt/model migration work. If the MCP is unavailable, use official OpenAI docs as fallback evidence and record the gap in `HERMES_PROGRESS.md`.

Repo-specific instructions for Hermes and other coding agents working on Texas Data Canvas.

## Project Purpose

Texas Data Canvas is an open-source, no-account, no-database visual explorer for approved Texas public datasets. Users enter natural-language prompts and the app generates source-cited dashboards from validated public-data query results.

The app is not a generic chatbot and must not render arbitrary model-generated HTML or JavaScript. Dashboard output is a validated `CanvasDocument` rendered through an allowlisted React block registry.

Current supported workflows:

- Dallas 311 service requests, with limited live Socrata support for verified non-ZIP aggregate fields.
- Austin building permits, sample-first.
- Houston transportation incidents, sample-first with precise locations excluded.
- Unsupported/sensitive prompts return governed suggestions instead of fabricated dashboards.
- Miro export is preview/spec-only; no Miro board writes or OAuth flow exist.

## Tech Stack

- Package manager/workspace: `pnpm@10.14.0`, configured in `package.json` and `pnpm-workspace.yaml`.
- Web app: Next.js 15 App Router, React 18, TypeScript.
- Styling: Tailwind CSS, PostCSS, `lucide-react`, custom theme in `apps/web/tailwind.config.ts`.
- Shared contracts: Zod schemas and TypeScript types in `packages/shared/src/schemas/index.ts`.
- Query/data logic: `packages/shared/src/query/index.ts`, `packages/shared/src/adapters/index.ts`, `packages/shared/src/prompt/index.ts`.
- MCP server: `@modelcontextprotocol/sdk` stdio server in `apps/mcp-server/src`.
- Tests: Vitest plus Playwright/axe e2e coverage.
- CI/security: `.github/workflows`, `.github/dependabot.yml`, `SECURITY.md`.

## Repo Structure

| Path | Owns |
|---|---|
| `apps/web/app` | Next.js routes and API route handlers. Main pages are `/explore`, `/sources`, `/saved`, `/gallery`, and `/demo-readiness`. |
| `apps/web/app/api` | JSON API routes for health, catalog, datasets, direct queries, canvas generation/validation, seed canvas lookup, and Miro preview specs. |
| `apps/web/components` | React UI for header, prompt shell, sidebars, inspector, saved/gallery views, and dashboard blocks. |
| `apps/web/components/canvas` | `CanvasDocument` validation and allowlisted block dispatch. |
| `apps/web/lib` | Web-side orchestration, data loading, API helpers, saved-canvas localStorage helpers, export helpers, dashboard generation. |
| `apps/web/test` | Vitest coverage for web/API/dashboard behavior. |
| `apps/mcp-server/src` | MCP server entry point, tool registration, handlers, and data loading. |
| `apps/mcp-server/test` | MCP tool tests. |
| `packages/shared/src` | Shared schemas, constants, validation, prompt parsing, query execution, adapters, persistence helpers, Miro specs, release metadata. |
| `packages/shared/test` | Shared query/canvas/schema tests. |
| `data/catalog` | Approved dataset catalog and live/sample metadata. |
| `data/samples` | Deterministic fallback JSON rows. |
| `data/gallery` | Validated demo `CanvasDocument` fixtures. |
| `docs` | Architecture, implementation, release, deployment, governance, and historical docs. |
| `.agents/skills/texas-public-data-explorer/SKILL.md` | Repo-scoped public-data/dashboard/MCP safety workflow. |
| `scripts` | Preflight, governance, data quality, live/deploy smoke, release verification scripts. |
| `tests/e2e` | Playwright product-demo and accessibility tests. |

Read these first for orientation:

- `CODEBASE_OVERVIEW.md`
- `ARCHITECTURE_MAP.md`
- `DEVELOPMENT_GUIDE.md`
- `README.md`
- `SECURITY.md`
- `.agents/skills/texas-public-data-explorer/SKILL.md`

## Commands

Run commands from the repo root.

Setup and local run:

```bash
pnpm install
pnpm dev
```

Open the app at:

```text
http://localhost:3000/explore
```

Minimum checks before finishing most code changes:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Run before claiming build readiness:

```bash
pnpm build
```

Run for frontend behavior, navigation, or accessibility changes:

```bash
pnpm test:e2e
```

Run for catalog/sample/gallery/public-data changes:

```bash
pnpm governance:audit
pnpm data:quality
```

Run for release/deployment readiness work:

```bash
pnpm preflight
pnpm verify:prod-local
pnpm release:check
```

Network-dependent or environment-dependent commands:

- `pnpm smoke:live` hits public live APIs.
- `pnpm smoke:deploy -- --url <url>` requires a running local or hosted URL.
- `pnpm test:e2e:remote` requires `PLAYWRIGHT_BASE_URL`.

Use these only when relevant and say clearly if skipped.

## Coding Conventions

- Keep shared data contracts in `packages/shared/src/schemas/index.ts` and validate with Zod at API, MCP, import/export, query, and canvas boundaries.
- Keep reusable public-data logic out of React components. Prefer `packages/shared/src` or `apps/web/lib`.
- Keep page files in `apps/web/app/**/page.tsx` focused on route composition and data loading.
- Use existing TypeScript types from `@texas-data-canvas/shared`; do not duplicate contract shapes in app code.
- Avoid `any`. If unavoidable, keep it narrow and explain why.
- Do not swallow validation/query errors with broad `try/catch` blocks. Use governed errors and existing API error helpers in `apps/web/lib/api.ts`.
- Do not bypass `validateCanvasDocument`, `safeValidateCanvasDocument`, `boundedQuerySpecSchema`, or MCP output validation.
- Do not add arbitrary SQL, raw user-generated queries, or model-generated executable code.
- Preserve row limits, aggregation requirements, source attribution, caveats, and query audit output.

## UI Conventions

- Use the existing Next App Router structure and Tailwind theme.
- Reuse nearby component patterns before adding new abstractions.
- Keep the main `/explore` interaction model centered in `apps/web/components/app-shell.tsx` unless deliberately extracting focused hooks/components.
- Dashboard blocks must be validated `CanvasBlock` variants and rendered through:
  - `apps/web/components/canvas/canvas-renderer.tsx`
  - `apps/web/components/canvas-blocks.tsx`
- Every generated dashboard must include source/method attribution.
- Keep UI copy truthful about data mode: live, sample fallback, unsupported, or preview-only.
- Header/navigation/runtime labels live in `apps/web/components/header.tsx`.
- Do not present Miro preview output as a real integration until an authenticated write flow exists.

## Data And Database Rules

There is currently no database.

- No Prisma, Supabase, migrations, SQL schema, Postgres config, `DATABASE_URL`, user table, or server-side saved-canvas store exists.
- `packages/shared/src/schemas/index.ts` is a Zod contract layer, not a database schema.
- Static public-data configuration lives in `data/catalog/approved-datasets.json`.
- Fallback rows live in `data/samples/*.sample.json`.
- Gallery canvases live in `data/gallery/*.canvas.json`.
- Saved canvases are stored in browser `localStorage` through `apps/web/lib/saved-canvases.ts` and `packages/shared/src/persistence/index.ts`.
- Share links encode validated saved-canvas bundles in the URL hash.
- `/api/canvas/save` is a server-side validation stub only. It does not persist to a backend.
- `/api/canvas/[id]` returns hardcoded seed/demo canvases. It is not a general object lookup service.

When adding or changing public datasets:

1. Update `data/catalog/approved-datasets.json`.
2. Classify every field as `safe_public`, `safe_with_aggregation`, `sensitive_hide`, or `unknown_review`.
3. Keep deterministic fallback samples available.
4. Do not expose precise addresses, personal contact fields, private data, or unreviewed raw rows.
5. Update prompt/query/dashboard logic and tests together.
6. Run `pnpm governance:audit` and `pnpm data:quality`.

## Environment Variable Rules

Sample mode does not require secrets.

Current runtime/public metadata variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_ENV` | Runtime label shown in UI/health metadata. |
| `NEXT_PUBLIC_APP_VERSION` | Version shown in UI/health and saved-canvas bundle metadata. |
| `NEXT_PUBLIC_SITE_URL` | Optional public deployment URL metadata and smoke-test expectation. |
| `PLAYWRIGHT_BASE_URL` | Points Playwright at an existing local/remote app. |
| `VERCEL`, `VERCEL_URL`, `VERCEL_ENV` | Vercel runtime metadata. |
| `VERCEL_GIT_COMMIT_SHA`, `VERCEL_GIT_COMMIT_REF` | Hosted git metadata. |
| `GITHUB_SHA`, `GITHUB_REF_NAME` | CI fallback git metadata. |
| `NODE_ENV` | Used by Next config for development CSP behavior. |

Rules:

- Do not add committed secrets.
- Do not introduce required API keys for the default local demo path.
- Do not invent `DATABASE_URL`, OAuth, Supabase, Miro, or other secret env vars without implementing and documenting the new architecture boundary.
- `.env.example` contains public runtime metadata examples only. Keep it aligned with release metadata when release labels change.

## Testing Expectations

Use the smallest check set that covers the change, then report exactly what ran.

| Change type | Expected checks |
|---|---|
| Docs only | Verify referenced paths if adding many path references. Run code checks only if docs affect scripts/config. |
| Shared schema/query/adapter logic | `pnpm typecheck`, `pnpm test`, usually `pnpm governance:audit`. |
| Web API route | `pnpm lint`, `pnpm typecheck`, `pnpm test`; add/update route tests. |
| UI or route behavior | `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm test:e2e` when visible flow changes. |
| Catalog/sample/gallery data | `pnpm governance:audit`, `pnpm data:quality`, `pnpm test`. |
| MCP tools | `pnpm typecheck`, `pnpm test`, and focused tests under `apps/mcp-server/test`. |
| Release/deploy work | `pnpm preflight`, `pnpm verify:prod-local`, or `pnpm release:check` as appropriate. |

Recently verified baseline from onboarding review:

- `pnpm lint` passed.
- `pnpm typecheck` passed.
- `pnpm test` passed.
- `pnpm build` passed.

## What Not To Touch Without Permission

Do not casually modify:

- `packages/shared/src/schemas/index.ts`
- `packages/shared/src/query/index.ts`
- `packages/shared/src/adapters/index.ts`
- `packages/shared/src/prompt/index.ts`
- `apps/web/lib/dashboard.ts`
- `apps/web/middleware.ts`
- `apps/web/next.config.mjs`
- `data/catalog/approved-datasets.json`
- `data/gallery/*.canvas.json`
- `docs/release-evidence.json`
- `packages/shared/src/release/index.ts`
- `SECURITY.md`
- `.github/workflows/*`
- `.github/dependabot.yml`
- `.agents/skills/texas-public-data-explorer/SKILL.md`

Do not edit generated outputs directly:

- `apps/web/.next`
- `apps/mcp-server/dist`
- `packages/shared/dist`
- `.turbo`
- `test-results`
- `playwright-report`
- `.vercel/output`

Do not run `pnpm clean` unless the user explicitly wants local generated artifacts and dependencies removed.

## How To Document Changes

- Update `CODEBASE_OVERVIEW.md` when changing product scope, routes, folders, dependencies, env vars, commands, risks, or external services.
- Update `ARCHITECTURE_MAP.md` when changing data flow, API behavior, validation boundaries, persistence, auth, MCP tools, side effects, or state management.
- Update `DEVELOPMENT_GUIDE.md` when changing local setup, safe workflows, risky files, checks, or recommended next tasks.
- Update `README.md` for user-facing setup/demo/deployment changes.
- Update `SECURITY.md` if adding auth, persistence, file uploads, external writes, secrets, Miro writes, or new sensitive data boundaries.
- Update `.agents/skills/texas-public-data-explorer/SKILL.md` if agent workflow/safety rules change.
- Keep documentation explicit about inspected facts versus inferred behavior.

## Hermes Safe Development Cycle

Use this loop for Hermes-driven work and for any other agent session that needs durable repo state.

1. Read `AGENTS.md`, `TASKS.md`, repo docs, and `git status` before choosing work.
2. Choose exactly one highest-priority safe task from `TASKS.md`.
3. Complete only that scoped task and touch only files needed for it.
4. Run the smallest relevant validation command set from this file.
5. Update `TASKS.md` and `HERMES_PROGRESS.md` before finishing.
6. If the task surfaces QA/reliability findings, update `QA_FINDINGS.md`.
7. If blocked, stop and record the blocker instead of starting another task.

Durable state must live in repo files, not chat memory:

- `AGENTS.md` for standing repo instructions.
- `TASKS.md` for ordered work and completion status.
- `QA_FINDINGS.md` for active reliability findings when needed.
- `HERMES_PROGRESS.md` for Hermes session handoffs, commands run, and current blocker/next-task notes.

Do not use broad "continue" instructions. Every run should finish with a report of the task chosen, why it was next, changed files, validation results, skipped commands, remaining risks, and the recommended next task.

## Definition Of Done For Agent Tasks

A task is done only when:

- The change matches the current no-auth/no-database/public-data safety model, or the user explicitly approved an architecture change.
- Relevant code paths are validated with Zod or existing helpers.
- Source attribution, caveats, row limits, and query audits remain intact for generated dashboards.
- UI changes preserve existing navigation and the trusted canvas block model.
- Tests or docs are updated close to the changed behavior.
- The appropriate commands from this file have been run, or skipped with a concrete reason.
- No unrelated files or generated outputs were modified.
- The final response lists what changed, what was verified, and any remaining uncertainty.

## Known Risks And Gotchas

- This repo is Texas Data Canvas, not HackFairOS. Do not document hackathon/team/judging flows unless the code actually changes to include them.
- Live data support is intentionally limited. Dallas ZIP, Austin monthly trends, and Houston live dashboards rely on sample fallback today.
- `apps/web/middleware.ts` uses in-memory rate limiting. This is not sufficient as distributed/serverless hosted rate limiting.
- `docs` includes historical milestone docs. Prefer `CODEBASE_OVERVIEW.md`, `ARCHITECTURE_MAP.md`, `DEVELOPMENT_GUIDE.md`, `README.md`, and active release docs for current state.
- URL-hash saved-canvas sharing can hit size limits for large canvases.
- Miro export is only a JSON preview spec.
- Health/demo readiness/release scripts depend on release metadata and `docs/release-evidence.json`; update deliberately.
- Next lint currently passes but uses `next lint`, which Next.js warns is deprecated for future Next versions.
