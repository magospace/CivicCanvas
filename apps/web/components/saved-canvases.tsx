"use client";

import Link from "next/link";
import { Copy, ExternalLink, FileJson, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { SavedCanvas } from "@texas-data-canvas/shared";
import {
  deleteSavedCanvas,
  duplicateSavedCanvas,
  exportSavedCanvasJson,
  importSavedCanvasJson,
  listSavedCanvases,
  queueCanvasForOpen
} from "../lib/saved-canvases";

export function SavedCanvases() {
  const [items, setItems] = useState<SavedCanvas[]>([]);
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    setItems(listSavedCanvases());
  }, []);

  function refresh(next: SavedCanvas[]) {
    setItems(next);
    setExportText("");
    setImportError("");
  }

  function importCanvas() {
    try {
      refresh(importSavedCanvasJson(importText));
      setImportText("");
    } catch {
      setImportError("Invalid saved canvas JSON. Import requires a valid CanvasDocument with allowlisted blocks and a SourceMethodBlock.");
    }
  }

  if (items.length === 0) {
    return (
      <section className="mt-8 w-full max-w-3xl space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-panel">
          Save a generated dashboard from `/explore` or import validated saved-canvas JSON.
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
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.prompt}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              <Link
                href="/explore"
                onClick={() => queueCanvasForOpen(item)}
                aria-label={`Open ${item.title}`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                onClick={() => refresh(duplicateSavedCanvas(item))}
                aria-label={`Duplicate ${item.title}`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => setExportText(exportSavedCanvasJson(item))}
                aria-label={`Export ${item.title} JSON`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700"
              >
                <FileJson className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${item.title}?`)) {
                    refresh(deleteSavedCanvas(item.canvasId));
                  }
                }}
                aria-label={`Delete ${item.title}`}
                className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-signal hover:text-signal"
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
        <h2 className="text-sm font-semibold text-ink">Import saved canvas JSON</h2>
        <button
          onClick={onImport}
          disabled={!importText.trim()}
          className="rounded-md bg-civic-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-civic-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Import
        </button>
      </div>
      <textarea
        aria-label="Saved canvas JSON import"
        value={importText}
        onChange={(event) => onChange(event.target.value)}
        className="mt-3 min-h-24 w-full rounded-md border border-slate-200 bg-civic-50 p-3 text-xs text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
        placeholder="Paste exported saved-canvas JSON"
      />
      {importError ? (
        <p className="mt-2 rounded-md bg-signal/10 px-3 py-2 text-xs leading-5 text-signal">
          {importError}
        </p>
      ) : null}
    </div>
  );
}
