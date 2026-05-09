import {
  parsePromptIntent,
  safeValidateCanvasDocument,
  validateCanvasDocument,
  type BoundedQuerySpec,
  type CanvasDocument,
  type DataMode,
  type DataModePreference,
  type DatasetAdapter,
  type DatasetMetadata,
  type PromptIntent,
  type QueryAudit,
  type QueryResult,
  type SampleRow,
  type SourceAttribution
} from "@texas-data-canvas/shared";
import { findDataset, getDatasetAdapter, getDatasetCatalog } from "./data";
import { zipFeaturesForRows } from "./geography";

export type DashboardFilterValues = Record<string, string>;

export type DashboardGeneration = {
  canvas: CanvasDocument;
  audits: QueryAudit[];
  intent?: PromptIntent;
  querySpec?: BoundedQuerySpec;
  dataMode?: DataMode;
  requestedDataMode?: DataModePreference;
  fallbackReason?: string;
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
  statusField: string;
  topLabel: string;
  caveatLead: string;
};

const demoIntents: DemoIntent[] = [
  {
    datasetId: "dallas_311_requests",
    title: "Dallas 311 Service Requests Explorer",
    summaryHeading: "Dallas 311 requests by category and ZIP",
    metricLabel: "Sample requests",
    countAlias: "request_count",
    dateField: "created_date",
    geographyField: "zip_code",
    categoryField: "category",
    statusField: "status",
    topLabel: "Top request category",
    caveatLead: "311 records reflect reported service requests, not every neighborhood condition."
  },
  {
    datasetId: "austin_building_permits",
    title: "Austin Building Permits Explorer",
    summaryHeading: "Austin permits by month and ZIP",
    metricLabel: "Sample permits",
    countAlias: "permit_count",
    dateField: "issued_date",
    geographyField: "zip_code",
    categoryField: "permit_type",
    statusField: "status",
    topLabel: "Top permit type",
    caveatLead: "Permit records are administrative data and may not represent construction starts."
  }
];

function detectIntent(prompt: string): DemoIntent | null {
  const normalized = prompt.toLowerCase();
  if (normalized.includes("austin") && normalized.includes("permit")) {
    return demoIntents[1];
  }
  if (normalized.includes("dallas") && (normalized.includes("311") || normalized.includes("service"))) {
    return demoIntents[0];
  }
  return null;
}

function numeric(row: Record<string, unknown>, field: string) {
  const value = row[field];
  return typeof value === "number" ? value : 0;
}

function stringify(row: Record<string, unknown>, field: string) {
  return String(row[field] ?? "Unknown");
}

function chartRows(result: QueryResult, xField: string, yField: string): SampleRow[] {
  return result.rows.map((row) => ({
    [xField]: stringify(row, xField),
    [yField]: numeric(row, yField)
  }));
}

function topValue(result: QueryResult, labelField: string, valueField: string) {
  const top = result.rows[0];
  return top ? `${stringify(top, labelField)} (${numeric(top, valueField)})` : "No records";
}

function defaultDateRange(prompt: string, promptIntent?: PromptIntent) {
  if (promptIntent?.dateRange) {
    return promptIntent.dateRange;
  }
  const year = prompt.match(/\b(20\d{2})\b/)?.[1] ?? "2024";
  return [`${year}-01-01`, `${year}-12-31`];
}

function parseDateRange(value: string | undefined, prompt: string, promptIntent?: PromptIntent) {
  if (!value || value === "All") {
    return defaultDateRange(prompt, promptIntent);
  }
  const parts = value.split(/\s+to\s+|,/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length === 2) {
    return [parts[0], parts[1]];
  }
  return defaultDateRange(prompt, promptIntent);
}

function buildFilters(prompt: string, intent: DemoIntent, filterValues: DashboardFilterValues = {}, promptIntent?: PromptIntent) {
  const allowedKeys = new Set(["city", "__groupBy", intent.dateField, intent.categoryField, intent.statusField, intent.geographyField]);
  for (const [field, value] of Object.entries(filterValues)) {
    if (value && !allowedKeys.has(field)) {
      throw new Error(`Filter field "${field}" is not allowlisted for this dashboard.`);
    }
  }

  const filters: BoundedQuerySpec["filters"] = [
    {
      field: intent.dateField,
      operator: "between",
      value: parseDateRange(filterValues[intent.dateField], prompt, promptIntent)
    }
  ];

  for (const field of [intent.categoryField, intent.statusField, intent.geographyField]) {
    const value = filterValues[field];
    if (value && value !== "All") {
      filters.push({ field, operator: "eq", value });
    }
  }

  return filters;
}

