import {
  executeBoundedQuery,
  safeValidateCanvasDocument,
  validateCanvasDocument,
  type BoundedQuerySpec,
  type CanvasDocument,
  type DatasetMetadata,
  type QueryAudit,
  type QueryResult,
  type SampleRow,
  type SourceAttribution
} from "@texas-data-canvas/shared";
import { findDataset, getDatasetCatalog, getSampleRows } from "./data";

export type DashboardGeneration = {
  canvas: CanvasDocument;
  audits: QueryAudit[];
  suggestedDatasets?: DatasetMetadata[];
};

type DemoIntent = {
  datasetId: "dallas_311_requests" | "austin_building_permits";
  title: string;
  summaryHeading: string;
  metricLabel: string;
  countAlias: string;
  dateField: string;
  geographyField: string;
  categoryField: string;
  topLabel: string;
  caveatLead: string;
};

const dallasIntent: DemoIntent = {
  datasetId: "dallas_311_requests",
  title: "Dallas 311 Service Requests Explorer",
  summaryHeading: "Dallas 311 requests by category and ZIP",
  metricLabel: "Sample requests",
  countAlias: "request_count",
  dateField: "created_date",
  geographyField: "zip_code",
  categoryField: "category",
  topLabel: "Top request category",
  caveatLead: "311 records reflect reported service requests, not every neighborhood condition."
};

const austinIntent: DemoIntent = {
  datasetId: "austin_building_permits",
  title: "Austin Building Permits Explorer",
  summaryHeading: "Austin permits by month and ZIP",
  metricLabel: "Sample permits",
  countAlias: "permit_count",
  dateField: "issued_date",
  geographyField: "zip_code",
  categoryField: "permit_type",
  topLabel: "Top permit type",
  caveatLead: "Permit records are administrative data and may not represent construction starts."
};

function detectIntent(prompt: string): DemoIntent | null {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("austin") && normalized.includes("permit")) {
    return austinIntent;
  }

  if (normalized.includes("dallas") && (normalized.includes("311") || normalized.includes("service"))) {
    return dallasIntent;
  }

  return null;
}

function runQuery(catalog: DatasetMetadata[], rows: SampleRow[], spec: BoundedQuerySpec) {
  return executeBoundedQuery({
    catalog,
    rows,
    spec,
    accessedAt: "2026-05-09T00:00:00.000Z"
  });
}

function numeric(row: Record<string, unknown>, field: string) {
  const value = row[field];
  return typeof value === "number" ? value : 0;
}

function stringify(row: Record<string, unknown>, field: string) {
  return String(row[field] ?? "Unknown");
}

function chartRows(result: QueryResult, xField: string, yField: string) {
  return result.rows.map((row) => ({
    [xField]: stringify(row, xField),
    [yField]: numeric(row, yField)
  }));
}

function topValue(result: QueryResult, labelField: string, valueField: string) {
  const top = result.rows[0];
  return top ? `${stringify(top, labelField)} (${numeric(top, valueField)})` : "No records";
}

function createCombinedSource(
  dataset: DatasetMetadata,
  results: QueryResult[],
  prompt: string
): SourceAttribution {
  const fieldsUsed = [...new Set(results.flatMap((result) => result.source.fieldsUsed))];
  const filtersApplied = [...new Set(results.flatMap((result) => result.source.filtersApplied))];

  return {
    datasetId: dataset.id,
    datasetTitle: dataset.title,
    sourceName: dataset.sourceName,
    sourceUrl: dataset.sourceUrl,
    accessedAt: "2026-05-09T00:00:00.000Z",
    fieldsUsed,
    filtersApplied,
    queryMethod: `Deterministic MVP prompt match for: "${prompt}"`,
    caveats: dataset.caveats,
    license: "Refer to source portal terms"
  };
}

