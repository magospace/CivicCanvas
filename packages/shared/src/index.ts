import { z } from "zod";

export const fieldTypeSchema = z.enum([
  "string",
  "number",
  "date",
  "boolean",
  "geography",
  "unknown"
]);

export const fieldClassificationSchema = z.enum([
  "safe_public",
  "safe_with_aggregation",
  "sensitive_hide",
  "unknown_review"
]);

export const datasetFieldSchema = z.object({
  name: z.string().min(1),
  type: fieldTypeSchema,
  classification: fieldClassificationSchema,
  description: z.string().optional()
});

export const datasetSourceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
  adapter: z.string().min(1)
});

export const datasetMetadataSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  city: z.string().min(1),
  topic: z.string().min(1),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  dataAccess: z.string().min(1),
  description: z.string().min(1),
  fields: z.array(datasetFieldSchema),
  recommendedVisuals: z.array(z.string().min(1)),
  caveats: z.array(z.string().min(1))
});

export const approvedDatasetCatalogSchema = z.array(datasetMetadataSchema);

export const queryOperatorSchema = z.enum([
  "eq",
  "neq",
  "in",
  "between",
  "gte",
  "lte",
  "contains"
]);

export const boundedQueryFilterSchema = z.object({
  field: z.string().min(1),
  operator: queryOperatorSchema,
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number(), z.boolean()]))
  ])
});

export const queryMetricSchema = z.object({
  type: z.enum(["count", "sum", "avg", "min", "max"]),
  field: z.string().min(1).optional(),
  alias: z.string().min(1)
});

export const boundedQuerySpecSchema = z.object({
  datasetId: z.string().min(1),
  filters: z.array(boundedQueryFilterSchema).default([]),
  groupBy: z.array(z.string().min(1)).default([]),
  metrics: z.array(queryMetricSchema).min(1),
  orderBy: z
    .array(
      z.object({
        field: z.string().min(1),
        direction: z.enum(["asc", "desc"]).default("desc")
      })
    )
    .default([]),
  limit: z.number().int().positive().max(1000).default(500)
});

export const sourceAttributionSchema = z.object({
  datasetId: z.string().min(1),
  datasetTitle: z.string().min(1),
  sourceName: z.string().min(1),
  sourceUrl: z.string().url(),
  accessedAt: z.string().datetime(),
  fieldsUsed: z.array(z.string().min(1)),
  filtersApplied: z.array(z.string().min(1)),
  queryMethod: z.string().min(1),
  caveats: z.array(z.string().min(1)),
  license: z.string().optional()
});

export const queryResultSchema = z.object({
  queryId: z.string().min(1),
  datasetId: z.string().min(1),
  resultType: z.enum(["aggregate", "geo_aggregate", "sample", "metadata"]),
  rows: z.array(z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]))),
  columns: z.array(
    z.object({
      field: z.string().min(1),
      label: z.string().min(1),
      type: fieldTypeSchema
    })
  ),
  source: sourceAttributionSchema,
  caveats: z.array(z.string().min(1))
});

export const visualizationRecommendationSchema = z.object({
  datasetId: z.string().min(1),
  resultType: z.string().min(1),
  recommendedBlocks: z.array(
    z.enum([
      "SummaryBlock",
      "MetricBlock",
      "ChartBlock",
      "MapBlock",
      "TableBlock",
      "FilterBlock",
      "SourceMethodBlock",
      "DatasetCardBlock"
    ])
  ),
  rationale: z.string().min(1)
});

export const queryReferenceSchema = z.object({
  queryId: z.string().min(1),
  datasetId: z.string().min(1),
  label: z.string().min(1),
  spec: boundedQuerySpecSchema.optional()
});

const chartDatumSchema = z.record(z.union([z.string(), z.number()]));
const tableDatumSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]));

const summaryBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("SummaryBlock"),
  props: z.object({
    heading: z.string().min(1),
    text: z.string().min(1),
    bullets: z.array(z.string().min(1)).default([])
  })
});

const metricBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("MetricBlock"),
  props: z.object({
    label: z.string().min(1),
    value: z.union([z.string(), z.number()]),
    helperText: z.string().optional(),
    tone: z.enum(["neutral", "good", "warning"]).default("neutral")
  })
});

const chartBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("ChartBlock"),
  props: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    chartType: z.enum(["bar", "line"]),
    xField: z.string().min(1),
    yField: z.string().min(1),
    data: z.array(chartDatumSchema)
  })
});

const mapBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("MapBlock"),
  props: z.object({
    title: z.string().min(1),
    geographyField: z.string().min(1),
    metricField: z.string().min(1),
    data: z.array(chartDatumSchema),
    note: z.string().optional()
  })
});

const tableBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("TableBlock"),
  props: z.object({
    title: z.string().min(1),
    caption: z.string().optional(),
    pageSize: z.number().int().positive().max(100).optional(),
    sortBy: z.string().min(1).optional(),
    columns: z.array(
      z.object({
        field: z.string().min(1),
        label: z.string().min(1)
      })
    ),
    rows: z.array(tableDatumSchema)
  })
});

const filterBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("FilterBlock"),
  props: z.object({
    title: z.string().min(1),
    filters: z.array(
      z.object({
        field: z.string().min(1),
        label: z.string().min(1),
        type: z.enum(["select", "dateRange", "text"]),
        options: z.array(z.string().min(1)).optional()
      })
    )
  })
});

const sourceMethodBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("SourceMethodBlock"),
  props: z.object({
    attribution: sourceAttributionSchema,
    methodology: z.string().min(1)
  })
});

const datasetCardBlockSchema = z.object({
  id: z.string().min(1),
  type: z.literal("DatasetCardBlock"),
  props: z.object({
    dataset: datasetMetadataSchema
  })
});

export const canvasBlockSchema = z.discriminatedUnion("type", [
  summaryBlockSchema,
  metricBlockSchema,
  chartBlockSchema,
  mapBlockSchema,
  tableBlockSchema,
  filterBlockSchema,
  sourceMethodBlockSchema,
  datasetCardBlockSchema
]);

function containsUnsafeGeneratedMarkup(value: unknown): boolean {
  if (typeof value === "string") {
    return /<\s*script|javascript:|on\w+\s*=|<\s*iframe/i.test(value);
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsUnsafeGeneratedMarkup(item));
  }

  if (value && typeof value === "object") {
    return Object.values(value).some((item) => containsUnsafeGeneratedMarkup(item));
  }

  return false;
}

export const canvasDocumentSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    blocks: z.array(canvasBlockSchema).min(1).max(10),
    sources: z.array(sourceAttributionSchema).min(1),
    queries: z.array(queryReferenceSchema).default([])
  })
  .superRefine((document, context) => {
    if (!document.blocks.some((block) => block.type === "SourceMethodBlock")) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["blocks"],
        message: "CanvasDocument must include SourceMethodBlock."
      });
    }

    if (containsUnsafeGeneratedMarkup(document)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "CanvasDocument contains unsafe generated markup or script-like values."
      });
    }
  });

export const miroExportSpecSchema = z.object({
  title: z.string().min(1),
  template: z.enum(["briefing_board", "slide_deck", "community_workshop"]),
  sourceMethodFrameRequired: z.literal(true),
  frames: z.array(
    z.object({
      title: z.string().min(1),
      items: z.array(
        z.object({
          type: z.enum(["text", "chart", "map", "table", "source_method"]),
          content: z.string().min(1)
        })
      )
    })
  )
});

export const queryAuditSchema = z.object({
  auditId: z.string().min(1),
  queryId: z.string().min(1),
  datasetId: z.string().min(1),
  fieldsUsed: z.array(z.string().min(1)),
  filtersApplied: z.array(z.string().min(1)),
  rowLimit: z.number().int().positive(),
  aggregation: z.boolean(),
  executedAt: z.string().datetime(),
  safetyDecisions: z.array(z.string().min(1))
});

