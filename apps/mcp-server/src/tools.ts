import { z } from "zod";
import {
  boundedQuerySpecSchema,
  catalogHealthReportSchema,
  createSourceAttribution,
  queryModeSchema,
  safeValidateCanvasDocument,
  validateCanvasDocument,
  UnsupportedDatasetError,
  type CanvasDocument,
  type DatasetMetadata,
  type QueryResult
} from "@texas-data-canvas/shared";
import { getAdapter, getCatalog } from "./data.js";

export const MCP_SERVER_VERSION = "0.6.0-hosted-beta";

export function getServerStatus() {
  const catalog = getCatalog();

  return {
    ok: true,
    name: "texas-public-data-mcp",
    version: MCP_SERVER_VERSION,
    datasetCount: catalog.length,
    liveEnabledDatasets: catalog.filter((dataset) => dataset.liveAvailable).map((dataset) => dataset.id),
    dataModeControls: ["auto", "live_if_available", "sample_only"],
    safetyModel: "BoundedQuerySpec plus approved catalog; no raw SQL, SoQL, HTML, JavaScript, or arbitrary components."
  };
}

export function validateCatalog() {
  const catalog = getCatalog();
  const issues = catalog.flatMap((dataset) => {
    const datasetIssues = [];
    if (dataset.liveAvailable && !dataset.fallbackSampleFile) {
      datasetIssues.push({
        path: [dataset.id, "fallbackSampleFile"],
        code: "missing_fallback",
        message: "Live-enabled datasets must keep fallback sample files."
      });
    }
    if (dataset.liveAvailable && (!dataset.externalDatasetId || !dataset.apiBaseUrl)) {
      datasetIssues.push({
        path: [dataset.id, "adapter"],
        code: "missing_live_adapter_metadata",
        message: "Live-enabled datasets require externalDatasetId and apiBaseUrl."
      });
    }
    return datasetIssues;
  });

  return {
    health: catalogHealthReportSchema.parse({
      status: issues.length === 0 ? "ok" : "degraded",
      checkedAt: new Date().toISOString(),
      datasetCount: catalog.length,
      liveEnabledDatasets: catalog.filter((dataset) => dataset.liveAvailable).map((dataset) => dataset.id),
      sampleFallbacks: catalog
        .filter((dataset) => dataset.fallbackSampleFile)
        .map((dataset) => ({
          datasetId: dataset.id,
          file: dataset.fallbackSampleFile!,
          available: true
        })),
      issues
    })
  };
}

export function listLiveSources() {
  return {
    liveSources: getCatalog()
      .filter((dataset) => dataset.liveAvailable)
      .map((dataset) => ({
        datasetId: dataset.id,
        title: dataset.title,
        adapter: dataset.adapter,
        externalDatasetId: dataset.externalDatasetId,
        apiBaseUrl: dataset.apiBaseUrl,
        fallbackSampleFile: dataset.fallbackSampleFile,
        liveFieldMap: dataset.liveFieldMap,
        liveVerification: dataset.liveVerification,
        caveats: dataset.caveats
      }))
  };
}

export function listSupportedSources() {
  const sources = new Map<string, { id: string; name: string; url: string; adapter: string }>();

  for (const dataset of getCatalog()) {
    sources.set(dataset.sourceName, {
      id: dataset.sourceName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
      name: dataset.sourceName,
      url: dataset.sourceUrl,
      adapter: dataset.dataAccess
    });
  }

  return { sources: [...sources.values()] };
}

export function searchDatasets(input: unknown) {
  const args = z
    .object({
      query: z.string().default(""),
      city: z.string().optional(),
      topic: z.string().optional(),
      limit: z.number().int().positive().max(25).default(10)
    })
    .parse(input);
  const normalized = `${args.query} ${args.city ?? ""} ${args.topic ?? ""}`.toLowerCase();

  const datasets = getCatalog()
    .map((dataset) => {
      const haystack = `${dataset.title} ${dataset.city} ${dataset.topic} ${dataset.description}`.toLowerCase();
      const confidence = normalized
        .split(/\s+/)
        .filter(Boolean)
        .reduce((score, term) => score + (haystack.includes(term) ? 0.15 : 0), 0.25);

      return {
        datasetId: dataset.id,
        title: dataset.title,
        sourceName: dataset.sourceName,
        city: dataset.city,
        topic: dataset.topic,
        confidence: Math.min(confidence, 0.95),
        recommendedUse: dataset.recommendedVisuals
      };
    })
    .filter((dataset) => dataset.confidence > 0.25)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, args.limit);

  return { datasets };
}

export function getDatasetMetadata(input: unknown) {
  const { datasetId } = z.object({ datasetId: z.string() }).parse(input);
  const dataset = findDataset(datasetId);

  return {
    ...dataset,
    dateFields: dataset.fields.filter((field) => field.type === "date").map((field) => field.name),
    geoFields: dataset.fields.filter((field) => field.name.includes("zip") || field.type === "geography").map((field) => field.name)
  };
}

export async function queryDataset(input: unknown) {
  const spec = boundedQuerySpecSchema.parse(input);
  return (await getAdapter().queryDataset(spec)).result;
}