function createDashboardForIntent(prompt: string, intent: DemoIntent): DashboardGeneration {
  const catalog = getDatasetCatalog();
  const dataset = findDataset(catalog, intent.datasetId);
  const rows = getSampleRows(intent.datasetId);

  const dateFilter = {
    field: intent.dateField,
    operator: "between" as const,
    value: ["2024-01-01", "2024-12-31"]
  };

  const total = runQuery(catalog, rows, {
    datasetId: intent.datasetId,
    filters: [dateFilter],
    groupBy: ["month"],
    metrics: [{ type: "count", alias: intent.countAlias }],
    orderBy: [{ field: "month", direction: "asc" }],
    limit: 12
  });

  const byCategory = runQuery(catalog, rows, {
    datasetId: intent.datasetId,
    filters: [dateFilter],
    groupBy: [intent.categoryField],
    metrics: [{ type: "count", alias: intent.countAlias }],
    orderBy: [{ field: intent.countAlias, direction: "desc" }],
    limit: 8
  });

  const byZip = runQuery(catalog, rows, {
    datasetId: intent.datasetId,
    filters: [dateFilter],
    groupBy: [intent.geographyField],
    metrics: [{ type: "count", alias: intent.countAlias }],
    orderBy: [{ field: intent.countAlias, direction: "desc" }],
    limit: 8
  });

  const table = runQuery(catalog, rows, {
    datasetId: intent.datasetId,
    filters: [dateFilter],
    groupBy: [intent.categoryField, intent.geographyField],
    metrics: [{ type: "count", alias: intent.countAlias }],
    orderBy: [{ field: intent.countAlias, direction: "desc" }],
    limit: 20
  });

  const results = [total.result, byCategory.result, byZip.result, table.result];
  const audits = [total.audit, byCategory.audit, byZip.audit, table.audit];
  const source = createCombinedSource(dataset, results, prompt);
  const totalCount = total.result.rows.reduce((sum, row) => sum + numeric(row, intent.countAlias), 0);

  const canvas = validateCanvasDocument({
    id: `canvas_${intent.datasetId}`,
    title: intent.title,
    description: "Generated from a validated CanvasDocument returned by the local MVP API.",
    createdAt: "2026-05-09T00:00:00.000Z",
    updatedAt: "2026-05-09T00:00:00.000Z",
    sources: [source],
    queries: audits.map((audit) => ({
      queryId: audit.queryId,
      datasetId: audit.datasetId,
      label: audit.fieldsUsed.join(", ")
    })),
    blocks: [
      {
        id: "summary",
        type: "SummaryBlock",
        props: {
          heading: intent.summaryHeading,
          text: `This dashboard summarizes ${totalCount.toLocaleString("en-US")} local sample records from ${dataset.title}. ${intent.caveatLead}`,
          bullets: [
            "Dataset, fields, filters, and row limits were validated before querying.",
            "Visuals are rendered through the allowlisted React block registry.",
            "Source and method details are required and remain visible."
          ]
        }
      },
      {
        id: "metric-total",
        type: "MetricBlock",
        props: {
          label: intent.metricLabel,
          value: totalCount.toLocaleString("en-US"),
          helperText: "Count from bounded sample query",
          tone: "neutral"
        }
      },
      {
        id: "metric-top",
        type: "MetricBlock",
        props: {
          label: intent.topLabel,
          value: topValue(byCategory.result, intent.categoryField, intent.countAlias),
          helperText: "Highest count in sample aggregate",
          tone: "good"
        }
      },
      {
        id: "trend",
        type: "ChartBlock",
        props: {
          title: "Monthly trend",
          subtitle: "Grouped by month with bounded count metric",
          chartType: "line",
          xField: "month",
          yField: intent.countAlias,
          data: chartRows(total.result, "month", intent.countAlias)
        }
      },
      {
        id: "zip-geography",
        type: "MapBlock",
        props: {
          title: "ZIP-code geography placeholder",
          geographyField: intent.geographyField,
          metricField: intent.countAlias,
          data: chartRows(byZip.result, intent.geographyField, intent.countAlias),
          note: "This MVP uses a ZIP-level geography placeholder, not live map tiles."
        }
      },
      {
        id: "category-chart",
        type: "ChartBlock",
        props: {
          title: `Top ${dataset.topic}`,
          subtitle: `Grouped by ${intent.categoryField.replace(/_/g, " ")}`,
          chartType: "bar",
          xField: intent.categoryField,
          yField: intent.countAlias,
          data: chartRows(byCategory.result, intent.categoryField, intent.countAlias)
        }
      },
      {
        id: "detail-table",
        type: "TableBlock",
        props: {
          title: "Grouped detail table",
          caption: "Top grouped rows returned by the bounded query.",
          pageSize: 10,
          sortBy: intent.countAlias,
          columns: table.result.columns.map((column) => ({
            field: column.field,
            label: column.label
          })),
          rows: table.result.rows
        }
      },
      {
        id: "filters",
        type: "FilterBlock",
        props: {
          title: "Filter definitions",
          filters: [
            { field: dataset.city, label: "City", type: "select", options: [dataset.city] },
            { field: intent.dateField, label: "Date range", type: "dateRange" },
            {
              field: intent.categoryField,
              label: intent.categoryField.replace(/_/g, " "),
              type: "select",
              options: byCategory.result.rows.map((row) => stringify(row, intent.categoryField))
            },
            {
              field: intent.geographyField,
              label: "ZIP code",
              type: "select",
              options: byZip.result.rows.map((row) => stringify(row, intent.geographyField))
            }
          ]
        }
      },
      {
        id: "dataset-card",
        type: "DatasetCardBlock",
        props: {
          dataset
        }
      },
      {
        id: "source-method",
        type: "SourceMethodBlock",
        props: {
          attribution: source,
          methodology:
            "Generated through deterministic prompt matching, approved catalog lookup, BoundedQuerySpec validation, local sample query execution, and CanvasDocument validation. No arbitrary SQL, HTML, JavaScript, or external scripts are executed."
        }
      }
    ]
  });

  return { canvas, audits };
}

