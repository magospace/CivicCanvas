import {
  savedCanvasBundleSchema,
  savedCanvasSchema,
  type CanvasDocument,
  type PromptIntent,
  type QueryAudit,
  type SavedCanvas,
  type SavedCanvasBundle
} from "../schemas/index.js";

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

export function clearSavedCanvasStorage(storage: StorageLike): SavedCanvas[] {
  storage.setItem(savedCanvasStorageKey, JSON.stringify([]));
  return [];
}

export function createSavedCanvasBundle({
  canvases,
  appVersion = "local",
  exportedAt = new Date().toISOString()
}: {
  canvases: SavedCanvas[];
  appVersion?: string;
  exportedAt?: string;
}): SavedCanvasBundle {
  return savedCanvasBundleSchema.parse({
    exportedAt,
    appVersion,
    canvases
  });
}

export function parseSavedCanvasImport(value: string): SavedCanvas[] {
  const parsed = JSON.parse(value) as unknown;
  const bundle = savedCanvasBundleSchema.safeParse(parsed);
  if (bundle.success) {
    return bundle.data.canvases;
  }
  return [savedCanvasSchema.parse(parsed)];
}

export function saveCanvasBundleToStorage(storage: StorageLike, canvases: SavedCanvas[]): SavedCanvas[] {
  const existing = loadSavedCanvases(storage);
  const importedById = new Map(canvases.map((canvas) => [canvas.canvasId, canvas]));
  const preserved = existing.filter((canvas) => !importedById.has(canvas.canvasId));
  const next = [...canvases, ...preserved];
  storage.setItem(savedCanvasStorageKey, JSON.stringify(next));
  return next;
}
