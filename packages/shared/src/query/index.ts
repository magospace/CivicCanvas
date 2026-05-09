import { governanceLimits } from "../constants.js";
import {
  boundedQuerySpecSchema,
  queryAuditSchema,
  queryResultSchema,
  sourceAttributionSchema,
  type BoundedQuerySpec,
  type DataMode,
  type DatasetMetadata,
  type QueryExecution,
  type SampleRow,
  type SourceAttribution
} from "../schemas/index.js";

function createId(prefix: string, parts: string[]) {
  const body = parts
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return `${prefix}_${body || "default"}`;
}

export function getApprovedDataset(catalog: DatasetMetadata[], datasetId: string) {
  const dataset = catalog.find((candidate) => candidate.id === datasetId);

  if (!dataset) {
    throw new Error(`Dataset is not approved: ${datasetId}`);
  }

  return dataset;
}

export function getDatasetField(dataset: DatasetMetadata, fieldName: string) {
  const field = dataset.fields.find((candidate) => candidate.name === fieldName);

  if (!field) {
    throw new Error(`Field "${fieldName}" is not allowlisted for ${dataset.id}.`);
  }

  return field;
}

function validateFieldUse(dataset: DatasetMetadata, fieldName: string, aggregation: boolean) {
  const field = getDatasetField(dataset, fieldName);

  if (field.classification === "sensitive_hide" || field.classification === "unknown_review") {
    throw new Error(`Field "${fieldName}" is not available for safe querying.`);
  }

  if (field.classification === "safe_with_aggregation" && !aggregation) {
    throw new Error(`Field "${fieldName}" requires aggregation.`);
  }
}

function compareValues(
  left: string | number | boolean | null,
  right: string | number | boolean | null
) {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left ?? "").localeCompare(String(right));
}

function matchesFilter(row: SampleRow, filter: BoundedQuerySpec["filters"][number]) {
  const rowValue = row[filter.field];

  switch (filter.operator) {
    case "eq":
      return rowValue === filter.value;
    case "neq":
      return rowValue !== filter.value;
    case "in":
      return Array.isArray(filter.value) && filter.value.some((value) => value === rowValue);
    case "between":
      if (!Array.isArray(filter.value) || filter.value.length !== 2) {
        return false;
      }
      return compareValues(rowValue, filter.value[0]) >= 0 && compareValues(rowValue, filter.value[1]) <= 0;
    case "gte":
      return !Array.isArray(filter.value) && compareValues(rowValue, filter.value) >= 0;
    case "lte":
      return !Array.isArray(filter.value) && compareValues(rowValue, filter.value) <= 0;
    case "contains":
      return !Array.isArray(filter.value) && String(rowValue ?? "").toLowerCase().includes(String(filter.value).toLowerCase());
    default:
      return false;
  }
}

export function formatQueryFilter(filter: BoundedQuerySpec["filters"][number]) {
  const value = Array.isArray(filter.value) ? filter.value.join(" and ") : String(filter.value);
  return `${filter.field} ${filter.operator} ${value}`;
}

export function fieldsUsedBySpec(spec: BoundedQuerySpec) {
  const fields = new Set<string>();

  for (const filter of spec.filters) {
    fields.add(filter.field);
  }

  for (const field of spec.groupBy) {
    fields.add(field);
  }

  for (const metric of spec.metrics) {
    if (metric.field) {
      fields.add(metric.field);
    }
  }

  for (const order of spec.orderBy) {
    fields.add(order.field);
  }

  return [...fields];
}

