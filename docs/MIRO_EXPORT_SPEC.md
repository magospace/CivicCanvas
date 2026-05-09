# Miro Export Specification

## Feature summary

Miro export turns a Texas Data Canvas dashboard into a collaborative board, briefing deck, or workshop space.

This is an MVP-plus/stretch feature. The core product must work without Miro.

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

### Research/story board

Frames:

1. Research question
2. Dataset/source
3. Key visual findings
4. Data limitations
5. Story leads / hypotheses
6. Follow-up questions

## MiroExportSpec

```ts
type MiroExportSpec = {
  canvasId: string;
  title: string;
  template: 'briefing_board' | 'slide_deck' | 'community_workshop' | 'research_story_board';
  frames: MiroFrameSpec[];
  sourceMethodFrameRequired: true;
};

type MiroFrameSpec = {
  id: string;
  title: string;
  purpose: string;
  items: MiroItemSpec[];
};

type MiroItemSpec =
  | { type: 'text'; title?: string; content: string }
  | { type: 'table'; title: string; columns: string[]; rows: string[][] }
  | { type: 'image'; title: string; assetId: string; alt: string }
  | { type: 'sticky'; content: string; color?: string };
```

## Safety rules

- Must include source/method frame.
- Must not export hidden/sensitive fields.
- Must not write to Miro without user confirmation.
- Must label sample/demo data if used.
- Must preserve source attribution and caveats.
- Must not use Miro as a substitute for dataset validation.

## Implementation approach

1. Implement spec generation first.
2. Display spec preview in the app.
3. Add integration instructions for Miro MCP.
4. If MCP connection exists, create board/frames/docs/tables/images after confirmation.

## Optional Miro MCP mapping

- Board creation: create a board for the briefing/workshop.
- Layout creation: create frames, text, shapes, and sticky notes.
- Doc creation: create source/method and executive summary docs.
- Table creation: create data tables.
- Image creation: place chart/map snapshots.

## MVP-plus success criteria

- Export spec generated for a saved dashboard.
- Frames include summary, visuals, source/method, and discussion/action sections.
- User can inspect before export.
