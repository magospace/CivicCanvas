import { NextResponse } from "next/server";
import { z } from "zod";
import { dataModePreferenceSchema } from "@texas-data-canvas/shared";
import { generateCanvasForPrompt } from "../../../../lib/dashboard";
import { apiError, createRequestId, parseJsonRequest } from "../../../../lib/api";

const requestSchema = z.object({
  prompt: z.string().min(1),
  filters: z.record(z.string()).default({}),
  dataModePreference: dataModePreferenceSchema.default("auto")
});

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const { prompt, filters, dataModePreference } = await parseJsonRequest(request, requestSchema);
    return NextResponse.json(await generateCanvasForPrompt(prompt, filters, dataModePreference));
  } catch (error) {
    return apiError(error, { code: "canvas_generation_failed", requestId });
  }
}
