# Texas Data Canvas PRD v0.3

**Product:** Texas Data Canvas  
**Track:** Brainforge / Vicinity Texas Open Data Track - Make Texas Public Data Useful  
**Version:** v0.3  
**Date:** May 9, 2026  
**Primary deliverables:** Visual web app, custom MCP server, agent skill, open-source repo  
**Core thesis:** Texas public data is valuable, but most people cannot easily find, query, interpret, visualize, present, or reuse it. Texas Data Canvas makes Texas public datasets useful through a contained AI-assisted visual canvas.

---

## 1. Executive summary

Texas Data Canvas is an open-source visual explorer for Texas public data. A user asks a plain-English question, such as:

> Show Dallas 311 service requests by category and ZIP code for 2024.

The app finds a relevant approved public dataset, inspects the schema, runs a bounded query through a custom MCP server, and renders a polished interactive dashboard with maps, charts, tables, filters, summaries, source attribution, methodology, and caveats.

The app is not a generic chatbot and not an arbitrary code generator. AI helps assemble a dashboard specification, but the product renders that specification through an allowlisted registry of trusted React components. This keeps the app visually rich while preserving safety, repeatability, auditability, and responsible public-data use.

Miro export is included as an MVP-plus/stretch feature: a user can export a completed dashboard into a Miro board, briefing deck, or workshop board for civic meetings, grant discussions, reporting, and stakeholder collaboration.

---

## 2. Product positioning

### One-sentence pitch

Texas Data Canvas turns Texas public datasets into interactive, source-cited dashboards that anyone can create with natural language.

### Longer pitch

Texas Data Canvas is an MCP-powered visual canvas for civic and business exploration of Texas public data. Users ask questions in plain English, the app safely discovers and queries approved public datasets, and the result becomes a dashboard made of trusted interactive blocks: maps, charts, tables, filters, metric cards, summaries, and source/method cards. Users can save dashboards, export data, and optionally export a presentation/workshop board to Miro.

### Why it is different

Texas Data Canvas does not try to replace open data portals, BI tools, GIS platforms, or Miro. It acts as a guided interaction layer on top of public datasets.

| Existing tool category | What it does well | Gap Texas Data Canvas fills |
|---|---|---|
| City/state open data portals | Publish datasets, expose APIs, allow downloads | Often hard for nontechnical users to navigate, query, compare, and visualize quickly |
| GIS platforms | Powerful map layers and spatial analysis | Can be too specialized for casual civic/business users |
| BI dashboards | Strong reporting once data is modeled | Requires setup, data preparation, and dashboard-authoring knowledge |
| AI data assistants | Natural-language querying | Often lack civic-data governance, source attribution, visual canvas editing, and Texas-specific dataset context |
| Miro | Collaboration, workshops, presentation boards | Does not itself discover/query/analyze Texas public datasets safely |

---

## 3. Goals and non-goals

### Goals

1. Help users find useful Texas public datasets.
2. Turn natural-language questions into safe bounded public-data queries.
3. Render results visually through interactive dashboards.
4. Always show source attribution, method, query filters, and caveats.
5. Ship a custom MCP server with well-scoped tools.
6. Ship a proper agent skill with safe workflow instructions.
7. Support a polished hackathon demo over two strong workflows.
8. Design the product so it can grow into a scalable civic-tech platform.
9. Add optional Miro export for briefing boards, slide-like frames, and workshops.

### Non-goals for hackathon MVP

1. Do not support arbitrary user-uploaded private datasets.
2. Do not scrape behind authentication.
3. Do not execute AI-generated raw HTML or JavaScript.
4. Do not allow arbitrary SQL/SoQL from the model.
5. Do not expose sensitive personal fields.
6. Do not make causal or policy claims beyond the data.
7. Do not make Miro the main canvas; Miro is an export/collaboration destination.
8. Do not attempt to support every Texas dataset in the MVP.

---

## 4. Target users and jobs to be done

### Persona 1: Civic analyst

