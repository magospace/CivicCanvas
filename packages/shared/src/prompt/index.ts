import {
  promptIntentSchema,
  type BoundedQuerySpec,
  type DatasetMetadata,
  type PromptIntent
} from "../schemas/index.js";

function yearRange(prompt: string): [string, string] | undefined {
  const match = prompt.match(/\b(20\d{2})\b/);
  if (!match) {
    return ["2024-01-01", "2024-12-31"];
  }

  return [`${match[1]}-01-01`, `${match[1]}-12-31`];
}

export function parsePromptIntent({
  prompt,
  catalog
}: {
  prompt: string;
  catalog: DatasetMetadata[];
}): PromptIntent {
  const normalized = prompt.toLowerCase();
  const candidates = catalog.filter((dataset) => {
    const haystack = `${dataset.id} ${dataset.title} ${dataset.city} ${dataset.topic}`.toLowerCase();
    return normalized
      .split(/\s+/)
      .filter(Boolean)
      .some((term) => haystack.includes(term));
  });
  const city = catalog.find((dataset) => normalized.includes(dataset.city.toLowerCase()))?.city;
  const dataset = candidates.find((candidate) => candidate.fields.length > 0);
  const groupBy = new Set<string>();

  if (normalized.includes("month")) {
    groupBy.add("month");
  }
  if (normalized.includes("zip")) {
    groupBy.add("zip_code");
  }
  if (normalized.includes("category")) {
    groupBy.add("category");
  }
  if (normalized.includes("status")) {
    groupBy.add("status");
  }
  if (normalized.includes("type") || normalized.includes("permit")) {
    groupBy.add("permit_type");
  }

  const supportedGroupBy = dataset
    ? [...groupBy].filter((field) => dataset.fields.some((candidate) => candidate.name === field))
    : [];
  const datasetCandidates = candidates.map((candidate) => candidate.id);
  const confidence = datasetCandidates.length > 0 ? Math.min(0.95, 0.5 + supportedGroupBy.length * 0.1) : 0.15;

  return promptIntentSchema.parse({
    prompt,
    datasetCandidates,
    city,
    topic: dataset?.topic,
    dateRange: yearRange(prompt),
    metrics: dataset
      ? [{ type: "count", alias: dataset.id.includes("permit") ? "permit_count" : "request_count" }]
      : [],
    groupBy: supportedGroupBy.length > 0 ? supportedGroupBy : dataset ? ["month"] : [],
    filters: [],
    requestedVisuals: ["summary", "metric", "chart", "map", "table", "source_method"],
    confidence,
    unresolvedQuestions:
      datasetCandidates.length === 0
        ? ["Choose an approved dataset from the catalog before generating a dashboard."]
        : []
  });
}

export function intentToBoundedQuerySpec(intent: PromptIntent, dataset: DatasetMetadata): BoundedQuerySpec {
  const dateField = dataset.fields.find((field) => field.type === "date")?.name;
  const filters = dateField && intent.dateRange
    ? [{ field: dateField, operator: "between" as const, value: intent.dateRange }]
    : [];

  return {
    schemaVersion: "1.0",
    datasetId: dataset.id,
    filters,
    groupBy: intent.groupBy.filter((field) => dataset.fields.some((candidate) => candidate.name === field)),
    metrics: intent.metrics.length > 0
      ? intent.metrics
      : [{ type: "count", alias: dataset.id.includes("permit") ? "permit_count" : "request_count" }],
    orderBy: [],
    limit: 100
  };
}
