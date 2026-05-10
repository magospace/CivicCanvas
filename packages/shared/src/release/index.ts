import { z } from "zod";

export const releaseMetadata = {
  packageVersion: "1.3.0",
  releaseVersion: "v1.3.0-hosted-launch-readiness",
  devFallbackVersion: "v1.3.0-hosted-launch-readiness-dev",
  releaseChannel: "hosted-launch-readiness"
} as const;

export type ReleaseMetadata = typeof releaseMetadata;

export const releaseGateStatusSchema = z.enum(["passed", "failed", "pending", "blocked", "skipped"]);

export const releaseEvidenceSchema = z.object({
  schemaVersion: z.literal("1.0").default("1.0"),
  releaseVersion: z.string(),
  branch: z.string(),
  commit: z.string(),
  updatedAt: z.string(),
  localVerifiedAt: z.string().nullable().default(null),
  localGates: z.array(z.object({
    name: z.string(),
    status: releaseGateStatusSchema,
    detail: z.string().optional()
  })).default([]),
  productionLocal: z.object({
    status: releaseGateStatusSchema,
    detail: z.string().optional()
  }).optional(),
  governanceAudit: z.object({
    status: releaseGateStatusSchema,
    summary: z.string().optional()
  }).optional(),
  hosted: z.object({
    status: z.enum(["blocked", "pending", "verified"]),
    publicUrl: z.string().url().optional(),
    smokeDeploy: releaseGateStatusSchema.optional(),
    remotePlaywright: releaseGateStatusSchema.optional(),
    firewallRateLimit: releaseGateStatusSchema.optional(),
    blocker: z.string().optional()
  }),
  screenshots: z.array(z.object({
    label: z.string(),
    path: z.string()
  })).default([])
});

export type ReleaseEvidence = z.infer<typeof releaseEvidenceSchema>;