**Who:** City staff, public-sector analysts, civic tech teams.  
**Interested in:** 311 trends, permit activity, service performance, transportation, spending, infrastructure, district comparisons.  
**Uses data for:** Briefings, public dashboards, internal analysis, council support, service performance monitoring.  
**How they find data today:** City open data portals, CSV exports, GIS tools, spreadsheets, departmental reports.  
**How this app helps:** They can ask a question, generate a source-cited dashboard, filter it, and share it without manually building a chart pack.

Example questions:

- Which 311 issues are rising in my district?
- How do response times compare by ZIP code?
- Where are building permits increasing?
- Which departments saw spending increases?

### Persona 2: City council staffer / elected office

**Who:** Staff supporting elected officials and constituent service.  
**Interested in:** Constituent complaints, neighborhood issues, response times, public investment, district-specific trends.  
**Uses data for:** Council briefings, constituent response, budget hearings, community meetings.  
**How they find data today:** Staff research, constituent systems, public portals, emails, manually prepared reports.  
**How this app helps:** Converts public service data into a visual briefing with source, method, and caveats.

Example questions:

- What are constituents reporting most often this quarter?
- Which neighborhoods have unresolved requests?
- What should we highlight in a council briefing?

### Persona 3: Journalist / public storyteller

**Who:** Local reporters, data journalists, researchers, students.  
**Interested in:** Story leads, public accountability, trends, city/county comparisons, source-backed visuals.  
**Uses data for:** Articles, charts, maps, public explainers, research.  
**How they find data today:** Open data portals, FOIA/public records requests, spreadsheets, Python/R, manual cleaning.  
**How this app helps:** Speeds up discovery, validates dataset context, and exports source-cited visuals.

Example questions:

- What changed in Dallas 311 requests over the last year?
- Which neighborhoods have the most unresolved complaints?
- How does this city compare with other Texas cities?

### Persona 4: Real estate developer / builder

**Who:** Developers, construction companies, site planners, commercial brokers.  
**Interested in:** Permits, development patterns, housing activity, infrastructure projects, zoning signals, road work.  
**Uses data for:** Site screening, market research, project planning, investment theses.  
**How they find data today:** Permit portals, city websites, GIS maps, broker reports, paid data tools, spreadsheets.  
**How this app helps:** Shows public development signals visually across ZIP codes, cities, and time periods.

Example questions:

- Where are residential permits growing fastest?
- Which ZIP codes have the highest permit value?
- What areas have new road or infrastructure projects?

### Persona 5: Small business owner / site selector

**Who:** Local business owners, franchise operators, chambers, economic development groups.  
**Interested in:** Neighborhood growth, safety, nearby development, public investment, traffic/transportation, demographics.  
**Uses data for:** Location decisions, expansion planning, community research.  
**How they find data today:** Search engines, city websites, broker advice, informal research, paid reports.  
**How this app helps:** Provides easy, public-data-backed location context without requiring GIS or SQL knowledge.

Example questions:

- Is this a good area to open my business?
- How is the neighborhood changing?
- What public projects are nearby?

### Persona 6: Nonprofit / advocate

**Who:** Housing advocates, transportation nonprofits, environmental groups, community organizations.  
**Interested in:** Equity gaps, affordability, access to services, infrastructure problems, environmental issues.  
**Uses data for:** Grant writing, community presentations, needs assessments, advocacy, program planning.  
**How they find data today:** Public portals, Census tools, reports, hand-built maps and slides.  
**How this app helps:** Creates evidence boards and dashboards with source-cited findings and caveats.

Example questions:

- Where are affordability challenges greatest?
- Which communities have the least service access?
- What data supports our grant proposal?

### Persona 7: Researcher / student

**Who:** Policy students, university researchers, analysts, data science learners.  
**Interested in:** Dataset discovery, metadata, cross-city comparisons, exportable data, repeatable query workflows.  
**Uses data for:** Research, class projects, analysis, policy papers.  
**How they find data today:** Data portals, API docs, CSV downloads, Python/R notebooks.  
**How this app helps:** Provides a fast exploration layer before deeper analysis.

Example questions:

- What datasets measure this topic?
- How do trends compare over time?
- Can I export the data for analysis?

### Persona 8: Government contractor / vendor

