import { Download, Filter, Save, Share2, SlidersHorizontal } from "lucide-react";
import type { BoundedQuerySpec, CanvasBlock, CanvasDocument, DataMode, DataModePreference, MiroExportSpec, PromptIntent, QueryAudit } from "@texas-data-canvas/shared";

type FilterBlock = Extract<CanvasBlock, { type: "FilterBlock" }>;

export function InspectorPanel({
  canvas,
  audits,
  intent,
  querySpec,
  dataMode,
  dataModePreference,
  fallbackReason,
  filterValues,
  miroTemplate,
  onFilterChange,
  onDataModePreferenceChange,
  onMiroTemplateChange,
  onExportMiro,
  onCopyCanvasJson,
  onCopyQuerySpec,
  onExportCsv,
  onSave,
  onShare,
  onApplyFilters
}: {
  canvas: CanvasDocument;
  audits?: QueryAudit[];
  intent?: PromptIntent | null;
  querySpec?: BoundedQuerySpec | null;
  dataMode?: DataMode;
  dataModePreference?: DataModePreference;
  fallbackReason?: string | null;
  filterValues?: Record<string, string>;
  miroTemplate?: MiroExportSpec["template"];
  onFilterChange?: (field: string, value: string) => void;
  onDataModePreferenceChange?: (mode: DataModePreference) => void;
  onMiroTemplateChange?: (template: MiroExportSpec["template"]) => void;
  onExportMiro?: () => void;
  onCopyCanvasJson?: () => void;
  onCopyQuerySpec?: () => void;
  onExportCsv?: () => void;
  onSave?: () => void;
  onShare?: () => void;
  onApplyFilters?: () => void;
}) {
  const source = canvas.sources[0];
  const filterBlock = canvas.blocks.find((block): block is FilterBlock => block.type === "FilterBlock");
  const mode = dataMode ?? source.dataMode;
  const modeLabel = mode === "live" ? "Live public API" : mode === "fallback" ? "Live unavailable, sample fallback used" : "Sample fallback";

  return (
    <aside className="space-y-4 border-l border-slate-200 bg-white p-4 lg:min-h-[calc(100vh-4rem)]">
      <section className="rounded-lg border border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-civic-700" />
          Inspector
        </div>
        <div className="mb-3 rounded-md bg-civic-50 px-3 py-2 text-xs font-semibold text-civic-700">
          {modeLabel}
        </div>
        <label className="mb-3 grid gap-1.5 text-sm">
          <span className="text-xs font-semibold text-slate-500">Requested data mode</span>
          <select
            aria-label="Inspector data mode"
            value={dataModePreference ?? "auto"}
            onChange={(event) => onDataModePreferenceChange?.(event.target.value as DataModePreference)}
            className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
          >
            <option value="auto">Auto</option>
            <option value="live">Live public API</option>
            <option value="sample">Sample fallback</option>
          </select>
        </label>
        {fallbackReason ? (
          <p className="mb-3 rounded-md bg-signal/10 px-3 py-2 text-xs leading-5 text-signal">
            {fallbackReason}
          </p>
        ) : null}
        {filterBlock ? (
          <div className="grid gap-3 text-sm">
            {filterBlock.props.filters.map((filter) => (
              <label key={filter.field} className="grid gap-1.5">
                <span className="text-xs font-semibold text-slate-500">{filter.label}</span>
                {filter.type === "select" ? (
                  <select
                    aria-label={filter.label}
                    value={filterValues?.[filter.field] ?? (filter.field === "__groupBy" ? "category_zip" : "All")}
                    onChange={(event) => onFilterChange?.(filter.field, event.target.value)}
                    className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
                  >
                    {(filter.options ?? []).map((option) => (
                      <option key={option} value={option}>{option.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    aria-label={filter.label}
                    value={filterValues?.[filter.field] ?? ""}
                    onChange={(event) => onFilterChange?.(filter.field, event.target.value)}
                    className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
                    placeholder={filter.type === "dateRange" ? "2024-01-01 to 2024-12-31" : filter.field}
                  />
                )}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-xs leading-5 text-slate-500">No dashboard filters available for this canvas.</p>
        )}
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
        <label className="mb-3 grid gap-1.5">
          <span className="text-xs font-semibold text-slate-500">Miro template</span>
          <select
            aria-label="Miro template"
            value={miroTemplate ?? "briefing_board"}
            onChange={(event) => onMiroTemplateChange?.(event.target.value as MiroExportSpec["template"])}
            className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-sm text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
          >
            <option value="briefing_board">Briefing board</option>
            <option value="slide_deck">Slide deck</option>
            <option value="community_workshop">Community workshop</option>
          </select>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onSave}
            aria-label="Save canvas locally"
            title="Save canvas locally"
            className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={onShare}
            aria-label="Copy portable saved-canvas bundle"
            title="Copy portable saved-canvas bundle"
            className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={onExportMiro}
            aria-label="Generate Miro export preview"
            title="Generate Miro export preview"
            className="flex h-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 grid gap-2">
          <button
            onClick={onExportCsv}
            className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
          >
            Export table CSV
          </button>
          <button
            onClick={onCopyCanvasJson}
            className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
          >
            Copy CanvasDocument JSON
          </button>
          <button
            onClick={onCopyQuerySpec}
            className="rounded-md border border-slate-200 px-3 py-2 text-left text-xs font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
          >
            Copy BoundedQuerySpec
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
      {intent ? (
        <section className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 text-sm font-semibold text-ink">Prompt intent</div>
          <div className="space-y-2 text-xs text-slate-600">
            <div>City: {intent.city ?? "unresolved"}</div>
            <div>Datasets: {intent.datasetCandidates.join(", ") || "none"}</div>
            <div>Group by: {intent.groupBy.join(", ") || "none"}</div>
            <div>Matched: {intent.matchedTerms.join(", ") || "none"}</div>
            <div>Reasons: {intent.reasonCodes.join(", ") || "none"}</div>
            <div>Rejected fields: {intent.rejectedFields.join(", ") || "none"}</div>
            <div>Confidence: {Math.round(intent.confidence * 100)}%</div>
            {intent.safetyWarnings.map((warning) => (
              <div key={warning} className="rounded-md bg-signal/10 px-3 py-2 text-signal">
                {warning}
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <section className="rounded-lg border border-slate-200 p-4">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-ink">
            Why this dashboard?
          </summary>
          <div className="mt-3 space-y-3 text-xs leading-5 text-slate-600">
            <div>
              <span className="font-semibold text-ink">Matched dataset:</span>{" "}
              {intent?.datasetCandidates[0] ?? source.datasetId}
            </div>
            <div>
              <span className="font-semibold text-ink">Matched terms:</span>{" "}
              {intent?.matchedTerms.join(", ") || "none"}
            </div>
            <div>
              <span className="font-semibold text-ink">Reason codes:</span>{" "}
              {intent?.reasonCodes.join(", ") || "none"}
            </div>
            <div>
              <span className="font-semibold text-ink">Selected mode:</span> {modeLabel}
            </div>
            {fallbackReason ? (
              <div className="rounded-md bg-signal/10 px-3 py-2 text-signal">{fallbackReason}</div>
            ) : null}
            <div>
              <div className="mb-1 font-semibold text-ink">Safety decisions</div>
              <ul className="list-disc space-y-1 pl-4">
                {(audits ?? []).flatMap((audit) => audit.safetyDecisions).slice(0, 8).map((decision) => (
                  <li key={decision}>{decision}</li>
                ))}
              </ul>
            </div>
            {querySpec ? (
              <pre
                aria-label="Active BoundedQuerySpec JSON"
                tabIndex={0}
                className="max-h-52 overflow-auto rounded-md bg-civic-900 p-3 text-[11px] leading-5 text-civic-50"
              >
                {JSON.stringify(querySpec, null, 2)}
              </pre>
            ) : (
              <p className="rounded-md bg-civic-50 px-3 py-2">No active BoundedQuerySpec is available for this canvas.</p>
            )}
          </div>
        </details>
      </section>
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
