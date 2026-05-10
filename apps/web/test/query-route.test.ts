import { describe, expect, it } from "vitest";
import { POST as queryPOST } from "../app/api/query/route";

describe("query API route", () => {
  it("executes a valid BoundedQuerySpec against approved sample data", async () => {
    const response = await queryPOST(new Request("http://localhost/api/query", {
      method: "POST",
      body: JSON.stringify({
        datasetId: "dallas_311_requests",
        mode: "sample_only",
        groupBy: ["category"],
        metrics: [{ type: "count", alias: "request_count" }],
        orderBy: [{ field: "request_count", direction: "desc" }],
        limit: 5
      })
    }));
    const body = await response.json() as {
      result: {
        datasetId: string;
        resultType: string;
        dataMode: string;
        rows: Array<Record<string, string | number | boolean | null>>;
        columns: Array<{ field: string }>;
      };
      audit: {
        datasetId: string;
        aggregation: boolean;
        rowLimit: number;
        fieldsUsed: string[];
      };
    };

    expect(response.status).toBe(200);
    expect(body.result.datasetId).toBe("dallas_311_requests");
    expect(body.result.resultType).toBe("aggregate");
    expect(body.result.dataMode).toBe("sample");
    expect(body.result.rows.length).toBeGreaterThan(0);
    expect(body.result.rows.length).toBeLessThanOrEqual(5);
    expect(body.result.rows[0]).toHaveProperty("category");
    expect(body.result.rows[0]).toHaveProperty("request_count");
    expect(body.result.columns.map((column) => column.field)).toEqual(["category", "request_count"]);
    expect(body.audit.datasetId).toBe("dallas_311_requests");
    expect(body.audit.aggregation).toBe(true);
    expect(body.audit.rowLimit).toBe(5);
    expect(body.audit.fieldsUsed).toEqual(expect.arrayContaining(["category", "request_count"]));
  });

  it("rejects invalid request bodies before query execution", async () => {
    const response = await queryPOST(new Request("http://localhost/api/query", {
      method: "POST",
      body: JSON.stringify({
        datasetId: "dallas_311_requests",
        metrics: []
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
    expect(body.error.code).toBe("query_failed");
    expect(body.error.message).toBe("Request validation failed.");
    expect(body.error.issues?.map((issue) => issue.path.join("."))).toContain("metrics");
    expect(JSON.stringify(body)).not.toContain("/Users/");
    expect(body.error.message).not.toContain("Error:");
  });

  it("returns governed public errors for disallowed fields", async () => {
    const response = await queryPOST(new Request("http://localhost/api/query", {
      method: "POST",
      body: JSON.stringify({
        datasetId: "dallas_311_requests",
        groupBy: ["private_field"],
        metrics: [{ type: "count", alias: "request_count" }],
        limit: 10
      })
    }));
    const body = await response.json() as {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("query_failed");
    expect(body.error.message).toContain("not allowlisted");
    expect(body.error.message).toContain("dallas_311_requests");
    expect(JSON.stringify(body)).not.toContain("/Users/");
    expect(JSON.stringify(body)).not.toContain("at ");
  });
});