**Who:** Vendors, government contractors, consultants, infrastructure firms.  
**Interested in:** Spending, budgets, contracts, procurement, capital projects, departmental activity.  
**Uses data for:** Market research, sales targeting, bid strategy, opportunity discovery.  
**How they find data today:** Procurement portals, comptroller sites, city council agendas, spreadsheets.  
**How this app helps:** Turns public spending and contract records into searchable visual context.

Example questions:

- Which departments spend the most?
- What contracts are coming up?
- Where are project opportunities?

---

## 5. Core user journeys

### Journey A: Natural-language dashboard generation

1. User types: “Show Dallas 311 service requests by category and ZIP code for 2024.”
2. App interprets city, topic, time range, metrics, and desired visual form.
3. MCP `search_datasets` returns approved dataset candidates.
4. MCP `get_dataset_metadata` inspects fields and source details.
5. MCP `query_dataset` runs a bounded aggregate query.
6. MCP `recommend_visualization` recommends map, time series, category chart, table, and summary.
7. MCP or app generates `CanvasSpec` JSON.
8. Frontend validates the spec and renders trusted blocks.
9. User interacts with filters and map/table/chart controls.
10. App keeps source/method visible.

### Journey B: Browse by city and topic

1. User opens Sources or Explore.
2. User browses Austin, Dallas, Houston, San Antonio, or State of Texas.
3. User chooses a topic: 311, permits, housing, transportation, spending, infrastructure.
4. App shows dataset cards with fields, update frequency, geography, and recommended visuals.
5. User adds a dataset to the canvas or previews it.

### Journey C: Compare communities

1. User asks: “Compare housing affordability across Austin, Dallas, Houston, and San Antonio.”
2. App finds compatible datasets and notes comparability limitations.
3. App creates a dashboard with metric cards, comparison bar chart, trend chart, map, table, and caveats.
4. User toggles “normalize by population” or changes metric.

### Journey D: Drill down and filter

1. User clicks a ZIP code on a map.
2. Dashboard filters to that ZIP code.
3. Charts, table, and summary update.
4. User saves or exports the filtered view.

### Journey E: Export to Miro briefing/workshop board

1. User creates a dashboard.
2. User clicks Export > Miro.
3. User selects template:
   - Briefing Board
   - Slide Deck
   - Community Workshop
4. App generates `MiroExportSpec`.
5. Miro MCP creates board/frames/docs/tables/images after user confirmation.
6. Export includes source/method/caveats as a required frame.

---

## 6. Functional requirements

### 6.1 App shell

The app must include:

- Header: Texas Data Canvas, Explore, Saved Canvases, Sources, user menu.
- Left sidebar: cities, topics, datasets, data-source summary.
- Prompt bar: natural-language input and Generate View button.
- Canvas area: blocks rendered from validated `CanvasSpec`.
- Right inspector: filters, visualization settings, source details, export controls.
- Footer/status: save state, undo/redo, share, save canvas.

### 6.2 Dataset discovery

The app must:

- Search approved public sources only.
- Support browse by city and topic.
- Show dataset cards with title, source, city, topic, fields, update frequency, geography availability, recommended visuals, and caveats.
- Prefer datasets with usable date/geography/category fields.
- Avoid data behind authentication or unclear terms.

### 6.3 Bounded query

The app must:

- Use `BoundedQuerySpec` rather than arbitrary SQL.
- Validate dataset ID, fields, operators, date ranges, groupings, metrics, and limits.
- Enforce row limits.
- Hide or aggregate sensitive fields.
- Return `QueryResult` with source attribution and caveats.
- Record query audit metadata.

### 6.4 Contained visual canvas

The app must:

- Store dashboards as `CanvasDocument` JSON.
- Render only allowlisted blocks.
- Reject unknown block types.
- Make `SourceMethodBlock` mandatory.
- Allow drag/reorder/resize/configuration where feasible.
- Allow chart type switching and filters.
- Never execute AI-generated raw HTML or JavaScript at runtime.

Allowed blocks:

- `SummaryBlock`
- `MetricBlock`
- `ChartBlock`
- `MapBlock`
- `TableBlock`
- `FilterBlock`
- `SourceMethodBlock`
- `DatasetCardBlock`
- `MiroExportBlock` optional/stretch

### 6.5 Visualization

The app should support:

