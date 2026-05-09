# CanvasSpec Contract

## Purpose

CanvasSpec is the safe interchange format between the agent/data layer and the React dashboard renderer.

## Rule

AI may generate CanvasSpec JSON. AI may not generate runtime HTML, JavaScript, SQL, or external scripts.

## Required fields

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
```

## Required block

Every generated canvas must include SourceMethodBlock.

## Validation failures

Reject the canvas if:

- unknown block type
- missing SourceMethodBlock
- prop shape invalid
- queryId references unknown query
- source attribution missing
- raw HTML/script values included
