"use client";

import { useEffect, useMemo, useState } from "react";
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
          {props.bullets.map((bullet, index) => (
            <div
              key={`${bullet}-${index}`}
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

function compactChartLabel(value: unknown) {
  const label = String(value ?? "");
  return label.replace("2024-", "").replace(/_/g, " ");
}

function presentationColumnLabel(label: string) {
  return label.replace(/\s+desc$/i, "");
}

export function ChartBlockView({ props }: ChartBlock) {
  const max = Math.max(...props.data.map((item) => asNumber(item[props.yField])), 1);
  const chartValues = props.data.map((item, index) => ({
    label: compactChartLabel(item[props.xField]),
    rawLabel: String(item[props.xField] ?? `item-${index}`),
    value: asNumber(item[props.yField])
  }));
  const linePoints = chartValues.map((item, index) => {
    const x = chartValues.length === 1 ? 24 : 24 + (index / (chartValues.length - 1)) * 312;
    const y = 180 - (item.value / max) * 144;
    return { ...item, x, y };
  });
  const linePath = linePoints.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = linePoints.length > 0
    ? `${linePath} L${linePoints[linePoints.length - 1].x},184 L${linePoints[0].x},184 Z`
    : "";

  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{props.title}</h2>
          {props.subtitle ? <p className="mt-1 text-xs text-slate-500">{props.subtitle}</p> : null}
        </div>
        <span className="rounded-md bg-civic-100 px-2 py-1 text-xs font-semibold text-civic-700">
          {props.chartType === "line" ? "trend" : "bars"}
        </span>
      </div>
      {chartValues.length > 0 ? (
        props.chartType === "line" ? (
          <div className="rounded-md border border-slate-200 bg-white p-3">
            <svg viewBox="0 0 368 224" role="img" aria-label={props.title} className="h-56 w-full">
              <rect x="0" y="0" width="368" height="224" rx="8" fill="#ffffff" />
              {[0, 1, 2, 3].map((tick) => {
                const y = 36 + tick * 48;
                return <line key={tick} x1="24" x2="336" y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />;
              })}
              <line x1="24" x2="336" y1="184" y2="184" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="24" x2="24" y1="32" y2="184" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d={areaPath} fill="#2b6b7f" opacity="0.12" />
              <path d={linePath} fill="none" stroke="#0f3a4a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              {linePoints.map((point) => (
                <g key={point.rawLabel}>
                  <circle cx={point.x} cy={point.y} r="4" fill="#0f3a4a" stroke="#ffffff" strokeWidth="2" />
                  <text x={point.x} y={point.y - 9} textAnchor="middle" className="fill-slate-600 text-[9px] font-semibold">
                    {point.value}
                  </text>
                  <text x={point.x} y="205" textAnchor="middle" className="fill-slate-500 text-[9px] font-semibold">
                    {point.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="space-y-3 rounded-md border border-slate-200 bg-white p-3">
            {chartValues.map((item) => (
              <div key={item.rawLabel} className="grid gap-1.5 sm:grid-cols-[minmax(0,11rem)_1fr_auto] sm:items-center">
                <div className="truncate text-xs font-semibold text-slate-600" title={item.rawLabel}>
                  {item.label}
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-civic-100">
                  <div
                    className="h-full rounded-full bg-civic-800"
                    style={{ width: `${Math.max((item.value / max) * 100, 6)}%` }}
                    title={`${item.label}: ${item.value}`}
                  />
                </div>
                <div className="text-right text-xs font-semibold text-ink">{item.value}</div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex h-56 items-center justify-center rounded-md border border-dashed border-slate-200 bg-civic-50 px-4 text-center text-sm text-slate-500">
          No matching rows for this chart after the current filters.
        </div>
      )}
    </article>
  );
}

export function MapBlockView({ props }: MapBlock) {
  const max = Math.max(...props.data.map((item) => asNumber(item[props.metricField])), 1);
  const mappedZipIds = new Set(props.features.map((feature) => feature.id));
  const missingZipCount = props.data.filter((item) => !mappedZipIds.has(String(item[props.geographyField]))).length;
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
              d="M70 28 L298 36 L340 92 L318 196 L222 224 L98 214 L42 156 L52 78 Z"
              fill="#e8eef6"
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <path
              d="M110 50 L244 48 L300 98 L276 178 L190 204 L104 184 L74 124 Z"
              fill="none"
              stroke="#94a3b8"
              strokeDasharray="4 5"
              strokeWidth="1.5"
            />
            {props.data.map((item, index) => {
              const zip = String(item[props.geographyField]);
              const feature = props.features.find((candidate) => candidate.id === zip);
              if (!feature) {
                return null;
              }
              const value = asNumber(item[props.metricField]);
              const radius = 8 + (value / max) * 20;
              return (
                <g key={`${zip}-${index}`}>
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
                  <text
                    x={xFor(feature.longitude)}
                    y={yFor(feature.latitude) + radius + 12}
                    textAnchor="middle"
                    className="fill-slate-600 text-[9px] font-semibold"
                  >
                    {value}
                  </text>
                </g>
              );
            })}
          </svg>
          {props.legend ? (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
              <span>{props.legend}</span>
              <span className="rounded bg-white px-2 py-1 text-[11px] text-slate-500">
                Max bubble: {max}
              </span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
          {props.data.map((item, index) => {
            const value = asNumber(item[props.metricField]);
            const opacity = 0.72 + (value / max) * 0.28;

            return (
              <div
                key={`${String(item[props.geographyField])}-${index}`}
                className="rounded-md border border-civic-100 p-3"
                style={{ backgroundColor: `rgba(16, 43, 58, ${opacity})` }}
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
      {missingZipCount > 0 ? (
        <p className="mt-3 rounded-md bg-signal/10 px-3 py-2 text-xs leading-5 text-signal">
          {missingZipCount} ZIP aggregate row{missingZipCount === 1 ? "" : "s"} could not be plotted because no governed centroid is bundled. Affected rows remain in the table and charts.
        </p>
      ) : null}
      {props.note ? <p className="mt-3 text-xs leading-5 text-slate-500">{props.note}</p> : null}
    </article>
  );
}

export function TableBlockView({ props }: TableBlock) {
  const [sortField, setSortField] = useState(props.sortBy ?? props.columns[0]?.field ?? "");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const pageSize = Math.max(props.pageSize ?? props.rows.length, 1);
  const rows = useMemo(() => {
    if (!sortField) {
      return props.rows;
    }
    return [...props.rows].sort((a, b) => {
      const left = a[sortField];
      const right = b[sortField];
      const comparison = typeof left === "number" && typeof right === "number"
        ? left - right
        : String(left ?? "").localeCompare(String(right ?? ""));
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [props.rows, sortDirection, sortField]);
  const pageCount = Math.max(Math.ceil(rows.length / pageSize), 1);
  useEffect(() => {
    setPage((value) => Math.min(value, pageCount - 1));
  }, [pageCount, props.rows.length]);
  const visibleRows = rows.slice(page * pageSize, page * pageSize + pageSize);
  const firstVisible = rows.length === 0 ? 0 : page * pageSize + 1;
  const lastVisible = rows.length === 0 ? 0 : page * pageSize + visibleRows.length;
  const changeSort = (field: string) => {
    setPage(0);
    if (field === sortField) {
      setSortDirection((direction) => direction === "asc" ? "desc" : "asc");
      return;
    }
    setSortField(field);
    setSortDirection("desc");
  };

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200">
      <div className="border-b border-slate-200 bg-civic-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">{props.title}</h2>
        {props.caption ? <p className="mt-1 text-xs text-slate-500">{props.caption}</p> : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="sticky top-0 bg-white">
            <tr>
              {props.columns.map((column) => (
                <th
                  key={column.field}
                  scope="col"
                  aria-sort={sortField === column.field ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                >
                  <button
                    type="button"
                    onClick={() => changeSort(column.field)}
                    className="flex items-center gap-1 text-left uppercase tracking-[0.12em] transition hover:text-civic-700 focus:outline-none focus:ring-2 focus:ring-civic-100"
                    aria-label={`Sort by ${presentationColumnLabel(column.label)}`}
                  >
                    {presentationColumnLabel(column.label)}
                    {sortField === column.field ? <span aria-hidden="true">{sortDirection === "asc" ? "↑" : "↓"}</span> : null}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleRows.length > 0 ? visibleRows.map((row, index) => (
              <tr key={`${props.title}-${index}`}>
                {props.columns.map((column) => (
                  <td key={column.field} className="px-4 py-3 text-slate-700">
                    {String(row[column.field] ?? "")}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={Math.max(props.columns.length, 1)} className="px-4 py-8 text-center text-sm text-slate-500">
                  No matching rows for the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-civic-50 px-4 py-2 text-xs text-slate-500">
        <span>Showing {firstVisible}-{lastVisible} of {props.rows.length} rows</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(value - 1, 0))}
            disabled={page === 0}
            className="rounded border border-slate-200 px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-civic-100 disabled:opacity-40"
          >
            Prev
          </button>
          <span>{page + 1} / {pageCount}</span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(value + 1, pageCount - 1))}
            disabled={page + 1 >= pageCount}
            className="rounded border border-slate-200 px-2 py-1 font-semibold focus:outline-none focus:ring-2 focus:ring-civic-100 disabled:opacity-40"
          >
            Next
          </button>
        </div>
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
                aria-label={filter.label}
                value={values[filter.field] ?? filter.options?.[0] ?? ""}
                onChange={(event) => onChange?.(filter.field, event.target.value)}
                className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-sm text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                {(filter.options ?? []).map((option, index) => (
                  <option key={`${option}-${index}`}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                aria-label={filter.label}
                value={values[filter.field] ?? ""}
                onChange={(event) => onChange?.(filter.field, event.target.value)}
                className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-sm text-slate-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
                placeholder={filter.type === "dateRange" ? "2024-01-01 to 2024-12-31" : filter.field}
              />
            )}
          </label>
        ))}
      </div>
      {onApply ? (
        <button
          onClick={onApply}
          className="mt-4 w-full rounded-md bg-civic-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-civic-700 focus:outline-none focus:ring-2 focus:ring-civic-100"
        >
          Apply filters
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
        {props.dataset.recommendedVisuals.map((visual, index) => (
          <span key={`${visual}-${index}`} className="rounded-md bg-civic-100 px-2 py-1 text-xs text-civic-700">
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
          className="rounded-md border border-white/20 p-2 text-white/80 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label={`Open source for ${props.attribution.datasetTitle}`}
          target="_blank"
          rel="noopener noreferrer"
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
        {props.attribution.caveats.map((caveat, index) => (
          <p key={`${caveat}-${index}`} className="rounded-md bg-white/10 px-3 py-2 text-xs leading-5 text-civic-100">
            {caveat}
          </p>
        ))}
      </div>
    </article>
  );
}