- Line chart for time series.
- Bar chart for rankings/categories.
- Metric cards for totals and KPIs.
- Map/geography block for ZIP/county/city/district/point/corridor data.
- Table block for inspectable grouped results.
- Summary block for human-readable interpretation.
- Source/method block for attribution and caveats.

### 6.6 Save/share/export

The app should support:

- Save canvas.
- Duplicate canvas.
- Share read-only link or placeholder in MVP.
- Export CSV.
- Export Canvas JSON.
- Export Miro board spec in MVP-plus/stretch.
- Export PDF/static HTML in later V1/V2.

### 6.7 Miro export

The app should support Miro export as a stretch feature:

- Generate a `MiroExportSpec` from a saved/generated canvas.
- Support templates:
  - Council Briefing Board
  - Slide Deck
  - Community Workshop Board
  - Research/Story Board
- Export summary and methodology as docs/text.
- Export charts/maps as images when available.
- Export tables as Miro table-compatible data.
- Include source/method/caveats as a required frame.
- Require user confirmation before writing to a Miro board.
- Keep all data validation in Texas Data Canvas; Miro is an output target, not the public-data query engine.

---

## 7. Data requirements

### 7.1 Initial approved datasets

MVP must support at least two workflows:

1. Dallas 311 Service Requests
2. Austin Building Permits

Stretch datasets:

3. Houston Transportation / Road Projects
4. Texas Government Spending
5. Housing Affordability Comparison

### 7.2 Data access strategy

Use a three-level approach:

1. Curated catalog: `data/catalog/approved-datasets.json`.
2. Sample data fallback: `data/samples/*.sample.json` for reliable demo.
3. API adapters as stretch:
   - Socrata/Tyler adapter.
   - CKAN adapter.
   - Static CSV/GeoJSON adapter.

The final demo should clearly distinguish sample fallback data from live public data. If live API access is working, source cards should show the original public dataset URL, retrieval time, and query method.

### 7.3 Field classification

Fields should be classified as:

- `safe_public`
- `safe_with_aggregation`
- `sensitive_hide`
- `unknown_review`

Default handling:

| Field type | Default handling |
|---|---|
| ZIP/city/county | Allowed |
| Date/month/year | Allowed |
| Category/status/type | Allowed |
| Exact address | Hide or generalize |
| Person name | Hide |
| Phone/email | Hide |
| Lat/lon | Aggregate/fuzz for sensitive topics |
| Public request/permit ID | Allow only when useful and safe |
| Public safety incident detail | Aggregate by time/geography/category |

---

## 8. Technical architecture

### 8.1 Recommended stack

| Layer | Recommendation |
|---|---|
| Frontend | Next.js + React + TypeScript |
| Styling | Tailwind CSS, shadcn/ui-style components |
| Canvas/editor | Puck or simple controlled grid fallback |
| Charts | Vega-Lite, ECharts, or Recharts |
| Maps | MapLibre GL JS, or geography placeholder if map tiles block MVP |
| Tables | TanStack Table or simple typed table |
| Validation | Zod |
| Backend/API | Next.js route handlers or separate Node service |
| MCP server | TypeScript MCP server package |
| Storage MVP | Local JSON/in-memory |
| Storage V1 | Postgres/Supabase |
| Collaboration export | Miro MCP integration through `MiroExportSpec` |

### 8.2 System flow

```text
User prompt
  -> intent parsing / dashboard generation request
  -> MCP search_datasets
  -> MCP get_dataset_metadata
  -> MCP query_dataset
  -> MCP recommend_visualization
  -> CanvasSpec generation
  -> schema validation
  -> trusted React block rendering
  -> save/share/export
  -> optional MiroExportSpec + Miro MCP
```

### 8.3 CanvasSpec model

```ts
type CanvasDocument = {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  blocks: CanvasBlock[];
  sources: SourceAttribution[];
  queries: QueryReference[];
};

type CanvasBlock = {
  id: string;
  type: 'SummaryBlock' | 'MetricBlock' | 'ChartBlock' | 'MapBlock' | 'TableBlock' | 'FilterBlock' | 'SourceMethodBlock' | 'DatasetCardBlock';
  title?: string;
  queryId?: string;
  props: Record<string, unknown>;
  layout?: { x: number; y: number; w: number; h: number };
};
```

