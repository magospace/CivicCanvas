import {
  clearSavedCanvasStorage,
  createSavedCanvas,
  createSavedCanvasBundle,
  deleteCanvasFromStorage,
  loadSavedCanvases,
  parseSavedCanvasImport,
  pendingOpenCanvasStorageKey,
  runtimeLimits,
  saveCanvasBundleToStorage,
  saveCanvasToStorage,
  savedCanvasSchema,
  savedCanvasStorageKey,
  type CanvasDocument,
  type PromptIntent,
  type QueryAudit,
  type SavedCanvas
} from "@texas-data-canvas/shared";

export const savedCanvasImportLimitBytes = runtimeLimits.maxSavedCanvasImportBytes;

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

export function clearAllSavedCanvases() {
  return clearSavedCanvasStorage(window.localStorage);
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

export function exportSavedCanvasesBundleJson(canvases: SavedCanvas[]) {
  return JSON.stringify(createSavedCanvasBundle({
    canvases,
    appVersion: "v0.6.0-hosted-beta"
  }), null, 2);
}

export function createCanvasShareBundleJson({
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
  return exportSavedCanvasesBundleJson([
    createSavedCanvas({ canvas, audits, prompt, intent })
  ]);
}

export function importSavedCanvasJson(value: string) {
  if (new TextEncoder().encode(value).byteLength > savedCanvasImportLimitBytes) {
    throw new Error(`Import exceeds ${savedCanvasImportLimitBytes.toLocaleString("en-US")} bytes.`);
  }

  return saveCanvasBundleToStorage(window.localStorage, parseSavedCanvasImport(value));
}

export { savedCanvasStorageKey };
