import { Database, ExternalLink } from "lucide-react";
import { Header } from "../../components/header";
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
        <div className="grid gap-4 md:grid-cols-2">
          {datasets.map((dataset) => (
            <article
              key={dataset.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-civic-700">
                    <Database className="h-4 w-4" />
                    {dataset.city} / {dataset.topic}
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-ink">{dataset.title}</h2>
                </div>
                <a
                  href={dataset.sourceUrl}
                  className="rounded-md border border-slate-200 p-2 text-slate-500 transition hover:border-civic-500 hover:text-civic-700"
                  aria-label={`Open source for ${dataset.title}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{dataset.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {dataset.fields.slice(0, 7).map((field) => (
                  <span
                    key={field.name}
                    className="rounded-md bg-civic-100 px-2.5 py-1 text-xs font-medium text-civic-700"
                  >
                    {field.name}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">{dataset.caveats[0]}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