export async function getSampleRows(input: unknown) {
  const { datasetId, limit } = z
    .object({ datasetId: z.string(), limit: z.number().int().positive().max(25).default(10) })
    .parse(input);

  return {
    datasetId,
    rows: await getAdapter().getSampleRows(datasetId, limit)
  };
}

export function summarizeQueryResult(input: unknown) {
  const result = z.custom<QueryResult>((value) => Boolean(value && typeof value === "object")).parse(input);

  return {
    summary: `${result.source.datasetTitle} returned ${result.rows.length} bounded rows for ${result.resultType}. ${result.caveats.join(" ")}`,
    caveats: result.caveats
  };
}

export function recommendVisualization(input: unknown) {
  const result = z.custom<QueryResult>((value) => Boolean(value && typeof value === "object")).parse(input);
  const fields = result.columns.map((column) => column.field);
  const blocks = ["SummaryBlock", "MetricBlock", "TableBlock", "SourceMethodBlock"];

  if (fields.some((field) => field.includes("month") || field.includes("date"))) {
    blocks.splice(2, 0, "ChartBlock");
  }

  if (fields.some((field) => field.includes("zip"))) {
    blocks.splice(2, 0, "MapBlock");
  }

  return {
    datasetId: result.datasetId,
    resultType: result.resultType,
    recommendedBlocks: [...new Set(blocks)],
    rationale: "Recommendation based on date, geography, grouped rows, and required attribution."
  };
}

export async function generateCanvasSpec(input: unknown) {
  const { datasetId, mode } = z.object({
    datasetId: z.string(),
    mode: queryModeSchema.default("auto")
  }).parse(input);
  const dataset = findDataset(datasetId);
  const dateField = dataset.fields.find((field) => field.type === "date")?.name ?? "month";
  const categoryField = dataset.fields.find((field) => field.name.includes("category") || field.name.includes("type"))?.name ?? "status";
  const countAlias = datasetId.includes("permit") ? "permit_count" : "request_count";
  const execution = await getAdapter().queryDataset({
    datasetId,
    mode,
    filters: [{ field: dateField, operator: "between", value: ["2024-01-01", "2024-12-31"] }],
    groupBy: [categoryField],
    metrics: [{ type: "count", alias: countAlias }],
    orderBy: [{ field: countAlias, direction: "desc" }],
    limit: 10
  });
  const source = execution.result.source;
  const generatedAt = new Date().toISOString();

  return {
    canvas: validateCanvasDocument({
      schemaVersion: "1.0",
      id: `canvas_${datasetId}`,
      title: `${dataset.title} Dashboard`,
      createdAt: generatedAt,
      updatedAt: generatedAt,
      sources: [source],
      queries: [{ queryId: execution.result.queryId, datasetId, label: `${dataset.title} aggregate` }],
      blocks: [
        {
          id: "summary",
          type: "SummaryBlock",
          props: {
            heading: dataset.title,
            text: `Generated safe aggregate view for ${dataset.title}.`,
            bullets: dataset.caveats
          }
        },
        {
          id: "table",
          type: "TableBlock",
          props: {
            title: "Aggregate rows",
            columns: execution.result.columns.map((column) => ({ field: column.field, label: column.label })),
            rows: execution.result.rows
          }
        },
        {
          id: "source-method",
          type: "SourceMethodBlock",
          props: {
            attribution: source,
            methodology: "Generated by MCP tool from approved catalog, bounded query, and allowlisted blocks."
          }
        }
      ]
    })
  };
}

export function validateCanvasSpec(input: unknown) {
  return safeValidateCanvasDocument(input);
}

export function getSourceAttribution(input: unknown) {
  const spec = boundedQuerySpecSchema.parse(input);
  return createSourceAttribution(findDataset(spec.datasetId), spec, new Date().toISOString());
}

export async function auditQuery(input: unknown) {
  const spec = boundedQuerySpecSchema.parse(input);
  return (await getAdapter().queryDataset(spec)).audit;
}

export function generateMiroExportSpec(input: unknown) {
  const { canvas, template } = z
    .object({
      canvas: z.custom<CanvasDocument>((value) => Boolean(value && typeof value === "object")),
      template: z.enum(["briefing_board", "slide_deck", "community_workshop"]).default("briefing_board")
    })
    .parse(input);
  const validCanvas = validateCanvasDocument(canvas);

  return {
    schemaVersion: "1.0",
    title: `${validCanvas.title} ${template.replace(/_/g, " ")}`,
    template,
    sourceMethodFrameRequired: true,
    frames: [
      { title: validCanvas.title, items: [{ type: "text", content: validCanvas.description ?? validCanvas.title }] },
      {
        title: "Source & Method",
        items: [{ type: "source_method", content: JSON.stringify(validCanvas.sources) }]
      }
    ]
  };
}

function findDataset(datasetId: string): DatasetMetadata {
  const dataset = getCatalog().find((candidate) => candidate.id === datasetId);

  if (!dataset) {
    throw new UnsupportedDatasetError(`Dataset is not approved: ${datasetId}`);
  }

  return dataset;
}
