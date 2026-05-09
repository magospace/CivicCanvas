"use client";

import { useEffect, useState } from "react";
import type { BoundedQuerySpec, CanvasDocument, DataMode, DataModePreference, DatasetMetadata, MiroExportSpec, PromptIntent, QueryAudit } from "@texas-data-canvas/shared";
import { CanvasRenderer } from "./canvas/canvas-renderer";
import { DatasetSidebar } from "./dataset-sidebar";
import { Header } from "./header";
import { InspectorPanel } from "./inspector-panel";
import { PromptBar } from "./prompt-bar";
import { boundedQuerySpecJson, canvasDocumentJson, tableCsv } from "../lib/dashboard-exports";
import { createCanvasShareBundleJson, saveCanvasLocally, takePendingOpenCanvas } from "../lib/saved-canvases";

export function AppShell({
  canvas,
  datasets
}: {
  canvas: CanvasDocument;
  datasets: DatasetMetadata[];
}) {
  const [prompt, setPrompt] = useState("Show Dallas 311 service requests by category and ZIP code for 2024.");
  const [activeCanvas, setActiveCanvas] = useState(canvas);
  const [audits, setAudits] = useState<QueryAudit[]>([]);
  const [intent, setIntent] = useState<PromptIntent | null>(null);
  const [querySpec, setQuerySpec] = useState<BoundedQuerySpec | null>(null);
  const [dataMode, setDataMode] = useState<DataMode>(canvas.sources[0]?.dataMode ?? "sample");
  const [dataModePreference, setDataModePreference] = useState<DataModePreference>("auto");
  const [fallbackReason, setFallbackReason] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [miroSpec, setMiroSpec] = useState<MiroExportSpec | null>(null);
  const [miroTemplate, setMiroTemplate] = useState<MiroExportSpec["template"]>("briefing_board");

  useEffect(() => {
    const pending = takePendingOpenCanvas();
    if (pending) {
      setPrompt(pending.prompt);
      setActiveCanvas(pending.canvas);
      setAudits(pending.audits);
      setIntent(pending.intent ?? null);
      setQuerySpec(null);
      setDataMode(pending.canvas.sources[0]?.dataMode ?? "sample");
      setDataModePreference("auto");
      setFallbackReason(null);
      setStatus(`Opened saved canvas: ${pending.title}`);
    }
  }, []);

  async function generateDashboard() {
    setIsGenerating(true);
    setStatus(null);
    setMiroSpec(null);

    try {
      const response = await fetch("/api/canvas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, filters: filterValues, dataModePreference })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error?.message ?? payload.error ?? "Dashboard generation failed.");
      }

      setActiveCanvas(payload.canvas);
      setAudits(payload.audits ?? []);
      setIntent(payload.intent ?? null);
      setQuerySpec(payload.querySpec ?? null);
      setDataMode(payload.dataMode ?? payload.canvas?.sources?.[0]?.dataMode ?? "sample");
      setFallbackReason(payload.fallbackReason ?? null);
      setStatus(
        payload.suggestedDatasets
          ? "Prompt not recognized. Showing approved dataset suggestions."
          : payload.fallbackReason
            ? `Dashboard generated with fallback: ${payload.fallbackReason}`
            : "Dashboard generated from bounded governed queries."
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Dashboard generation failed.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function exportMiroSpec() {
    try {
      const response = await fetch("/api/export/miro-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvas: activeCanvas, template: miroTemplate })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error?.message ?? payload.error ?? "Miro export spec failed.");
      }

      setStatus(`Miro export spec generated with ${payload.spec.frames.length} frames. Preview-only.`);
      setMiroSpec(payload.spec);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Miro export spec failed.");
    }
  }

  function saveCurrentCanvas() {
    try {
      saveCanvasLocally({ canvas: activeCanvas, audits, prompt, intent: intent ?? undefined });
      setStatus(`Saved locally: ${activeCanvas.title}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save canvas.");
    }
  }

  async function shareCurrentCanvas() {
    try {
      const bundle = createCanvasShareBundleJson({
        canvas: activeCanvas,
        audits,
        prompt,
        intent: intent ?? undefined
      });
      await navigator.clipboard?.writeText(bundle);
      setStatus("Portable saved-canvas bundle copied to clipboard.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not copy saved-canvas bundle.");
    }
  }

  async function copyCanvasJson() {
    try {
      await navigator.clipboard?.writeText(canvasDocumentJson(activeCanvas));
      setStatus("Validated CanvasDocument JSON copied to clipboard.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not copy canvas JSON.");
    }
  }

  async function copyQuerySpec() {
    try {
      const json = boundedQuerySpecJson(querySpec);
      if (!json) {
        setStatus("No active BoundedQuerySpec is available for this canvas.");
        return;
      }
      await navigator.clipboard?.writeText(json);
      setStatus("Active BoundedQuerySpec copied to clipboard.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not copy query spec.");
    }
  }

  function downloadTableCsv() {
    try {
      const csv = tableCsv(activeCanvas);
      if (!csv) {
        setStatus("No table block is available for CSV export.");
        return;
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${activeCanvas.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-table.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("Current table exported as CSV.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not export table CSV.");
    }
  }

  function updateFilter(field: string, value: string) {
    setFilterValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <main className="min-h-screen bg-civic-50">
      <Header />
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)_330px]">
        <DatasetSidebar datasets={datasets} />
        <section className="min-w-0 space-y-5 px-4 py-5 md:px-6">
          <PromptBar
            prompt={prompt}
            dataModePreference={dataModePreference}
            isGenerating={isGenerating}
            onPromptChange={setPrompt}
            onDataModePreferenceChange={setDataModePreference}
            onGenerate={generateDashboard}
          />
          {status ? (
            <div className="rounded-lg border border-civic-100 bg-white px-4 py-3 text-sm text-civic-700 shadow-sm">
              {status}
            </div>
          ) : null}
          {isGenerating ? (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
              <div className="h-4 w-48 animate-pulse rounded bg-civic-100" />
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="h-24 animate-pulse rounded-md bg-civic-100" />
                <div className="h-24 animate-pulse rounded-md bg-civic-100" />
                <div className="h-24 animate-pulse rounded-md bg-civic-100" />
              </div>
            </div>
          ) : (
            <CanvasRenderer
              document={activeCanvas}
              filterValues={filterValues}
              onFilterChange={updateFilter}
              onApplyFilters={generateDashboard}
            />
          )}
          {miroSpec ? (
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">Miro export preview</h2>
                <span className="rounded-md bg-mint/10 px-2 py-1 text-xs font-semibold text-mint">
                  {miroSpec.frames.length} frames
                </span>
              </div>
              <div className="mb-4 grid gap-2 md:grid-cols-[1fr_auto_auto]">
                <label className="grid gap-1.5 text-xs font-semibold text-slate-500">
                  Template
                  <select
                    value={miroTemplate}
                    onChange={(event) => setMiroTemplate(event.target.value as MiroExportSpec["template"])}
                    className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    <option value="briefing_board">Briefing board</option>
                    <option value="slide_deck">Slide deck</option>
                    <option value="community_workshop">Community workshop</option>
                  </select>
                </label>
                <button
                  onClick={() => navigator.clipboard?.writeText(JSON.stringify(miroSpec, null, 2))}
                  className="self-end rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700"
                >
                  Copy JSON
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(miroSpec, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const anchor = document.createElement("a");
                    anchor.href = url;
                    anchor.download = `${miroSpec.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.json`;
                    anchor.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="self-end rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700"
                >
                  Download
                </button>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {miroSpec.frames.map((frame, index) => (
                  <div
                    key={`${frame.title}-${index}`}
                    className={
                      frame.title === "Source & Method"
                        ? "rounded-md border border-mint bg-mint/10 p-3 text-sm"
                        : "rounded-md border border-slate-200 bg-civic-50 p-3 text-sm"
                    }
                  >
                    <div className="font-semibold text-ink">{frame.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{frame.items.length} item(s)</div>
                  </div>
                ))}
              </div>
              <pre className="mt-4 max-h-72 overflow-auto rounded-md bg-civic-900 p-3 text-xs text-civic-50">
                {JSON.stringify(miroSpec, null, 2)}
              </pre>
            </section>
          ) : null}
        </section>
        <InspectorPanel
          canvas={activeCanvas}
          audits={audits}
          intent={intent}
          querySpec={querySpec}
          dataMode={dataMode}
          dataModePreference={dataModePreference}
          fallbackReason={fallbackReason}
          filterValues={filterValues}
          miroTemplate={miroTemplate}
          onFilterChange={updateFilter}
          onDataModePreferenceChange={setDataModePreference}
          onMiroTemplateChange={setMiroTemplate}
          onExportMiro={exportMiroSpec}
          onCopyCanvasJson={copyCanvasJson}
          onCopyQuerySpec={copyQuerySpec}
          onExportCsv={downloadTableCsv}
          onSave={saveCurrentCanvas}
          onShare={shareCurrentCanvas}
          onApplyFilters={generateDashboard}
        />
      </div>
    </main>
  );
}