export type FieldType = z.infer<typeof fieldTypeSchema>;
export type FieldClassification = z.infer<typeof fieldClassificationSchema>;
export type DatasetField = z.infer<typeof datasetFieldSchema>;
export type DatasetSource = z.infer<typeof datasetSourceSchema>;
export type DatasetMetadata = z.infer<typeof datasetMetadataSchema>;
export type BoundedQuerySpec = z.infer<typeof boundedQuerySpecSchema>;
export type QueryResult = z.infer<typeof queryResultSchema>;
export type SourceAttribution = z.infer<typeof sourceAttributionSchema>;
export type VisualizationRecommendation = z.infer<typeof visualizationRecommendationSchema>;
export type QueryReference = z.infer<typeof queryReferenceSchema>;
export type CanvasBlock = z.infer<typeof canvasBlockSchema>;
export type CanvasDocument = z.infer<typeof canvasDocumentSchema>;
export type MiroExportSpec = z.infer<typeof miroExportSpecSchema>;
export type QueryAudit = z.infer<typeof queryAuditSchema>;
export type QueryExecution = {
  result: QueryResult;
  audit: QueryAudit;
};
export type SampleRow = Record<string, string | number | boolean | null>;

export function validateCanvasDocument(input: unknown): CanvasDocument {
  return canvasDocumentSchema.parse(input);
}

export function safeValidateCanvasDocument(input: unknown):
  | { ok: true; data: CanvasDocument; errors: [] }
  | { ok: false; data?: never; errors: string[] } {
  const result = canvasDocumentSchema.safeParse(input);

  if (result.success) {
    return { ok: true, data: result.data, errors: [] };
  }

  return {
    ok: false,
    errors: result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
  };
}

const maxRawRows = 100;
const maxAggregateRows = 1000;

function createId(prefix: string, parts: string[]) {
  const body = parts
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return `${prefix}_${body || "default"}`;
}

function getDataset(catalog: DatasetMetadata[], datasetId: string) {
  const dataset = catalog.find((candidate) => candidate.id === datasetId);

  if (!dataset) {
    throw new Error(`Dataset is not approved: ${datasetId}`);
  }

  return dataset;
}

function getDatasetField(dataset: DatasetMetadata, fieldName: string) {
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

function formatFilter(filter: BoundedQuerySpec["filters"][number]) {
  const value = Array.isArray(filter.value) ? filter.value.join(" and ") : String(filter.value);
  return `${filter.field} ${filter.operator} ${value}`;
}

function fieldsUsedBySpec(spec: BoundedQuerySpec) {
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
  accessedAt = new Date().toISOString()
): SourceAttribution {
  const fieldsUsed = fieldsUsedBySpec(spec);

  return sourceAttributionSchema.parse({
    datasetId: dataset.id,
    datasetTitle: dataset.title,
    sourceName: dataset.sourceName,
    sourceUrl: dataset.sourceUrl,
    accessedAt,
    fieldsUsed,
    filtersApplied: spec.filters.map(formatFilter),
    queryMethod: "Validated BoundedQuerySpec executed against approved local sample data.",
    caveats: dataset.caveats,
    license: "Refer to source portal terms"
  });
}

export function executeBoundedQuery({
  catalog,
  rows,
  spec,
  accessedAt = new Date().toISOString()
}: {
  catalog: DatasetMetadata[];
  rows: SampleRow[];
  spec: unknown;
  accessedAt?: string;
}): QueryExecution {
  const parsedSpec = boundedQuerySpecSchema.parse(spec);
  const dataset = getDataset(catalog, parsedSpec.datasetId);
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

  const maxRows = aggregation ? maxAggregateRows : maxRawRows;
  if (parsedSpec.limit > maxRows) {
    throw new Error(`Query limit ${parsedSpec.limit} exceeds max ${maxRows} for this query type.`);
  }

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
  const source = createSourceAttribution(dataset, parsedSpec, accessedAt);
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
    rows: resultRows,
    columns,
    source,
    caveats: dataset.caveats
  });

  const audit = queryAuditSchema.parse({
    auditId: createId("audit", [queryId]),
    queryId,
    datasetId: parsedSpec.datasetId,
    fieldsUsed,
    filtersApplied: parsedSpec.filters.map(formatFilter),
    rowLimit: parsedSpec.limit,
    aggregation,
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
