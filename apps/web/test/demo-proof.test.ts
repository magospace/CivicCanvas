import { describe, expect, it } from "vitest";
import { generateCanvasForPrompt } from "../lib/dashboard";

function sourceMethodBlockTypes(blocks: Array<{ type: string }>) {
  return blocks.filter((block) => block.type === "SourceMethodBlock").map((block) => block.type);
}

describe("core judge demo proof", () => {
  it("preserves honest data modes, caveats, and attribution for exact demo prompts", async () => {
    const dallas = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    expect(dallas.requestedDataMode).toBe("auto");
    expect(dallas.dataMode).toBe("fallback");
    expect(dallas.fallbackReason).toContain("zip_code");
    expect(dallas.canvas.sources[0]).toEqual(expect.objectContaining({
      datasetId: "dallas_311_requests",
      dataMode: "fallback",
      sourceName: "City of Dallas Open Data"
    }));
    expect(dallas.canvas.sources[0].caveats.join(" ")).toContain("Approved sample fallback");
    expect(sourceMethodBlockTypes(dallas.canvas.blocks)).toEqual(["SourceMethodBlock"]);

    const austin = await generateCanvasForPrompt("Show Austin building permits by month and ZIP code for 2024.");
    expect(austin.requestedDataMode).toBe("auto");
    expect(austin.dataMode).toBe("sample");
    expect(austin.fallbackReason).toBeUndefined();
    expect(austin.canvas.sources[0]).toEqual(expect.objectContaining({
      datasetId: "austin_building_permits",
      dataMode: "sample",
      sourceName: "City of Austin Open Data"
    }));
    expect(austin.canvas.sources[0].caveats.join(" ")).toContain("Sample fallback remains available");
    expect(sourceMethodBlockTypes(austin.canvas.blocks)).toEqual(["SourceMethodBlock"]);

    const houston = await generateCanvasForPrompt("Show Houston transportation incidents by ZIP and incident type for 2024.");
    expect(houston.requestedDataMode).toBe("auto");
    expect(houston.dataMode).toBe("sample");
    expect(houston.fallbackReason).toBeUndefined();
    expect(houston.canvas.sources[0]).toEqual(expect.objectContaining({
      datasetId: "houston_transportation_incidents",
      dataMode: "sample",
      sourceName: "Houston TranStar Traffic Data Feeds"
    }));
    expect(houston.canvas.sources[0].caveats.join(" ")).toContain("sample-first");
    expect(JSON.stringify(houston.canvas)).not.toContain("precise_address");
    expect(sourceMethodBlockTypes(houston.canvas.blocks)).toEqual(["SourceMethodBlock"]);
  });

  it("keeps explicit live requests honest when core demo data cannot be promoted", async () => {
    const austinLive = await generateCanvasForPrompt(
      "Show Austin building permits by month and ZIP code for 2024.",
      {},
      "live"
    );
    expect(austinLive.requestedDataMode).toBe("live");
    expect(austinLive.dataMode).toBe("fallback");
    expect(austinLive.fallbackReason).toContain("not live-enabled");
    expect(austinLive.canvas.sources[0].caveats.join(" ")).toContain("Approved sample fallback");

    const houstonLive = await generateCanvasForPrompt(
      "Show Houston transportation incidents by ZIP and incident type for 2024.",
      {},
      "live"
    );
    expect(houstonLive.requestedDataMode).toBe("live");
    expect(houstonLive.dataMode).toBe("fallback");
    expect(houstonLive.fallbackReason).toContain("not live-enabled");
    expect(JSON.stringify(houstonLive.canvas)).not.toContain("precise_address");
  });
});
