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

export function validateCanvasDocument(input: unknown): CanvasDocument {
  return canvasDocumentSchema.parse(input);
}