function groupByMode(intent: DemoIntent, filterValues: DashboardFilterValues) {
  const requested = filterValues.__groupBy;
  if (requested === "month") {
    return ["month"];
  }
  if (requested === "status") {
    return [intent.statusField];
  }
  if (requested === "zip_code") {
    return [intent.geographyField];
  }
  if (requested === "category") {
    return [intent.categoryField];
  }
  return [intent.categoryField, intent.geographyField];
}

function dashboardMode(
  dataset: DatasetMetadata,
  requiredFields: string[],
  promptIntent: PromptIntent,
  dataModePreference: DataModePreference
): { queryMode: BoundedQuerySpec["mode"]; dataMode: DataMode; reason?: string } {
  if (dataModePreference === "sample" || promptIntent.reasonCodes.includes("mode_sample_requested")) {
    return {
      queryMode: "sample_only",
      dataMode: "sample",
      reason: dataModePreference === "sample" ? "Data mode control requested sample fallback." : "Prompt requested sample mode."
    };
  }

  if (!dataset.liveAvailable) {
    return dataModePreference === "live" || promptIntent.reasonCodes.includes("mode_live_requested")
      ? { queryMode: "sample_only", dataMode: "fallback", reason: "Live public API requested, but this dataset is not live-enabled." }
      : { queryMode: "auto", dataMode: "sample" };
  }

  const missing = [...new Set(requiredFields.filter((field) => !dataset.liveFieldMap[field]))];
  if (missing.length > 0) {
    return {
      queryMode: "sample_only",
      dataMode: "fallback",
      reason: `Verified live source lacks required dashboard field(s): ${missing.join(", ")}.`
    };
  }

  return { queryMode: "live_if_available", dataMode: "live" };
}

function topLimit(promptIntent: PromptIntent, fallback: number) {
  const parsed = Number(promptIntent.reasonCodes.find((code) => code.startsWith("top_n:"))?.split(":")[1] ?? fallback);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), fallback) : fallback;
}

function safeIdPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function generatedCanvasId(datasetId: string, createdAt: string) {
  const timestamp = createdAt.replace(/\D/g, "").slice(0, 14);
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);

  return `canvas_${safeIdPart(datasetId)}_${timestamp}_${randomPart}`;
}

function createCombinedSource(
  dataset: DatasetMetadata,
  results: QueryResult[],
  prompt: string,
  dataMode: DataMode,
  extraCaveats: string[] = [],
  accessedAt = new Date().toISOString()
): SourceAttribution {
  const fieldsUsed = [...new Set(results.flatMap((result) => result.source.fieldsUsed))];
  const filtersApplied = [...new Set(results.flatMap((result) => result.source.filtersApplied))];

  return {
    datasetId: dataset.id,
    datasetTitle: dataset.title,
    sourceName: dataset.sourceName,
    sourceUrl: dataset.sourceUrl,
    accessedAt,
    fieldsUsed,
    filtersApplied,
    queryMethod: `Rule-based prompt intent for: "${prompt}"`,
    dataMode,
    caveats: [...new Set([...dataset.caveats, ...extraCaveats, ...results.flatMap((result) => result.caveats)])],
    license: "Refer to source portal terms"
  };
}

async function runQuery(adapter: DatasetAdapter, spec: BoundedQuerySpec) {
  return adapter.queryDataset(spec);
}

