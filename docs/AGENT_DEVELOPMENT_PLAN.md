# Agent Development Plan

This is the recommended phased plan for Codex or another coding agent.

## Ground rules

- Read `AGENTS.md` first.
- Do not only write a plan; implement each phase.
- Keep changes scoped to the current phase.
- Run typecheck/build after each phase where possible.
- Do not implement arbitrary AI-generated HTML/JS execution.
- Use CanvasSpec + trusted block registry.
- Use BoundedQuerySpec + approved dataset catalog.
- Keep Miro export as stretch until the core app works.

---

## Phase P0 - Repo foundation

### Goal

Create a clean monorepo and shared schema foundation.

### Inputs

- `AGENTS.md`
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/MVP_BUILD_BRIEF.md`

### Tasks

1. Create `apps/web` Next.js TypeScript app.
2. Create `apps/mcp-server` TypeScript package.
3. Create `packages/shared` with shared types/schemas.
4. Add root package scripts.
5. Add README with setup commands.
6. Add sample dataset files and catalog.

### Success criteria

- Repo installs dependencies.
- TypeScript config exists.
- Shared schemas can be imported.
- README explains how to run.

---

## Phase P1 - Frontend shell

### Goal

Build the visual structure of Texas Data Canvas.

### Tasks

1. Create `/explore`, `/sources`, `/saved` routes.
2. Build header navigation.
3. Build left sidebar for city/topic/dataset navigation.
4. Build prompt bar with Generate View button.
5. Build main canvas placeholder.
6. Build right inspector/filter panel.
7. Build source/method placeholder.

### Success criteria

- App visually resembles the mockups.
- UI renders without real data.
- Responsive enough for demo screen.

---

## Phase P2 - Canvas system

### Goal

Implement the contained visual canvas.

### Tasks

1. Define CanvasSpec Zod schema.
2. Define CanvasBlock schemas.
3. Implement block registry.
4. Implement CanvasRenderer.
5. Implement blocks:
   - SummaryBlock
   - MetricBlock
   - ChartBlock
   - MapBlock or GeographyBlock
   - TableBlock
   - FilterBlock
   - SourceMethodBlock
6. Reject unknown blocks.
7. Make SourceMethodBlock mandatory.

### Success criteria

- A hardcoded CanvasSpec renders a dashboard.
- Invalid block type fails validation.
- SourceMethodBlock appears on every generated dashboard.

---

## Phase P3 - Data/query layer

### Goal

Make sample data queryable through safe bounded specs.

### Tasks

1. Load `approved-datasets.json`.
2. Load Dallas 311 and Austin permits sample data.
3. Implement BoundedQuerySpec validation.
4. Implement filtering.
5. Implement grouping and metrics.
6. Implement source attribution.
7. Implement query audit records.
8. Add field classification enforcement.

### Success criteria

- Dallas 311 grouped by category and ZIP works.
- Austin permits grouped by month and ZIP works.
- Invalid field/operator/limit is rejected.
- QueryResult includes source and caveats.

---

## Phase P4 - MCP server

### Goal

Expose the data workflow through MCP tools.

### Tasks

1. Implement TypeScript MCP server package.
2. Add tools:
   - list_supported_sources
   - search_datasets
   - get_dataset_metadata
   - query_dataset
   - recommend_visualization
   - generate_canvas_spec
   - summarize_query_result
   - get_source_attribution
   - audit_query
3. Share schemas with frontend if practical.
4. Add server README.
5. Add MCP Inspector command.

### Success criteria

- MCP server starts.
- Tools return typed results.
- Inspector can list/call tools.

---

## Phase P5 - Prompt-to-dashboard integration

### Goal

Make the demo prompts work end to end.

### Tasks

1. Implement prompt matching or lightweight intent parsing.
2. Dallas 311 prompt selects Dallas 311 dataset.
3. Austin permit prompt selects Austin permits dataset.
4. Generate BoundedQuerySpec.
5. Query sample data.
6. Generate CanvasSpec.
7. Render dashboard.
8. Connect filters to re-query or client-side filter.

### Success criteria

- Demo prompt 1 works.
- Demo prompt 2 works.
- Dashboard updates when filters change.

---

## Phase P6 - Miro export stretch

### Goal

Turn a dashboard into a Miro-ready briefing/workshop spec.

### Tasks

1. Define MiroExportSpec schema.
2. Add Export to Miro modal.
3. Add templates:
   - briefing_board
   - slide_deck
   - community_workshop
4. Implement `generate_miro_export_spec` function/tool.
5. Ensure source/method frame is required.
6. Add optional Miro MCP instructions, but do not make app dependent on Miro.

### Success criteria

- Dashboard can generate MiroExportSpec.
- Spec contains frames and items.
- Source/method frame is present.
- If Miro MCP is available, instructions show how to create board after confirmation.

---

## Phase P7 - Demo polish and verification

### Goal

Make the project judge-ready.

### Tasks

1. Improve UI polish.
2. Add loading/empty/error states.
3. Add README and demo script.
4. Add acceptance checklist.
5. Run typecheck/build/tests.
6. Document any limitations.

### Success criteria

- Repo builds.
- Demo script works.
- Docs explain what was built.
- MVP clearly satisfies track requirements.
