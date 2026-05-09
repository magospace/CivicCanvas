# Acceptance Criteria

## App shell

- [ ] App has header, sidebar, prompt bar, canvas, inspector/filter panel.
- [ ] App can render at least one saved/generated dashboard.
- [ ] App uses TypeScript and passes type check.

## Dataset catalog

- [ ] Approved dataset catalog exists.
- [ ] Dataset cards show source, city, topic, update status, and fields.
- [ ] At least Austin building permits and Dallas 311 are represented.

## Query flow

- [ ] Query endpoint/function accepts BoundedQuerySpec.
- [ ] Query endpoint/function validates dataset and fields.
- [ ] Query endpoint/function returns QueryResult.
- [ ] Query result includes source attribution and caveats.
- [ ] Row limits are enforced.
- [ ] Unknown fields/operators are rejected.

## Canvas flow

- [ ] CanvasSpec schema exists.
- [ ] Unknown block types are rejected.
- [ ] Generated canvas includes SummaryBlock, ChartBlock, TableBlock, and SourceMethodBlock.
- [ ] SourceMethodBlock is mandatory.

## Visuals

- [ ] Chart block renders data.
- [ ] Table block renders data.
- [ ] Map/geography block renders a map or geography visualization placeholder.
- [ ] Filters update visible results or trigger re-query.

## MCP

- [ ] MCP server package exists.
- [ ] MCP tools are implemented or scaffolded with typed schemas.
- [ ] Tools include search_datasets, get_dataset_metadata, query_dataset, recommend_visualization, generate_canvas_spec.
- [ ] MCP README explains how to run and test the server.

## Agent skill

- [ ] `.agents/skills/texas-public-data-explorer/SKILL.md` exists.
- [ ] Skill includes name and description metadata.
- [ ] Skill explains safe dataset discovery, bounded querying, visualization rules, attribution, and Miro export rules.
- [ ] Skill includes at least two example workflows.

## Miro export stretch

- [ ] MiroExportSpec schema exists.
- [ ] Export spec includes required source/method frame.
- [ ] Export template supports briefing board and slide deck modes.
- [ ] If Miro MCP is wired, board writes require user confirmation.

## Demo

- [ ] Dallas 311 demo works.
- [ ] Austin permits demo works.
- [ ] README includes setup and demo commands.
- [ ] Demo script includes fallback instructions if live API is unavailable.
