import type { BoundedQuerySpec, CanvasDocument, DatasetMetadata } from "@texas-data-canvas/shared";

export type McpToolName =
  | "list_supported_sources"
  | "search_datasets"
  | "get_dataset_metadata"
  | "query_dataset"
  | "get_sample_rows"
  | "summarize_query_result"
  | "recommend_visualization"
  | "generate_canvas_spec"
  | "validate_canvas_spec"
  | "get_source_attribution"
  | "audit_query"
  | "generate_miro_export_spec";

export type McpToolScaffold = {
  name: McpToolName;
  phase: "P4";
  description: string;
};

export const toolScaffold: McpToolScaffold[] = [
  {
    name: "list_supported_sources",
    phase: "P4",
    description: "Return approved public portals and static data adapters."
  },
  {
    name: "search_datasets",
    phase: "P4",
    description: "Search the approved dataset catalog by city, topic, and prompt text."
  },
  {
    name: "get_dataset_metadata",
    phase: "P4",
    description: "Return source details, fields, caveats, and recommended visuals."
  },
  {
    name: "query_dataset",
    phase: "P4",
    description: "Run a validated BoundedQuerySpec against approved sample or public data."
  },
  {
    name: "get_sample_rows",
    phase: "P4",
    description: "Return a safe sample preview within the max sample row policy."
  },
  {
    name: "summarize_query_result",
    phase: "P4",
    description: "Create descriptive summaries with caveats and no causal claims."
  },
  {
    name: "recommend_visualization",
    phase: "P4",
    description: "Recommend allowlisted canvas blocks for a query result."
  },
  {
    name: "generate_canvas_spec",
    phase: "P4",
    description: "Generate CanvasDocument JSON with SourceMethodBlock required."
  },
  {
    name: "validate_canvas_spec",
    phase: "P4",
    description: "Validate CanvasDocument JSON and reject unsafe or unknown blocks."
  },
  {
    name: "get_source_attribution",
    phase: "P4",
    description: "Return required source, method, fields, filters, and caveats."
  },
  {
    name: "audit_query",
    phase: "P4",
    description: "Return row limits, fields used, safety decisions, and execution metadata."
  },
  {
    name: "generate_miro_export_spec",
    phase: "P4",
    description: "Stretch: convert a safe CanvasDocument into a source-cited MiroExportSpec."
  }
];

export function createMcpServerPlaceholder(_datasets: DatasetMetadata[]) {
  return {
    serverName: "texas-public-data-mcp",
    status: "P0/P1 scaffold",
    tools: toolScaffold
  };
}

export type FutureQueryHandler = (query: BoundedQuerySpec) => Promise<unknown>;
export type FutureCanvasValidator = (canvas: CanvasDocument) => CanvasDocument;
