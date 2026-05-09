"use client";

import { useEffect, useState } from "react";
import type { CanvasDocument, DatasetMetadata, MiroExportSpec, QueryAudit } from "@texas-data-canvas/shared";
import { CanvasRenderer } from "./canvas/canvas-renderer";
import { DatasetSidebar } from "./dataset-sidebar";
import { Header } from "./header";
import { InspectorPanel } from "./inspector-panel";
import { PromptBar } from "./prompt-bar";
import { saveCanvasLocally, takePendingOpenCanvas } from "../lib/saved-canvases";

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
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [miroSpec, setMiroSpec] = useState<MiroExportSpec | null>(null);

  useEffect(() => {
    const pending = takePendingOpenCanvas();
    if (pending) {
      setPrompt(pending.prompt);
      setActiveCanvas(pending.canvas);
      setAudits(pending.audits);
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
        body: JSON.stringify({ prompt, filters: filterValues })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Dashboard generation failed.");
      }

      setActiveCanvas(payload.canvas);
      setAudits(payload.audits ?? []);
      setStatus(payload.suggestedDatasets ? "Prompt not recognized. Showing approved dataset suggestions." : "Dashboard generated from bounded sample queries.");
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
        body: JSON.stringify({ canvas: activeCanvas, template: "briefing_board" })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Miro export spec failed.");
      }

      setStatus(`Miro export spec generated with ${payload.spec.frames.length} frames. Preview-only for MVP.`);
      setMiroSpec(payload.spec);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Miro export spec failed.");
    }
  }

  function saveCurrentCanvas() {
    try {
      saveCanvasLocally({ canvas: activeCanvas, audits, prompt });
      setStatus(`Saved locally: ${activeCanvas.title}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not save canvas.");
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
            isGenerating={isGenerating}
            onPromptChange={setPrompt}
            onGenerate={generateDashboard}
          />
          {status ? (
            <div className="rounded-lg border border-civic-100 bg-white px-4 py-3 text-sm text-civic-700 shadow-sm">
              {status}
            </div>
          ) : null}
          <CanvasRenderer
            document={activeCanvas}
            filterValues={filterValues}
            onFilterChange={updateFilter}
            onApplyFilters={generateDashboard}
          />
          {miroSpec ? (
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-ink">Miro export preview</h2>
                <span className="rounded-md bg-mint/10 px-2 py-1 text-xs font-semibold text-mint">
                  {miroSpec.frames.length} frames
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {miroSpec.frames.map((frame) => (
                  <div
                    key={frame.title}
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
          datasets={datasets}
          audits={audits}
          onExportMiro={exportMiroSpec}
          onSave={saveCurrentCanvas}
          onApplyFilters={generateDashboard}
        />
      </div>
    </main>
  );
}
