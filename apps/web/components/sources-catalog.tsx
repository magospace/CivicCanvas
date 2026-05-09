"use client";

import { useMemo, useState } from "react";
import { Database, ExternalLink } from "lucide-react";
import type { DatasetMetadata } from "@texas-data-canvas/shared";

export function SourcesCatalog({ datasets }: { datasets: DatasetMetadata[] }) {
  const [city, setCity] = useState("All");
  const [topic, setTopic] = useState("All");
  const cities = ["All", ...new Set(datasets.map((dataset) => dataset.city))];
  const topics = ["All", ...new Set(datasets.map((dataset) => dataset.topic))];
  const filtered = useMemo(
    () =>
      datasets.filter(
        (dataset) =>
          (city === "All" || dataset.city === city) && (topic === "All" || dataset.topic === topic)
      ),
    [city, datasets, topic]
  );

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">City</span>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="min-w-48 rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-slate-700"
          >
            {cities.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Topic</span>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="min-w-48 rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-slate-700"
          >
            {topics.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((dataset) => {
          const verification = dataset.liveVerification;
          const promotionLabel = verification?.promotionStatus === "promoted"
            ? "live promoted"
            : verification?.promotionStatus === "blocked"
              ? "sample fallback required"
              : verification?.promotionStatus === "sample_first"
                ? "sample first"
                : dataset.liveAvailable
                  ? "live verified"
                  : dataset.dataAccess;
          const hostedBetaNote = dataset.id === "dallas_311_requests"
            ? "Hosted beta: verified Dallas live aggregates do not expose ZIP, so ZIP geography dashboards use sample fallback."
            : dataset.id === "austin_building_permits"
              ? "Hosted beta: Austin live metadata is verified, but monthly live aggregation remains sample-first until source-owned month grouping is approved."
              : null;
          return (
          <article
            key={dataset.id}
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-civic-700">
                  <Database className="h-4 w-4" />
                  {dataset.city} / {dataset.topic}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-ink">{dataset.title}</h2>
              </div>
              <a
                href={dataset.sourceUrl}
                className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:border-civic-500 hover:text-civic-700"
                aria-label={`Open source for ${dataset.title}`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{dataset.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-md bg-mint/10 px-2.5 py-1 text-xs font-medium text-mint">
                {promotionLabel}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {dataset.externalDatasetId ? `external ${dataset.externalDatasetId}` : "schema pending"}
              </span>
              {verification ? (
                <span className="rounded-md bg-civic-100 px-2.5 py-1 text-xs font-medium text-civic-700">
                  checked {new Date(verification.lastCheckedAt).toLocaleDateString("en-US")}
                </span>
              ) : null}
              {dataset.recommendedVisuals.map((visual) => (
                <span
                  key={visual}
                  className="rounded-md bg-civic-100 px-2.5 py-1 text-xs font-medium text-civic-700"
                >
                  {visual}
                </span>
              ))}
            </div>
            {dataset.liveQueryNotes.length > 0 ? (
              <div className="mt-3 space-y-1">
                {dataset.liveQueryNotes.map((note) => (
                  <p key={note} className="text-xs leading-5 text-slate-500">{note}</p>
                ))}
              </div>
            ) : null}
            {hostedBetaNote ? (
              <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                {hostedBetaNote}
              </p>
            ) : null}
            {verification ? (
              <div className="mt-4 rounded-md border border-slate-200 bg-civic-50 p-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Live verification
                </div>
                <div className="mt-2 grid gap-2 text-xs leading-5 text-slate-600">
                  <div>Live-capable fields: {verification.liveCapableFields.join(", ") || "none"}</div>
                  <div>Sample-only fields: {verification.sampleOnlyFields.join(", ") || "none"}</div>
                  {verification.checks.slice(0, 3).map((check) => (
                    <div key={check.label} className="rounded bg-white px-2 py-1">
                      <span className="font-semibold text-ink">{check.label}</span>: {check.status} / {check.reason}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {dataset.fields.slice(0, 7).map((field) => (
                <span
                  key={field.name}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"
                >
                  {field.name}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">{dataset.caveats[0]}</p>
          </article>
          );
        })}
      </div>
    </>
  );
}
