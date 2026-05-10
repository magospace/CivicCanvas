import { describe, expect, it } from "vitest";
import { GET as datasetsGET } from "../app/api/datasets/route";
import { GET as datasetGET } from "../app/api/datasets/[id]/route";

describe("dataset catalog API routes", () => {
  it("returns approved dataset catalog metadata without sample rows", async () => {
    const response = datasetsGET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.datasets.map((dataset: { id: string }) => dataset.id)).toEqual(expect.arrayContaining([
      "dallas_311_requests",
      "austin_building_permits",
      "houston_transportation_incidents"
    ]));
    expect(JSON.stringify(body)).not.toContain("sampleRows");
    expect(JSON.stringify(body)).not.toContain("precise_address\":\"123");
  });

  it("returns one approved dataset by id", async () => {
    const response = await datasetGET(new Request("http://localhost/api/datasets/dallas_311_requests"), {
      params: Promise.resolve({ id: "dallas_311_requests" })
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.dataset.id).toBe("dallas_311_requests");
    expect(body.dataset.sourceName).toBe("City of Dallas Open Data");
    expect(body.dataset.fields.every((field: { classification?: string }) => Boolean(field.classification))).toBe(true);
  });

  it("returns governed 404 errors for unknown dataset ids", async () => {
    const response = await datasetGET(new Request("http://localhost/api/datasets/not_approved"), {
      params: Promise.resolve({ id: "not_approved" })
    });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("dataset_not_found");
    expect(JSON.stringify(body)).not.toContain("at ");
  });
});
