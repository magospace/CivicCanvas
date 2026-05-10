"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Download, FileJson, Info, Save, Share2, Workflow } from "lucide-react";
import type { BoundedQuerySpec, CanvasDocument, DataMode, DataModePreference, DatasetMetadata, MiroExportSpec, PromptIntent, QueryAudit } from "@texas-data-canvas/shared";
import { CanvasRenderer } from "./canvas/canvas-renderer";
import { DatasetSidebar } from "./dataset-sidebar";
import { Header } from "./header";
import { InspectorPanel } from "./inspector-panel";
import { PromptBar } from "./prompt-bar";
import { boundedQuerySpecJson, canvasDocumentJson, tableCsv } from "../lib/dashboard-exports";
import { createCanvasShareBundleLink, importSavedCanvasHash, saveCanvasLocally, takePendingOpenCanvas } from "../lib/saved-canvases";

type PromptExample = {
  label: string;
  prompt: string;
  datasetId: string;
  dataModeNote: string;
};

type StatusMessage = {
  message: string;
  tone: "success" | "error";
};

export function AppShell({
  aiSuggestionsActive,
  canvas,
  datasets,
  promptExamples
}: {
  aiSuggestionsActive?: boolean;
  canvas: CanvasDocument;
  datasets: DatasetMetadata[];
  promptExamples: PromptExample[];
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
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [miroSpec, setMiroSpec] = useState<MiroExportSpec | null>(null);
  const [miroTemplate, setMiroTemplate] = useState<MiroExportSpec["template"]>("briefing_board");
  const activeSource = activeCanvas.sources[0];
  const sampleModeNotice = !fallbackReason &&
    activeSource?.datasetId === "houston_transportation_incidents" &&
    activeSource.dataMode === "sample"
    ? "Houston is running in sample-first mode. Live promotion is blocked until Houston TranStar live feed access and aggregate-safe mappings are verified."
    : null;

  useEffect(() => {
    if (status?.tone !== "success") {
      return;
    }

    const timeoutId = window.setTimeout(() => setStatus(null), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [status]);

  useEffect(() => {
    function openSavedCanvas(saved: ReturnType<typeof takePendingOpenCanvas>) {
      if (!saved) {
        return;
      }
      setPrompt(saved.prompt);
      setActiveCanvas(saved.canvas);
      setAudits(saved.audits);
      setIntent(saved.intent ?? null);
      setQuerySpec(null);
      setDataMode(saved.canvas.sources[0]?.dataMode ?? "sample");
      setDataModePreference("auto");
      setFallbackReason(null);
      setStatus({ message: `Opened saved canvas: ${saved.title}`, tone: "success" });
    }

    const pending = takePendingOpenCanvas();
    if (pending) {
      openSavedCanvas(pending);
      return;
    }

    if (window.location.hash.includes("canvasBundle=")) {
      try {
        const imported = importSavedCanvasHash(window.location.hash);
        const shared = imported?.[0];
        if (shared) {
          openSavedCanvas(shared);
          setStatus({ message: `Imported shared canvas link: ${shared.title}`, tone: "success" });
          window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
          return;
        }
      } catch (error) {
        setStatus({ message: error instanceof Error ? error.message : "Shared canvas link was rejected.", tone: "error" });
      }
    }

    const promptFromQuery = new URLSearchParams(window.location.search).get("prompt")?.trim();
    if (promptFromQuery) {
      setPrompt(promptFromQuery);
      setStatus({ message: "Prompt prefilled from demo link. Generate the dashboard when ready.", tone: "success" });
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
      setStatus({
        message: payload.suggestedDatasets
          ? "Prompt not recognized. Showing approved dataset suggestions."
          : payload.fallbackReason
            ? `Dashboard generated with fallback: ${payload.fallbackReason}`
            : "Dashboard generated from bounded governed queries.",
        tone: "success"
      });
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "Dashboard generation failed.", tone: "error" });
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

      setStatus({ message: `Miro export spec generated with ${payload.spec.frames.length} frames. Preview-only.`, tone: "success" });
      setMiroSpec(payload.spec);
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "Miro export spec failed.", tone: "error" });
    }
  }

  function saveCurrentCanvas() {
    try {
      saveCanvasLocally({ canvas: activeCanvas, audits, prompt, intent: intent ?? undefined });
      setStatus({ message: `Saved locally: ${activeCanvas.title}`, tone: "success" });
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "Could not save canvas.", tone: "error" });
    }
  }

  async function shareCurrentCanvas() {
    try {
      const share = createCanvasShareBundleLink({
        canvas: activeCanvas,
        audits,
        prompt,
        intent: intent ?? undefined
      });
      await navigator.clipboard?.writeText(share.url);
      setStatus({ message: "No-backend share link copied. The hash bundle is validated before import.", tone: "success" });
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "Could not copy saved-canvas share link.", tone: "error" });
    }
  }

  async function copyCanvasJson() {
    try {
      await navigator.clipboard?.writeText(canvasDocumentJson(activeCanvas));
      setStatus({ message: "Dashboard JSON copied to clipboard.", tone: "success" });
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "Could not copy canvas JSON.", tone: "error" });
    }
  }

  async function copyQuerySpec() {
    try {
      const json = boundedQuerySpecJson(querySpec);
      if (!json) {
        setStatus({ message: "No active query definition is available for this dashboard.", tone: "error" });
        return;
      }
      await navigator.clipboard?.writeText(json);
      setStatus({ message: "Active query definition copied to clipboard.", tone: "success" });
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "Could not copy query spec.", tone: "error" });
    }
  }

  function downloadTableCsv() {
    try {
      const csv = tableCsv(activeCanvas);
      if (!csv) {
        setStatus({ message: "No table block is available for CSV export.", tone: "error" });
        return;
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${activeCanvas.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-table.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus({ message: "Current table exported as CSV.", tone: "success" });
    } catch (error) {
      setStatus({ message: error instanceof Error ? error.message : "Could not export table CSV.", tone: "error" });
    }
  }

  function updateFilter(field: string, value: string) {
    setFilterValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <main id="main-content" className="min-h-screen bg-civic-50">
      <Header />
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)_330px]">
        <div className="order-2 lg:order-1">
          <DatasetSidebar datasets={datasets} />
        </div>
        <section className="order-1 min-w-0 space-y-5 px-4 py-5 md:px-6 lg:order-2">
          <PromptBar
            prompt={prompt}
            dataModePreference={dataModePreference}
            isGenerating={isGenerating}
            promptExamples={promptExamples}
            suggestionsLabel={aiSuggestionsActive ? "AI-assisted suggestions" : "Guided suggestions"}
            onPromptChange={setPrompt}
            onDataModePreferenceChange={setDataModePreference}
            onGenerate={generateDashboard}
          />
          {status ? (
            <div
              role={status.tone === "error" ? "alert" : "status"}
              aria-live={status.tone === "error" ? "assertive" : "polite"}
              className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm ${
                status.tone === "error"
                  ? "border-signal/30 bg-signal/10 text-signal"
                  : "border-mint/30 bg-mint/10 text-civic-900"
              }`}
            >
              <span>{status.message}</span>
              {status.tone === "error" ? (
                <button
                  type="button"
                  onClick={() => setStatus(null)}
                  className="rounded-md px-2 py-1 text-xs font-semibold underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-civic-500"
                >
                  Dismiss
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-ink">Canvas tools</div>
              <p className="text-xs text-slate-500">
                Export only validated canvas, query, and table data. No generated HTML or scripts.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-md bg-civic-100 px-2 py-1 text-[11px] font-semibold text-civic-700">
                  Selected mode: {dataModePreference}
                </span>
                <span className="rounded-md bg-mint/10 px-2 py-1 text-[11px] font-semibold text-mint">
                  Rendered mode: {dataMode}
                </span>
                {fallbackReason || sampleModeNotice ? (
                  <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-900">
                    Fallback/caveat active
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={saveCurrentCanvas}
                aria-label="Save canvas locally"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={shareCurrentCanvas}
                aria-label="Copy saved-canvas share link"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <Share2 className="h-4 w-4" />
                Share link
              </button>
              <button
                onClick={downloadTableCsv}
                aria-label="Export current table CSV"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <Download className="h-4 w-4" />
                CSV
              </button>
              <button
                onClick={copyCanvasJson}
                aria-label="Copy dashboard JSON"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <FileJson className="h-4 w-4" />
                Dashboard JSON
              </button>
              <button
                onClick={copyQuerySpec}
                aria-label="Copy query definition"
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <ClipboardList className="h-4 w-4" />
                Query definition
              </button>
              <button
                onClick={exportMiroSpec}
                aria-label="Generate Miro export preview"
                className="inline-flex items-center gap-2 rounded-md bg-civic-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-civic-700 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <Workflow className="h-4 w-4" />
                Miro preview
              </button>
            </div>
          </div>
          <details className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
            <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-ink marker:hidden">
              <Info className="h-4 w-4 text-civic-700" />
              Known data boundaries
            </summary>
            <div className="mt-3 grid gap-3 text-xs leading-5 text-slate-600 md:grid-cols-3">
              <div className="rounded-md bg-civic-50 p-3">
                <span className="font-semibold text-ink">Dallas ZIP fallback.</span> Live Dallas 311
                aggregates are promoted for verified non-ZIP fields; ZIP dashboard views use sample
                fallback because the verified live source does not expose ZIP.
              </div>
              <div className="rounded-md bg-civic-50 p-3">
                <span className="font-semibold text-ink">Austin month blocker.</span> Austin permits
                remain sample-first for monthly views until a source-owned month grouping is safely verified.
              </div>
              <div className="rounded-md bg-civic-50 p-3">
                <span className="font-semibold text-ink">Houston TranStar access.</span> Houston transportation
                stays sample-first until live feed access, terms, aggregate-safe fields, and precise-location
                handling are approved.
              </div>
            </div>
          </details>
          {fallbackReason ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 shadow-sm">
              <span className="font-semibold">Sample fallback active.</span>{" "}
              {fallbackReason}
            </div>
          ) : null}
          {sampleModeNotice ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 shadow-sm">
              <span className="font-semibold">Sample-first Houston pilot.</span>{" "}
              {sampleModeNotice}
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
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-semibold text-ink">{frame.title}</div>
                      {frame.title === "Source & Method" ? (
                        <span className="rounded bg-civic-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Required
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {frame.items.map((item, itemIndex) => (
                        <span
                          key={`${item.type}-${itemIndex}`}
                          className="rounded bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                        >
                          {item.type.replace("_", " ")}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                      {frame.items[0]?.content.slice(0, 180)}
                    </p>
                  </div>
                ))}
              </div>
              <pre
                aria-label="Miro export JSON preview"
                tabIndex={0}
                className="mt-4 max-h-72 overflow-auto rounded-md bg-civic-900 p-3 text-xs text-civic-50"
              >
                {JSON.stringify(miroSpec, null, 2)}
              </pre>
            </section>
          ) : null}
        </section>
        <div className="order-3 lg:order-3">
          <InspectorPanel
            canvas={activeCanvas}
            audits={audits}
            intent={intent}
            querySpec={querySpec}
            dataMode={dataMode}
            dataModePreference={dataModePreference}
            fallbackReason={fallbackReason}
            filterValues={filterValues}
            onFilterChange={updateFilter}
            onDataModePreferenceChange={setDataModePreference}
            onApplyFilters={generateDashboard}
          />
        </div>
      </div>
    </main>
  );
}
