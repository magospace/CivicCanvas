import type { CanvasDocument, DatasetMetadata } from "@texas-data-canvas/shared";
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
  return (
    <main className="min-h-screen bg-civic-50">
      <Header />
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)_330px]">
        <DatasetSidebar datasets={datasets} />
        <section className="min-w-0 space-y-5 px-4 py-5 md:px-6">
          <PromptBar />
          <CanvasRenderer document={canvas} />
        </section>
        <InspectorPanel canvas={canvas} datasets={datasets} />
      </div>
    </main>
  );
}