async function createDashboardForIntent({
  prompt,
  intent,
  filterValues = {},
  dataModePreference = "auto"
}: {
  prompt: string;
  intent: DemoIntent;
  filterValues?: DashboardFilterValues;
  dataModePreference?: DataModePreference;
}): Promise<DashboardGeneration> {
  const catalog = getDatasetCatalog();
  const adapter = getDatasetAdapter();
  const dataset = findDataset(catalog, intent.datasetId);
  const promptIntent = parsePromptIntent({ prompt, catalog });
  const filters = buildFilters(prompt, intent, filterValues, promptIntent);
  const tableGroupBy = groupByMode(intent, filterValues);
  const primaryGroupField = intent.categoryField;
  const categoryLimit = topLimit(promptIntent, 8);
  const tableLimit = topLimit(promptIntent, 20);
  const mode = dashboardMode(dataset, [
    intent.dateField,
    "month",
    intent.categoryField,
    intent.statusField,
    intent.geographyField,
    ...tableGroupBy
  ], promptIntent, dataModePreference);

  const monthlySpec: BoundedQuerySpec = {
    schemaVersion: "1.0",
    datasetId: intent.datasetId,
    mode: mode.queryMode,
    filters,
    groupBy: ["month"],
    metrics: [{ type: "count", alias: intent.countAlias }],
    orderBy: [{ field: "month", direction: "asc" }],
    limit: 12
  };
  const categorySpec: BoundedQuerySpec = {
    schemaVersion: "1.0",
    datasetId: intent.datasetId,
    mode: mode.queryMode,
    filters,
    groupBy: [primaryGroupField],
    metrics: [{ type: "count", alias: intent.countAlias }],
    orderBy: [{ field: intent.countAlias, direction: "desc" }],
    limit: categoryLimit
  };
  const zipSpec: BoundedQuerySpec = {
    schemaVersion: "1.0",
    datasetId: intent.datasetId,
    mode: mode.queryMode,
    filters,
    groupBy: [intent.geographyField],
    metrics: [{ type: "count", alias: intent.countAlias }],
    orderBy: [{ field: intent.countAlias, direction: "desc" }],
    limit: 8
  };
  const statusSpec: BoundedQuerySpec = {
    schemaVersion: "1.0",
    datasetId: intent.datasetId,
    mode: mode.queryMode,
    filters,
    groupBy: [intent.statusField],
    metrics: [{ type: "count", alias: intent.countAlias }],
    orderBy: [{ field: intent.countAlias, direction: "desc" }],
    limit: 8
  };
  const tableSpec: BoundedQuerySpec = {
    schemaVersion: "1.0",
    datasetId: intent.datasetId,
    mode: mode.queryMode,
    filters,
    groupBy: tableGroupBy,
    metrics: [{ type: "count", alias: intent.countAlias }],
    orderBy: [{ field: intent.countAlias, direction: "desc" }],
    limit: tableLimit
  };

  const [monthly, byCategory, byZip, byStatus, table] = await Promise.all([
    runQuery(adapter, monthlySpec),
    runQuery(adapter, categorySpec),
    runQuery(adapter, zipSpec),
    runQuery(adapter, statusSpec),
    runQuery(adapter, tableSpec)
  ]);

  const results = [monthly.result, byCategory.result, byZip.result, byStatus.result, table.result];
  const actualDataMode: DataMode = results.some((result) => result.dataMode === "fallback") || mode.dataMode === "fallback"
    ? "fallback"
    : results.every((result) => result.dataMode === "live")
      ? "live"
      : "sample";
  const rawAudits = [monthly.audit, byCategory.audit, byZip.audit, byStatus.audit, table.audit];
  const audits = actualDataMode === "fallback"
    ? rawAudits.map((audit) => ({
      ...audit,
      dataMode: "fallback" as const,
      safetyDecisions: [
        ...audit.safetyDecisions,
        mode.reason ?? "Dashboard used approved sample fallback for at least one requested live view."
      ]
    }))
    : rawAudits;
  const modeCaveat = mode.reason ? [`${mode.reason} Approved sample fallback is used for this dashboard.`] : [];
  const generatedAt = new Date().toISOString();
  const source = createCombinedSource(dataset, results, prompt, actualDataMode, modeCaveat, generatedAt);
  const totalCount = monthly.result.rows.reduce((sum, row) => sum + numeric(row, intent.countAlias), 0);
  const zipRows = chartRows(byZip.result, intent.geographyField, intent.countAlias);
  const dataModeText = actualDataMode === "live"
    ? "Live public API"
    : actualDataMode === "fallback"
      ? "Live unavailable, sample fallback used"
      : "Sample fallback";

  const canvas = validateCanvasDocument({
    schemaVersion: "1.0",
    id: generatedCanvasId(intent.datasetId, generatedAt),
    title: intent.title,
    prompt,
    description: "Generated from validated CanvasDocument JSON returned by the governed local API.",
    createdAt: generatedAt,
    updatedAt: generatedAt,
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
          text: `This dashboard summarizes ${totalCount.toLocaleString("en-US")} records from ${dataset.title}. ${intent.caveatLead}`,
          bullets: [
            "Dataset, fields, filters, and row limits were validated before querying.",
            "Visuals are rendered through the allowlisted React block registry.",
            dataModeText
          ]
        }
      },
      {
        id: "metric-total",
        type: "MetricBlock",
        props: {
          label: intent.metricLabel,
          value: totalCount.toLocaleString("en-US"),
          helperText: "Count from bounded query",
          tone: "neutral"
        }
      },
      {
        id: "metric-top",
        type: "MetricBlock",
        props: {
          label: intent.topLabel,
          value: topValue(byCategory.result, intent.categoryField, intent.countAlias),
          helperText: "Highest count in aggregate",
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
          data: chartRows(monthly.result, "month", intent.countAlias)
        }
      },
      {
        id: "zip-geography",
        type: "MapBlock",
        props: {
          title: "ZIP-code aggregate geography",
          geographyMode: "zip_bubble",
          geographyField: intent.geographyField,
          metricField: intent.countAlias,
          data: zipRows,
          features: zipFeaturesForRows(zipRows, intent.geographyField),
          legend: `${intent.countAlias.replace(/_/g, " ")} by ZIP code`,
          note:
            "ZIP-level coordinates are approximate centroids for aggregate context. Sample mode may not represent full live public records."
        }
      },
      {
        id: "category-chart",
        type: "ChartBlock",
        props: {
          title: `Top ${dataset.topic}`,
          subtitle: `Grouped by ${primaryGroupField.replace(/_/g, " ")}`,
          chartType: "bar",
          xField: primaryGroupField,
          yField: intent.countAlias,
          data: chartRows(byCategory.result, primaryGroupField, intent.countAlias)
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
          title: "Dashboard filters",
          filters: [
            { field: "city", label: "City", type: "select", options: ["All", dataset.city] },
            { field: intent.dateField, label: "Date range", type: "dateRange" },
            {
              field: "__groupBy",
              label: "Group by",
              type: "select",
              options: ["category_zip", "category", "month", "status", "zip_code"]
            },
            {
              field: intent.categoryField,
              label: intent.categoryField.replace(/_/g, " "),
              type: "select",
              options: ["All", ...byCategory.result.rows.map((row) => stringify(row, intent.categoryField))]
            },
            {
              field: intent.statusField,
              label: "Status",
              type: "select",
              options: ["All", ...new Set(byStatus.result.rows.map((row) => stringify(row, intent.statusField)))]
            },
            {
              field: intent.geographyField,
              label: "ZIP code",
              type: "select",
              options: ["All", ...byZip.result.rows.map((row) => stringify(row, intent.geographyField))]
            }
          ]
        }
      },
      {
        id: "dataset-card",
        type: "DatasetCardBlock",
        props: { dataset }
      },
      {
        id: "source-method",
        type: "SourceMethodBlock",
        props: {
          attribution: source,
          methodology:
            "Generated through rule-based prompt intent, approved catalog lookup, adapter-routed BoundedQuerySpec execution, and CanvasDocument validation. No arbitrary SQL, HTML, JavaScript, or external scripts are executed."
        }
      }
    ]
  });

  return {
    canvas,
    audits,
    intent: promptIntent,
    querySpec: tableSpec,
    dataMode: actualDataMode,
    requestedDataMode: dataModePreference,
    fallbackReason: mode.reason
  };
}

