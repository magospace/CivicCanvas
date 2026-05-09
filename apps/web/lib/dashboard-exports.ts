import {
  boundedQuerySpecSchema,
  validateCanvasDocument,
  type BoundedQuerySpec,
  type CanvasDocument,
  type CanvasBlock
} from "@texas-data-canvas/shared";

type TableBlock = Extract<CanvasBlock, { type: "TableBlock" }>;

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}

function tableBlock(canvas: CanvasDocument): TableBlock | undefined {
  return canvas.blocks.find((block): block is TableBlock => block.type === "TableBlock");
}

export function canvasDocumentJson(canvas: CanvasDocument) {
  return JSON.stringify(validateCanvasDocument(canvas), null, 2);
}

export function boundedQuerySpecJson(spec: BoundedQuerySpec | null | undefined) {
  if (!spec) {
    return null;
  }
  return JSON.stringify(boundedQuerySpecSchema.parse(spec), null, 2);
}

export function tableCsv(canvas: CanvasDocument) {
  const validCanvas = validateCanvasDocument(canvas);
  const table = tableBlock(validCanvas);
  if (!table) {
    return null;
  }

  const headers = table.props.columns.map((column) => column.field);
  const labels = table.props.columns.map((column) => column.label);
  const rows = table.props.rows.map((row) => headers.map((header) => csvCell(row[header])).join(","));

  return [labels.map(csvCell).join(","), ...rows].join("\n");
}
