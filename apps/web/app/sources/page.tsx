import { Header } from "../../components/header";
import { SourcesCatalog } from "../../components/sources-catalog";
import { getCatalogHealth, getDatasetCatalog } from "../../lib/data";

export default function SourcesPage() {
  const datasets = getDatasetCatalog();
  const health = getCatalogHealth();

  return (
    <main className="min-h-screen bg-civic-50">
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
          <div className="mt-4 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-civic-700 shadow-sm">
            Catalog health: {health.status} / {health.datasetCount} datasets / {health.liveEnabledDatasets.length} live-enabled
          </div>
        </div>
        <SourcesCatalog datasets={datasets} />
      </section>
    </main>
  );
}
