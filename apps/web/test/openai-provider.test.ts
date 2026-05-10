import { describe, expect, it, vi } from "vitest";
import { getDatasetCatalog, getSampleRows } from "../lib/data";
import {
  assistPromptWithOpenAI,
  getOpenAIReadiness,
  summarizeQueryResultWithOpenAI
} from "../lib/openai-provider";
import { executeBoundedQuery } from "@texas-data-canvas/shared";

const catalog = getDatasetCatalog();

function jsonResponse(body: unknown) {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(body)
  } as Response);
}

describe("server-only OpenAI provider boundary", () => {
  it("falls back deterministically when OPENAI_API_KEY is missing", async () => {
    const fetchMock = vi.fn();

    const result = await assistPromptWithOpenAI({
      prompt: "Which Dallas datasets can I use?",
      catalog,
      env: {},
      fetchImpl: fetchMock
    });

    expect(getOpenAIReadiness({}).keyStatus).toBe("missing");
    expect(result.provider).toBe("deterministic_fallback");
    expect(result.closestSupportedPrompt).toContain("Dallas 311");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back deterministically when OpenAI returns invalid schema output", async () => {
    const fetchMock = vi.fn(() => jsonResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              provider: "openai",
              mode: "supported",
              datasetCandidates: ["dallas_311_requests"],
              supportedQueryShape: "arbitrary_sql",
              closestSupportedPrompt: "SELECT * FROM private_people",
              explanation: "Use arbitrary SQL",
              caveats: []
            })
          }
        }
      ]
    }));

    const result = await assistPromptWithOpenAI({
      prompt: "Write SQL against private people tables",
      catalog,
      env: { OPENAI_API_KEY: "sk-test-secret" },
      fetchImpl: fetchMock
    });

    expect(result.provider).toBe("deterministic_fallback");
    expect(result.mode).toBe("unsupported");
    expect(JSON.stringify(result)).not.toContain("SELECT");
    expect(JSON.stringify(result)).not.toContain("sk-test-secret");
  });

  it("does not leak OPENAI_API_KEY in readiness or fallback artifacts", async () => {
    const secret = "sk-test-secret-123";
    const fetchMock = vi.fn(() => jsonResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              provider: "openai",
              mode: "supported",
              datasetCandidates: ["dallas_311_requests"],
              supportedQueryShape: "approved_dataset_query",
              closestSupportedPrompt: "Show Dallas 311 service requests by category and ZIP code for 2024.",
              explanation: "Dallas 311 is approved for governed aggregate dashboards.",
              caveats: ["ZIP dashboards may use sample fallback."]
            })
          }
        }
      ]
    }));

    const result = await assistPromptWithOpenAI({
      prompt: "Dallas service request dashboard",
      catalog,
      env: { OPENAI_API_KEY: secret },
      fetchImpl: fetchMock
    });
    const readiness = getOpenAIReadiness({ OPENAI_API_KEY: secret });

    expect(readiness.keyStatus).toBe("present");
    expect(readiness.enabled).toBe(true);
    expect(JSON.stringify(readiness)).not.toContain(secret);
    expect(JSON.stringify(result)).not.toContain(secret);
    expect(JSON.stringify(result).toLowerCase()).not.toContain("authorization");
  });

  it("uses a mocked OpenAI response after schema validation on the happy path", async () => {
    const fetchMock = vi.fn(() => jsonResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              provider: "openai",
              mode: "supported",
              datasetCandidates: ["austin_building_permits"],
              supportedQueryShape: "approved_dataset_query",
              closestSupportedPrompt: "Show Austin building permits by month and ZIP code for 2024.",
              explanation: "Austin permits are an approved catalog source; monthly ZIP dashboards are governed sample-first today.",
              caveats: ["Use validated query results and source caveats."]
            })
          }
        }
      ]
    }));

    const result = await assistPromptWithOpenAI({
      prompt: "Can I explore Austin construction activity?",
      catalog,
      env: { OPENAI_API_KEY: "sk-test-secret" },
      fetchImpl: fetchMock
    });

    expect(result.provider).toBe("openai");
    expect(result.datasetCandidates).toEqual(["austin_building_permits"]);
    expect(result.closestSupportedPrompt).toContain("Austin building permits");
  });

  it("rejects non-catalog dataset selections and preserves unsupported prompt boundaries", async () => {
    const fetchMock = vi.fn(() => jsonResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              provider: "openai",
              mode: "supported",
              datasetCandidates: ["non_catalog_private_dataset"],
              supportedQueryShape: "approved_dataset_query",
              closestSupportedPrompt: "Build a dashboard from private payroll data.",
              explanation: "This should not be accepted.",
              caveats: []
            })
          }
        }
      ]
    }));

    const result = await assistPromptWithOpenAI({
      prompt: "Build a private payroll dashboard",
      catalog,
      env: { OPENAI_API_KEY: "sk-test-secret" },
      fetchImpl: fetchMock
    });

    expect(result.provider).toBe("deterministic_fallback");
    expect(result.mode).toBe("unsupported");
    expect(result.datasetCandidates).not.toContain("non_catalog_private_dataset");
    expect(result.explanation).toContain("approved Dallas 311, Austin permits, or Houston transportation workflows");
  });

  it("does not expose hidden sensitive fields in prompt assist fallback", async () => {
    const result = await assistPromptWithOpenAI({
      prompt: "Show Houston precise address and exact location for every traffic incident",
      catalog,
      env: {},
      fetchImpl: vi.fn()
    });

    expect(result.provider).toBe("deterministic_fallback");
    expect(result.mode).toBe("unsupported");
    expect(result.blockedReason).toContain("sensitive");
    expect(JSON.stringify(result)).not.toContain("precise_address");
  });

  it("grounds source-aware summaries in validated query results and falls back on invalid model output", async () => {
    const queryResult = executeBoundedQuery({
      catalog,
      rows: getSampleRows("dallas_311_requests"),
      spec: {
        schemaVersion: "1.0",
        datasetId: "dallas_311_requests",
        mode: "sample_only",
        filters: [],
        groupBy: ["category"],
        metrics: [{ type: "count", alias: "request_count" }],
        orderBy: [{ field: "request_count", direction: "desc" }],
        limit: 3
      },
      dataMode: "sample"
    }).result;
    const fetchMock = vi.fn(() => jsonResponse({
      choices: [
        {
          message: {
            content: JSON.stringify({
              provider: "openai",
              summary: "Unsupported causation claim without caveats."
            })
          }
        }
      ]
    }));

    const result = await summarizeQueryResultWithOpenAI({
      queryResult,
      env: { OPENAI_API_KEY: "sk-test-secret" },
      fetchImpl: fetchMock
    });

    expect(result.provider).toBe("deterministic_fallback");
    expect(result.summary).toContain(queryResult.source.datasetTitle);
    expect(result.sourceDatasetIds).toEqual(["dallas_311_requests"]);
    expect(result.caveats.length).toBeGreaterThan(0);
  });
});
