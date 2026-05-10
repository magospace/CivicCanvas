import { describe, expect, it } from "vitest";
import { boundedQuerySpecJson, canvasDocumentJson, tableCsv } from "../lib/dashboard-exports";
import { generateCanvasForPrompt } from "../lib/dashboard";
import { zipFeaturesForRows } from "../lib/geography";
import { generateMiroExportSpec } from "../lib/miro";

describe("dashboard exports", () => {
  it("exports a preview-only Miro spec with source method frame", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const spec = generateMiroExportSpec({ canvas: generation.canvas, template: "community_workshop" });

    expect(spec.sourceMethodFrameRequired).toBe(true);
    expect(spec.frames.map((frame) => frame.title)).toContain("Source & Method");
    expect(spec.frames.map((frame) => frame.title)).toContain("Workshop Prompts");
  });

  it("exports governed dashboard artifacts from validated JSON", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const canvasJson = canvasDocumentJson(generation.canvas);
    const specJson = boundedQuerySpecJson(generation.querySpec);
    const csv = tableCsv(generation.canvas);

    expect(JSON.parse(canvasJson).blocks.map((block: { type: string }) => block.type)).toContain("SourceMethodBlock");
    expect(JSON.parse(specJson ?? "{}").datasetId).toBe("dallas_311_requests");
    expect(csv).toContain("request count");
    expect(csv).toContain("Sanitation");
  });

  it("escapes CSV cells and omits unknown ZIP centroids", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const canvas = {
      ...generation.canvas,
      blocks: generation.canvas.blocks.map((block) => {
        if (block.type !== "TableBlock") {
          return block;
        }
        return {
          ...block,
          props: {
            ...block.props,
            rows: [
              {
                ...block.props.rows[0],
                category: "Trash, \"Bulk\""
              }
            ]
          }
        };
      })
    };

    expect(tableCsv(canvas)).toContain("\"Trash, \"\"Bulk\"\"\"");
    expect(zipFeaturesForRows([
      { zip_code: "75201", request_count: 4 },
      { zip_code: "99999", request_count: 3 }
    ], "zip_code")).toEqual([
      expect.objectContaining({ id: "75201", label: "75201" })
    ]);
  });

  it("keeps hidden Houston fields out of client exports", async () => {
    const generation = await generateCanvasForPrompt("Show Houston transportation incidents by ZIP and incident type for 2024.");
    const canvasJson = canvasDocumentJson(generation.canvas);
    const specJson = boundedQuerySpecJson(generation.querySpec);
    const csv = tableCsv(generation.canvas);

    expect(canvasJson).not.toContain("precise_address");
    expect(specJson).not.toContain("precise_address");
    expect(csv).not.toContain("precise_address");
    expect(csv).toContain("incident count");
  });
});
