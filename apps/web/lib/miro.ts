import {
  miroExportSpecSchema,
  validateCanvasDocument,
  type MiroExportSpec
} from "@texas-data-canvas/shared";

export function generateMiroExportSpec({
  canvas,
  template
}: {
  canvas: unknown;
  template: MiroExportSpec["template"];
}): MiroExportSpec {
  const validCanvas = validateCanvasDocument(canvas);
  const sourceBlock = validCanvas.blocks.find((block) => block.type === "SourceMethodBlock");

  if (!sourceBlock || sourceBlock.type !== "SourceMethodBlock") {
    throw new Error("Miro export requires SourceMethodBlock.");
  }

  const frames = [
    {
      title: validCanvas.title,
      items: [
        {
          type: "text" as const,
          content: validCanvas.description ?? "Texas Data Canvas briefing export."
        }
      ]
    },
    ...validCanvas.blocks
      .filter((block) => block.type !== "SourceMethodBlock")
      .map((block) => ({
        title: block.type.replace("Block", ""),
        items: [
          {
            type:
              block.type === "ChartBlock"
                ? ("chart" as const)
                : block.type === "MapBlock"
                  ? ("map" as const)
                  : block.type === "TableBlock"
                    ? ("table" as const)
                    : ("text" as const),
            content: JSON.stringify(block.props)
          }
        ]
      })),
    {
      title: "Source & Method",
      items: [
        {
          type: "source_method" as const,
          content: JSON.stringify({
            source: sourceBlock.props.attribution,
            methodology: sourceBlock.props.methodology
          })
        }
      ]
    },
    {
      title: template === "community_workshop" ? "Discussion Questions" : "Next Steps",
      items: [
        {
          type: "text" as const,
          content:
            template === "community_workshop"
              ? "What does this public data suggest we should inspect next? What caveats should be named in the room?"
              : "Review caveats, confirm source terms, and decide whether to refresh with live public API data."
        }
      ]
    }
  ];

  return miroExportSpecSchema.parse({
    schemaVersion: "1.0",
    title: `${validCanvas.title} ${template.replace(/_/g, " ")}`,
    template,
    sourceMethodFrameRequired: true,
    frames
  });
}
