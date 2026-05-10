import { NextResponse } from "next/server";
import { z } from "zod";
import { canvasDocumentSchema } from "@texas-data-canvas/shared";
import { apiError, createRequestId, parseJsonRequest } from "../../../../lib/api";

const requestSchema = z.object({ canvas: canvasDocumentSchema });

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const { canvas } = await parseJsonRequest(request, requestSchema);

    return NextResponse.json({
      saved: true,
      canvasId: canvas.id,
      note: "Server route validates CanvasDocument; browser-local persistence is handled by the client saved-canvas workflow."
    });
  } catch (error) {
    return apiError(error, { code: "canvas_save_failed", requestId });
  }
}
