import { NextResponse } from "next/server";
import { z } from "zod";
import { generateCanvasForPrompt } from "../../../../lib/dashboard";

const requestSchema = z.object({
  prompt: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const { prompt } = requestSchema.parse(await request.json());
    return NextResponse.json(generateCanvasForPrompt(prompt));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Canvas generation failed." },
      { status: 400 }
    );
  }
}
