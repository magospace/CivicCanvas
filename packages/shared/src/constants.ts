export const SCHEMA_VERSION = "1.0" as const;

export const governanceLimits = {
  maxRawRows: 100,
  maxAggregateRows: 1000,
  maxSampleRows: 25,
  maxDashboardBlocks: 10
} as const;

export const runtimeLimits = {
  maxJsonBodyBytes: 64 * 1024,
  liveFetchTimeoutMs: 8000
} as const;