function metricValue(rows: SampleRow[], metric: BoundedQuerySpec["metrics"][number]) {
  if (metric.type === "count") {
    return rows.length;
  }

  const values = rows
    .map((row) => row[metric.field ?? ""])
    .filter((value): value is number => typeof value === "number");

  if (values.length === 0) {
    return 0;
  }

  if (metric.type === "sum") {
    return values.reduce((sum, value) => sum + value, 0);
  }

  if (metric.type === "avg") {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  if (metric.type === "min") {
    return Math.min(...values);
  }

  return Math.max(...values);
}

function sortRows(rows: SampleRow[], spec: BoundedQuerySpec) {
  if (spec.orderBy.length === 0) {
    return rows;
  }

  return [...rows].sort((a, b) => {
    for (const order of spec.orderBy) {
      const comparison = compareValues(a[order.field], b[order.field]);
      if (comparison !== 0) {
        return order.direction === "asc" ? comparison : -comparison;
      }
    }

    return 0;
  });
}

export function createSourceAttribution(
  dataset: DatasetMetadata,
  spec: BoundedQuerySpec,
  accessedAt = new Date().toISOString(),
  queryMethod = "Validated BoundedQuerySpec executed against approved local sample data.",
  dataMode: DataMode = "sample",
  caveats = dataset.caveats
): SourceAttribution {
  return sourceAttributionSchema.parse({
    datasetId: dataset.id,
    datasetTitle: dataset.title,
    sourceName: dataset.sourceName,
    sourceUrl: dataset.sourceUrl,
    accessedAt,
    fieldsUsed: fieldsUsedBySpec(spec),
    filtersApplied: spec.filters.map(formatQueryFilter),
    queryMethod,
    dataMode,
    caveats,
    license: "Refer to source portal terms"
  });
}

export function validateBoundedQuerySpec({
  catalog,
  spec
}: {
  catalog: DatasetMetadata[];
  spec: unknown;
}) {
  const parsedSpec = boundedQuerySpecSchema.parse(spec);
  const dataset = getApprovedDataset(catalog, parsedSpec.datasetId);
  const aggregation = parsedSpec.groupBy.length > 0 || parsedSpec.metrics.some((metric) => metric.type !== "count");
  const fieldsUsed = fieldsUsedBySpec(parsedSpec);

  for (const field of fieldsUsed) {
    const isMetricAlias = parsedSpec.metrics.some((metric) => metric.alias === field);
    if (!isMetricAlias) {
      validateFieldUse(dataset, field, aggregation);
    }
  }

  for (const metric of parsedSpec.metrics) {
    if (metric.type !== "count" && !metric.field) {
      throw new Error(`Metric "${metric.alias}" requires a numeric field.`);
    }
  }

  const maxRows = aggregation ? governanceLimits.maxAggregateRows : governanceLimits.maxRawRows;
  if (parsedSpec.limit > maxRows) {
    throw new Error(`Query limit ${parsedSpec.limit} exceeds max ${maxRows} for this query type.`);
  }

  return { spec: parsedSpec, dataset, aggregation, fieldsUsed };
}

export function executeBoundedQuery({
  catalog,
  rows,
  spec,
  accessedAt = new Date().toISOString(),
  queryMethod,
  dataMode = "sample",
  caveats
}: {
  catalog: DatasetMetadata[];
  rows: SampleRow[];
  spec: unknown;
  accessedAt?: string;
  queryMethod?: string;
  dataMode?: DataMode;
  caveats?: string[];
}): QueryExecution {
  const { spec: parsedSpec, dataset, aggregation, fieldsUsed } = validateBoundedQuerySpec({ catalog, spec });
  const filteredRows = rows.filter((row) => parsedSpec.filters.every((filter) => matchesFilter(row, filter)));
  let resultRows: SampleRow[];

  if (parsedSpec.groupBy.length > 0) {
    const groups = new Map<string, SampleRow[]>();

    for (const row of filteredRows) {
      const key = parsedSpec.groupBy.map((field) => String(row[field] ?? "Unknown")).join("\u001f");
      const existing = groups.get(key) ?? [];
      existing.push(row);
      groups.set(key, existing);
    }

    resultRows = [...groups.entries()].map(([key, groupRows]) => {
      const keyParts = key.split("\u001f");
      const groupedRow: SampleRow = {};

      parsedSpec.groupBy.forEach((field, index) => {
        groupedRow[field] = keyParts[index] ?? "Unknown";
      });

      for (const metric of parsedSpec.metrics) {
        groupedRow[metric.alias] = metricValue(groupRows, metric);
      }

      return groupedRow;
    });
  } else {
    resultRows = filteredRows.map((row) => {
      const projected: SampleRow = {};
      for (const field of fieldsUsed) {
        projected[field] = row[field] ?? null;
      }
      return projected;
    });
  }

  resultRows = sortRows(resultRows, parsedSpec).slice(0, parsedSpec.limit);
  const source = createSourceAttribution(dataset, parsedSpec, accessedAt, queryMethod, dataMode, caveats);
  const queryId = createId("q", [parsedSpec.datasetId, ...parsedSpec.groupBy, ...parsedSpec.metrics.map((metric) => metric.alias)]);
  const columns = [
    ...parsedSpec.groupBy.map((field) => {
      const datasetField = getDatasetField(dataset, field);
      return { field, label: field.replace(/_/g, " "), type: datasetField.type };
    }),
    ...parsedSpec.metrics.map((metric) => ({
      field: metric.alias,
      label: metric.alias.replace(/_/g, " "),
      type: "number" as const
    }))
  ];

  const result = queryResultSchema.parse({
    queryId,
    datasetId: parsedSpec.datasetId,
    resultType: parsedSpec.groupBy.some((field) => field.includes("zip")) ? "geo_aggregate" : aggregation ? "aggregate" : "sample",
    dataMode,
    rows: resultRows,
    columns,
    source,
    caveats: caveats ?? dataset.caveats
  });

  const audit = queryAuditSchema.parse({
    auditId: createId("audit", [queryId]),
    queryId,
    datasetId: parsedSpec.datasetId,
    fieldsUsed,
    filtersApplied: parsedSpec.filters.map(formatQueryFilter),
    rowLimit: parsedSpec.limit,
    aggregation,
    dataMode,
    executedAt: accessedAt,
    safetyDecisions: [
      "Dataset ID matched approved catalog.",
      "Fields and operators validated before execution.",
      `Row limit enforced at ${parsedSpec.limit}.`,
      aggregation ? "Aggregate result returned." : "Raw sample result returned within raw row limit."
    ]
  });

  return { result, audit };
}
