import { NextResponse } from "next/server";
import { getDatasetCatalog } from "../../../../lib/data";
import { assistPromptWithOpenAI, getOpenAIReadiness } from "../../../../lib/openai-provider";

const MOCK_OPENAI_KEY = "mock-openai-smoke-key";

function mockedOpenAIFetch() {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      choices: [
        {
          message: {
            content: JSON.stringify({
              provider: "openai",
              mode: "supported",
              datasetCandidates: ["dallas_311_requests"],
              supportedQueryShape: "approved_dataset_query",
              closestSupportedPrompt: "Show Dallas 311 service requests by category and ZIP code for 2024.",
              explanation: "Dallas 311 is an approved CivicCanvas source; bounded query validation remains authoritative.",
              caveats: ["ZIP dashboards use governed sample fallback when live fields are unavailable."]
            })
          }
        }
      ]
    })
  } as Response);
}

export async function GET() {
  const catalog = getDatasetCatalog();
  const noKey = await assistPromptWithOpenAI({
    prompt: "Show Dallas 311 service requests by category and ZIP code for 2024.",
    catalog,
    env: {},
    fetchImpl: mockedOpenAIFetch
  });
  const mockedLive = await assistPromptWithOpenAI({
    prompt: "Show Dallas 311 service requests by category and ZIP code for 2024.",
    catalog,
    env: { OPENAI_API_KEY: MOCK_OPENAI_KEY, OPENAI_MODEL: "mocked-openai-model" },
    fetchImpl: mockedOpenAIFetch
  });

  return NextResponse.json({
    ok: true,
    network: "not_used",
    liveCalls: 0,
    serverSideOnly: true,
    defaultReadiness: getOpenAIReadiness({}),
    mockedReadiness: getOpenAIReadiness({
      OPENAI_API_KEY: MOCK_OPENAI_KEY,
      OPENAI_MODEL: "mocked-openai-model"
    }),
    noKey: {
      provider: noKey.provider,
      mode: noKey.mode,
      closestSupportedPrompt: noKey.closestSupportedPrompt,
      datasetCandidates: noKey.datasetCandidates
    },
    mockedLive: {
      provider: mockedLive.provider,
      mode: mockedLive.mode,
      closestSupportedPrompt: mockedLive.closestSupportedPrompt,
      datasetCandidates: mockedLive.datasetCandidates
    },
    boundaries: [
      "Default path is deterministic and does not call OpenAI.",
      "Mocked-live smoke validates OpenAI-shaped structured output without network.",
      "Bounded query generation, catalog allowlists, and hidden-field rules remain authoritative."
    ],
    secretEcho: false
  });
}
