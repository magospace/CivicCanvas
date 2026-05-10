import { NextResponse } from "next/server";
import { releaseMetadata } from "@texas-data-canvas/shared";
import { getCatalogHealth, getReleaseEvidence } from "../../../lib/data";
import { getOpenAIReadiness } from "../../../lib/openai-provider";

function deploymentUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return undefined;
}

function deploymentProvider() {
  if (process.env.VERCEL || process.env.VERCEL_URL) {
    return "vercel";
  }

  return "local";
}

export function GET() {
  const catalog = getCatalogHealth();
  const releaseEvidence = getReleaseEvidence();
  const gitRef = process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GITHUB_REF_NAME;
  const openAI = getOpenAIReadiness();

  return NextResponse.json({
    ok: catalog.status !== "failed",
    appEnvironment: process.env.NEXT_PUBLIC_APP_ENV ?? process.env.VERCEL_ENV ?? "local",
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? releaseMetadata.devFallbackVersion,
    releaseVersion: releaseMetadata.releaseVersion,
    releaseChannel: releaseMetadata.releaseChannel,
    packageVersion: releaseMetadata.packageVersion,
    promptProcessing: {
      mode: openAI.enabled ? "deterministic_with_optional_openai_assist" : "deterministic_rule_based",
      requiresProviderSecret: openAI.enabled,
      provider: openAI.enabled ? "openai" : null,
      openAIReadiness: openAI,
      boundaries: [
        "Deterministic parser and bounded query engine remain authoritative.",
        "OpenAI may assist with prompt interpretation and summaries only when a server-side provider key is configured.",
        "OpenAI cannot generate executable dashboard code, arbitrary SQL, non-catalog dataset access, or hidden-field overrides."
      ]
    },
    mediaGeneration: {
      appGeneratesMedia: false,
      dashboardMediaOutput: "not_implemented",
      defaultProviderCall: false,
      optionalProofProvider: "fal",
      optionalProofGate: "RUN_LIVE_FAL_SMOKE=1",
      proofCommand: "pnpm media:fal:smoke:json",
      secretEcho: false,
      note: "Dashboards render validated UI and client exports only. Fal media proof is an optional script path, not normal app generation."
    },
    runtime: "nextjs",
    deploymentProvider: deploymentProvider(),
    deploymentUrl: deploymentUrl(),
    gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA,
    gitBranch: gitRef,
    gitRef,
    releaseEvidence: {
      localVerifiedAt: releaseEvidence.localVerifiedAt,
      hostedStatus: releaseEvidence.hosted.status,
      latestLocalGates: releaseEvidence.localGates
        .filter((gate) => gate.status === "passed")
        .map((gate) => gate.name)
    },
    checkedAt: catalog.checkedAt,
    catalogCount: catalog.datasetCount,
    liveEnabledDatasets: catalog.liveEnabledDatasets,
    sampleFallbacksAvailable: catalog.sampleFallbacks.every((sample) => sample.available),
    catalogStatus: catalog.status
  });
}
