import { NextResponse } from "next/server";
import { z } from "zod";
import { canvasDocumentSchema } from "@texas-data-canvas/shared";
import { apiError, createRequestId, parseJsonRequest } from "../../../../lib/api";

const requestSchema = z.object({ canvas: z.unknown() });

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const body = await parseJsonRequest(request, requestSchema);
    const canvas = canvasDocumentSchema.parse(body.canvas);

    return NextResponse.json({
      saved: true,
      canvasId: canvas.id,
      note: "Server route validates CanvasDocument; browser-local persistence is handled by the client saved-canvas workflow."
    });
  } catch (error) {
    return apiError(error, { code: "canvas_save_failed", requestId });
  }
}
