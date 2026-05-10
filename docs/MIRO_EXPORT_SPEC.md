# Miro Export Specification

## Feature summary

Miro export currently generates a preview-only `MiroExportSpec` JSON document from a validated Texas Data Canvas dashboard.

The current implementation does not authenticate with Miro, create boards, create frames, upload images, or perform any third-party write. The core product works without Miro, and the Miro path is limited to local preview/download/copy of governed JSON.

If a reviewer manually saves or shares preview JSON, use [`MIRO_PREVIEW_ARTIFACT_TEMPLATE.md`](MIRO_PREVIEW_ARTIFACT_TEMPLATE.md) to record the source dashboard, template type, validation status, and no-OAuth/no-board-write caveats. That template is an artifact note only; it is not release evidence unless Task 35 later reruns the full release gate and intentionally includes it.

## Why this matters

Many users need to present and discuss public-data findings:

- City council staff need briefing boards.
- Nonprofits need grant and advocacy evidence boards.
- Journalists need story boards.
- Developers and site selectors need stakeholder presentations.
- Researchers and students need presentation-ready visuals.

## Export templates

### Briefing board

Frames:

1. Title and question
2. Executive summary
3. Key metrics
4. Map / geography view
5. Chart / trend view
6. Table / detailed results
7. Source and method
8. Discussion questions
9. Next steps / action items

### Slide deck

Frames:

1. Title slide
2. Dataset and source
3. Key findings
4. Map
5. Chart
6. Table or comparison
7. Caveats
8. Next steps

### Community workshop

Frames:

1. What the data shows
2. What surprised us?
3. Where are the hotspots?
4. Community comments
5. Priorities / voting
6. Action planning
7. Source and method

No `research_story_board` template is implemented in the current schema. Treat any research/story-board workflow as a future idea until the shared schema, route validation, tests, and docs are updated together.

## MiroExportSpec

```ts
type MiroExportSpec = {
  schemaVersion: '1.0';
  title: string;
  template: 'briefing_board' | 'slide_deck' | 'community_workshop';
  frames: MiroFrameSpec[];
  sourceMethodFrameRequired: true;
};

type MiroFrameSpec = {
  title: string;
  items: MiroItemSpec[];
};

type MiroItemSpec =
  | { type: 'text'; content: string }
  | { type: 'chart'; content: string }
  | { type: 'map'; content: string }
  | { type: 'table'; content: string }
  | { type: 'source_method'; content: string };
```

## Safety rules

- Must include source/method frame.
- Must not export hidden/sensitive fields.
- Must not write to Miro in the current implementation.
- Must not include OAuth tokens, access tokens, board IDs, or write instructions in generated JSON.
- Must label sample/demo data if used.
- Must preserve source attribution and caveats.
- Must not use Miro as a substitute for dataset validation.

## Implementation approach

Implemented today:

1. Validate an input `CanvasDocument` with `safeValidateCanvasDocument()`.
2. Require a `SourceMethodBlock`.
3. Generate `briefing_board`, `slide_deck`, or `community_workshop` preview frames.
4. Validate output with `miroExportSpecSchema`.
5. Return preview JSON from `/api/export/miro-spec` with the note: "Preview-only MiroExportSpec. No Miro board write is performed in MVP."
6. Let users inspect, copy, or download the preview JSON.

Future authenticated Miro integration would be a new architecture boundary requiring OAuth/secrets, explicit user confirmation, API write tests, security docs, and updated governance notes. Do not describe the current feature as creating or updating a Miro board.

## Optional Miro MCP mapping

Not implemented in this repo today. This section is a future mapping only.

- Board creation: create a board for the briefing/workshop.
- Layout creation: create frames, text, shapes, and sticky notes.
- Doc creation: create source/method and executive summary docs.
- Table creation: create data tables.
- Image creation: place chart/map snapshots.

## MVP-plus success criteria

- Export spec generated for a saved dashboard.
- Frames include summary, visuals, source/method, and discussion/action sections.
- User can inspect before export.
- Route and browser tests prove no OAuth, access-token, board-ID, or board-write fields are returned.
