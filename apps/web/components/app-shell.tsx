"use client";

import { useState } from "react";
import type { CanvasDocument, DatasetMetadata } from "@texas-data-canvas/shared";
import type { QueryAudit } from "@texas-data-canvas/shared";
import { CanvasRenderer } from "./canvas/canvas-renderer";
import { DatasetSidebar } from "./dataset-sidebar";
import { Header } from "./header";
import { InspectorPanel } from "./inspector-panel";
import { PromptBar } from "./prompt-bar";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function generateDashboard() {
    setIsGenerating(true);
    setStatus(null);

    try {
      const response = await fetch("/api/canvas/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Miro export spec failed.");
    }
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
          <CanvasRenderer document={activeCanvas} />
        </section>
        <InspectorPanel
          canvas={activeCanvas}
          datasets={datasets}
          audits={audits}
          onExportMiro={exportMiroSpec}
          onApplyFilters={generateDashboard}
        />
      </div>
    </main>
  );
}
