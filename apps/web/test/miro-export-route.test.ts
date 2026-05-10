import { describe, expect, it } from "vitest";
import { POST as miroExportPOST } from "../app/api/export/miro-spec/route";
import { generateCanvasForPrompt } from "../lib/dashboard";

describe("Miro export route", () => {
  it("returns a preview-only Miro export spec for a valid governed canvas", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const response = await miroExportPOST(new Request("http://localhost/api/export/miro-spec", {
      method: "POST",
      body: JSON.stringify({
        canvas: generation.canvas,
        template: "community_workshop"
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.note).toContain("Preview-only");
    expect(body.note).toContain("No Miro board write");
    expect(body.spec.template).toBe("community_workshop");
    expect(body.spec.sourceMethodFrameRequired).toBe(true);
    expect(body.spec.frames.map((frame: { title: string }) => frame.title)).toContain("Source & Method");
    expect(JSON.stringify(body)).not.toContain("accessToken");
    expect(JSON.stringify(body)).not.toContain("oauth");
    expect(JSON.stringify(body)).not.toContain("oauthUrl");
    expect(JSON.stringify(body)).not.toContain("boardId");
    expect(JSON.stringify(body)).not.toContain("boardWriteUrl");
    expect(JSON.stringify(body).toLowerCase()).not.toContain("modelprovider");
  });

  it("returns governed errors for invalid Miro export canvases", async () => {
    const response = await miroExportPOST(new Request("http://localhost/api/export/miro-spec", {
      method: "POST",
      body: JSON.stringify({
        canvas: { blocks: [{ type: "UnknownBlock" }] },
        template: "briefing_board"
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("miro_export_failed");
    expect(JSON.stringify(body)).not.toContain("at ");
  });

  it("returns governed errors for malformed Miro export requests", async () => {
    const response = await miroExportPOST(new Request("http://localhost/api/export/miro-spec", {
      method: "POST",
      body: JSON.stringify({
        canvas: {},
        template: "write_to_board_now"
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("miro_export_failed");
    expect(JSON.stringify(body)).not.toContain("at ");
  });
});
