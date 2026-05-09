import { Sparkles, Wand2 } from "lucide-react";

export function PromptBar() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-civic-900">
          <Sparkles className="h-4 w-4 text-signal" />
          Ask about Texas public data
        </div>
        <span className="text-xs font-medium text-slate-500">P1 shell / sample-first</span>
      </div>
      <form className="flex flex-col gap-3 lg:flex-row">
        <input
          className="min-h-11 flex-1 rounded-md border border-slate-200 bg-civic-50 px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-civic-500 focus:bg-white"
          defaultValue="Show Dallas 311 service requests by category and ZIP code for 2024."
          aria-label="Dashboard prompt"
        />
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-civic-900 px-4 text-sm font-semibold text-white transition hover:bg-civic-700"
        >
          <Wand2 className="h-4 w-4" />
          Generate View
        </button>
      </form>
    </section>
  );
}
