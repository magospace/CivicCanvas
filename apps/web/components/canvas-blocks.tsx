import { ExternalLink, FileText, ShieldCheck } from "lucide-react";
import type { CanvasBlock } from "@texas-data-canvas/shared";

function asNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

type SummaryBlock = Extract<CanvasBlock, { type: "SummaryBlock" }>;
type MetricBlock = Extract<CanvasBlock, { type: "MetricBlock" }>;
type ChartBlock = Extract<CanvasBlock, { type: "ChartBlock" }>;
type MapBlock = Extract<CanvasBlock, { type: "MapBlock" }>;
type TableBlock = Extract<CanvasBlock, { type: "TableBlock" }>;
type FilterBlock = Extract<CanvasBlock, { type: "FilterBlock" }>;
type SourceMethodBlock = Extract<CanvasBlock, { type: "SourceMethodBlock" }>;
type DatasetCardBlock = Extract<CanvasBlock, { type: "DatasetCardBlock" }>;

export function SummaryBlockView({ props }: SummaryBlock) {
  return (
    <article className="rounded-lg border border-slate-200 bg-civic-50 p-5">
      <h2 className="text-lg font-semibold text-ink">{props.heading}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{props.text}</p>
      {props.bullets.length > 0 ? (
        <div className="mt-4 grid gap-2 md:grid-cols-3">
          {props.bullets.map((bullet) => (
            <div
              key={bullet}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-600"
            >
              {bullet}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function MetricBlockView({ props }: MetricBlock) {
  const toneClass =
    props.tone === "good"
      ? "border-mint/30 bg-mint/10 text-mint"
      : props.tone === "warning"
        ? "border-signal/30 bg-signal/10 text-signal"
        : "border-civic-100 bg-civic-50 text-civic-700";

  return (
    <article className={`rounded-lg border p-4 ${toneClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em]">{props.label}</p>
      <div className="mt-3 text-2xl font-semibold text-ink">{props.value}</div>
      {props.helperText ? <p className="mt-1 text-xs text-slate-500">{props.helperText}</p> : null}
    </article>
  );
}

export function ChartBlockView({ props }: ChartBlock) {
  const max = Math.max(...props.data.map((item) => asNumber(item[props.yField])), 1);

  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">{props.title}</h2>
          {props.subtitle ? <p className="mt-1 text-xs text-slate-500">{props.subtitle}</p> : null}
        </div>
        <span className="rounded-md bg-civic-100 px-2 py-1 text-xs font-semibold text-civic-700">
          {props.chartType}
        </span>
      </div>
      <div className="flex h-56 items-end gap-2 border-b border-l border-slate-200 px-2 pb-2">
        {props.data.map((item) => {
          const value = asNumber(item[props.yField]);
          const label = String(item[props.xField]);

          return (
            <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md bg-civic-700"
                style={{ height: `${Math.max((value / max) * 100, 8)}%` }}
                title={`${label}: ${value}`}
              />
              <span className="w-full truncate text-center text-[11px] font-medium text-slate-500">
                {label.replace("2024-", "")}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export function MapBlockView({ props }: MapBlock) {
  const max = Math.max(...props.data.map((item) => asNumber(item[props.metricField])), 1);
  const longitudes = props.features.map((feature) => feature.longitude);
  const latitudes = props.features.map((feature) => feature.latitude);
  const minLon = Math.min(...longitudes, -99);
  const maxLon = Math.max(...longitudes, -94);
  const minLat = Math.min(...latitudes, 25);
  const maxLat = Math.max(...latitudes, 33);
  const xFor = (longitude: number) => ((longitude - minLon) / Math.max(maxLon - minLon, 0.1)) * 320 + 24;
  const yFor = (latitude: number) => 220 - ((latitude - minLat) / Math.max(maxLat - minLat, 0.1)) * 180;

  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <h2 className="text-sm font-semibold text-ink">{props.title}</h2>
      {props.features.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-md border border-slate-200 bg-civic-50">
          <svg viewBox="0 0 368 248" role="img" aria-label={props.title} className="h-64 w-full">
            <rect x="0" y="0" width="368" height="248" fill="#f6f8fb" />
            <path
              d="M62 38 L312 32 L340 82 L310 206 L88 218 L38 154 Z"
              fill="#e8eef6"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            {props.data.map((item) => {
              const zip = String(item[props.geographyField]);
              const feature = props.features.find((candidate) => candidate.id === zip);
              if (!feature) {
                return null;
              }
              const value = asNumber(item[props.metricField]);
              const radius = 8 + (value / max) * 20;
              return (
                <g key={zip}>
                  <circle
                    cx={xFor(feature.longitude)}
                    cy={yFor(feature.latitude)}
                    r={radius}
                    fill="#2b6b7f"
                    fillOpacity="0.78"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <text
                    x={xFor(feature.longitude)}
                    y={yFor(feature.latitude) + 4}
                    textAnchor="middle"
                    className="fill-white text-[10px] font-semibold"
                  >
                    {zip}
                  </text>
                </g>
              );
            })}
          </svg>
          {props.legend ? (
            <div className="border-t border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
              {props.legend}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
          {props.data.map((item) => {
            const value = asNumber(item[props.metricField]);
            const opacity = 0.2 + (value / max) * 0.8;

            return (
              <div
                key={String(item[props.geographyField])}
                className="rounded-md border border-civic-100 p-3"
                style={{ backgroundColor: `rgba(43, 107, 127, ${opacity})` }}
              >
                <div className="text-xs font-semibold text-white">
                  {String(item[props.geographyField])}
                </div>
                <div className="mt-1 text-lg font-semibold text-white">{value}</div>
              </div>
            );
          })}
        </div>
      )}
      {props.note ? <p className="mt-3 text-xs leading-5 text-slate-500">{props.note}</p> : null}
    </article>
  );
}

export function TableBlockView({ props }: TableBlock) {
  const rows = props.sortBy
    ? [...props.rows].sort((a, b) => asNumber(b[props.sortBy ?? ""]) - asNumber(a[props.sortBy ?? ""]))
    : props.rows;
  const visibleRows = rows.slice(0, props.pageSize ?? rows.length);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200">
      <div className="border-b border-slate-200 bg-civic-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{props.title}</h2>
        {props.caption ? <p className="mt-1 text-xs text-slate-500">{props.caption}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-white">
            <tr>
              {props.columns.map((column) => (
                <th
                  key={column.field}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleRows.map((row, index) => (
              <tr key={`${props.title}-${index}`}>
                {props.columns.map((column) => (
                  <td key={column.field} className="px-4 py-3 text-slate-700">
                    {String(row[column.field] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-200 bg-civic-50 px-4 py-2 text-xs text-slate-500">
        Showing {visibleRows.length} of {props.rows.length} rows
      </div>
    </article>
  );
}

export function FilterBlockView({
  props,
  values = {},
  onChange,
  onApply
}: FilterBlock & {
  values?: Record<string, string>;
  onChange?: (field: string, value: string) => void;
  onApply?: () => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <h2 className="text-sm font-semibold text-ink">{props.title}</h2>
      <div className="mt-4 grid gap-3">
        {props.filters.map((filter) => (
          <label key={filter.field} className="grid gap-1.5">
            <span className="text-xs font-semibold text-slate-500">{filter.label}</span>
            {filter.type === "select" ? (
              <select
                value={values[filter.field] ?? "All"}
                onChange={(event) => onChange?.(filter.field, event.target.value)}
                className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-sm text-slate-700"
              >
                {(filter.options ?? []).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                value={values[filter.field] ?? ""}
                onChange={(event) => onChange?.(filter.field, event.target.value)}
                className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-sm text-slate-700"
                placeholder={filter.type === "dateRange" ? "2024-01-01 to 2024-12-31" : filter.field}
              />
            )}
          </label>
        ))}
      </div>
      {onApply ? (
        <button
          onClick={onApply}
          className="mt-4 w-full rounded-md bg-civic-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-civic-700"
        >
          Apply filter state
        </button>
      ) : null}
    </article>
  );
}

export function DatasetCardBlockView({ props }: DatasetCardBlock) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-700">
            Dataset card
          </p>
          <h2 className="mt-2 text-sm font-semibold text-ink">{props.dataset.title}</h2>
        </div>
        <FileText className="h-5 w-5 text-civic-700" />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-600">{props.dataset.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {props.dataset.recommendedVisuals.map((visual) => (
          <span key={visual} className="rounded-md bg-civic-100 px-2 py-1 text-xs text-civic-700">
            {visual}
          </span>
        ))}
      </div>
    </article>
  );
}

export function SourceMethodBlockView({ props }: SourceMethodBlock) {
  return (
    <article className="rounded-lg border border-civic-700 bg-civic-900 p-5 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-mint" />
            Source and method
          </div>
          <h2 className="mt-3 text-xl font-semibold">{props.attribution.datasetTitle}</h2>
        </div>
        <a
          href={props.attribution.sourceUrl}
          className="rounded-md border border-white/20 p-2 text-white/80 transition hover:text-white"
          aria-label={`Open source for ${props.attribution.datasetTitle}`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
      <p className="mt-3 text-sm leading-6 text-civic-100">{props.methodology}</p>
      <dl className="mt-4 grid gap-3 md:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-100">
            Source
          </dt>
          <dd className="mt-1 text-sm">{props.attribution.sourceName}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-100">
            Fields
          </dt>
          <dd className="mt-1 text-sm">{props.attribution.fieldsUsed.join(", ")}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-civic-100">
            Accessed
          </dt>
          <dd className="mt-1 text-sm">
            {new Date(props.attribution.accessedAt).toLocaleDateString("en-US")}
          </dd>
        </div>
      </dl>
      <div className="mt-4 space-y-2">
        {props.attribution.caveats.map((caveat) => (
          <p key={caveat} className="rounded-md bg-white/10 px-3 py-2 text-xs leading-5 text-civic-100">
            {caveat}
          </p>
        ))}
      </div>
    </article>
  );
}
