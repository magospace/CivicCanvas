import {
  promptIntentSchema,
  type BoundedQuerySpec,
  type DatasetMetadata,
  type PromptIntent
} from "../schemas/index.js";

function yearRange(prompt: string): [string, string] | undefined {
  const range = prompt.match(/\b(20\d{2})\b\s*(?:-|to|through)\s*\b(20\d{2})\b/i);
  if (range) {
    return [`${range[1]}-01-01`, `${range[2]}-12-31`];
  }

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
  const sensitiveTerms = ["name", "phone", "email", "address", "applicant", "contractor", "personal", "private"];
  const candidates = catalog.filter((dataset) => {
    const haystack = `${dataset.id} ${dataset.title} ${dataset.city} ${dataset.topic}`.toLowerCase();
    const topicHints = [
      dataset.topic.toLowerCase(),
      dataset.city.toLowerCase(),
      dataset.id.replace(/_/g, " "),
      dataset.title.toLowerCase()
    ];
    return topicHints.some((term) => normalized.includes(term)) ||
      normalized.split(/\s+/).filter(Boolean).some((term) => haystack.includes(term));
  });
  const city = catalog.find((dataset) => normalized.includes(dataset.city.toLowerCase()))?.city;
  const dataset = candidates.find((candidate) => candidate.fields.length > 0);
  const groupBy = new Set<string>();
  const requestedVisuals = new Set(["summary", "metric", "table", "source_method"]);

  if (normalized.includes("month") || normalized.includes("trend")) {
    groupBy.add("month");
    requestedVisuals.add("chart");
  }
  if (normalized.includes("zip")) {
    groupBy.add("zip_code");
    requestedVisuals.add("map");
  }
  if (normalized.includes("category")) {
    groupBy.add("category");
    requestedVisuals.add("chart");
  }
  if (normalized.includes("status")) {
    groupBy.add("status");
    requestedVisuals.add("chart");
  }
  if (normalized.includes("type") || normalized.includes("permit")) {
    groupBy.add("permit_type");
    requestedVisuals.add("chart");
  }
  if (normalized.includes("top")) {
    requestedVisuals.add("chart");
  }

  const supportedGroupBy = dataset
    ? [...groupBy].filter((field) => dataset.fields.some((candidate) => candidate.name === field))
    : [];
  const datasetCandidates = candidates.map((candidate) => candidate.id);
  const safetyWarnings = sensitiveTerms
    .filter((term) => normalized.includes(term))
    .map((term) => `Prompt referenced "${term}"; governed dashboards only expose approved aggregate/public fields.`);
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
    requestedVisuals: [...requestedVisuals],
    safetyWarnings,
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
    mode: "auto",
    filters,
    groupBy: intent.groupBy.filter((field) => dataset.fields.some((candidate) => candidate.name === field)),
    metrics: intent.metrics.length > 0
      ? intent.metrics
      : [{ type: "count", alias: dataset.id.includes("permit") ? "permit_count" : "request_count" }],
    orderBy: [],
    limit: 100
  };
}
