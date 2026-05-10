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
  datasetId: "dallas_311_requests" | "austin_building_permits" | "houston_transportation_incidents";
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

type QueryExecution = Awaited<ReturnType<DatasetAdapter["queryDataset"]>>;
type DashboardQueryRunner = (adapter: DatasetAdapter, spec: BoundedQuerySpec) => Promise<QueryExecution>;
type DashboardGenerationOptions = {
  queryRunner?: DashboardQueryRunner;
};
type DashboardQuerySlot = "monthly" | "category" | "zip" | "status" | "table";

const supportedPromptSuggestions = [
  "Show Dallas 311 service requests by category and ZIP code for 2024.",
  "Show Austin building permits by month and ZIP code for 2024.",
  "Show Houston transportation incidents by ZIP and incident type for 2024."
];

const supportedSuggestionDatasetIds = [
  "dallas_311_requests",
  "austin_building_permits",
  "houston_transportation_incidents"
];

function supportedSuggestionDatasets(catalog: DatasetMetadata[]) {
  return supportedSuggestionDatasetIds
    .map((datasetId) => catalog.find((dataset) => dataset.id === datasetId))
    .filter((dataset): dataset is DatasetMetadata => Boolean(dataset));
}

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
  },
  {
    datasetId: "houston_transportation_incidents",
    title: "Houston Transportation Incidents Explorer",
    summaryHeading: "Houston transportation incidents by type and ZIP",
    metricLabel: "Sample incidents",
    countAlias: "incident_count",
    dateField: "reported_date",
    geographyField: "zip_code",
    categoryField: "incident_type",
    statusField: "status",
    topLabel: "Top incident type",
    caveatLead: "Houston transportation pilot data is sample-first and excludes precise locations."
  }
];

const datasetFilterAllowlists: Record<DemoIntent["datasetId"], string[]> = {
  dallas_311_requests: ["city", "__groupBy", "created_date", "category", "status", "zip_code"],
  austin_building_permits: ["city", "__groupBy", "issued_date", "permit_type", "status", "zip_code"],
  houston_transportation_incidents: ["city", "__groupBy", "reported_date", "incident_type", "status", "zip_code"]
};

