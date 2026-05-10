import { describe, expect, it } from "vitest";
import { validateCanvasDocument } from "@texas-data-canvas/shared";
import { getSeedCanvasPrompt } from "../lib/data";
import { GET as canvasSeedGET } from "../app/api/canvas/[id]/route";

function getSeedCanvas(id: string) {
  return canvasSeedGET(new Request(`http://localhost/api/canvas/${id}`), {
    params: Promise.resolve({ id })
  });
}

describe("canvas seed API demo helper", () => {
  it("loads seed prompts through the repo data loader instead of route-local mocks", () => {
    expect(getSeedCanvasPrompt("canvas_dallas_311_seed")).toBe("Show Dallas 311 service requests by category and ZIP code for 2024.");
    expect(getSeedCanvasPrompt("canvas_not_in_seed_map")).toBeUndefined();
  });

  it("returns a generated demo canvas for a fixture-backed seed ID instead of stored persistence", async () => {
    const response = await getSeedCanvas("canvas_dallas_311_seed");
    const body = await response.json() as {
      canvas: unknown;
      audits: unknown[];
      requestedDataMode?: string;
      dataMode?: string;
    };
    const canvas = validateCanvasDocument(body.canvas);

    expect(response.status).toBe(200);
    expect(canvas.id).toMatch(/^canvas_dallas_311_requests_/);
    expect(canvas.id).not.toBe("canvas_dallas_311_seed");
    expect(canvas.prompt).toBe("Show Dallas 311 service requests by category and ZIP code for 2024.");
    expect(canvas.sources[0].datasetId).toBe("dallas_311_requests");
    expect(canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(body.audits.length).toBeGreaterThan(0);
    expect(body.requestedDataMode).toBe("auto");
    expect(body.dataMode).toBe("fallback");
  });

  it("returns 404 for unknown IDs because the route is only a seed/demo helper", async () => {
    const response = await getSeedCanvas("canvas_not_in_seed_map");
    const body = await response.json() as {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

    expect(response.status).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("canvas_not_found");
    expect(body.error.message).toBe("Request failed.");
    expect(JSON.stringify(body)).not.toContain("canvas_not_in_seed_map");
    expect(JSON.stringify(body)).not.toContain("/Users/");
  });
});
