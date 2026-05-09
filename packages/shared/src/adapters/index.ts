import { governanceLimits } from "../constants.js";
import {
  boundedQuerySpecSchema,
  queryAuditSchema,
  queryResultSchema,
  type BoundedQuerySpec,
  type DataMode,
  type DatasetMetadata,
  type QueryExecution,
  type SampleRow
} from "../schemas/index.js";
import {
  createSourceAttribution,
  executeBoundedQuery,
  fieldsUsedBySpec,
  formatQueryFilter,
  getApprovedDataset,
  getDatasetField,
  validateBoundedQuerySpec
} from "../query/index.js";

export type DatasetSamples = Record<string, SampleRow[]>;

export type DatasetAdapter = {
  kind: string;
  listDatasets(): Promise<DatasetMetadata[]>;
  getMetadata(datasetId: string): Promise<DatasetMetadata>;
  getSampleRows(datasetId: string, limit?: number): Promise<SampleRow[]>;
  queryDataset(spec: unknown): Promise<QueryExecution>;
};

export function createStaticJsonAdapter({
  catalog,
  samples,
  accessedAt = new Date().toISOString()
}: {
  catalog: DatasetMetadata[];
  samples: DatasetSamples;
  accessedAt?: string;
}): DatasetAdapter {
  return {
    kind: "static_json",
    async listDatasets() {
      return catalog;
    },
    async getMetadata(datasetId) {
      return getApprovedDataset(catalog, datasetId);
    },
    async getSampleRows(datasetId, limit = governanceLimits.maxSampleRows) {
      getApprovedDataset(catalog, datasetId);
      return (samples[datasetId] ?? []).slice(0, Math.min(limit, governanceLimits.maxSampleRows));
    },
    async queryDataset(spec) {
      const parsedSpec = boundedQuerySpecSchema.parse(spec);
      return executeBoundedQuery({
        catalog,
        rows: samples[parsedSpec.datasetId] ?? [],
        spec: parsedSpec,
        accessedAt,
        queryMethod: "Validated BoundedQuerySpec executed against static JSON fallback data.",
        dataMode: "sample"
      });
    }
  };
}

function createId(prefix: string, parts: string[]) {
  const body = parts
    .join("_")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return `${prefix}_${body || "default"}`;
}

function safeIdentifier(value: string) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe Socrata identifier: ${value}`);
  }
  return value;
}

function safeSocrataExpression(value: string) {
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    return value;
  }

  const dateTrunc = value.match(/^date_trunc_ym\(([a-zA-Z_][a-zA-Z0-9_]*)\)$/);
  if (dateTrunc) {
    return `date_trunc_ym(${dateTrunc[1]})`;
  }

  throw new Error(`Unsafe Socrata expression: ${value}`);
}

function liveFieldExpression(dataset: DatasetMetadata, field: string) {
  const mapped = dataset.liveFieldMap[field];
  if (!mapped) {
    throw new Error(`Field "${field}" is not available in verified live mapping for ${dataset.id}.`);
  }
  return safeSocrataExpression(mapped);
}

function liveFilterField(dataset: DatasetMetadata, field: string) {
  const expression = liveFieldExpression(dataset, field);
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(expression)) {
    throw new Error(`Field "${field}" cannot be used as a live filter for ${dataset.id}.`);
  }
  return expression;
}

function soqlLiteral(value: string | number | boolean) {
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return `'${value.replace(/'/g, "''")}'`;
}

function whereClause(dataset: DatasetMetadata, filter: BoundedQuerySpec["filters"][number]) {
  const field = liveFilterField(dataset, filter.field);

  if (filter.operator === "eq") {
    return `${field} = ${soqlLiteral(filter.value as string | number | boolean)}`;
  }
  if (filter.operator === "neq") {
    return `${field} != ${soqlLiteral(filter.value as string | number | boolean)}`;
  }
  if (filter.operator === "gte") {
    return `${field} >= ${soqlLiteral(filter.value as string | number | boolean)}`;
  }
  if (filter.operator === "lte") {
    return `${field} <= ${soqlLiteral(filter.value as string | number | boolean)}`;
  }
  if (filter.operator === "contains") {
    return `lower(${field}) like lower('%${String(filter.value).replace(/'/g, "''")}%')`;
  }
  if (filter.operator === "between") {
    if (!Array.isArray(filter.value) || filter.value.length !== 2) {
      throw new Error(`Between filter requires exactly two values: ${formatQueryFilter(filter)}`);
    }
    return `${field} between ${soqlLiteral(filter.value[0])} and ${soqlLiteral(filter.value[1])}`;
  }
  if (filter.operator === "in") {
    if (!Array.isArray(filter.value)) {
      throw new Error(`In filter requires an array: ${formatQueryFilter(filter)}`);
    }
    return `${field} in (${filter.value.map(soqlLiteral).join(", ")})`;
  }

  throw new Error(`Unsupported Socrata operator: ${filter.operator}`);
}

