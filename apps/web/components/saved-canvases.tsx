"use client";

import Link from "next/link";
import { Copy, Download, ExternalLink, FileJson, Link2, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { SavedCanvas } from "@texas-data-canvas/shared";
import { tableCsv } from "../lib/dashboard-exports";
import { downloadTextFile, safeDownloadName } from "../lib/client-downloads";
import {
  clearAllSavedCanvases,
  deleteSavedCanvas,
  duplicateSavedCanvas,
  exportSavedCanvasesBundleJson,
  exportSavedCanvasJson,
  createSavedCanvasShareLink,
  importSavedCanvasHash,
  importSavedCanvasJson,
  isSavedCanvasImportOverLimit,
  listSavedCanvases,
  queueCanvasForOpen,
  savedCanvasImportLimitBytes,
  updateSavedCanvasMetadata
} from "../lib/saved-canvases";

export function SavedCanvases() {
  const [items, setItems] = useState<SavedCanvas[]>([]);
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [edits, setEdits] = useState<Record<string, { title: string; prompt: string }>>({});

  useEffect(() => {
    if (window.location.hash.includes("canvasBundle=")) {
      try {
        const imported = importSavedCanvasHash(window.location.hash);
        if (imported) {
          setItems(imported);
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
          return;
        }
      } catch (error) {
        const detail = error instanceof Error ? ` ${error.message}` : "";
        setImportError(`Shared link rejected.${detail}`);
      }
    }
    setItems(listSavedCanvases());
  }, []);

  function refresh(next: SavedCanvas[]) {
    setItems(next);
    setEdits(Object.fromEntries(next.map((item) => [item.canvasId, { title: item.title, prompt: item.prompt }])));
    setExportText("");
    setImportError("");
  }

  function editFor(item: SavedCanvas) {
    return edits[item.canvasId] ?? { title: item.title, prompt: item.prompt };
  }

  function updateEdit(canvasId: string, patch: Partial<{ title: string; prompt: string }>) {
    setEdits((current) => ({
      ...current,
      [canvasId]: {
        title: current[canvasId]?.title ?? items.find((item) => item.canvasId === canvasId)?.title ?? "",
        prompt: current[canvasId]?.prompt ?? items.find((item) => item.canvasId === canvasId)?.prompt ?? "",
        ...patch
      }
    }));
  }

  function importCanvas() {
    try {
      if (isSavedCanvasImportOverLimit(importText)) {
        throw new Error(`Import exceeds ${savedCanvasImportLimitBytes.toLocaleString("en-US")} bytes.`);
      }
      refresh(importSavedCanvasJson(importText));
      setImportText("");
    } catch (error) {
      const detail = error instanceof Error ? ` ${error.message}` : "";
      setImportError(`Import rejected. Saved bundles must contain valid canvases with allowlisted blocks and a SourceMethodBlock.${detail}`);
    }
  }

  async function copyShareLink(canvases: SavedCanvas[]) {
    try {
      const share = createSavedCanvasShareLink(canvases, "/saved");
      setExportText(share.url);
      await navigator.clipboard?.writeText(share.url);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Could not create share link.";
      setImportError(detail);
    }
  }

  function downloadSavedCanvasCsv(item: SavedCanvas) {
    const csv = tableCsv(item.canvas);
    if (!csv) {
      setImportError(`${item.title} does not include a table block to export.`);
      return;
    }

    downloadTextFile(
      safeDownloadName(`${item.title}-table`, "csv"),
      csv,
      "text/csv;charset=utf-8"
    );
  }

  if (items.length === 0) {
    return (
      <section className="mt-8 w-full max-w-3xl space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600 shadow-panel">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Save a generated dashboard from /explore or import a validated saved-canvas bundle.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center rounded-md bg-civic-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-civic-700 focus:outline-none focus:ring-2 focus:ring-civic-100"
            >
              Go to Explore
            </Link>
          </div>
        </div>
        <ImportPanel
          importText={importText}
          importError={importError}
          onChange={setImportText}
          onImport={importCanvas}
        />
      </section>
    );
  }

  return (
    <section className="mt-8 w-full max-w-5xl space-y-4">
      <ImportPanel
        importText={importText}
        importError={importError}
        onChange={setImportText}
        onImport={importCanvas}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setExportText(exportSavedCanvasesBundleJson(items))}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
        >
          Export bundle
        </button>
        <button
          onClick={() => copyShareLink(items)}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
        >
          Copy share link
        </button>
        <button
          onClick={async () => {
            const bundle = exportSavedCanvasesBundleJson(items);
            setExportText(bundle);
            await navigator.clipboard?.writeText(bundle);
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
        >
          Copy share bundle
        </button>
        <button
          onClick={() => {
            if (window.confirm("Clear all saved canvases?")) {
              refresh(clearAllSavedCanvases());
            }
          }}
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-signal hover:text-signal focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20"
        >
          Clear all
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.canvasId} className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-panel">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">{item.title}</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Saved {new Date(item.savedAt).toLocaleString("en-US")}
                </p>
              </div>
              <span className="rounded-md bg-civic-100 px-2 py-1 text-xs font-semibold text-civic-700">
                {item.audits.length} audits
              </span>
            </div>
            <div className="mt-3 space-y-2 rounded-md border border-slate-200 bg-civic-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">
                Browser-local editable metadata
              </p>
              <label className="block text-xs font-semibold text-slate-600">
                Saved title
                <input
                  aria-label={`Edit saved title for ${item.title}`}
                  value={editFor(item).title}
                  onChange={(event) => updateEdit(item.canvasId, { title: event.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Saved prompt
                <textarea
                  aria-label={`Edit saved prompt for ${item.title}`}
                  value={editFor(item).prompt}
                  onChange={(event) => updateEdit(item.canvasId, { prompt: event.target.value })}
                  className="mt-1 min-h-20 w-full rounded-md border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  try {
                    const edit = editFor(item);
                    refresh(updateSavedCanvasMetadata({ canvasId: item.canvasId, title: edit.title, prompt: edit.prompt }));
                  } catch (error) {
                    const detail = error instanceof Error ? error.message : "Could not update saved canvas metadata.";
                    setImportError(detail);
                  }
                }}
                aria-label={`Save local edits for ${item.title}`}
                className="inline-flex items-center gap-2 rounded-md bg-civic-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-civic-700 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <Save className="h-4 w-4" />
                Save local edits
              </button>
              <p className="text-xs leading-5 text-slate-500">
                Edits update this browser-local saved record and exported/share bundles only; they do not write to a backend database.
              </p>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-2">
              <Link
                href="/explore"
                onClick={(event) => {
                  try {
                    queueCanvasForOpen(item);
                  } catch (error) {
                    event.preventDefault();
                    const detail = error instanceof Error ? error.message : "Could not open saved canvas.";
                    setImportError(detail);
                  }
                }}
                aria-label={`Open ${item.title}`}
                title={`Open ${item.title}`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                onClick={() => copyShareLink([item])}
                aria-label={`Copy share link for ${item.title}`}
                title={`Copy share link for ${item.title}`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <Link2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  try {
                    refresh(duplicateSavedCanvas(item));
                  } catch (error) {
                    const detail = error instanceof Error ? error.message : "Could not duplicate saved canvas.";
                    setImportError(detail);
                  }
                }}
                aria-label={`Duplicate ${item.title}`}
                title={`Duplicate ${item.title}`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => setExportText(exportSavedCanvasJson(item))}
                aria-label={`Export ${item.title} JSON`}
                title={`Export ${item.title} JSON`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <FileJson className="h-4 w-4" />
              </button>
              <button
                onClick={() => downloadSavedCanvasCsv(item)}
                aria-label={`Export ${item.title} table CSV`}
                title={`Export ${item.title} table CSV`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${item.title}?`)) {
                    try {
                      refresh(deleteSavedCanvas(item.canvasId));
                    } catch (error) {
                      const detail = error instanceof Error ? error.message : "Could not delete saved canvas.";
                      setImportError(detail);
                    }
                  }
                }}
                aria-label={`Delete ${item.title}`}
                title={`Delete ${item.title}`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-signal hover:text-signal focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/20"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
      {exportText ? (
        <pre className="max-h-96 overflow-auto rounded-lg bg-civic-900 p-4 text-left text-xs text-civic-50">
          {exportText}
        </pre>
      ) : null}
    </section>
  );
}

function ImportPanel({
  importText,
  importError,
  onChange,
  onImport
}: {
  importText: string;
  importError: string;
  onChange: (value: string) => void;
  onImport: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-panel">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Import saved canvas bundle or JSON</h2>
        <button
          onClick={onImport}
          disabled={!importText.trim()}
          className="rounded-md bg-civic-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-civic-700 focus:outline-none focus:ring-2 focus:ring-civic-100 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          Import
        </button>
      </div>
      <textarea
        aria-label="Saved canvas JSON import"
        value={importText}
        onChange={(event) => onChange(event.target.value)}
        maxLength={savedCanvasImportLimitBytes}
        className="mt-3 min-h-24 w-full rounded-md border border-slate-200 bg-civic-50 p-3 text-xs text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
        placeholder="Paste exported saved-canvas bundle or JSON"
      />
      <p className="mt-2 text-xs text-slate-500">
        Import limit: {savedCanvasImportLimitBytes.toLocaleString("en-US")} bytes. Bundles are validated before rendering.
      </p>
      {importError ? (
        <p className="mt-2 rounded-md bg-signal/10 px-3 py-2 text-xs leading-5 text-signal">
          {importError}
        </p>
      ) : null}
    </div>
  );
}
