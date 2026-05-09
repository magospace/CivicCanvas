import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  auditQuery,
  generateCanvasSpec,
  generateMiroExportSpec,
  getDatasetMetadata,
  getSampleRows,
  getSourceAttribution,
  listSupportedSources,
  queryDataset,
  recommendVisualization,
  searchDatasets,
  summarizeQueryResult,
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

const boundedQueryInput = {
  datasetId: z.string(),
  filters: z.array(z.any()).default([]),
  groupBy: z.array(z.string()).default([]),
  metrics: z.array(z.any()),
  orderBy: z.array(z.any()).default([]),
  limit: z.number().int().positive().max(1000).default(500)
};

export function createServer() {
  const server = new McpServer({
    name: "texas-public-data-mcp",
    version: "0.1.0"
  });

  server.registerTool("list_supported_sources", {
    title: "List supported sources",
    description: "Return allowlisted Texas public data portals and static adapters."
  }, () => jsonContent(listSupportedSources()));

  server.registerTool("search_datasets", {
    title: "Search datasets",
    description: "Search approved dataset catalog.",
    inputSchema: {
      query: z.string().default(""),
      city: z.string().optional(),
      topic: z.string().optional(),
      limit: z.number().int().positive().max(25).default(10)
    }
  }, (args) => jsonContent(searchDatasets(args)));

  server.registerTool("get_dataset_metadata", {
    title: "Get dataset metadata",
    description: "Return schema, source details, caveats, and recommended visuals.",
    inputSchema: { datasetId: z.string() }
  }, (args) => jsonContent(getDatasetMetadata(args)));

  server.registerTool("query_dataset", {
    title: "Query dataset",
    description: "Run a validated BoundedQuerySpec against approved sample data.",
    inputSchema: boundedQueryInput
  }, async (args) => jsonContent(await queryDataset(args)));

  server.registerTool("get_sample_rows", {
    title: "Get sample rows",
    description: "Return a safe preview of an approved dataset.",
    inputSchema: { datasetId: z.string(), limit: z.number().int().positive().max(25).default(10) }
  }, async (args) => jsonContent(await getSampleRows(args)));

  server.registerTool("summarize_query_result", {
    title: "Summarize query result",
    description: "Create a descriptive summary with caveats.",
    inputSchema: { result: z.any() }
  }, (args) => jsonContent(summarizeQueryResult(args.result)));

  server.registerTool("recommend_visualization", {
    title: "Recommend visualization",
    description: "Recommend allowlisted canvas blocks.",
    inputSchema: { result: z.any() }
  }, (args) => jsonContent(recommendVisualization(args.result)));

  server.registerTool("generate_canvas_spec", {
    title: "Generate CanvasSpec",
    description: "Generate safe CanvasDocument JSON from an approved dataset.",
    inputSchema: { datasetId: z.string() }
  }, async (args) => jsonContent(await generateCanvasSpec(args)));

  server.registerTool("validate_canvas_spec", {
    title: "Validate CanvasSpec",
    description: "Validate CanvasDocument JSON and reject unsafe block specs.",
    inputSchema: { canvas: z.any() }
  }, (args) => jsonContent(validateCanvasSpec(args.canvas)));

  server.registerTool("get_source_attribution", {
    title: "Get source attribution",
    description: "Return source and method attribution for a bounded query.",
    inputSchema: boundedQueryInput
  }, (args) => jsonContent(getSourceAttribution(args)));

  server.registerTool("audit_query", {
    title: "Audit query",
    description: "Return query safety/audit metadata.",
    inputSchema: boundedQueryInput
  }, async (args) => jsonContent(await auditQuery(args)));

  server.registerTool("generate_miro_export_spec", {
    title: "Generate Miro export spec",
    description: "Stretch preview: convert safe CanvasDocument into MiroExportSpec JSON.",
    inputSchema: {
      canvas: z.any(),
      template: z.enum(["briefing_board", "slide_deck", "community_workshop"]).default("briefing_board")
    }
  }, (args) => jsonContent(generateMiroExportSpec(args)));

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
