import { Header } from "../../components/header";
import { SourcesCatalog } from "../../components/sources-catalog";
import { getCatalogHealth, getDatasetCatalog } from "../../lib/data";

export default function SourcesPage() {
  const datasets = getDatasetCatalog();
  const health = getCatalogHealth();
  const livePromotedCount = datasets.filter((dataset) => dataset.liveAvailable).length;
  const sampleFirstCount = datasets.filter((dataset) => !dataset.liveAvailable && Boolean(dataset.fallbackSampleFile)).length;
  const comingLaterCount = datasets.filter((dataset) => !dataset.liveAvailable && !dataset.fallbackSampleFile).length;
  const healthClassName = health.status === "ok"
    ? "border-mint/30 bg-mint/10 text-civic-900"
    : health.status === "degraded"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-signal/30 bg-signal/10 text-signal";

  return (
    <main id="main-content" className="min-h-screen bg-civic-50">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-civic-700">
            Approved catalog
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-ink">Texas public data sources</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            The catalog keeps verified source metadata, live adapter mappings, sample fallbacks,
            caveats, and recommended visual types together so dashboards stay governed.
            Hosted beta keeps Dallas ZIP dashboards on sample fallback and keeps Austin monthly
            live aggregation blocked until a source-owned month expression is safely verified.
          </p>
          <div className={`mt-4 rounded-md border px-3 py-2 text-xs font-semibold shadow-sm ${healthClassName}`}>
            Catalog health: {health.status} / {health.datasetCount} datasets / {health.liveEnabledDatasets.length} live-enabled
          </div>
          <div aria-label="Sources readiness legend" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="text-2xl font-semibold text-ink">{datasets.length}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Approved sources</div>
              <p className="mt-2 text-xs leading-5 text-slate-600">Catalog entries reviewed before they appear in dashboards or MCP tools.</p>
            </div>
            <div className="rounded-lg border border-mint/30 bg-mint/10 p-3 shadow-sm">
              <div className="text-2xl font-semibold text-civic-900">{livePromotedCount}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-civic-700">Live promoted</div>
              <p className="mt-2 text-xs leading-5 text-civic-900">Only verified, catalog-mapped fields can use live public APIs.</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 shadow-sm">
              <div className="text-2xl font-semibold text-amber-900">{sampleFirstCount}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">Sample fallback</div>
              <p className="mt-2 text-xs leading-5 text-amber-900">Demo-safe local samples stay visible when live data is blocked or unsafe.</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm">
              <div className="text-2xl font-semibold text-slate-700">{comingLaterCount}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Coming later</div>
              <p className="mt-2 text-xs leading-5 text-slate-600">Metadata without query-ready samples stays out of generated dashboards.</p>
            </div>
          </div>
          {health.status !== "ok" ? (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
              Catalog health is degraded. Dashboards should stay in sample fallback until catalog/sample issues are resolved.
              {health.issues.length > 0 ? (
                <ul className="mt-2 list-disc pl-4">
                  {health.issues.slice(0, 4).map((issue, index) => (
                    <li key={`${issue.code}-${index}`}>{issue.path.join(".")}: {issue.message}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
        <SourcesCatalog datasets={datasets} />
      </section>
    </main>
  );
}
