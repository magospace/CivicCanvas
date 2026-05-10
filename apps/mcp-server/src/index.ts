import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  boundedQueryFilterSchema,
  canvasDocumentSchema,
  catalogHealthReportSchema,
  isGovernedError,
  miroExportSpecSchema,
  queryAuditSchema,
  queryMetricSchema,
  queryResultSchema,
  releaseEvidenceSchema,
  sourceAttributionSchema,
  visualizationRecommendationSchema
} from "@texas-data-canvas/shared";
import {
  auditQuery,
  generateCanvasSpec,
  generateMiroExportSpec,
  getDatasetMetadata,
  getReleaseEvidence,
  getSampleRows,
  getServerStatus,
  getSourceAttribution,
  listLiveSources,
  listSupportedSources,
  MCP_SERVER_VERSION,
  queryDataset,
  recommendVisualization,
  searchDatasets,
  summarizeQueryResult,
  validateCatalog,
  validateCanvasSpec
} from "./tools.js";

function jsonContent(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

function validateOutput<T>(schema: z.ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : "Tool execution failed.";
  const category = isGovernedError(error) ? error.category : "validation_error";

  return { ok: false, error: { category, message } };
}

function handled<T>(callback: (args: T) => unknown | Promise<unknown>, outputSchema: z.ZodType = z.unknown()) {
  return async (args: T) => {
    try {
      return jsonContent(validateOutput(outputSchema, await callback(args)));
    } catch (error) {
      return jsonContent(toolError(error));
    }
  };
}

export const boundedQueryInput = {
  datasetId: z.string(),
  mode: z.enum(["auto", "sample_only", "live_if_available"]).default("auto"),
  filters: z.array(boundedQueryFilterSchema).default([]),
  groupBy: z.array(z.string()).default([]),
  metrics: z.array(queryMetricSchema),
  orderBy: z.array(z.object({
    field: z.string().min(1),
    direction: z.enum(["asc", "desc"]).default("desc")
  })).default([]),
  limit: z.number().int().positive().max(1000).default(500)
};

export const boundedQueryToolInputSchema = z.object(boundedQueryInput);

const sampleRowSchema = z.record(z.union([z.string(), z.number(), z.boolean(), z.null()]));
const serverStatusOutputSchema = z.object({
  ok: z.literal(true),
  name: z.string(),
  version: z.string(),
  releaseChannel: z.string(),
  packageVersion: z.string(),
  devFallbackVersion: z.string(),
  datasetCount: z.number().int().nonnegative(),
  liveEnabledDatasets: z.array(z.string()),
  dataModeControls: z.array(z.string()),
  safetyModel: z.string()
});
const releaseEvidenceOutputSchema = releaseEvidenceSchema.pick({
  releaseVersion: true,
  branch: true,
  commit: true,
  localVerifiedAt: true,
  hosted: true,
  localGates: true,
  governanceAudit: true,
  productionLocal: true
});
const datasetMetadataOutputSchema = z.object({
  dateFields: z.array(z.string()),
  geoFields: z.array(z.string())
}).passthrough();
const canvasValidationOutputSchema = z.union([
  z.object({ ok: z.literal(true), data: canvasDocumentSchema, errors: z.array(z.string()) }),
  z.object({ ok: z.literal(false), errors: z.array(z.string()) })
]);
const outputSchemas = {
  listSupportedSources: z.object({
    sources: z.array(z.object({
      id: z.string(),
      name: z.string(),
      url: z.string().url(),
      adapter: z.string()
    }))
  }),
  serverStatus: serverStatusOutputSchema,
  releaseEvidence: releaseEvidenceOutputSchema,
  validateCatalog: z.object({ health: catalogHealthReportSchema }),
  listLiveSources: z.object({ liveSources: z.array(z.object({ datasetId: z.string() }).passthrough()) }),
  searchDatasets: z.object({
    datasets: z.array(z.object({
      datasetId: z.string(),
      title: z.string(),
      sourceName: z.string(),
      city: z.string(),
      topic: z.string(),
      confidence: z.number(),
      recommendedUse: z.array(z.string())
    }))
  }),
  datasetMetadata: datasetMetadataOutputSchema,
  queryResult: queryResultSchema,
  sampleRows: z.object({ datasetId: z.string(), rows: z.array(sampleRowSchema) }),
  summary: z.object({ summary: z.string(), caveats: z.array(z.string()) }),
  visualization: visualizationRecommendationSchema,
  canvasSpec: z.object({ canvas: canvasDocumentSchema }),
  canvasValidation: canvasValidationOutputSchema,
  sourceAttribution: sourceAttributionSchema,
  queryAudit: queryAuditSchema,
  miroExport: miroExportSpecSchema
} as const;

export function createServer() {
  const server = new McpServer({
    name: "texas-public-data-mcp",
    version: MCP_SERVER_VERSION
  });

  server.registerTool("list_supported_sources", {
    title: "List supported sources",
    description: "Return allowlisted Texas public data portals and static adapters."
  }, handled(() => listSupportedSources(), outputSchemas.listSupportedSources));

  server.registerTool("get_server_status", {
    title: "Get server status",
    description: "Return MCP server readiness and safety model metadata."
  }, handled(() => getServerStatus(), outputSchemas.serverStatus));

  server.registerTool("get_release_evidence", {
    title: "Get release evidence",
    description: "Return checked-in release evidence for local and hosted readiness gates."
  }, handled(() => getReleaseEvidence(), outputSchemas.releaseEvidence));

  server.registerTool("validate_catalog", {
    title: "Validate catalog",
    description: "Return approved catalog health and live fallback readiness."
  }, handled(() => validateCatalog(), outputSchemas.validateCatalog));

  server.registerTool("list_live_sources", {
    title: "List live sources",
    description: "Return live-enabled datasets and verified field mappings."
  }, handled(() => listLiveSources(), outputSchemas.listLiveSources));

  server.registerTool("search_datasets", {
    title: "Search datasets",
    description: "Search approved dataset catalog.",
    inputSchema: {
      query: z.string().default(""),
      city: z.string().optional(),
      topic: z.string().optional(),
      limit: z.number().int().positive().max(25).default(10)
    }
  }, handled((args) => searchDatasets(args), outputSchemas.searchDatasets));

  server.registerTool("get_dataset_metadata", {
    title: "Get dataset metadata",
    description: "Return schema, source details, caveats, and recommended visuals.",
    inputSchema: { datasetId: z.string() }
  }, handled((args) => getDatasetMetadata(args), outputSchemas.datasetMetadata));

  server.registerTool("query_dataset", {
    title: "Query dataset",
    description: "Run a validated BoundedQuerySpec against approved sample data.",
    inputSchema: boundedQueryInput
  }, handled((args) => queryDataset(args), outputSchemas.queryResult));

  server.registerTool("get_sample_rows", {
    title: "Get sample rows",
    description: "Return a safe preview of an approved dataset.",
    inputSchema: { datasetId: z.string(), limit: z.number().int().positive().max(25).default(10) }
  }, handled((args) => getSampleRows(args), outputSchemas.sampleRows));

  server.registerTool("summarize_query_result", {
    title: "Summarize query result",
    description: "Create a descriptive summary with caveats.",
    inputSchema: { result: queryResultSchema }
  }, handled((args) => summarizeQueryResult(args.result), outputSchemas.summary));

  server.registerTool("recommend_visualization", {
    title: "Recommend visualization",
    description: "Recommend allowlisted canvas blocks.",
    inputSchema: { result: queryResultSchema }
  }, handled((args) => recommendVisualization(args.result), outputSchemas.visualization));

  server.registerTool("generate_canvas_spec", {
    title: "Generate CanvasSpec",
    description: "Generate safe CanvasDocument JSON from an approved dataset.",
    inputSchema: { datasetId: z.string(), mode: z.enum(["auto", "sample_only", "live_if_available"]).default("auto") }
  }, handled((args) => generateCanvasSpec(args), outputSchemas.canvasSpec));

  server.registerTool("validate_canvas_spec", {
    title: "Validate CanvasSpec",
    description: "Validate CanvasDocument JSON and reject unsafe block specs.",
    inputSchema: { canvas: z.record(z.unknown()) }
  }, handled((args) => validateCanvasSpec(args.canvas), outputSchemas.canvasValidation));

  server.registerTool("get_source_attribution", {
    title: "Get source attribution",
    description: "Return source and method attribution for a bounded query.",
    inputSchema: boundedQueryInput
  }, handled((args) => getSourceAttribution(args), outputSchemas.sourceAttribution));

  server.registerTool("audit_query", {
    title: "Audit query",
    description: "Return query safety/audit metadata.",
    inputSchema: boundedQueryInput
  }, handled((args) => auditQuery(args), outputSchemas.queryAudit));

  server.registerTool("generate_miro_export_spec", {
    title: "Generate Miro export spec",
    description: "Stretch preview: convert safe CanvasDocument into MiroExportSpec JSON.",
    inputSchema: {
      canvas: canvasDocumentSchema,
      template: z.enum(["briefing_board", "slide_deck", "community_workshop"]).default("briefing_board")
    }
  }, handled((args) => generateMiroExportSpec(args), outputSchemas.miroExport));

  return server;
}

export async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
