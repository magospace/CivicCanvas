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
pnpm typecheck
pnpm test
pnpm build
pnpm preflight
```

## MVP demo prompts

Use `/explore` and run:

```text
Show Dallas 311 service requests by category and ZIP code for 2024.
Show Austin building permits by month and ZIP code.
```

Unsupported prompts return approved dataset suggestions instead of hallucinated dashboards.

## MCP server

```bash
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
```

The MCP server exposes safe catalog, query, source attribution, audit, canvas, visualization, and Miro export-spec tools. All dataset queries are bounded and catalog-validated.

## Deployment

The web app is ready for Vercel-style deployment from `apps/web` after the root quality gate passes.

```bash
pnpm preflight
pnpm --filter @texas-data-canvas/web build
```

Sample mode requires no secrets. Live public-data adapters are disabled by default until each source is verified in `data/catalog/approved-datasets.json`.

## Workspace packages

- `apps/web` - Next.js App Router frontend shell.
- `apps/mcp-server` - typed MCP server scaffold for later phases.
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
