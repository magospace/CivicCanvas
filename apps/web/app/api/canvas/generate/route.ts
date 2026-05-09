import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCanvasForPrompt } from "../../../../lib/dashboard";

const requestSchema = z.object({
  prompt: z.string().min(1),
  filters: z.record(z.string()).default({})
});

export async function POST(request: Request) {
  try {
    const { prompt, filters } = requestSchema.parse(await request.json());
    return NextResponse.json(await generateCanvasForPrompt(prompt, filters));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canvas generation failed." },
      { status: 400 }
    );
  }
}
