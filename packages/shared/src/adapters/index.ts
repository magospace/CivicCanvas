import { governanceLimits } from "../constants.js";
import {
  boundedQuerySpecSchema,
  type BoundedQuerySpec,
  type DatasetMetadata,
  type QueryExecution,
  type SampleRow
} from "../schemas/index.js";
import {
  executeBoundedQuery,
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
        queryMethod: "Validated BoundedQuerySpec executed against static JSON fallback data."
      });
    }
  };
}

function safeIdentifier(value: string) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    throw new Error(`Unsafe Socrata identifier: ${value}`);
  }
  return value;
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

function whereClause(filter: BoundedQuerySpec["filters"][number]) {
  const field = safeIdentifier(filter.field);

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
    return `${metric.type}(${safeIdentifier(metric.field ?? "")}) as ${alias}`;
  });
  const groupFields = parsedSpec.groupBy.map(safeIdentifier);
  const select = [...groupFields, ...metrics].join(", ");
  const params = new URLSearchParams();
  params.set("$select", select);
  if (parsedSpec.filters.length > 0) {
    params.set("$where", parsedSpec.filters.map(whereClause).join(" and "));
  }
  if (groupFields.length > 0) {
    params.set("$group", groupFields.join(", "));
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
      if (!dataset.liveAvailable) {
        return fallback.queryDataset(parsedSpec);
      }

      try {
        const url = buildSocrataQueryUrl({ dataset, spec: parsedSpec });
        const response = await fetcher(url);
        if (!response.ok) {
          throw new Error(`Socrata request failed with ${response.status}`);
        }
        const rows = (await response.json()) as SampleRow[];
        return executeBoundedQuery({
          catalog,
          rows,
          spec: parsedSpec,
          accessedAt,
          queryMethod: `Validated BoundedQuerySpec executed against live Socrata endpoint for ${dataset.sourceName}.`
        });
      } catch {
        const execution = await fallback.queryDataset(parsedSpec);
        execution.result.caveats = [
          ...execution.result.caveats,
          "Live adapter unavailable; returned approved static sample fallback."
        ];
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
      if (dataset.adapter === "socrata" && dataset.liveAvailable) {
        return socrataAdapter.queryDataset(parsedSpec);
      }
      return staticAdapter.queryDataset(parsedSpec);
    }
  };
}