function detectIntent(prompt: string): DemoIntent | null {
  const normalized = prompt.toLowerCase();
  const dallasTopicTerms = [
    "311",
    "service request",
    "service requests",
    "city request",
    "city requests",
    "complaint",
    "complaints",
    "case",
    "cases"
  ];
  const austinTopicTerms = [
    "permit",
    "permits",
    "building activity",
    "construction permit",
    "construction permits",
    "issued permit",
    "issued permits"
  ];
  const houstonTopicTerms = [
    "transportation",
    "transportation incident",
    "transportation incidents",
    "traffic",
    "traffic incident",
    "traffic incidents",
    "road hazard",
    "road hazards",
    "lane closure",
    "lane closures",
    "road project",
    "road projects",
    "crash",
    "crashes",
    "incident",
    "incidents"
  ];

  if (normalized.includes("austin") && austinTopicTerms.some((term) => normalized.includes(term))) {
    return demoIntents[1];
  }
  if (normalized.includes("dallas") && dallasTopicTerms.some((term) => normalized.includes(term))) {
    return demoIntents[0];
  }
  if (normalized.includes("houston") && houstonTopicTerms.some((term) => normalized.includes(term))) {
    return demoIntents[2];
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
  const allowedKeys = new Set(datasetFilterAllowlists[intent.datasetId]);
  for (const [field, value] of Object.entries(filterValues)) {
    if (value && !allowedKeys.has(field)) {
      throw new Error(`Filter field "${field}" is not approved for ${intent.datasetId}.`);
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

function querySlotLabel(slot: DashboardQuerySlot) {
  return slot === "zip" ? "ZIP" : slot;
}

function queryFailureMessage(slot: DashboardQuerySlot, error: unknown) {
  const detail = error instanceof Error ? error.message : "Unknown query failure.";
  return `${querySlotLabel(slot)} query failed: ${detail}`;
}

function failedQueryExecution({
  dataset,
  spec,
  slot,
  error,
  accessedAt
}: {
  dataset: DatasetMetadata;
  spec: BoundedQuerySpec;
  slot: DashboardQuerySlot;
  error: unknown;
  accessedAt: string;
}): QueryExecution {
  const caveat = queryFailureMessage(slot, error);
  const fieldsUsed = [...spec.groupBy, ...spec.metrics.map((metric) => metric.alias)];
  const columns = [
    ...spec.groupBy.map((field) => ({
      field,
      label: field.replace(/_/g, " "),
      type: "string" as const
    })),
    ...spec.metrics.map((metric) => ({
      field: metric.alias,
      label: metric.alias.replace(/_/g, " "),
      type: "number" as const
    }))
  ];

  return {
    result: {
      queryId: `failed_${slot}_${dataset.id}`,
      datasetId: dataset.id,
      resultType: "aggregate",
      dataMode: "fallback",
      rows: [],
      columns,
      source: {
        datasetId: dataset.id,
        datasetTitle: dataset.title,
        sourceName: dataset.sourceName,
        sourceUrl: dataset.sourceUrl,
        accessedAt,
        fieldsUsed,
        filtersApplied: spec.filters.map((filter) => filter.field),
        queryMethod: `Bounded ${querySlotLabel(slot)} aggregate failed; dashboard rendered remaining validated blocks.`,
        dataMode: "fallback",
        caveats: [caveat],
        license: "Refer to source portal terms"
      },
      caveats: [caveat]
    },
    audit: {
      auditId: `audit_failed_${slot}_${dataset.id}`,
      queryId: `failed_${slot}_${dataset.id}`,
      datasetId: dataset.id,
      fieldsUsed,
      filtersApplied: spec.filters.map((filter) => filter.field),
      rowLimit: spec.limit ?? 1,
      aggregation: true,
      dataMode: "fallback",
      executedAt: accessedAt,
      safetyDecisions: [
        "Dashboard preserved remaining validated blocks after a bounded aggregate query failure.",
        caveat
      ]
    }
  };
}

async function createDashboardForIntent({
  prompt,
  intent,
  filterValues = {},
  dataModePreference = "auto",
  options = {}
}: {
  prompt: string;
  intent: DemoIntent;
  filterValues?: DashboardFilterValues;
  dataModePreference?: DataModePreference;
  options?: DashboardGenerationOptions;
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

  const queryRunner = options.queryRunner ?? runQuery;
  const generatedAt = new Date().toISOString();
  const queryEntries: Array<{ slot: DashboardQuerySlot; spec: BoundedQuerySpec }> = [
    { slot: "monthly", spec: monthlySpec },
    { slot: "category", spec: categorySpec },
    { slot: "zip", spec: zipSpec },
    { slot: "status", spec: statusSpec },
    { slot: "table", spec: tableSpec }
  ];
  const settledQueries = await Promise.allSettled(queryEntries.map((entry) => queryRunner(adapter, entry.spec)));
  const queryFailures: string[] = [];
  const [monthly, byCategory, byZip, byStatus, table] = settledQueries.map((settled, index) => {
    const entry = queryEntries[index];
    if (settled.status === "fulfilled") {
      return settled.value;
    }
    const failure = queryFailureMessage(entry.slot, settled.reason);
    queryFailures.push(failure);
    return failedQueryExecution({
      dataset,
      spec: entry.spec,
      slot: entry.slot,
      error: settled.reason,
      accessedAt: generatedAt
    });
  }) as [QueryExecution, QueryExecution, QueryExecution, QueryExecution, QueryExecution];

  const results = [monthly.result, byCategory.result, byZip.result, byStatus.result, table.result];
  const actualDataMode: DataMode = queryFailures.length > 0 || results.some((result) => result.dataMode === "fallback") || mode.dataMode === "fallback"
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
        mode.reason ?? (queryFailures.join(" ") || "Dashboard used approved sample fallback for at least one requested live view.")
      ]
    }))
    : rawAudits;
  const modeCaveat = [
    ...(mode.reason ? [`${mode.reason} Approved sample fallback is used for this dashboard.`] : []),
    ...queryFailures
  ];
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
            intent.datasetId === "houston_transportation_incidents"
              ? "Houston remains sample-first until Houston TranStar live feed access and aggregate-safe mappings are verified."
              : dataModeText
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
          note: intent.datasetId === "houston_transportation_incidents"
            ? "ZIP-level coordinates are approximate centroids for aggregate context. Precise incident locations are excluded from this sample-first pilot."
            : "ZIP-level coordinates are approximate centroids for aggregate context. Sample mode may not represent full live public records."
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
          caption: intent.datasetId === "houston_transportation_incidents"
            ? "Top aggregate-safe sample rows returned by the bounded query; precise locations are excluded."
            : "Top grouped rows returned by the bounded query.",
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
      ...(intent.datasetId === "houston_transportation_incidents"
        ? [
          {
            id: "status-chart",
            type: "ChartBlock" as const,
            props: {
              title: "Status breakdown",
              subtitle: "Grouped by incident status from aggregate-safe sample rows",
              chartType: "bar" as const,
              xField: intent.statusField,
              yField: intent.countAlias,
              data: chartRows(byStatus.result, intent.statusField, intent.countAlias)
            }
          }
        ]
        : [
          {
            id: "dataset-card",
            type: "DatasetCardBlock" as const,
            props: { dataset }
          }
        ]),
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
    fallbackReason: [mode.reason, ...queryFailures].filter(Boolean).join(" ") || undefined
  };
}