export function buildSocrataQueryUrl({
  dataset,
  spec
}: {
  dataset: DatasetMetadata;
  spec: unknown;
}) {
  const parsedSpec = boundedQuerySpecSchema.parse(spec);
  if (!dataset.apiBaseUrl || !dataset.externalDatasetId) {
    throw new Error(`Dataset ${dataset.id} is missing Socrata API configuration.`);
  }

  validateBoundedQuerySpec({ catalog: [dataset], spec: parsedSpec });
  const metrics = parsedSpec.metrics.map((metric) => {
    const alias = safeIdentifier(metric.alias);
    if (metric.type === "count") {
      return `count(*) as ${alias}`;
    }
    return `${metric.type}(${liveFieldExpression(dataset, metric.field ?? "")}) as ${alias}`;
  });
  const groupFields = parsedSpec.groupBy.map((field) => ({
    field,
    expression: liveFieldExpression(dataset, field)
  }));
  const select = [
    ...groupFields.map((field) => `${field.expression} as ${safeIdentifier(field.field)}`),
    ...metrics
  ].join(", ");
  const params = new URLSearchParams();
  params.set("$select", select);
  if (parsedSpec.filters.length > 0) {
    params.set("$where", parsedSpec.filters.map((filter) => whereClause(dataset, filter)).join(" and "));
  }
  if (groupFields.length > 0) {
    params.set("$group", groupFields.map((field) => field.expression).join(", "));
  }
  if (parsedSpec.orderBy.length > 0) {
    params.set(
      "$order",
      parsedSpec.orderBy
        .map((order) => `${safeIdentifier(order.field)} ${order.direction.toUpperCase()}`)
        .join(", ")
    );
  }
  params.set("$limit", String(parsedSpec.limit));

  return `${dataset.apiBaseUrl.replace(/\/$/, "")}/resource/${dataset.externalDatasetId}.json?${params.toString()}`;
}

