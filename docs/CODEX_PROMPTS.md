# Codex Prompts

Use these staged prompts rather than one giant task.

## Master prompt

```text
You are building Texas Data Canvas from this repo handoff packet.

Goal:
Create a hackathon-ready MVP of Texas Data Canvas: an open-source, MCP-powered visual explorer for Texas public datasets. Users ask natural-language questions, the system discovers approved public datasets, runs safe bounded queries, and renders interactive dashboards with maps, charts, tables, filters, summaries, and source attribution. Miro export is stretch: generated dashboards can be exported as briefing/workshop board specs.

Read first:
1. AGENTS.md
2. docs/PRD.md
3. docs/MVP_BUILD_BRIEF.md
4. docs/AGENT_DEVELOPMENT_PLAN.md
5. docs/ARCHITECTURE.md
6. docs/DATA_GOVERNANCE.md
7. docs/MCP_SERVER_SPEC.md
8. docs/ACCEPTANCE_CRITERIA.md
9. .agents/skills/texas-public-data-explorer/SKILL.md

Important:
Do not build arbitrary AI-generated HTML/JavaScript execution. The app must render validated CanvasSpec JSON through an allowlisted React block registry.

Implement the current phase, run verification, and report what changed, what commands ran, and any blockers.
```

## Prompt P0 - Repo setup

```text
Read AGENTS.md and the PRD. Create the initial monorepo structure for Texas Data Canvas.

Implement:
- apps/web Next.js TypeScript app
- apps/mcp-server TypeScript package
- packages/shared for schemas/types
- docs folder
- data/catalog and data/samples
- README with setup commands

Do not build UI yet beyond a basic placeholder page. Focus on clean structure, package scripts, TypeScript config, shared schemas, and sample data imports.
Run install/build/typecheck if possible and fix errors.
```

## Prompt P1 - Frontend shell

```text
Build the Texas Data Canvas frontend shell in apps/web.

Create:
- header
- left dataset/source sidebar
- prompt bar
- main canvas area
- right inspector/filter panel
- footer save/share/export controls
- routes for /explore, /sources, and /saved

Use sample static data for now. Make it look like a polished civic data dashboard. Do not wire the MCP server yet.
Run typecheck/build and fix errors.
```

## Prompt P2 - Canvas blocks

```text
Implement the contained CanvasSpec renderer.

Create:
- CanvasSpec Zod schema
- block registry
- CanvasRenderer
- SummaryBlock
- MetricBlock
- ChartBlock
- MapBlock or GeographyBlock
- TableBlock
- FilterBlock
- SourceMethodBlock

Reject unknown block types. Ensure SourceMethodBlock appears in generated demo dashboards.
Use sample data.
Run typecheck/build and fix errors.
```

## Prompt P3 - Data/query layer

```text
Implement the safe data/query layer.

Create:
- approved dataset catalog loader
- Austin permits sample data loader
- Dallas 311 sample data loader
- BoundedQuerySpec schema
- queryDataset function
- filtering, grouping, count aggregation, simple sum/avg where appropriate
- source attribution model
- query audit model

Do not allow arbitrary SQL. Validate dataset IDs, fields, operators, and row limits.
Run tests/typecheck/build.
```

## Prompt P4 - MCP server

```text
Implement the TypeScript MCP server package for Texas Data Canvas.

Tools:
- list_supported_sources
- search_datasets
- get_dataset_metadata
- query_dataset
- recommend_visualization
- generate_canvas_spec
- summarize_query_result
- get_source_attribution
- audit_query

Use shared schemas where possible. Tools should operate on the approved catalog and sample data first.
Add README instructions for running and testing the MCP server with MCP Inspector.
Run typecheck/build.
```

## Prompt P5 - Demo integration

```text
Wire the frontend prompt bar to generate dashboards for these demo prompts:

1. "Show Dallas 311 service requests by category and ZIP code for 2024."
2. "Show Austin building permits by month and ZIP code."

The output should be a CanvasSpec rendered through trusted blocks.
Include charts, table, map/geography card, filters, summary, and source/method card.
Run build and fix issues.
```

## Prompt P6 - Miro export stretch

```text
Add Miro export as a stretch feature without making Miro required for the core app.

Implement:
- MiroExportSpec schema
- generateMiroExportSpec function
- generate_miro_export_spec MCP tool or scaffold
- Export to Miro modal with templates:
  - briefing_board
  - slide_deck
  - community_workshop
- required source/method frame

Do not call Miro automatically. The output should be inspectable before board creation. If Miro MCP is configured, document how to create frames/docs/tables/images after user confirmation.
Run typecheck/build.
```

## Prompt P7 - Polish and demo readiness

```text
Polish the app for hackathon demo.

Improve:
- empty states
- loading states
- dataset source cards
- right-side filters
- save/share/export buttons
- source/methodology display
- README
- docs/DEMO_SCRIPT.md
- docs/ACCEPTANCE_CRITERIA.md

Run final typecheck/build. Summarize completed work and remaining gaps.
```
