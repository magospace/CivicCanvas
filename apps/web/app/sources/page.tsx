import { Header } from "../../components/header";
import { SourcesCatalog } from "../../components/sources-catalog";
import { getDatasetCatalog } from "../../lib/data";

export default function SourcesPage() {
  const datasets = getDatasetCatalog();

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
            P0/P1 uses curated sample data first. Live portal adapters come later, but the
            catalog already captures the source, fields, caveats, and recommended visual types.
          </p>
        </div>
        <SourcesCatalog datasets={datasets} />
      </section>
    </main>
  );
}
