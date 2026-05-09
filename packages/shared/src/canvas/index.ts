import { canvasDocumentSchema, type CanvasDocument } from "../schemas/index.js";

export function validateCanvasDocument(input: unknown): CanvasDocument {
  return canvasDocumentSchema.parse(input);
}

export function safeValidateCanvasDocument(input: unknown):
  | { ok: true; data: CanvasDocument; errors: [] }
  | { ok: false; data?: never; errors: string[] } {
  const result = canvasDocumentSchema.safeParse(input);

  if (result.success) {
    return { ok: true, data: result.data, errors: [] };
  }

  return {
    ok: false,
    errors: result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
  };
}
