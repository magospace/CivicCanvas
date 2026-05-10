import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateCanvasDocument, type CanvasBlock } from "@texas-data-canvas/shared";
import { getCuratedGalleryCanvases, getDatasetCatalog } from "../lib/data";

const allowedGalleryBlockTypes = new Set<CanvasBlock["type"]>([
  "SummaryBlock",
  "MetricBlock",
  "ChartBlock",
  "MapBlock",
  "TableBlock",
  "FilterBlock",
  "SourceMethodBlock",
  "DatasetCardBlock"
]);

function galleryFixtureFiles() {
  return readdirSync(join(process.cwd(), "data/gallery"))
    .filter((fileName) => fileName.endsWith(".canvas.json"))
    .sort();
}

describe("gallery fixture data realism", () => {
  it("loads every gallery fixture through the shared data loader", () => {
    const fixtureFiles = galleryFixtureFiles();
    const canvases = getCuratedGalleryCanvases();

    expect(canvases).toHaveLength(fixtureFiles.length);
    expect(canvases.map((canvas) => canvas.id).sort()).toEqual([
      "gallery_austin_permits_sample",
      "gallery_dallas_311_sample",
      "gallery_houston_transportation_sample",
      "gallery_unsupported_sensitive_prompt"
    ]);
    expect(canvases.every((canvas) => canvas.blocks.some((block) => block.type === "SourceMethodBlock"))).toBe(true);
  });

  it("validates checked-in gallery JSON and keeps hidden fields out", () => {
    const catalog = getDatasetCatalog();
    const approvedDatasetIds = new Set(catalog.map((dataset) => dataset.id));
    const hiddenOrReviewFields = catalog.flatMap((dataset) =>
      dataset.fields
        .filter((field) => ["sensitive_hide", "unknown_review"].includes(field.classification))
        .map((field) => field.name)
    );

    expect(hiddenOrReviewFields).toContain("precise_address");

    for (const fileName of galleryFixtureFiles()) {
      const raw = JSON.parse(readFileSync(join(process.cwd(), "data/gallery", fileName), "utf8"));
      const canvas = validateCanvasDocument(raw);
      const serialized = JSON.stringify(canvas);

      expect(canvas.blocks.every((block) => allowedGalleryBlockTypes.has(block.type)), fileName).toBe(true);
      expect(canvas.blocks.some((block) => block.type === "SourceMethodBlock"), fileName).toBe(true);

      for (const fieldName of hiddenOrReviewFields) {
        expect(serialized, `${fileName} should not expose hidden/review field ${fieldName}`).not.toContain(fieldName);
      }

      for (const source of canvas.sources) {
        if (source.datasetId === "catalog_suggestions") {
          expect(canvas.id).toBe("gallery_unsupported_sensitive_prompt");
        } else {
          expect(approvedDatasetIds.has(source.datasetId), `${fileName} source ${source.datasetId} must be approved`).toBe(true);
        }
        expect(source.sourceName.length, fileName).toBeGreaterThan(0);
        expect(source.sourceUrl).toMatch(/^https?:\/\//);
        expect(source.caveats.length, fileName).toBeGreaterThan(0);
      }
    }
  });

  it("keeps gallery fixture paths out of route and component code", () => {
    const scannedFiles = [
      "apps/web/app/gallery/page.tsx",
      "apps/web/components/gallery-canvas-list.tsx"
    ];

    for (const filePath of scannedFiles) {
      const source = readFileSync(join(process.cwd(), filePath), "utf8");
      expect(source, `${filePath} must not import gallery fixture files directly`).not.toContain("data/gallery");
      expect(source, `${filePath} must not name concrete gallery fixture JSON files`).not.toMatch(/\.canvas\.json/);
    }

    expect(readFileSync(join(process.cwd(), "apps/web/app/gallery/page.tsx"), "utf8")).toContain("getCuratedGalleryCanvases");
  });
});
