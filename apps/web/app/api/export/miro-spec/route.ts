import { NextResponse } from "next/server";
import { z } from "zod";
import { generateMiroExportSpec } from "../../../../lib/miro";

const requestSchema = z.object({
  canvas: z.unknown(),
  template: z.enum(["briefing_board", "slide_deck", "community_workshop"]).default("briefing_board")
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const spec = generateMiroExportSpec({
      canvas: body.canvas,
      template: body.template
    });

    return NextResponse.json({
      spec,
      note: "Preview-only MiroExportSpec. No Miro board write is performed in MVP."
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Miro export spec failed." },
      { status: 400 }
    );
  }
}
