"use client";

import { Download, FileJson } from "lucide-react";
import { createSavedCanvas, type CanvasDocument } from "@texas-data-canvas/shared";
import { useRouter } from "next/navigation";
import { canvasDocumentJson, tableCsv } from "../lib/dashboard-exports";
import { downloadTextFile, safeDownloadName } from "../lib/client-downloads";
import { queueCanvasForOpen } from "../lib/saved-canvases";
import { CanvasRenderer } from "./canvas/canvas-renderer";

function exportCanvasJson(canvas: CanvasDocument) {
  downloadTextFile(
    safeDownloadName(canvas.title, "canvas.json"),
    canvasDocumentJson(canvas),
    "application/json"
  );
}

function exportTableCsv(canvas: CanvasDocument) {
  const csv = tableCsv(canvas);
  if (!csv) {
    return;
  }

  downloadTextFile(
    safeDownloadName(`${canvas.title}-table`, "csv"),
    csv,
    "text/csv;charset=utf-8"
  );
}

export function GalleryCanvasList({ canvases }: { canvases: CanvasDocument[] }) {
  const router = useRouter();

  function openInExplore(canvas: CanvasDocument) {
    queueCanvasForOpen(createSavedCanvas({
      canvas,
      audits: [],
      prompt: canvas.prompt ?? canvas.title
    }));
    router.push("/explore");
  }

  return (
    <div className="space-y-6">
      {canvases.map((canvas) => (
        <section key={canvas.id} className="space-y-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => openInExplore(canvas)}
              aria-label={`Open ${canvas.title} in explore`}
              title={`Open ${canvas.title} in explore`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
            >
              Open in explore
            </button>
            <button
              type="button"
              onClick={() => exportTableCsv(canvas)}
              disabled={!tableCsv(canvas)}
              aria-label={`Download ${canvas.title} table CSV`}
              title={`Download ${canvas.title} table CSV`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Table CSV
            </button>
            <button
              type="button"
              onClick={() => exportCanvasJson(canvas)}
              aria-label={`Download ${canvas.title} CanvasDocument JSON`}
              title={`Download ${canvas.title} CanvasDocument JSON`}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
            >
              <FileJson className="h-4 w-4" />
              Canvas JSON
            </button>
          </div>
          <CanvasRenderer document={canvas} />
        </section>
      ))}
    </div>
  );
}
