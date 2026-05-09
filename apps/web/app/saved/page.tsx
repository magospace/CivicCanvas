import { Bookmark, Share2 } from "lucide-react";
import { Header } from "../../components/header";

export default function SavedPage() {
  return (
    <main className="min-h-screen bg-civic-50">
      <Header />
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white text-civic-700 shadow-panel">
          <Bookmark className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-ink">Saved canvases</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Saving and sharing are reserved for a later phase. The P1 shell keeps the controls
          visible so the demo shape is honest about where the product is headed.
        </p>
        <div className="mt-8 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-panel">
          <Share2 className="h-4 w-4 text-civic-700" />
          Share/export controls are present in the explorer inspector.
        </div>
      </section>
    </main>
  );
}
