import { NextResponse } from "next/server";
import { z } from "zod";
import { generateMiroExportSpec } from "../../../../lib/miro";
import { apiError, createRequestId, parseJsonRequest } from "../../../../lib/api";

const requestSchema = z.object({
  canvas: z.unknown(),
  template: z.enum(["briefing_board", "slide_deck", "community_workshop"]).default("briefing_board")
});

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const body = await parseJsonRequest(request, requestSchema);
    const spec = generateMiroExportSpec({
      canvas: body.canvas,
      template: body.template ?? "briefing_board"
    });

    return NextResponse.json({
      spec,
      note: "Preview-only MiroExportSpec. No Miro board write is performed in MVP."
    });
  } catch (error) {
    return apiError(error, { code: "miro_export_failed", requestId });
  }
}
