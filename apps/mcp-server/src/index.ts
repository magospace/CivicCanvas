import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  boundedQueryFilterSchema,
  isGovernedError,
  queryMetricSchema
} from "@texas-data-canvas/shared";
import {
  auditQuery,
  generateCanvasSpec,
  generateMiroExportSpec,
  getDatasetMetadata,
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

function toolError(error: unknown) {
  const message = error instanceof Error ? error.message : "Tool execution failed.";
  const category = isGovernedError(error) ? error.category : "validation_error";

  return { ok: false, error: { category, message } };
}

function handled<T>(callback: (args: T) => unknown | Promise<unknown>) {
  return async (args: T) => {
    try {
      return jsonContent(await callback(args));
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

export function createServer() {
  const server = new McpServer({
    name: "texas-public-data-mcp",
    version: MCP_SERVER_VERSION
  });

  server.registerTool("list_supported_sources", {
    title: "List supported sources",
    description: "Return allowlisted Texas public data portals and static adapters."
  }, handled(() => listSupportedSources()));

  server.registerTool("get_server_status", {
    title: "Get server status",
    description: "Return MCP server readiness and safety model metadata."
  }, handled(() => getServerStatus()));

  server.registerTool("validate_catalog", {
    title: "Validate catalog",
    description: "Return approved catalog health and live fallback readiness."
  }, handled(() => validateCatalog()));

  server.registerTool("list_live_sources", {
    title: "List live sources",
    description: "Return live-enabled datasets and verified field mappings."
  }, handled(() => listLiveSources()));

  server.registerTool("search_datasets", {
    title: "Search datasets",
    description: "Search approved dataset catalog.",
    inputSchema: {
      query: z.string().default(""),
      city: z.string().optional(),
      topic: z.string().optional(),
      limit: z.number().int().positive().max(25).default(10)
    }
  }, handled((args) => searchDatasets(args)));

  server.registerTool("get_dataset_metadata", {
    title: "Get dataset metadata",
    description: "Return schema, source details, caveats, and recommended visuals.",
    inputSchema: { datasetId: z.string() }
  }, handled((args) => getDatasetMetadata(args)));

  server.registerTool("query_dataset", {
    title: "Query dataset",
    description: "Run a validated BoundedQuerySpec against approved sample data.",
    inputSchema: boundedQueryInput
  }, handled((args) => queryDataset(args)));

  server.registerTool("get_sample_rows", {
    title: "Get sample rows",
    description: "Return a safe preview of an approved dataset.",
    inputSchema: { datasetId: z.string(), limit: z.number().int().positive().max(25).default(10) }
  }, handled((args) => getSampleRows(args)));

  server.registerTool("summarize_query_result", {
    title: "Summarize query result",
    description: "Create a descriptive summary with caveats.",
    inputSchema: { result: z.any() }
  }, handled((args) => summarizeQueryResult(args.result)));

  server.registerTool("recommend_visualization", {
    title: "Recommend visualization",
    description: "Recommend allowlisted canvas blocks.",
    inputSchema: { result: z.any() }
  }, handled((args) => recommendVisualization(args.result)));

  server.registerTool("generate_canvas_spec", {
    title: "Generate CanvasSpec",
    description: "Generate safe CanvasDocument JSON from an approved dataset.",
    inputSchema: { datasetId: z.string(), mode: z.enum(["auto", "sample_only", "live_if_available"]).default("auto") }
  }, handled((args) => generateCanvasSpec(args)));

  server.registerTool("validate_canvas_spec", {
    title: "Validate CanvasSpec",
    description: "Validate CanvasDocument JSON and reject unsafe block specs.",
    inputSchema: { canvas: z.any() }
  }, handled((args) => validateCanvasSpec(args.canvas)));

  server.registerTool("get_source_attribution", {
    title: "Get source attribution",
    description: "Return source and method attribution for a bounded query.",
    inputSchema: boundedQueryInput
  }, handled((args) => getSourceAttribution(args)));

  server.registerTool("audit_query", {
    title: "Audit query",
    description: "Return query safety/audit metadata.",
    inputSchema: boundedQueryInput
  }, handled((args) => auditQuery(args)));

  server.registerTool("generate_miro_export_spec", {
    title: "Generate Miro export spec",
    description: "Stretch preview: convert safe CanvasDocument into MiroExportSpec JSON.",
    inputSchema: {
      canvas: z.any(),
      template: z.enum(["briefing_board", "slide_deck", "community_workshop"]).default("briefing_board")
    }
  }, handled((args) => generateMiroExportSpec(args)));

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
