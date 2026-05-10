"use client";

import { useMemo, useState } from "react";
import { Database, ExternalLink } from "lucide-react";
import type { DatasetMetadata } from "@texas-data-canvas/shared";

function fieldStatus(dataset: DatasetMetadata, fieldName: string) {
  const field = dataset.fields.find((candidate) => candidate.name === fieldName);
  if (field?.classification === "sensitive_hide") {
    return { label: "hidden", className: "border-signal/30 bg-signal/10 text-signal" };
  }
  if (field?.classification === "unknown_review") {
    return { label: "review", className: "border-amber-200 bg-amber-50 text-amber-900" };
  }
  const verification = dataset.liveVerification;
  if (verification?.liveCapableFields.includes(fieldName)) {
    return { label: "live-capable", className: "border-mint/30 bg-mint/10 text-mint" };
  }
  if (verification?.sampleOnlyFields.includes(fieldName)) {
    return { label: "sample-only", className: "border-amber-200 bg-amber-50 text-amber-800" };
  }
  if (verification?.testedFields.includes(fieldName)) {
    return { label: "blocked", className: "border-signal/30 bg-signal/10 text-signal" };
  }
  if (dataset.fields.length === 0) {
    return { label: "coming later", className: "border-slate-200 bg-slate-100 text-slate-500" };
  }
  return { label: dataset.liveAvailable ? "mapped" : "sample", className: "border-slate-200 bg-white text-slate-600" };
}

function datasetStatus(dataset: DatasetMetadata) {
  const promotion = dataset.liveVerification?.promotionStatus;
  if (promotion === "promoted") {
    return { label: "live promoted", className: "bg-mint/10 text-mint" };
  }
  if (promotion === "blocked") {
    return { label: "blocked", className: "bg-amber-50 text-amber-900" };
  }
  if (promotion === "sample_first") {
    return { label: "sample-first", className: "bg-amber-50 text-amber-900" };
  }
  if (dataset.fields.length === 0) {
    return { label: "coming later", className: "bg-slate-100 text-slate-600" };
  }
  return dataset.liveAvailable
    ? { label: "live verified", className: "bg-mint/10 text-mint" }
    : { label: "sample fallback", className: "bg-slate-100 text-slate-600" };
}

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
          const fields = dataset.fields.length > 0
            ? dataset.fields.map((field) => ({ name: field.name, status: fieldStatus(dataset, field.name) }))
            : [{ name: "Approved metadata pending", status: fieldStatus(dataset, "pending") }];
          const hiddenFields = dataset.fields.filter((field) => field.classification === "sensitive_hide");
          const status = datasetStatus(dataset);
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
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:border-civic-500 hover:text-civic-700"
                aria-label={`Open source for ${dataset.title}`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{dataset.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                {status.label}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {dataset.externalDatasetId ? `external ${dataset.externalDatasetId}` : "schema pending"}
              </span>
              {dataset.fallbackSampleFile ? (
                <span className="rounded-md bg-civic-100 px-2.5 py-1 text-xs font-medium text-civic-700">
                  sample fallback required
                </span>
              ) : null}
              {verification ? (
                <span className="rounded-md bg-civic-100 px-2.5 py-1 text-xs font-medium text-civic-700">
                  checked {new Date(verification.lastCheckedAt).toLocaleDateString("en-US")}
                </span>
              ) : dataset.lastVerifiedAt ? (
                <span className="rounded-md bg-civic-100 px-2.5 py-1 text-xs font-medium text-civic-700">
                  checked {new Date(dataset.lastVerifiedAt).toLocaleDateString("en-US")}
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
            <div className="mt-3 rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-xs leading-5 text-slate-600">
              <span className="font-semibold text-ink">Verification summary:</span>{" "}
              {verification
                ? `${verification.promotionStatus}; last checked ${new Date(verification.lastCheckedAt).toLocaleDateString("en-US")}. ${verification.checks.find((check) => check.status !== "passed")?.reason ?? "Current verified field mappings are listed below."}`
                : "Live verification is not complete; treat this source as coming later until metadata and sample governance are approved."}
            </div>
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
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Field confidence
              </div>
              <div className="flex flex-wrap gap-2">
              {fields.map((field) => (
                <span
                  key={field.name}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium ${field.status.className}`}
                >
                  {field.name} · {field.status.label}
                </span>
              ))}
              </div>
              {hiddenFields.length > 0 ? (
                <p className="mt-2 rounded-md bg-signal/10 px-3 py-2 text-xs leading-5 text-signal">
                  Hidden fields such as {hiddenFields.map((field) => field.name).join(", ")} are intentionally excluded from queries, exports, and generated dashboards.
                </p>
              ) : null}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">{dataset.caveats[0]}</p>
          </article>
          );
        })}
      </div>
    </>
  );
}
