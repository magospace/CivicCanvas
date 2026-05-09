"use client";

import Link from "next/link";
import { Copy, ExternalLink, FileJson, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { SavedCanvas } from "@texas-data-canvas/shared";
import {
  deleteSavedCanvas,
  duplicateSavedCanvas,
  exportSavedCanvasJson,
  listSavedCanvases,
  queueCanvasForOpen
} from "../lib/saved-canvases";

export function SavedCanvases() {
  const [items, setItems] = useState<SavedCanvas[]>([]);
  const [exportText, setExportText] = useState("");

  useEffect(() => {
    setItems(listSavedCanvases());
  }, []);

  function refresh(next: SavedCanvas[]) {
    setItems(next);
    setExportText("");
  }

  if (items.length === 0) {
    return (
      <div className="mt-8 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-panel">
        Save a generated dashboard from `/explore` to populate this page.
      </div>
    );
  }

  return (
    <section className="mt-8 w-full max-w-5xl space-y-4">
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
                onClick={() => refresh(deleteSavedCanvas(item.canvasId))}
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