### 8.4 BoundedQuerySpec model

```ts
type BoundedQuerySpec = {
  datasetId: string;
  filters?: Array<{
    field: string;
    operator: 'eq' | 'neq' | 'contains' | 'in' | 'between' | 'gte' | 'lte';
    value: unknown;
  }>;
  groupBy?: string[];
  metrics?: Array<{
    type: 'count' | 'sum' | 'avg' | 'min' | 'max';
    field?: string;
    alias: string;
  }>;
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
};
```

### 8.5 MiroExportSpec model

```ts
type MiroExportSpec = {
  canvasId: string;
  title: string;
  template: 'briefing_board' | 'slide_deck' | 'community_workshop' | 'research_story_board';
  frames: Array<{
    id: string;
    title: string;
    purpose: string;
    items: Array<
      | { type: 'text'; title?: string; content: string }
      | { type: 'table'; title: string; columns: string[]; rows: string[][] }
      | { type: 'image'; title: string; assetId: string; alt: string }
      | { type: 'sticky'; content: string; color?: string }
    >;
  }>;
  sourceMethodFrameRequired: true;
};
```

---

## 9. MCP server requirements

### 9.1 Server name

`texas-public-data-mcp`

### 9.2 Core tools

| Tool | Purpose | MVP priority |
|---|---|---|
| `list_supported_sources` | Return allowlisted portals/sources | Must |
| `search_datasets` | Find relevant approved datasets | Must |
| `get_dataset_metadata` | Return schema, fields, source, caveats | Must |
| `query_dataset` | Run bounded validated query | Must |
| `get_sample_rows` | Preview limited safe rows | Should |
| `summarize_query_result` | Plain-English descriptive summary | Must |
| `recommend_visualization` | Choose appropriate visual blocks | Must |
| `generate_canvas_spec` | Generate safe CanvasSpec JSON | Must |
| `validate_canvas_spec` | Validate unknown blocks/missing source | Should |
| `get_source_attribution` | Return source/method info | Must |
| `audit_query` | Return query audit record | Should |
| `generate_miro_export_spec` | Create Miro-ready export spec | Stretch |

### 9.3 MCP guardrails

- Approved datasets only.
- No arbitrary SQL from model.
- No shell execution.
- No external URLs except approved dataset/source URLs.
- Strict JSON schema validation.
- Row limits.
- Field allowlists.
- Sensitive-field classification.
- Aggregation by default for sensitive datasets.
- Source/caveat required in every query result.
- Query audit record created for each request.

---

## 10. Agent skill requirements

The repo must include:

```text
.agents/skills/texas-public-data-explorer/SKILL.md
.agents/skills/texas-public-data-explorer/references/dataset-selection.md
.agents/skills/texas-public-data-explorer/references/query-safety.md
.agents/skills/texas-public-data-explorer/references/visualization-rules.md
.agents/skills/texas-public-data-explorer/references/attribution-rules.md
.agents/skills/texas-public-data-explorer/references/miro-export-rules.md
.agents/skills/texas-public-data-explorer/references/example-workflows.md
```

The skill should instruct coding agents and product agents to:

1. Search approved datasets first.
2. Inspect metadata before querying.
3. Use bounded query specs only.
4. Prefer aggregate views.
5. Render through approved canvas blocks.
6. Always include SourceMethodBlock.
7. Avoid raw AI-generated runtime code.
8. Avoid unsupported claims.
9. Generate Miro export specs only after canvas results are source-safe.
10. Update docs/tests when behavior changes.

---

## 11. UX requirements

### Main Explore screen

Must include:

- Dataset/city sidebar.
- Prompt bar.
- Dashboard cards.
- Map/chart/table blocks.
- Right-side filters.
- Source/method block.
- Export controls.

### Sources screen

Must include:

- Search datasets/topics/cities.
- Filter chips: city, topic, geography, update frequency, data type.
- Dataset cards with preview/open/add.
- Right detail panel with fields, records, recommended questions.

### Saved canvases screen

Must include:

