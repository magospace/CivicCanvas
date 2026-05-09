# Texas Data Canvas

Open-source, MCP-powered visual explorer for Texas public datasets.

## What it does

Users ask natural-language questions about Texas public data. The app discovers approved public datasets, runs safe bounded queries, and renders interactive dashboards with maps, charts, tables, filters, summaries, and source attribution.

Optional stretch: export dashboards to Miro as briefing boards, slide-like frames, or workshop boards.

## MVP workflows

1. Dallas 311 service requests by category and ZIP code for 2024.
2. Austin building permits by month and ZIP code.

## Core safety model

- No arbitrary AI-generated runtime HTML/JavaScript.
- No arbitrary SQL.
- Use CanvasSpec JSON + trusted React block registry.
- Use BoundedQuerySpec + approved dataset catalog.
- Always include SourceMethodBlock.

## Suggested commands once implemented

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build
```

## Setup

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000/explore` for the main app shell.

## Verification

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preflight
pnpm smoke:live
pnpm smoke:live:json
pnpm smoke:deploy -- --url http://localhost:3000
pnpm smoke:deploy:json -- --url http://localhost:3000
pnpm test:e2e
PLAYWRIGHT_BASE_URL=https://your-deployment.example pnpm test:e2e:remote
pnpm verify
```

`pnpm smoke:live` is optional and only checks catalog entries with `liveAvailable: true`.
`pnpm verify` runs the local release gate: preflight, live smoke, and Playwright browser smoke.

## MVP demo prompts

Use `/explore` and run:

```text
Show Dallas 311 service requests by category and ZIP code for 2024.
Show Austin building permits by month and ZIP code.
```

Unsupported prompts return approved dataset suggestions instead of hallucinated dashboards.

## Data modes

The dashboard prompt bar and inspector expose the same governed data modes used by the APIs and MCP server:

- Auto: use live public APIs only when the approved catalog marks the requested dataset and fields as live-ready.
- Live public API: request live data and fall back to approved samples with a visible caveat if live access is unavailable or unsafe.
- Sample fallback: force local sample data for deterministic demos.

## MCP server

```bash
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
```

The MCP server exposes safe catalog, query, source attribution, audit, canvas, visualization, and Miro export-spec tools. All dataset queries are bounded and catalog-validated.

Production-pilot health surfaces are available at `/api/health`, `/api/catalog/health`, and MCP tools `get_server_status`, `validate_catalog`, and `list_live_sources`.

## Deployment

The web app is ready for Vercel-style deployment from this monorepo. For v0.6 hosted-beta deployment, use the manual runbook in `docs/HOSTED_BETA_DEPLOYMENT.md`; this repo has no configured Git remote, so Git-integrated Vercel deployment workflows are intentionally not committed yet. A manual hosted verification workflow is present for checking an already-deployed URL.

```bash
pnpm preflight
pnpm --filter @texas-data-canvas/web build
```

Recommended Vercel settings:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm --filter @texas-data-canvas/web build`
- Output framework: Next.js
- Required secrets: none for sample mode
- Hosted beta env: `NEXT_PUBLIC_APP_ENV=hosted-beta`
- Hosted beta version: `NEXT_PUBLIC_APP_VERSION=v0.6.0-hosted-beta`
- Optional site URL: `NEXT_PUBLIC_SITE_URL=https://your-public-beta.example`

Set hosted beta `NEXT_PUBLIC_*` values before building; Next.js captures them into the production bundle.

Sample mode requires no secrets. Live Socrata adapters use verified catalog field mappings and keep sample fallbacks for demos.

After deploying, smoke-check the public URL:

```bash
pnpm smoke:deploy -- --url https://your-deployment.example --expect-version v0.6.0-hosted-beta
```

Saved canvases remain browser-local. Use `/saved` to export/import portable saved-canvas bundles for demos and handoffs.

The `/explore` inspector includes a "Why this dashboard?" section with matched prompt terms, reason codes, safety decisions, selected data mode, and active bounded query JSON. Dashboard exports stay client-side and governed: current table CSV, validated `CanvasDocument` JSON, and active `BoundedQuerySpec` JSON.

## Workspace packages

- `apps/web` - Next.js App Router frontend shell.
- `apps/mcp-server` - typed MCP server for safe catalog, query, audit, canvas, and export tools.
- `packages/shared` - Zod schemas and TypeScript types shared across the app.

## Data files

- `data/catalog/approved-datasets.json`
- `data/samples/dallas-311.sample.json`
- `data/samples/austin-building-permits.sample.json`

The frontend validates catalog data and renders dashboards through a trusted React block registry. It does not execute AI-generated HTML, JavaScript, external scripts, SQL, or arbitrary components.

## Key docs

- `docs/PRD.md`
- `docs/MVP_BUILD_BRIEF.md`
- `docs/AGENT_DEVELOPMENT_PLAN.md`
- `docs/ARCHITECTURE.md`
- `docs/MCP_SERVER_SPEC.md`
- `docs/DATA_GOVERNANCE.md`
- `docs/ACCEPTANCE_CRITERIA.md`
- `.agents/skills/texas-public-data-explorer/SKILL.md`
