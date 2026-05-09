import { NextResponse } from "next/server";
import { generateCanvasForPrompt } from "../../../../lib/dashboard";

const savedCanvases = {
  canvas_dallas_311_seed: "Show Dallas 311 service requests by category and ZIP code for 2024.",
  canvas_austin_permits_seed: "Show Austin building permits by month and ZIP code."
};

export async function GET(_request: Request, { params }: { params: { id: keyof typeof savedCanvases } }) {
  const prompt = savedCanvases[params.id];

  if (!prompt) {
    return NextResponse.json({ error: "Canvas not found." }, { status: 404 });
  }

  return NextResponse.json(await generateCanvasForPrompt(prompt));
}
