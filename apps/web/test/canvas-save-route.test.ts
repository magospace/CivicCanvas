import { describe, expect, it } from "vitest";
import { validateCanvasDocument } from "@texas-data-canvas/shared";
import { POST as canvasSavePOST } from "../app/api/canvas/save/route";

function createValidCanvas() {
  const source = {
    datasetId: "dallas_311_requests",
    datasetTitle: "Dallas 311 Service Requests",
    sourceName: "City of Dallas Open Data",
    sourceUrl: "https://www.dallasopendata.com/",
    accessedAt: "2026-05-09T00:00:00.000Z",
    fieldsUsed: ["month"],
    filtersApplied: [],
    queryMethod: "Test",
    caveats: ["Sample data"],
    license: "Source terms"
  };

  return validateCanvasDocument({
    id: "canvas_save_validation_stub",
    title: "Canvas Save Validation Stub",
    createdAt: "2026-05-09T00:00:00.000Z",
    updatedAt: "2026-05-09T00:00:00.000Z",
    sources: [source],
    queries: [],
    blocks: [
      {
        id: "summary",
        type: "SummaryBlock",
        props: { heading: "Summary", text: "Safe summary", bullets: [] }
      },
      {
        id: "source",
        type: "SourceMethodBlock",
        props: { attribution: source, methodology: "Safe validation method" }
      }
    ]
  });
}

describe("canvas save API validation stub", () => {
  it("validates a CanvasDocument while stating persistence remains browser-local", async () => {
    const canvas = createValidCanvas();
    const response = await canvasSavePOST(new Request("http://localhost/api/canvas/save", {
      method: "POST",
      body: JSON.stringify({ canvas })
    }));
    const body = await response.json() as {
      saved: boolean;
      canvasId: string;
      note: string;
    };

    expect(response.status).toBe(200);
    expect(body.saved).toBe(true);
    expect(body.canvasId).toBe(canvas.id);
    expect(body.note).toContain("validates CanvasDocument");
    expect(body.note).toContain("browser-local persistence");
    expect(JSON.stringify(body).toLowerCase()).not.toContain("database");
    expect(JSON.stringify(body).toLowerCase()).not.toContain("object-store");
    expect(JSON.stringify(body).toLowerCase()).not.toContain("public share service");
  });

  it("rejects invalid canvases through structured route validation", async () => {
    const response = await canvasSavePOST(new Request("http://localhost/api/canvas/save", {
      method: "POST",
      body: JSON.stringify({
        canvas: {
          id: "invalid_canvas_save",
          title: "Invalid canvas",
          blocks: []
        }
      })
    }));
    const body = await response.json() as {
      ok: false;
      error: {
        code: string;
        message: string;
        issues?: Array<{ path: string[]; message: string }>;
      };
    };

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("canvas_save_failed");
    expect(body.error.message).toBe("Request validation failed.");
    expect(body.error.issues?.map((issue) => issue.path.join("."))).toEqual(expect.arrayContaining([
      "createdAt",
      "updatedAt",
      "blocks",
      "sources"
    ]));
  });
});
