import { AppShell } from "../../components/app-shell";
import { getDatasetCatalog, getPromptExamples } from "../../lib/data";
import { getOpenAIReadiness } from "../../lib/openai-provider";
import { createSeedCanvasDocument } from "../../lib/seed-canvas";

export default function ExplorePage() {
  const datasets = getDatasetCatalog();
  const canvas = createSeedCanvasDocument(datasets);
  const promptExamples = getPromptExamples();
  const aiSuggestionsActive = getOpenAIReadiness().enabled;

  return <AppShell aiSuggestionsActive={aiSuggestionsActive} canvas={canvas} datasets={datasets} promptExamples={promptExamples} />;
}
