# Acceptance Criteria

## App shell

- [x] App has header, sidebar, prompt bar, canvas, inspector/filter panel.
- [x] App can render at least one saved/generated dashboard.
- [x] App uses TypeScript and passes type check.

## Dataset catalog

- [x] Approved dataset catalog exists.
- [x] Dataset cards show source, city, topic, update status, and fields.
- [x] At least Austin building permits and Dallas 311 are represented.

## Query flow

- [x] Query endpoint/function accepts BoundedQuerySpec.
- [x] Query endpoint/function validates dataset and fields.
- [x] Query endpoint/function returns QueryResult.
- [x] Query result includes source attribution and caveats.
- [x] Row limits are enforced.
- [x] Unknown fields/operators are rejected.

## Canvas flow

- [x] CanvasSpec schema exists.
- [x] Unknown block types are rejected.
- [x] Generated canvas includes SummaryBlock, ChartBlock, TableBlock, and SourceMethodBlock.
- [x] SourceMethodBlock is mandatory.

## Visuals

- [x] Chart block renders data.
- [x] Table block renders data.
- [x] Map/geography block renders a map or geography visualization placeholder.
- [x] Filters update visible results or trigger re-query.

## MCP

- [x] MCP server package exists.
- [x] MCP tools are implemented or scaffolded with typed schemas.
- [x] Tools include search_datasets, get_dataset_metadata, query_dataset, recommend_visualization, generate_canvas_spec.
- [x] MCP README explains how to run and test the server.

## Agent skill

- [x] `.agents/skills/texas-public-data-explorer/SKILL.md` exists.
- [x] Skill includes name and description metadata.
- [x] Skill explains safe dataset discovery, bounded querying, visualization rules, attribution, and Miro export rules.
- [x] Skill includes at least two example workflows.

## Miro export stretch

- [x] MiroExportSpec schema exists.
- [x] Export spec includes required source/method frame.
- [x] Export template supports briefing board and slide deck modes.
- [x] If Miro MCP is wired, board writes require user confirmation.

## Demo

- [x] Dallas 311 demo works.
- [x] Austin permits demo works.
- [x] README includes setup and demo commands.
- [x] Demo script includes fallback instructions if live API is unavailable.
