import {
  promptIntentSchema,
  type BoundedQuerySpec,
  type DatasetMetadata,
  type PromptIntent
} from "../schemas/index.js";

const monthIndex: Record<string, string> = {
  january: "01",
  jan: "01",
  february: "02",
  feb: "02",
  march: "03",
  mar: "03",
  april: "04",
  apr: "04",
  may: "05",
  june: "06",
  jun: "06",
  july: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sep: "09",
  october: "10",
  oct: "10",
  november: "11",
  nov: "11",
  december: "12",
  dec: "12"
};

function endOfMonth(year: string, month: string) {
  return new Date(Number(year), Number(month), 0).getDate().toString().padStart(2, "0");
}

function yearRange(prompt: string, referenceDate = new Date()): [string, string] | undefined {
  const monthRange = prompt.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(20\d{2})\b\s*(?:-|to|through)\s*\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(20\d{2})\b/i);
  if (monthRange) {
    const startMonth = monthIndex[monthRange[1].toLowerCase()];
    const endMonth = monthIndex[monthRange[3].toLowerCase()];
    return [
      `${monthRange[2]}-${startMonth}-01`,
      `${monthRange[4]}-${endMonth}-${endOfMonth(monthRange[4], endMonth)}`
    ];
  }

  if (/\blast year\b/i.test(prompt)) {
    const year = String(referenceDate.getFullYear() - 1);
    return [`${year}-01-01`, `${year}-12-31`];
  }

  if (/\bthis year\b/i.test(prompt)) {
    const year = String(referenceDate.getFullYear());
    return [`${year}-01-01`, `${year}-12-31`];
  }

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
  catalog,
  referenceDate
}: {
  prompt: string;
  catalog: DatasetMetadata[];
  referenceDate?: Date;
}): PromptIntent {
  const normalized = prompt.toLowerCase();
  const sensitiveTerms = ["name", "phone", "email", "address", "applicant", "contractor", "personal", "private"];
  const matchedTerms = new Set<string>();
  const reasonCodes = new Set<string>();
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
  if (city) {
    matchedTerms.add(city.toLowerCase());
    reasonCodes.add("city_match");
  }
  const dataset = candidates.find((candidate) => candidate.fields.length > 0);
  if (dataset) {
    matchedTerms.add(dataset.topic.toLowerCase());
    reasonCodes.add("dataset_candidate_match");
  }
  const groupBy = new Set<string>();
  const requestedVisuals = new Set(["summary", "metric", "table", "source_method"]);

  if (normalized.includes("month") || normalized.includes("trend")) {
    groupBy.add("month");
    requestedVisuals.add("chart");
    matchedTerms.add(normalized.includes("trend") ? "trend" : "month");
    reasonCodes.add("time_grouping_requested");
  }
  if (normalized.includes("zip")) {
    groupBy.add("zip_code");
    requestedVisuals.add("map");
    matchedTerms.add("zip");
    reasonCodes.add("geography_requested");
  }
  if (normalized.includes("category")) {
    groupBy.add("category");
    requestedVisuals.add("chart");
    matchedTerms.add("category");
    reasonCodes.add("category_grouping_requested");
  }
  if (normalized.includes("status")) {
    groupBy.add("status");
    requestedVisuals.add("chart");
    matchedTerms.add("status");
    reasonCodes.add("status_grouping_requested");
  }
  if (normalized.includes("type") || normalized.includes("permit")) {
    groupBy.add("permit_type");
    requestedVisuals.add("chart");
    matchedTerms.add(normalized.includes("permit") ? "permit" : "type");
    reasonCodes.add("type_grouping_requested");
  }
  if (normalized.includes("top")) {
    requestedVisuals.add("chart");
    matchedTerms.add("top");
    reasonCodes.add(`top_n:${Math.min(Number(normalized.match(/\btop\s+(\d+)\b/)?.[1] ?? 10), 100)}`);
  }
  if (/\bsample data\b|\bsample mode\b/.test(normalized)) {
    matchedTerms.add("sample data");
    reasonCodes.add("mode_sample_requested");
  }
  if (/\blive data\b|\bpublic api\b|\blive api\b/.test(normalized)) {
    matchedTerms.add("live data");
    reasonCodes.add("mode_live_requested");
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
    dateRange: yearRange(prompt, referenceDate),
    metrics: dataset
      ? [{ type: "count", alias: dataset.id.includes("permit") ? "permit_count" : "request_count" }]
      : [],
    groupBy: supportedGroupBy.length > 0 ? supportedGroupBy : dataset ? ["month"] : [],
    filters: [],
    requestedVisuals: [...requestedVisuals],
    safetyWarnings,
    matchedTerms: [...matchedTerms],
    reasonCodes: [...reasonCodes],
    rejectedFields: sensitiveTerms.filter((term) => normalized.includes(term)),
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
    mode: intent.reasonCodes.includes("mode_sample_requested")
      ? "sample_only"
      : intent.reasonCodes.includes("mode_live_requested")
        ? "live_if_available"
        : "auto",
    limit: Number(intent.reasonCodes.find((code) => code.startsWith("top_n:"))?.split(":")[1] ?? 100)
  };
}
