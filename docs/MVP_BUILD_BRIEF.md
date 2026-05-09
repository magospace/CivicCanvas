# MVP Build Brief

## Objective

Build a hackathon-ready MVP of Texas Data Canvas.

Texas Data Canvas helps users ask questions about Texas public data and receive interactive, source-cited dashboards.

## MVP demo prompt 1

> Show Dallas 311 service requests by category and ZIP code for 2024.

Expected output:

- Summary of total requests and top categories
- Requests over time chart
- Requests by ZIP code map/geography card
- Top request categories bar chart
- Detail table
- Source and method card
- Right-side filters for city, date range, category, group by, and visualization

## MVP demo prompt 2

> Show Austin building permits by month and ZIP code.

Expected output:

- Summary of permit activity
- Permits by month chart
- Permits by ZIP code map/geography card
- Top ZIP codes chart
- Detail table
- Source and method card

## MVP-plus stretch demo

> Export this Dallas 311 dashboard to Miro as a council briefing board.

Expected output:

- MiroExportSpec with frames for title, summary, metrics, map, chart, table, source/method, discussion questions, and next steps.
- If Miro MCP is configured, create a board/frames/docs/tables/images after user confirmation.

## MVP must prove

1. Natural-language prompt can generate a dashboard.
2. Dashboard is built from trusted blocks.
3. Dashboard has interactive filters.
4. Dataset/source attribution is visible.
5. Query/result path is bounded and auditable.
6. MCP tools exist and are documented.
7. Agent skill exists and explains safe usage.
8. Miro export is available as a spec or integration stretch.

## MVP implementation approach

Use local sample data first for demo reliability.

Then add public API adapters as stretch:

- Socrata/Tyler adapter
- CKAN adapter
- Static CSV/GeoJSON adapter

## Required app routes

- `/` landing or redirect to `/explore`
- `/explore` main app experience
- `/sources` dataset catalog/source list
- `/saved` saved canvases placeholder

## Required API routes or equivalent functions

- `GET /api/datasets`
- `GET /api/datasets/:id`
- `POST /api/query`
- `POST /api/canvas/generate`
- `GET /api/canvas/:id`
- `POST /api/canvas/save`
- `POST /api/export/miro-spec` stretch

## Required schemas

- DatasetSource
- DatasetMetadata
- BoundedQuerySpec
- QueryResult
- CanvasDocument
- CanvasBlock
- SourceAttribution
- VisualizationRecommendation
- MiroExportSpec stretch

## Final user-facing result

The user sees a polished dashboard that looks like a real civic data product, not a developer demo.
