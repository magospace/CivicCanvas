# AGENTS.md

## Project

Build Texas Data Canvas: an open-source, MCP-powered visual explorer for Texas public datasets.

Users ask natural-language questions about Texas public data. The app discovers approved public datasets, runs safe bounded queries through an MCP server, and renders interactive dashboards using maps, charts, tables, filters, summaries, and source attribution. Optional stretch: export generated dashboards to Miro as briefing boards, slide-like frames, or workshop boards.

## Primary goal

Deliver a hackathon-ready MVP for the Brainforge / Vicinity Texas Open Data Track:

1. Visual interface for real Texas public data.
2. Public dataset attribution.
3. Safe bounded query behavior.
4. Custom MCP server.
5. Agent skill documentation.
6. Open-source-ready repo.
7. Optional Miro export spec/workflow.

## Build order

Build in this order:

1. Create the monorepo structure and shared schemas.
2. Build the Next.js frontend shell.
3. Implement the contained canvas with trusted React blocks.
4. Implement mock/sample data support and approved dataset catalog.
5. Implement safe query functions and validation.
6. Implement the MCP server tools.
7. Connect frontend prompt flow to query/canvas generation.
8. Add source attribution, caveats, and query audit UI.
9. Add the repo-scoped agent skill.
10. Add Miro export spec as stretch.
11. Add tests, demo script, and README.
12. Polish UI for demo readiness.

## Tech stack

Use:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui-style components where useful
- Puck or a simple controlled grid fallback for the canvas/editor
- MapLibre GL JS for maps, or a static geography placeholder for MVP if map tiles are blocked
- Vega-Lite, ECharts, or Recharts for charts
- TanStack Table or a simple typed table component
- Zod for schema validation
- Node/TypeScript MCP server
- Local JSON sample data for reliable demo fallback

## Non-negotiable product constraints

Do not implement arbitrary AI-generated raw HTML or JavaScript execution.

The AI may create a validated CanvasSpec JSON object. The app must render that spec through an allowlisted React block registry.

Allowed canvas block types:

- SummaryBlock
- MetricBlock
- ChartBlock
- MapBlock
- TableBlock
- FilterBlock
- SourceMethodBlock
- DatasetCardBlock

Every generated dashboard must include SourceMethodBlock.

## Data safety rules

- Use only approved public datasets.
- Do not scrape behind authentication.
- Do not expose private, personal, or sensitive fields.
- Prefer aggregation over raw rows.
- Enforce row limits.
- Include source attribution.
- Include query filters and caveats.
- Do not infer causation from descriptive public data.
- Do not generate arbitrary SQL from the model.
- Do not let Miro export bypass source/safety rules.

## MVP datasets

Start with curated sample data and source metadata:

1. Austin Building Permits
2. Dallas 311 Service Requests

Optional stretch:

3. Houston transportation incidents / road projects
4. Texas government spending
5. Housing affordability comparison

## MCP server requirements

Implement these MCP tools or well-typed scaffolds:

- list_supported_sources
- search_datasets
- get_dataset_metadata
- query_dataset
- get_sample_rows
- summarize_query_result
- recommend_visualization
- generate_canvas_spec
- validate_canvas_spec
- get_source_attribution
- audit_query
- generate_miro_export_spec (stretch)

Each tool should have typed input/output schemas and validation.

## Frontend requirements

The main screen should have:

- Header
- Prompt bar
- Dataset/source sidebar
- Main canvas area
- Inspector/filter panel
- Save/share/export controls
- Source and method card

The MVP should render:

- Summary card
- Metric cards
- Line or bar chart
- Map or geography visualization placeholder
- Sortable/paginated table
- Filter panel
- Source/methodology card

## Testing and verification

Before finishing each major implementation pass, run:

- Type check
- Lint, if configured
- Unit tests, if configured
- Build command
- Manual smoke test instructions

Do not claim completion unless the app builds successfully or a blocker is clearly documented.

## Implementation style

- Prefer small, typed, composable modules.
- Keep domain/query logic out of UI components.
- Reuse shared schemas between frontend and MCP/server where practical.
- Validate external/tool inputs with Zod.
- Store sample data and catalog data in version-controlled JSON files.
- Avoid broad try/catch blocks that hide errors.
- Avoid `any` unless absolutely necessary.
- Keep AGENTS.md under the default Codex guidance size budget; use docs/ for larger specs.

## Final deliverables

The repo should include:

- Working Next.js app
- Working MCP server or typed MCP-compatible server scaffold
- Curated dataset catalog
- Sample datasets
- Canvas block registry
- CanvasSpec schema
- BoundedQuerySpec schema
- Agent skill at `.agents/skills/texas-public-data-explorer/SKILL.md`
- README with setup instructions
- Demo script
- Acceptance checklist
- Optional Miro export spec/tool