export function generateCanvasForPrompt(prompt: string): DashboardGeneration {
  const intent = detectIntent(prompt);

  if (!intent) {
    return {
      canvas: createDatasetSuggestionCanvas(prompt),
      audits: [],
      suggestedDatasets: getDatasetCatalog().filter((dataset) => dataset.fields.length > 0)
    };
  }

  return createDashboardForIntent(prompt, intent);
}

export function createDatasetSuggestionCanvas(prompt: string): CanvasDocument {
  const datasets = getDatasetCatalog().filter((dataset) => dataset.fields.length > 0);
  const dataset = datasets[0];
  const source: SourceAttribution = {
    datasetId: dataset.id,
    datasetTitle: dataset.title,
    sourceName: dataset.sourceName,
    sourceUrl: dataset.sourceUrl,
    accessedAt: "2026-05-09T00:00:00.000Z",
    fieldsUsed: [],
    filtersApplied: [],
    queryMethod: `No deterministic MVP prompt match for: "${prompt}"`,
    caveats: [
      "The MVP only generates dashboards for the Dallas 311 and Austin permits demo prompts."
    ],
    license: "Refer to source portal terms"
  };

  return validateCanvasDocument({
    id: "canvas_dataset_suggestions",
    title: "Choose an approved dataset",
    description: "The prompt did not match a supported MVP workflow.",
    createdAt: "2026-05-09T00:00:00.000Z",
    updatedAt: "2026-05-09T00:00:00.000Z",
    sources: [source],
    queries: [],
    blocks: [
      {
        id: "summary",
        type: "SummaryBlock",
        props: {
          heading: "Unsupported prompt for MVP",
          text: "Try the Dallas 311 or Austin building permit demo prompt. Unknown prompts return suggestions instead of hallucinated dashboards.",
          bullets: [
            "Show Dallas 311 service requests by category and ZIP code for 2024.",
            "Show Austin building permits by month and ZIP code."
          ]
        }
      },
      ...datasets.slice(0, 2).map((candidate) => ({
        id: `dataset-${candidate.id}`,
        type: "DatasetCardBlock" as const,
        props: { dataset: candidate }
      })),
      {
        id: "source-method",
        type: "SourceMethodBlock",
        props: {
          attribution: source,
          methodology:
            "The app declined to generate a dashboard because the prompt did not match an implemented deterministic workflow."
        }
      }
    ]
  });
}

export function validateGeneratedCanvas(input: unknown) {
  return safeValidateCanvasDocument(input);
}
