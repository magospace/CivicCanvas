import { NextResponse } from "next/server";
import { generateCanvasForPrompt } from "../../../../lib/dashboard";
import { apiError, createRequestId } from "../../../../lib/api";
import { getSeedCanvasPrompt } from "../../../../lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId();
  const { id } = await params;
  const prompt = getSeedCanvasPrompt(id);

  if (!prompt) {
    return apiError(new Error("Canvas not found."), { code: "canvas_not_found", status: 404, requestId });
  }

  try {
    return NextResponse.json(await generateCanvasForPrompt(prompt));
  } catch (error) {
    return apiError(error, { code: "canvas_generation_failed", requestId });
  }
}