- Search saved dashboards.
- Filter by city/topic/status.
- Canvas preview cards.
- Right detail panel with included blocks and sources.

### Miro export screen/modal

Should include:

- Template selection.
- Included blocks checklist.
- Required source/method reminder.
- Preview of frames.
- Confirmation before creating board.

---

## 12. Phased roadmap

### P0: Documentation and repo foundation

Deliver:

- PRD, AGENTS.md, build brief, architecture, governance, acceptance criteria, skill docs.
- Monorepo folders.
- Starter catalog and sample data.

### P1: Frontend shell

Deliver:

- Next.js app shell with mock dashboard.
- Explore/Sources/Saved routes.
- Polished layout matching mockups.

### P2: Canvas system

Deliver:

- Zod schemas.
- Block registry.
- Canvas renderer.
- Summary, metric, chart, map/geography, table, filter, source blocks.

### P3: Query and dataset layer

Deliver:

- Approved dataset catalog.
- Sample data query functions.
- Field classification.
- BoundedQuerySpec validation.
- QueryResult and SourceAttribution.

### P4: MCP server

Deliver:

- `texas-public-data-mcp` TypeScript package.
- Core tools with typed schemas.
- MCP Inspector instructions.
- Tool tests.

### P5: Prompt-to-dashboard integration

Deliver:

- Demo prompts produce dashboards.
- Dallas 311 and Austin permits work end to end.
- Filters update results.

### P6: Miro export stretch

Deliver:

- `generate_miro_export_spec` tool/function.
- Export modal.
- Board templates.
- Optional integration instructions for Miro MCP.

### P7: Demo polish

Deliver:

- README.
- Demo script.
- Acceptance checklist.
- Build/test verification.
- Clear caveats if sample data fallback is used.

---

## 13. Acceptance criteria

MVP is complete when:

1. App runs locally.
2. User can type Dallas 311 demo prompt and see a dashboard.
3. User can type Austin permits demo prompt and see a dashboard.
4. Every dashboard includes source/method/caveats.
5. Dashboard renders through trusted block registry.
6. Unknown block types are rejected.
7. Query specs are validated and bounded.
8. MCP server exposes core tools.
9. Agent skill exists with references.
10. README explains setup and demo.
11. Optional/stretch: Miro export spec can be generated.

---

## 14. Demo prompts

### Demo 1: Dallas 311

> Show Dallas 311 service requests by category and ZIP code for 2024.

Expected blocks:

- SummaryBlock
- MetricBlock(s)
- Line ChartBlock
- MapBlock
- Bar ChartBlock
- TableBlock
- FilterBlock
- SourceMethodBlock

### Demo 2: Austin permits

> Show Austin building permits by month and ZIP code.

Expected blocks:

- SummaryBlock
- MetricBlock(s)
- Line ChartBlock
- MapBlock
- Bar ChartBlock
- TableBlock
- SourceMethodBlock

### Demo 3: Miro export stretch

> Export this dashboard to Miro as a council briefing board.

Expected frames:

- Title/question
- Executive summary
- Key metrics
- Map
- Chart
- Table/highlights
- Source and method
- Discussion questions
- Action planning

---

## 15. Risks and mitigations

- **Live public API unavailable:** Use curated sample fallback and mark it clearly as demo data.
- **AI picks wrong dataset:** Show dataset confidence and require user confirmation when confidence is low.
- **Sensitive fields exposed:** Use field classification, allowlists, aggregation defaults, and hidden-field rules.
- **Raw generated code creates risk:** Use CanvasSpec and the trusted React block registry only.
- **Demo scope too broad:** Focus on Dallas 311 and Austin permits first.
- **Maps are hard:** Use MapLibre if feasible; otherwise use a geography card or choropleth placeholder for MVP.
- **Miro integration distracts:** Treat Miro as a stretch export feature, not the core app.
- **Hackathon judges expect real data:** Use public source attribution and a live adapter if feasible; clearly label any sample fallback.

---

## 16. Final implementation guidance

The development agent should start with docs and structure, then build demo reliability before live API depth. The goal is not to build the largest public-data portal. The goal is to build the clearest proof that Texas public data can be discovered, safely queried, visualized, cited, saved, and exported for action.
