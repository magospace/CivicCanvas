import Link from "next/link";
import { execSync } from "node:child_process";
import { AlertTriangle, CheckCircle2, ClipboardCheck, ExternalLink, ShieldCheck } from "lucide-react";
import { releaseMetadata, type DatasetMetadata } from "@texas-data-canvas/shared";
import { DemoChecklistActions, HostedHandoffActions, ReleaseGateActions } from "../../components/demo-checklist-actions";
import { Header } from "../../components/header";
import { getCatalogHealth, getDatasetCatalog, getReleaseEvidence, getSampleDataQualityReport } from "../../lib/data";

const localGateCommands = [
  "pnpm lint",
  "pnpm typecheck",
  "pnpm test",
  "pnpm build",
  "pnpm governance:audit",
  "pnpm data:quality",
  "pnpm verify",
  "pnpm verify:prod-local",
  "pnpm release:check",
  "pnpm smoke:deploy -- --url http://localhost:<port>"
];

const hostedGateCommands = [
  "pnpm smoke:deploy -- --url <public-url> --expect-version v1.3.0-hosted-launch-readiness",
  "PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote"
];

const safetyRules = [
  "Dashboards render only validated CanvasDocument JSON.",
  "Queries run only through approved BoundedQuerySpec objects.",
  "Saved/share bundles validate before render.",
  "Miro remains preview/spec-only.",
  "No auth, database, LLM parser, arbitrary generated UI, or live external map layers."
];

function readinessStatus(dataset: DatasetMetadata | undefined) {
  if (!dataset) {
    return { label: "missing", className: "bg-signal/10 text-signal", detail: "Dataset is not in the approved catalog." };
  }
  if (dataset.liveAvailable) {
    return { label: "live-capable", className: "bg-mint/10 text-civic-900", detail: "Verified live fields are promoted; sample fallback remains available." };
  }
  if (dataset.fields.length > 0 && dataset.fallbackSampleFile) {
    return { label: "sample-first", className: "bg-amber-50 text-amber-900", detail: "Queryable through approved local sample fallback only." };
  }
  return { label: "coming later", className: "bg-slate-100 text-slate-600", detail: "Metadata exists, but query governance is not complete." };
}

function gitValue(command: string) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "unavailable";
  }
}