export function createSocrataAdapter({
  catalog,
  fallback,
  fetcher = fetch,
  accessedAt = new Date().toISOString()
}: {
  catalog: DatasetMetadata[];
  fallback: DatasetAdapter;
  fetcher?: typeof fetch;
  accessedAt?: string;
}): DatasetAdapter {
  return {
    kind: "socrata",
    async listDatasets() {
      return catalog;
    },
    async getMetadata(datasetId) {
      return getApprovedDataset(catalog, datasetId);
    },
    async getSampleRows(datasetId, limit) {
      return fallback.getSampleRows(datasetId, limit);
    },
    async queryDataset(spec) {
      const parsedSpec = boundedQuerySpecSchema.parse(spec);
      const dataset = getApprovedDataset(catalog, parsedSpec.datasetId);
      if (!dataset.liveAvailable || parsedSpec.mode === "sample_only") {
        return fallback.queryDataset(parsedSpec);
      }

      try {
        const url = buildSocrataQueryUrl({ dataset, spec: parsedSpec });
        const response = await fetcher(url);
        if (!response.ok) {
          throw new Error(`Socrata request failed with ${response.status}`);
        }
        const rows = normalizeSocrataRows(await response.json(), parsedSpec);
        return createSocrataExecution({
          dataset,
          spec: parsedSpec,
          rows,
          accessedAt,
          dataMode: "live",
          caveats: [
            ...dataset.caveats,
            "Live public API result. Field names were translated through the verified catalog mapping."
          ]
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown live adapter error";
        const execution = await fallback.queryDataset(parsedSpec);
        execution.result.dataMode = "fallback";
        execution.result.caveats = [
          ...execution.result.caveats,
          `Live adapter unavailable; returned approved static sample fallback. Reason: ${reason}`
        ];
        execution.result.source.dataMode = "fallback";
        execution.result.source.queryMethod = `Static sample fallback after live adapter failure for ${dataset.sourceName}.`;
        execution.result.source.caveats = execution.result.caveats;
        execution.audit.dataMode = "fallback";
        execution.audit.safetyDecisions.push("Live adapter unavailable; static fallback returned.");
        return execution;
      }
    }
  };
}

export function createAdapterRouter({
  catalog,
  samples,
  fetcher,
  accessedAt
}: {
  catalog: DatasetMetadata[];
  samples: DatasetSamples;
  fetcher?: typeof fetch;
  accessedAt?: string;
}): DatasetAdapter {
  const staticAdapter = createStaticJsonAdapter({ catalog, samples, accessedAt });
  const socrataAdapter = createSocrataAdapter({ catalog, fallback: staticAdapter, fetcher, accessedAt });

  return {
    kind: "router",
    async listDatasets() {
      return catalog;
    },
    async getMetadata(datasetId) {
      return getApprovedDataset(catalog, datasetId);
    },
    async getSampleRows(datasetId, limit) {
      return staticAdapter.getSampleRows(datasetId, limit);
    },
    async queryDataset(spec) {
      const parsedSpec = boundedQuerySpecSchema.parse(spec);
      const dataset = getApprovedDataset(catalog, parsedSpec.datasetId);
      getDatasetField(dataset, parsedSpec.groupBy[0] ?? dataset.fields[0]?.name ?? "");
      if (parsedSpec.mode === "sample_only") {
        return staticAdapter.queryDataset(parsedSpec);
      }
      if (dataset.adapter === "socrata" && dataset.liveAvailable) {
        return socrataAdapter.queryDataset(parsedSpec);
      }
      return staticAdapter.queryDataset(parsedSpec);
    }
  };
}

function normalizeSocrataRows(value: unknown, spec: BoundedQuerySpec): SampleRow[] {
  if (!Array.isArray(value)) {
    throw new Error("Socrata response was not an array.");
  }

  return value.map((row) => {
    const input = row && typeof row === "object" ? row as Record<string, unknown> : {};
    const output: SampleRow = {};

    for (const field of spec.groupBy) {
      const value = input[field];
      output[field] = field === "month" && typeof value === "string" ? value.slice(0, 7) : normalizeCell(value);
    }

    for (const metric of spec.metrics) {
      output[metric.alias] = Number(input[metric.alias] ?? 0);
    }

    return output;
  });
}

function normalizeCell(value: unknown): SampleRow[string] {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || value === null) {
    return value;
  }
  return value === undefined ? null : String(value);
}

function createSocrataExecution({
  dataset,
  spec,
  rows,
  accessedAt,
  dataMode,
  caveats
}: {
  dataset: DatasetMetadata;
  spec: BoundedQuerySpec;
  rows: SampleRow[];
  accessedAt: string;
  dataMode: DataMode;
  caveats: string[];
}): QueryExecution {
  const aggregation = spec.groupBy.length > 0 || spec.metrics.some((metric) => metric.type !== "count");
  const fieldsUsed = fieldsUsedBySpec(spec);
  const source = createSourceAttribution(
    dataset,
    spec,
    accessedAt,
    `Validated BoundedQuerySpec executed against live Socrata endpoint ${dataset.externalDatasetId}.`,
    dataMode,
    caveats
  );
  const queryId = createId("q", [spec.datasetId, ...spec.groupBy, ...spec.metrics.map((metric) => metric.alias)]);

  return {
    result: queryResultSchema.parse({
      queryId,
      datasetId: spec.datasetId,
      resultType: spec.groupBy.some((field) => field.includes("zip")) ? "geo_aggregate" : aggregation ? "aggregate" : "sample",
      dataMode,
      rows,
      columns: [
        ...spec.groupBy.map((field) => {
          const datasetField = getDatasetField(dataset, field);
          return { field, label: field.replace(/_/g, " "), type: datasetField.type };
        }),
        ...spec.metrics.map((metric) => ({
          field: metric.alias,
          label: metric.alias.replace(/_/g, " "),
          type: "number" as const
        }))
      ],
      source,
      caveats
    }),
    audit: queryAuditSchema.parse({
      auditId: createId("audit", [queryId]),
      queryId,
      datasetId: spec.datasetId,
      fieldsUsed,
      filtersApplied: spec.filters.map(formatQueryFilter),
      rowLimit: spec.limit,
      aggregation,
      dataMode,
      executedAt: accessedAt,
      safetyDecisions: [
        "Dataset ID matched approved catalog.",
        "Fields and operators validated before live query generation.",
        "Socrata query was generated from allowlisted catalog mappings.",
        `Row limit enforced at ${spec.limit}.`,
        "Live aggregate result returned."
      ]
    })
  };
}
