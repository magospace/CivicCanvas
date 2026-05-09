import { Bookmark, Share2 } from "lucide-react";
import Link from "next/link";
import { Header } from "../../components/header";
import { SavedCanvases } from "../../components/saved-canvases";

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
          Saved canvases stay browser-local for public beta. Export or copy a portable JSON bundle
          to move dashboards between demos without adding accounts or a hosted database. Share copies
          the validated bundle itself, not a public URL.
        </p>
        <div className="mt-8 grid w-full max-w-3xl gap-3 md:grid-cols-2">
          {[
            "Show Dallas 311 service requests by category and ZIP code for 2024.",
            "Show Austin building permits by month and ZIP code."
          ].map((prompt) => (
            <Link
              key={prompt}
              href="/explore"
              className="rounded-lg border border-slate-200 bg-white p-4 text-left text-sm text-slate-600 shadow-panel transition hover:border-civic-500"
            >
              <div className="mb-2 flex items-center gap-2 font-semibold text-ink">
                <Share2 className="h-4 w-4 text-civic-700" />
                Demo canvas
              </div>
              {prompt}
            </Link>
          ))}
        </div>
        <SavedCanvases />
      </section>
    </main>
  );
}
