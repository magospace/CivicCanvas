import { Sparkles, Wand2 } from "lucide-react";
import type { DataModePreference } from "@texas-data-canvas/shared";

export function PromptBar({
  prompt,
  dataModePreference,
  isGenerating,
  promptExamples,
  suggestionsLabel = "Guided suggestions",
  onPromptChange,
  onDataModePreferenceChange,
  onGenerate
}: {
  prompt: string;
  dataModePreference: DataModePreference;
  isGenerating: boolean;
  promptExamples?: { label: string; prompt: string }[];
  suggestionsLabel?: "AI-assisted suggestions" | "Guided suggestions";
  onPromptChange: (prompt: string) => void;
  onDataModePreferenceChange: (mode: DataModePreference) => void;
  onGenerate: () => void;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-civic-900">
          <Sparkles className="h-4 w-4 text-signal" />
          Ask about Texas public data
        </div>
        <span className="text-xs font-medium text-slate-500">{suggestionsLabel} / governed data mode</span>
      </div>
      <form
        className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          onGenerate();
        }}
      >
        <input
          className="min-h-11 flex-1 rounded-md border border-slate-200 bg-civic-50 px-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-civic-500 focus:bg-white"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          aria-label="Dashboard prompt"
        />
        <label className="grid gap-1.5">
          <span className="sr-only">Data mode</span>
          <select
            aria-label="Data mode"
            value={dataModePreference}
            onChange={(event) => onDataModePreferenceChange(event.target.value as DataModePreference)}
            className="min-h-11 rounded-md border border-slate-200 bg-civic-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-civic-500 focus:bg-white focus:ring-2 focus:ring-civic-700"
          >
            <option value="auto">Auto</option>
            <option value="live">Live public API</option>
            <option value="sample">Sample fallback</option>
          </select>
        </label>
        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-civic-900 px-4 text-sm font-semibold text-white transition hover:bg-civic-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Wand2 className="h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate View"}
        </button>
      </form>
      {promptExamples && promptExamples.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Try:</span>
          {promptExamples.map((example) => (
            <button
              key={example.label}
              type="button"
              onClick={() => onPromptChange(example.prompt)}
              className="rounded-md border border-slate-200 bg-civic-50 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-700"
            >
              {example.label}
            </button>
          ))}
          <span className="text-xs text-slate-500">
            Auto uses live only for verified fields; sample fallback stays available for ZIP, Austin month, and Houston.
          </span>
        </div>
      ) : null}
    </section>
  );
}
