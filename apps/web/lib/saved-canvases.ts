"use client";

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
export const savedCanvasShareHashKey = "canvasBundle";
export const savedCanvasShareHashLimitChars = Math.ceil(savedCanvasImportLimitBytes * 1.4);

export function savedCanvasImportByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

export function isSavedCanvasImportOverLimit(value: string) {
  return savedCanvasImportByteLength(value) > savedCanvasImportLimitBytes;
}

function localStorageError(action: string, error: unknown) {
  const detail = error instanceof Error && error.message ? ` ${error.message}` : "";
  return new Error(
    `Browser-local saved-canvas storage failed while ${action}. Clear browser storage or export existing canvases before trying again.${detail}`
  );
}

function currentAppVersion() {
  return process.env.NEXT_PUBLIC_APP_VERSION ?? "local";
}

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
  try {
    return saveCanvasToStorage(window.localStorage, saved);
  } catch (error) {
    throw localStorageError("saving this canvas", error);
  }
}

export function duplicateSavedCanvas(saved: SavedCanvas) {
  const duplicate = savedCanvasSchema.parse({
    ...saved,
    canvasId: `${saved.canvasId}_copy_${Date.now()}`,
    title: `${saved.title} Copy`,
    savedAt: new Date().toISOString()
  });
  try {
    return saveCanvasToStorage(window.localStorage, duplicate);
  } catch (error) {
    throw localStorageError("duplicating this canvas", error);
  }
}

export function updateSavedCanvasMetadata({
  canvasId,
  title,
  prompt
}: {
  canvasId: string;
  title: string;
  prompt: string;
}) {
  const nextTitle = title.trim();
  const nextPrompt = prompt.trim();
  if (!nextTitle || !nextPrompt) {
    throw new Error("Saved canvas title and prompt are required for local edits.");
  }

  const savedAt = new Date().toISOString();
  const existing = listSavedCanvases();
  const next = existing.map((item) => item.canvasId === canvasId
    ? savedCanvasSchema.parse({
      ...item,
      title: nextTitle,
      prompt: nextPrompt,
      savedAt,
      canvas: {
        ...item.canvas,
        title: nextTitle,
        prompt: nextPrompt,
        updatedAt: savedAt
      }
    })
    : item);

  if (!existing.some((item) => item.canvasId === canvasId)) {
    throw new Error(`Saved canvas ${canvasId} was not found in browser-local storage.`);
  }

  try {
    window.localStorage.setItem(savedCanvasStorageKey, JSON.stringify(next));
    return next;
  } catch (error) {
    throw localStorageError("updating this saved canvas", error);
  }
}

export function deleteSavedCanvas(canvasId: string) {
  try {
    return deleteCanvasFromStorage(window.localStorage, canvasId);
  } catch (error) {
    throw localStorageError("deleting this canvas", error);
  }
}

export function clearAllSavedCanvases() {
  try {
    return clearSavedCanvasStorage(window.localStorage);
  } catch (error) {
    throw localStorageError("clearing saved canvases", error);
  }
}

export function queueCanvasForOpen(saved: SavedCanvas) {
  try {
    window.localStorage.setItem(pendingOpenCanvasStorageKey, JSON.stringify(saved));
  } catch (error) {
    throw localStorageError("queueing this canvas to open", error);
  }
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
    appVersion: currentAppVersion()
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
  if (isSavedCanvasImportOverLimit(value)) {
    throw new Error(`Import exceeds ${savedCanvasImportLimitBytes.toLocaleString("en-US")} bytes.`);
  }

  try {
    return saveCanvasBundleToStorage(window.localStorage, parseSavedCanvasImport(value));
  } catch (error) {
    throw localStorageError("importing saved canvases", error);
  }
}

function encodeBase64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function createSavedCanvasShareLink(canvases: SavedCanvas[], route = "/explore") {
  const bundle = exportSavedCanvasesBundleJson(canvases);
  if (savedCanvasImportByteLength(bundle) > savedCanvasImportLimitBytes) {
    throw new Error(`Share bundle exceeds ${savedCanvasImportLimitBytes.toLocaleString("en-US")} bytes.`);
  }
  const url = new URL(route, window.location.origin);
  url.hash = `${savedCanvasShareHashKey}=${encodeBase64Url(bundle)}`;
  return { url: url.toString(), bundle };
}

export function createCanvasShareBundleLink({
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
  return createSavedCanvasShareLink([
    createSavedCanvas({ canvas, audits, prompt, intent })
  ]);
}

export function importSavedCanvasHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/u, ""));
  const encoded = params.get(savedCanvasShareHashKey);
  if (!encoded) {
    return null;
  }
  if (encoded.length > savedCanvasShareHashLimitChars) {
    throw new Error(`Shared canvas hash exceeds ${savedCanvasShareHashLimitChars.toLocaleString("en-US")} characters.`);
  }

  const decoded = decodeBase64Url(encoded);
  if (savedCanvasImportByteLength(decoded) > savedCanvasImportLimitBytes) {
    throw new Error(`Shared canvas exceeds ${savedCanvasImportLimitBytes.toLocaleString("en-US")} bytes.`);
  }
  return importSavedCanvasJson(decoded);
}

export { savedCanvasStorageKey };
