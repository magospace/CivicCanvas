import { NextResponse } from "next/server";
import { canvasDocumentSchema } from "@texas-data-canvas/shared";

export async function POST(request: Request) {
  try {
    const canvas = canvasDocumentSchema.parse((await request.json()).canvas);

    return NextResponse.json({
      saved: true,
      canvasId: canvas.id,
      note: "Server route validates CanvasDocument; browser-local persistence is handled by the client saved-canvas workflow."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canvas save failed." },
      { status: 400 }
    );
  }
}
