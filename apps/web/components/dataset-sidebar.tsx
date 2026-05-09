import { Building2, Layers3, MapPinned } from "lucide-react";
import type { DatasetMetadata } from "@texas-data-canvas/shared";

export function DatasetSidebar({ datasets }: { datasets: DatasetMetadata[] }) {
  const cities = [...new Set(datasets.map((dataset) => dataset.city))];
  const topics = [...new Set(datasets.map((dataset) => dataset.topic))];

  return (
    <aside className="space-y-4 border-r border-slate-200 bg-white p-4 lg:min-h-[calc(100vh-4rem)]">
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <MapPinned className="h-4 w-4" />
          Cities
        </div>
        <div className="grid gap-2">
          {cities.map((city) => (
            <button
              key={city}
              className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-civic-500 hover:text-civic-900"
            >
              {city}
              <span className="text-xs text-slate-400">
                {datasets.filter((dataset) => dataset.city === city).length}
              </span>
            </button>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <Layers3 className="h-4 w-4" />
          Topics
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-md bg-civic-100 px-2.5 py-1 text-xs font-semibold text-civic-700"
            >
              {topic}
            </span>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <Building2 className="h-4 w-4" />
          Datasets
        </div>
        <div className="space-y-2">
          {datasets.map((dataset) => {
            const isQueryable = dataset.fields.length > 0;

            return (
              <article
                key={dataset.id}
                className="rounded-lg border border-slate-200 bg-civic-50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-ink">{dataset.title}</h3>
                  {!isQueryable ? (
                    <span className="shrink-0 rounded bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Coming later
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {dataset.sourceName} / {dataset.dataAccess}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </aside>
  );
}
