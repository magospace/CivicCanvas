import Image from "next/image";
import { GalleryCanvasList } from "../../components/gallery-canvas-list";
import { Header } from "../../components/header";
import { getCuratedGalleryCanvases } from "../../lib/data";

export default function GalleryPage() {
  const canvases = getCuratedGalleryCanvases();

  return (
    <main id="main-content" className="min-h-screen bg-civic-50">
      <Header />
      <section className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <div className="flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-civic-700">
              Curated demo gallery
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Validated sample canvases</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              These checked-in fixtures demonstrate the public beta flows without accounts,
              databases, arbitrary generated UI, or live Miro writes. Each gallery item is a
              validated dashboard JSON rendered through the same approved panel registry as
              the main dashboard.
            </p>
            <p className="mt-3 rounded-md border border-mint/30 bg-mint/10 px-3 py-2 text-xs font-semibold leading-5 text-civic-900">
              Safety proof: gallery dashboards are checked-in dashboard JSON, validated before render,
              and available to open in `/explore` through the same saved-canvas validation path.
            </p>
          </div>
          <div className="w-52 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <Image
              src="/brand/civiccanvas-logo.svg"
              alt="CivicCanvas logo"
              width={208}
              height={208}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
        <GalleryCanvasList canvases={canvases} />
      </section>
    </main>
  );
}
