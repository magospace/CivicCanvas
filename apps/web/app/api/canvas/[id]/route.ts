import { NextResponse } from "next/server";
import { generateCanvasForPrompt } from "../../../../lib/dashboard";
import { apiError, createRequestId } from "../../../../lib/api";

const savedCanvases = {
  canvas_dallas_311_seed: "Show Dallas 311 service requests by category and ZIP code for 2024.",
  canvas_austin_permits_seed: "Show Austin building permits by month and ZIP code."
};

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId();
  const { id } = await params;
  const prompt = savedCanvases[id as keyof typeof savedCanvases];

  if (!prompt) {
    return apiError(new Error("Canvas not found."), { code: "canvas_not_found", status: 404, requestId });
  }

  try {
    return NextResponse.json(await generateCanvasForPrompt(prompt));
  } catch (error) {
    return apiError(error, { code: "canvas_generation_failed", requestId });
  }
}
