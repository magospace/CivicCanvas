export const releaseMetadata = {
  packageVersion: "1.2.0",
  releaseVersion: "v1.2.0-hosted-trust",
  devFallbackVersion: "v1.2.0-hosted-trust-dev",
  releaseChannel: "hosted-trust"
} as const;

export type ReleaseMetadata = typeof releaseMetadata;
