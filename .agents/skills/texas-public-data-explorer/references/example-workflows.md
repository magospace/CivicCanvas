# Example Workflows

## Dallas 311

Prompt: Show Dallas 311 service requests by category and ZIP code for 2024.

Expected steps:

1. search_datasets
2. get_dataset_metadata
3. query_dataset with created_date between 2024-01-01 and 2024-12-31
4. group by category, ZIP, and month as needed
5. recommend_visualization
6. generate_canvas_spec
7. render SummaryBlock, MetricBlock, ChartBlock, MapBlock, TableBlock, SourceMethodBlock

## Austin permits

Prompt: Show Austin building permits by month and ZIP code.

Expected steps:

1. search_datasets
2. get_dataset_metadata
3. query_dataset grouped by month and ZIP code
4. generate CanvasSpec
5. include caveat about administrative permit records

## Miro briefing export

Prompt: Export this dashboard to Miro as a council briefing board.

Expected steps:

1. confirm current CanvasDocument has SourceMethodBlock
2. generate_miro_export_spec
3. show frame preview
4. only then call Miro MCP if configured and user approves
