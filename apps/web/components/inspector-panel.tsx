import { Download, Filter, Save, Share2, SlidersHorizontal } from "lucide-react";
import type { CanvasDocument, DatasetMetadata, QueryAudit } from "@texas-data-canvas/shared";

export function InspectorPanel({
  canvas,
  datasets,
  audits,
  onExportMiro,
  onSave,
  onApplyFilters
}: {
  canvas: CanvasDocument;
  datasets: DatasetMetadata[];
  audits?: QueryAudit[];
  onExportMiro?: () => void;
  onSave?: () => void;
  onApplyFilters?: () => void;
}) {
  const source = canvas.sources[0];

  return (
    <aside className="space-y-4 border-l border-slate-200 bg-white p-4 lg:min-h-[calc(100vh-4rem)]">
      <section className="rounded-lg border border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-civic-700" />
          Inspector
        </div>
        <div className="grid gap-3 text-sm">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-slate-500">City</span>
            <select className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-slate-700">
              {[...new Set(datasets.map((dataset) => dataset.city))].map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Date range</span>
            <select className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-slate-700">
              <option>2024 calendar year</option>
              <option>Last 12 months</option>
            </select>
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Group by</span>
            <select className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-slate-700">
              <option>Category and ZIP code</option>
              <option>Month</option>
              <option>Status</option>
            </select>
          </label>
        </div>
        <button
          onClick={onApplyFilters}
          className="mt-4 w-full rounded-md bg-civic-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-civic-700"
        >
          Apply filters
        </button>
      </section>
      <section className="rounded-lg border border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <Filter className="h-4 w-4 text-civic-700" />
          Filter state
        </div>
        <div className="space-y-2 text-xs text-slate-600">
          {source.filtersApplied.map((filter) => (
            <div key={filter} className="rounded-md bg-civic-50 px-3 py-2">
              {filter}
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 p-4">
        <div className="mb-3 text-sm font-semibold text-ink">Save / share / export</div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onSave}
            aria-label="Save canvas locally"
            className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            aria-label="Share canvas placeholder"
            className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={onExportMiro}
            aria-label="Generate Miro export preview"
            className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </section>
      {audits && audits.length > 0 ? (
        <section className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 text-sm font-semibold text-ink">Query audit</div>
          <div className="space-y-3">
            {audits.slice(0, 3).map((audit) => (
              <article key={audit.auditId} className="rounded-md bg-civic-50 p-3 text-xs text-slate-600">
                <div className="font-semibold text-ink">{audit.datasetId}</div>
                <div className="mt-1">Fields: {audit.fieldsUsed.join(", ") || "none"}</div>
                <div>Limit: {audit.rowLimit}</div>
                <div>{audit.aggregation ? "Aggregate query" : "Raw sample query"}</div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="rounded-lg bg-civic-900 p-4 text-white">
        <div className="text-sm font-semibold">Source & method</div>
        <p className="mt-2 text-xs leading-5 text-civic-100">
          {source.datasetTitle} from {source.sourceName}. Fields:{" "}
          {source.fieldsUsed.join(", ")}.
        </p>
      </section>
    </aside>
  );
}
