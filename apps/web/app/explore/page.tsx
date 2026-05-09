import { AppShell } from "../../components/app-shell";
import { getDatasetCatalog } from "../../lib/data";
import { createSeedCanvasDocument } from "../../lib/seed-canvas";

export default function ExplorePage() {
  const datasets = getDatasetCatalog();
  const canvas = createSeedCanvasDocument(datasets);

  return <AppShell canvas={canvas} datasets={datasets} />;
}
