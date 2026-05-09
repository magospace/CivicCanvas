"use client";

import type { CanvasDocument } from "@texas-data-canvas/shared";
import { CanvasRenderer } from "./canvas/canvas-renderer";

export function GalleryCanvasList({ canvases }: { canvases: CanvasDocument[] }) {
  return (
    <div className="space-y-6">
      {canvases.map((canvas) => (
        <CanvasRenderer key={canvas.id} document={canvas} />
      ))}
    </div>
  );
}
