import { describe, expect, it } from "vitest";
import { generateCanvasForPrompt } from "../lib/dashboard";
import { generateMiroExportSpec } from "../lib/miro";

describe("dashboard generation", () => {
  it("generates the Dallas demo dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");

    expect(generation.canvas.title).toContain("Dallas 311");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("ChartBlock");
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("TableBlock");
  });

  it("generates the Austin demo dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Austin building permits by month and ZIP code.");

    expect(generation.canvas.title).toContain("Austin Building Permits");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.canvas.sources[0].datasetId).toBe("austin_building_permits");
  });

  it("returns dataset suggestions for unsupported prompts", async () => {
    const generation = await generateCanvasForPrompt("Compare tax abatements across El Paso.");

    expect(generation.suggestedDatasets?.length).toBeGreaterThan(0);
    expect(generation.audits).toEqual([]);
    expect(generation.canvas.title).toContain("Choose");
  });

  it("exports a preview-only Miro spec with source method frame", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const spec = generateMiroExportSpec({ canvas: generation.canvas, template: "briefing_board" });

    expect(spec.sourceMethodFrameRequired).toBe(true);
    expect(spec.frames.map((frame) => frame.title)).toContain("Source & Method");
  });

  it("applies category filters to Dallas dashboard generation", async () => {
    const generation = await generateCanvasForPrompt(
      "Show Dallas 311 service requests by category and ZIP code for 2024.",
      { category: "Sanitation" }
    );
    const table = generation.canvas.blocks.find((block) => block.type === "TableBlock");

    expect(table?.type).toBe("TableBlock");
    if (table?.type === "TableBlock") {
      expect(table.props.rows.every((row) => row.category === "Sanitation")).toBe(true);
    }
  });
});
