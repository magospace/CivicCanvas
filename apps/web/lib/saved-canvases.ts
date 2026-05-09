import {
  createSavedCanvas,
  deleteCanvasFromStorage,
  loadSavedCanvases,
  pendingOpenCanvasStorageKey,
  saveCanvasToStorage,
  savedCanvasSchema,
  savedCanvasStorageKey,
  type CanvasDocument,
  type PromptIntent,
  type QueryAudit,
  type SavedCanvas
} from "@texas-data-canvas/shared";

export function listSavedCanvases(): SavedCanvas[] {
  return loadSavedCanvases(window.localStorage);
}

export function saveCanvasLocally({
  canvas,
  audits,
  prompt,
  intent
}: {
  canvas: CanvasDocument;
  audits: QueryAudit[];
  prompt: string;
  intent?: PromptIntent;
}) {
  const saved = createSavedCanvas({ canvas, audits, prompt, intent });
  return saveCanvasToStorage(window.localStorage, saved);
}

export function duplicateSavedCanvas(saved: SavedCanvas) {
  const duplicate = savedCanvasSchema.parse({
    ...saved,
    canvasId: `${saved.canvasId}_copy_${Date.now()}`,
    title: `${saved.title} Copy`,
    savedAt: new Date().toISOString()
  });
  return saveCanvasToStorage(window.localStorage, duplicate);
}

export function deleteSavedCanvas(canvasId: string) {
  return deleteCanvasFromStorage(window.localStorage, canvasId);
}

export function queueCanvasForOpen(saved: SavedCanvas) {
  window.localStorage.setItem(pendingOpenCanvasStorageKey, JSON.stringify(saved));
}

export function takePendingOpenCanvas(): SavedCanvas | null {
  const value = window.localStorage.getItem(pendingOpenCanvasStorageKey);
  if (!value) {
    return null;
  }
  window.localStorage.removeItem(pendingOpenCanvasStorageKey);
  return savedCanvasSchema.parse(JSON.parse(value));
}

export function exportSavedCanvasJson(saved: SavedCanvas) {
  return JSON.stringify(saved, null, 2);
}

export function importSavedCanvasJson(value: string) {
  const saved = savedCanvasSchema.parse(JSON.parse(value));
  return saveCanvasToStorage(window.localStorage, saved);
}

export { savedCanvasStorageKey };