export default function DemoReadinessPage() {
  const health = getCatalogHealth();
  const releaseEvidence = getReleaseEvidence();
  const quality = getSampleDataQualityReport();
  const datasets = getDatasetCatalog();
  const dallas = datasets.find((dataset) => dataset.id === "dallas_311_requests");
  const austin = datasets.find((dataset) => dataset.id === "austin_building_permits");
  const thirdCandidate = datasets.find((dataset) => dataset.id === "houston_transportation_incidents");
  const activeBranch = process.env.VERCEL_GIT_COMMIT_REF ?? process.env.GITHUB_REF_NAME ?? gitValue("git branch --show-current");
  const currentCommit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? process.env.GITHUB_SHA?.slice(0, 12) ?? gitValue("git rev-parse --short=12 HEAD");
  const activeAppVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? releaseMetadata.devFallbackVersion;
  const hostedStatus = process.env.NEXT_PUBLIC_SITE_URL ? "pending hosted verification" : "blocked: no public URL configured";

  return (
    <main id="main-content" className="min-h-screen bg-civic-50">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-civic-700">
              Release utility
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Demo readiness</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use this page to check public-demo boundaries, local gates, hosted blockers, and the
              governed data story before sharing a deployment. It is a release console, not a marketing page.
            </p>
          </div>
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
          >
            <ExternalLink className="h-4 w-4" />
            Open gallery
          </Link>
          <DemoChecklistActions />
          <ReleaseGateActions />
          <HostedHandoffActions />
        </div>

        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-civic-700">
                Release proof
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink">{releaseMetadata.releaseVersion}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                v1.3 makes hosted handoff, release evidence, and demo readiness repeatable before any manual Vercel release.
                The package version, health route, MCP status, docs, and audit scripts all derive from shared release metadata.
              </p>
            </div>
            <span className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
              Hosted status: {hostedStatus}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-civic-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Branch</div>
              <div className="mt-1 text-sm font-semibold text-ink">{activeBranch}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-civic-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Commit</div>
              <div className="mt-1 text-sm font-semibold text-ink">{currentCommit}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-civic-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">App version</div>
              <div className="mt-1 text-sm font-semibold text-ink">{activeAppVersion}</div>
            </div>
            <div className="rounded-md border border-slate-200 bg-civic-50 p-3">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Package version</div>
              <div className="mt-1 text-sm font-semibold text-ink">{releaseMetadata.packageVersion}</div>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-mint/30 bg-mint/10 px-3 py-2 text-xs leading-5 text-civic-900">
            Latest evidence: {releaseEvidence.localVerifiedAt ?? "local v1.3 verification pending"} / hosted {releaseEvidence.hosted.status}.
            Passed gates recorded: {releaseEvidence.localGates.filter((gate) => gate.status === "passed").map((gate) => gate.name).join(", ") || "pending"}.
          </div>
        </section>

        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">Sample data quality</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Current samples cover {quality.datasets.length} datasets and {quality.datasets.reduce((sum, dataset) => sum + dataset.rowCount, 0)} rows.
                Missing ZIP rows: {quality.datasets.reduce((sum, dataset) => sum + dataset.missingZipRows, 0)}.
              </p>
            </div>
            <code className="rounded-md bg-civic-900 px-3 py-2 text-xs text-civic-50">pnpm data:quality:json</code>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {quality.datasets.map((dataset) => (
              <div key={dataset.datasetId} className="rounded-md border border-slate-200 bg-civic-50 p-3">
                <div className="text-sm font-semibold text-ink">{dataset.title}</div>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {dataset.rowCount} rows / {dataset.dateRange ? `${dataset.dateRange.min} to ${dataset.dateRange.max}` : "no date range"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Top status: {dataset.topStatuses[0] ? `${dataset.topStatuses[0].value} (${dataset.topStatuses[0].count})` : "n/a"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ClipboardCheck className="h-4 w-4 text-civic-700" />
              Catalog health
            </div>
            <div className="mt-4 text-3xl font-semibold text-ink">{health.status}</div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {health.datasetCount} approved datasets, {health.liveEnabledDatasets.length} live-enabled,
              and {health.sampleFallbacks.filter((sample) => sample.available).length} fallback sample files available.
            </p>
            {health.issues.length > 0 ? (
              <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                {health.issues.slice(0, 3).map((issue, index) => (
                  <div key={`${issue.code}-${index}`}>{issue.path.join(".")}: {issue.message}</div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-md bg-mint/10 px-3 py-2 text-xs font-semibold text-mint">
                Catalog and fallback samples are available locally.
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <AlertTriangle className="h-4 w-4 text-signal" />
              Hosted blocker
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              v0.6 through v1.2 remain untagged until a public URL passes hosted smoke,
              remote Playwright, and platform-level firewall/rate-limit review for the target release.
            </p>
            <div className="mt-3 rounded-md bg-signal/10 px-3 py-2 text-xs font-semibold text-signal">
              No public URL or Git remote is configured in this repo context.
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldCheck className="h-4 w-4 text-mint" />
              Safety model
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              {safetyRules.map((rule, index) => (
                <li key={`${rule}-${index}`} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="text-base font-semibold text-ink">Dataset readiness</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[dallas, austin, thirdCandidate].map((dataset) => {
              const status = readinessStatus(dataset);
              return (
                <article key={dataset?.id ?? "missing"} className="rounded-md border border-slate-200 bg-civic-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-ink">{dataset?.title ?? "Missing dataset"}</h3>
                      <p className="mt-1 text-xs text-slate-500">{dataset?.city ?? "Unknown"} / {dataset?.topic ?? "Unknown"}</p>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-1 text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">{status.detail}</p>
                  {dataset?.liveVerification ? (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Last checked {new Date(dataset.liveVerification.lastCheckedAt).toLocaleDateString("en-US")}
                    </p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">Houston live verification</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Houston remains sample-first. Houston TranStar publishes sample JSON feeds, but live feed
                access requires contacting TranStar and exact locations require governance before promotion.
              </p>
            </div>
            {thirdCandidate ? (
              <Link
                href={thirdCandidate.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-civic-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
              >
                <ExternalLink className="h-4 w-4" />
                Source docs
              </Link>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="font-semibold">Status</div>
              <p className="mt-1 text-xs leading-5">
                {thirdCandidate?.liveVerification?.promotionStatus ?? "missing"} / live disabled
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-civic-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-ink">Last checked</div>
              <p className="mt-1 text-xs leading-5">
                {thirdCandidate?.liveVerification
                  ? new Date(thirdCandidate.liveVerification.lastCheckedAt).toLocaleString("en-US")
                  : "not checked"}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-civic-50 p-3 text-sm text-slate-700">
              <div className="font-semibold text-ink">Next command</div>
              <code className="mt-1 block text-xs leading-5">pnpm smoke:live:json</code>
            </div>
          </div>
          {thirdCandidate?.liveVerification?.checks ? (
            <div className="mt-4 grid gap-2 text-xs leading-5 text-slate-600">
              {thirdCandidate.liveVerification.checks.map((check) => (
                <div key={check.label} className="rounded-md border border-slate-200 bg-civic-50 px-3 py-2">
                  <span className="font-semibold text-ink">{check.label}</span>: {check.status} — {check.reason}
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
          <h2 className="text-base font-semibold text-ink">Known sample/live boundaries</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-civic-50 p-4">
              <div className="text-sm font-semibold text-ink">{dallas?.title ?? "Dallas 311"}</div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Live aggregates are promoted for verified non-ZIP mapped fields. ZIP dashboard views
                intentionally use sample fallback because the verified live source does not expose ZIP.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-civic-50 p-4">
              <div className="text-sm font-semibold text-ink">{austin?.title ?? "Austin permits"}</div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Austin metadata is verified, but monthly live aggregation remains sample-first until
                a source-owned month grouping is safely verified.
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-civic-50 p-4">
              <div className="text-sm font-semibold text-ink">{thirdCandidate?.title ?? "Houston candidate"}</div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                Houston transportation is the third public-pilot dataset. It remains sample-first
                until a stable source-owned live API/schema is verified.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <h2 className="text-base font-semibold text-ink">Local release gates</h2>
            <div className="mt-4 space-y-2">
              {localGateCommands.map((command) => (
                <code key={command} className="block rounded-md bg-civic-900 px-3 py-2 text-xs text-civic-50">
                  {command}
                </code>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
            <h2 className="text-base font-semibold text-ink">Hosted release gates</h2>
            <div className="mt-4 space-y-2">
              {hostedGateCommands.map((command) => (
                <code key={command} className="block rounded-md bg-civic-900 px-3 py-2 text-xs text-civic-50">
                  {command}
                </code>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              These gates should run against the same public URL before tagging a hosted release.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
