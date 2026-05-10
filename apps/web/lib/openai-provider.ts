import {
  parsePromptIntent,
  promptAssistResultSchema,
  sourceAwareSummarySchema,
  type DatasetMetadata,
  type PromptAssistResult,
  type QueryResult,
  type SourceAwareSummary
} from "@texas-data-canvas/shared";
import { getPromptExamples } from "./data";

const OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

function supportedPromptSuggestions() {
  return getPromptExamples().map((example) => example.prompt);
}

type EnvLike = Partial<Record<string, string | undefined>>;
type FetchLike = typeof fetch;

export type OpenAIReadiness = {
  provider: "openai";
  enabled: boolean;
  keyStatus: "present" | "missing";
  serverSideOnly: true;
  model: string;
  defaultLocalFallback: "deterministic";
  secretEcho: false;
};

export function getOpenAIReadiness(env: EnvLike = process.env): OpenAIReadiness {
  const keyPresent = Boolean(env.OPENAI_API_KEY?.trim());

  return {
    provider: "openai",
    enabled: keyPresent,
    keyStatus: keyPresent ? "present" : "missing",
    serverSideOnly: true,
    model: env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
    defaultLocalFallback: "deterministic",
    secretEcho: false
  };
}

function catalogIds(catalog: DatasetMetadata[]) {
  return new Set(catalog.map((dataset) => dataset.id));
}

function containsSensitivePrompt(prompt: string) {
  return /\b(name|phone|email|address|street address|exact address|precise address|exact location|precise location|raw location|raw incident|applicant|contractor|personal|private)\b/i.test(prompt);
}

function deterministicPromptAssist(prompt: string, catalog: DatasetMetadata[]): PromptAssistResult {
  const intent = parsePromptIntent({ prompt, catalog });
  const hasApprovedDataset = intent.datasetCandidates.some((datasetId) => catalogIds(catalog).has(datasetId));
  const sensitive = containsSensitivePrompt(prompt) || intent.rejectedFields.length > 0;
  const mode = hasApprovedDataset && !sensitive ? "supported" : "unsupported";
  const suggestions = supportedPromptSuggestions();
  const closestSupportedPrompt = suggestions.find((suggestion) => {
    const city = intent.city?.toLowerCase();
    return city ? suggestion.toLowerCase().includes(city) : false;
  }) ?? suggestions[0];

  return promptAssistResultSchema.parse({
    provider: "deterministic_fallback",
    mode,
    datasetCandidates: mode === "supported" ? intent.datasetCandidates.filter((datasetId) => catalogIds(catalog).has(datasetId)).slice(0, 3) : [],
    supportedQueryShape: mode === "supported" ? "approved_dataset_query" : "unsupported_refusal",
    closestSupportedPrompt,
    explanation: mode === "supported"
      ? "The deterministic parser matched an approved catalog dataset and will still use the bounded query engine as authority."
      : "This prompt is outside the approved Dallas 311, Austin permits, or Houston transportation workflows; governed suggestions are returned instead of an arbitrary dashboard.",
    blockedReason: mode === "unsupported"
      ? sensitive
        ? "Prompt requested sensitive or hidden fields; only approved aggregate/public fields can be summarized."
        : "Prompt did not match an approved catalog dataset or supported query shape."
      : undefined,
    caveats: [
      "Deterministic parser and bounded query validation remain authoritative.",
      "OpenAI cannot select non-catalog datasets, arbitrary SQL, executable code, or hidden fields."
    ]
  });
}

function deterministicSourceSummary(queryResult: QueryResult): SourceAwareSummary {
  return sourceAwareSummarySchema.parse({
    provider: "deterministic_fallback",
    summary: `${queryResult.source.datasetTitle} returned ${queryResult.rows.length} validated ${queryResult.resultType} rows in ${queryResult.dataMode} mode. The summary is grounded in the checked QueryResult and SourceAttribution only.`,
    caveats: queryResult.caveats.length > 0
      ? queryResult.caveats
      : ["No additional source caveats were supplied with this validated query result."],
    sourceDatasetIds: [queryResult.datasetId],
    dataMode: queryResult.dataMode,
    unsupportedClaimsAvoided: true
  });
}