export async function generateCanvasForPrompt(
  prompt: string,
  filterValues: DashboardFilterValues = {},
  dataModePreference: DataModePreference = "auto",
  options: DashboardGenerationOptions = {}
): Promise<DashboardGeneration> {
  const promptIntent = parsePromptIntent({ prompt, catalog: getDatasetCatalog() });
  const catalog = getDatasetCatalog();
  const suggestedDatasets = supportedSuggestionDatasets(catalog);
  if (promptIntent.safetyWarnings.length > 0 || promptIntent.rejectedFields.length > 0) {
    return {
      canvas: createDatasetSuggestionCanvas(prompt),
      audits: [],
      intent: promptIntent,
      requestedDataMode: dataModePreference,
      suggestedDatasets
    };
  }

  const intent = detectIntent(prompt);

  if (!intent) {
    return {
      canvas: createDatasetSuggestionCanvas(prompt),
      audits: [],
      intent: promptIntent,
      requestedDataMode: dataModePreference,
      suggestedDatasets
    };
  }

  return createDashboardForIntent({ prompt, intent, filterValues, dataModePreference, options });
}

export function createDatasetSuggestionCanvas(prompt: string, catalog: DatasetMetadata[] = getDatasetCatalog()): CanvasDocument {
  const datasets = supportedSuggestionDatasets(catalog);
  const dataset = datasets[0];
  const sourceNames = datasets.map((candidate) => candidate.sourceName);
  const approvedSourceText = sourceNames.length === 0
    ? "No approved suggestion datasets are available from the current catalog."
    : sourceNames.length === 3
      ? `${sourceNames[0]}, ${sourceNames[1]}, and ${sourceNames[2]}`
      : sourceNames.join(", ");
  const generatedAt = new Date().toISOString();
  const source: SourceAttribution = {
    datasetId: dataset?.id ?? "catalog_suggestions",
    datasetTitle: dataset?.title ?? "Approved dataset suggestions",
    sourceName: dataset?.sourceName ?? "CivicCanvas approved catalog",
    sourceUrl: dataset?.sourceUrl ?? "https://texas-data-canvas.local/catalog",
    accessedAt: generatedAt,
    fieldsUsed: [],
    filtersApplied: [],
    queryMethod: `No supported rule-based prompt match for: "${prompt}"`,
    dataMode: "sample",
    caveats: [
      "The current parser only generates dashboards for approved Dallas 311, Austin permits, and Houston transportation workflows.",
      ...(datasets.length === 0 ? ["No approved suggestion datasets are available from the current catalog."] : [])
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
          text: datasets.length === 0
            ? `${approvedSourceText} Unknown or sensitive prompts return governed guidance instead of hallucinated dashboards.`
            : `Try one of the exact supported prompts below. Approved sources include ${approvedSourceText}. Unknown or sensitive prompts return suggestions instead of hallucinated dashboards.`,
          bullets: supportedPromptSuggestions
        }
      },
      ...datasets.slice(0, 3).map((candidate) => ({
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