export async function generateCanvasForPrompt(
  prompt: string,
  filterValues: DashboardFilterValues = {},
  dataModePreference: DataModePreference = "auto"
): Promise<DashboardGeneration> {
  const intent = detectIntent(prompt);

  if (!intent) {
    return {
      canvas: createDatasetSuggestionCanvas(prompt),
      audits: [],
      intent: parsePromptIntent({ prompt, catalog: getDatasetCatalog() }),
      requestedDataMode: dataModePreference,
      suggestedDatasets: getDatasetCatalog().filter((dataset) => dataset.fields.length > 0)
    };
  }

  return createDashboardForIntent({ prompt, intent, filterValues, dataModePreference });
}

export function createDatasetSuggestionCanvas(prompt: string): CanvasDocument {
  const datasets = getDatasetCatalog().filter((dataset) => dataset.fields.length > 0);
  const dataset = datasets[0];
  const generatedAt = new Date().toISOString();
  const source: SourceAttribution = {
    datasetId: dataset.id,
    datasetTitle: dataset.title,
    sourceName: dataset.sourceName,
    sourceUrl: dataset.sourceUrl,
    accessedAt: generatedAt,
    fieldsUsed: [],
    filtersApplied: [],
    queryMethod: `No supported rule-based prompt match for: "${prompt}"`,
    dataMode: "sample",
    caveats: [
      "The current parser only generates dashboards for approved Dallas 311 and Austin permits workflows."
    ],
    license: "Refer to source portal terms"
  };

  return validateCanvasDocument({
    schemaVersion: "1.0",
    id: generatedCanvasId("dataset_suggestions", generatedAt),
    title: "Choose an approved dataset",
    prompt,
    description: "The prompt did not match a supported workflow.",
    createdAt: generatedAt,
    updatedAt: generatedAt,
    sources: [source],
    queries: [],
    blocks: [
      {
        id: "summary",
        type: "SummaryBlock",
        props: {
          heading: "Unsupported prompt for governed generation",
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
            "The app declined to generate a dashboard because the prompt did not match an implemented governed workflow."
        }
      }
    ]
  });
}

export function validateGeneratedCanvas(input: unknown) {
  return safeValidateCanvasDocument(input);
}