function extractAssistantJson(responseBody: unknown) {
  if (!responseBody || typeof responseBody !== "object" || !("choices" in responseBody) || !Array.isArray(responseBody.choices)) {
    throw new Error("OpenAI response did not include choices.");
  }

  const content = responseBody.choices[0]?.message?.content;
  if (typeof content !== "string") {
    throw new Error("OpenAI response did not include message content.");
  }

  return JSON.parse(content) as unknown;
}

async function callOpenAIJson({
  apiKey,
  model,
  systemPrompt,
  userPayload,
  fetchImpl
}: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPayload: unknown;
  fetchImpl: FetchLike;
}) {
  const response = await fetchImpl(OPENAI_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPayload) }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed.");
  }

  return extractAssistantJson(await response.json());
}

function validateCatalogDatasetIds(result: PromptAssistResult, catalog: DatasetMetadata[]) {
  const allowed = catalogIds(catalog);
  return result.datasetCandidates.every((datasetId) => allowed.has(datasetId));
}

export async function assistPromptWithOpenAI({
  prompt,
  catalog,
  env = process.env,
  fetchImpl = fetch
}: {
  prompt: string;
  catalog: DatasetMetadata[];
  env?: EnvLike;
  fetchImpl?: FetchLike;
}): Promise<PromptAssistResult> {
  const readiness = getOpenAIReadiness(env);
  const fallback = () => deterministicPromptAssist(prompt, catalog);
  const apiKey = env.OPENAI_API_KEY?.trim();

  if (!readiness.enabled || !apiKey) {
    return fallback();
  }

  try {
    const parsed = promptAssistResultSchema.parse(await callOpenAIJson({
      apiKey,
      model: readiness.model,
      fetchImpl,
      systemPrompt: [
        "You help map civic-data prompts to approved CivicCanvas workflows.",
        "Return only JSON matching PromptAssistResult.",
        "Never return SQL, executable dashboard code, non-catalog datasets, hidden fields, or policy/causation claims.",
        "The deterministic parser and bounded query engine remain authoritative."
      ].join(" "),
      userPayload: {
        prompt,
        approvedDatasetIds: catalog.map((dataset) => dataset.id),
        supportedQueryShapes: ["approved_dataset_query", "catalog_discovery", "unsupported_refusal"],
        supportedPromptSuggestions: supportedPromptSuggestions(),
      }
    }));

    if (parsed.provider !== "openai" || !validateCatalogDatasetIds(parsed, catalog)) {
      return fallback();
    }

    return parsed;
  } catch {
    return fallback();
  }
}

export async function summarizeQueryResultWithOpenAI({
  queryResult,
  env = process.env,
  fetchImpl = fetch
}: {
  queryResult: QueryResult;
  env?: EnvLike;
  fetchImpl?: FetchLike;
}): Promise<SourceAwareSummary> {
  const readiness = getOpenAIReadiness(env);
  const fallback = () => deterministicSourceSummary(queryResult);
  const apiKey = env.OPENAI_API_KEY?.trim();

  if (!readiness.enabled || !apiKey) {
    return fallback();
  }

  try {
    const parsed = sourceAwareSummarySchema.parse(await callOpenAIJson({
      apiKey,
      model: readiness.model,
      fetchImpl,
      systemPrompt: [
        "Summarize only validated CivicCanvas QueryResult and SourceAttribution JSON.",
        "Return only JSON matching SourceAwareSummary.",
        "Include caveats and avoid unsupported causation, policy claims, arbitrary SQL, code, or hidden fields."
      ].join(" "),
      userPayload: {
        queryResult: {
          datasetId: queryResult.datasetId,
          resultType: queryResult.resultType,
          dataMode: queryResult.dataMode,
          rowCount: queryResult.rows.length,
          columns: queryResult.columns,
          rows: queryResult.rows.slice(0, 10),
          source: queryResult.source,
          caveats: queryResult.caveats
        }
      }
    }));

    if (parsed.provider !== "openai" || !parsed.sourceDatasetIds.includes(queryResult.datasetId)) {
      return fallback();
    }

    return parsed;
  } catch {
    return fallback();
  }
}
