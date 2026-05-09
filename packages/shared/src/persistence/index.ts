import { savedCanvasSchema, type CanvasDocument, type PromptIntent, type QueryAudit, type SavedCanvas } from "../schemas/index.js";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export const savedCanvasStorageKey = "texas-data-canvas:saved-canvases";
export const pendingOpenCanvasStorageKey = "texas-data-canvas:pending-open-canvas";

export function createSavedCanvas({
  canvas,
  audits = [],
  prompt,
  intent,
  savedAt = new Date().toISOString()
}: {
  canvas: CanvasDocument;
  audits?: QueryAudit[];
  prompt: string;
  intent?: PromptIntent;
  savedAt?: string;
}): SavedCanvas {
  return savedCanvasSchema.parse({
    canvasId: canvas.id,
    title: canvas.title,
    prompt,
    canvas,
    audits,
    intent,
    savedAt
  });
}

export function parseSavedCanvases(value: string | null): SavedCanvas[] {
  if (!value) {
    return [];
  }

  const parsed = JSON.parse(value) as unknown;
  return savedCanvasSchema.array().parse(parsed);
}

export function loadSavedCanvases(storage: StorageLike): SavedCanvas[] {
  return parseSavedCanvases(storage.getItem(savedCanvasStorageKey));
}

export function saveCanvasToStorage(storage: StorageLike, savedCanvas: SavedCanvas): SavedCanvas[] {
  const existing = loadSavedCanvases(storage).filter((item) => item.canvasId !== savedCanvas.canvasId);
  const next = [savedCanvas, ...existing];
  storage.setItem(savedCanvasStorageKey, JSON.stringify(next));
  return next;
}

export function deleteCanvasFromStorage(storage: StorageLike, canvasId: string): SavedCanvas[] {
  const next = loadSavedCanvases(storage).filter((item) => item.canvasId !== canvasId);
  storage.setItem(savedCanvasStorageKey, JSON.stringify(next));
  return next;
}
