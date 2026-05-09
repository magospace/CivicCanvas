import type { CanvasBlock, CanvasDocument } from "@texas-data-canvas/shared";
import { safeValidateCanvasDocument } from "@texas-data-canvas/shared";
import {
  ChartBlockView,
  DatasetCardBlockView,
  FilterBlockView,
  MapBlockView,
  MetricBlockView,
  SourceMethodBlockView,
  SummaryBlockView,
  TableBlockView
} from "../canvas-blocks";

type Registry = {
  [BlockType in CanvasBlock["type"]]: (
    block: Extract<CanvasBlock, { type: BlockType }>
  ) => JSX.Element;
};

const blockRegistry = {
  SummaryBlock: SummaryBlockView,
  MetricBlock: MetricBlockView,
  ChartBlock: ChartBlockView,
  MapBlock: MapBlockView,
  TableBlock: TableBlockView,
  FilterBlock: FilterBlockView,
  SourceMethodBlock: SourceMethodBlockView,
  DatasetCardBlock: DatasetCardBlockView
} satisfies Registry;

function renderBlock(block: CanvasBlock) {
  switch (block.type) {
    case "SummaryBlock":
      return blockRegistry.SummaryBlock(block);
    case "MetricBlock":
      return blockRegistry.MetricBlock(block);
    case "ChartBlock":
      return blockRegistry.ChartBlock(block);
    case "MapBlock":
      return blockRegistry.MapBlock(block);
    case "TableBlock":
      return blockRegistry.TableBlock(block);
    case "FilterBlock":
      return blockRegistry.FilterBlock(block);
    case "SourceMethodBlock":
      return blockRegistry.SourceMethodBlock(block);
    case "DatasetCardBlock":
      return blockRegistry.DatasetCardBlock(block);
    default: {
      const unreachable: never = block;
      throw new Error(`Unknown canvas block: ${String(unreachable)}`);
    }
  }
}

export function CanvasRenderer({
  document,
  filterValues = {},
  onFilterChange,
  onApplyFilters
}: {
  document: CanvasDocument;
  filterValues?: Record<string, string>;
  onFilterChange?: (field: string, value: string) => void;
  onApplyFilters?: () => void;
}) {
  const validation = safeValidateCanvasDocument(document);

  if (!validation.ok) {
    return (
      <section className="rounded-lg border border-signal/30 bg-signal/10 p-5 text-signal">
        <h2 className="text-sm font-semibold text-ink">Canvas validation failed</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {validation.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </section>
    );
  }

  const validatedDocument = validation.data;
  const metricBlocks = validatedDocument.blocks.filter((block) => block.type === "MetricBlock");
  const otherBlocks = validatedDocument.blocks.filter((block) => block.type !== "MetricBlock");

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-panel">
      <div className="mb-5 flex flex-col justify-between gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-civic-700">
            Validated CanvasSpec
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{validatedDocument.title}</h1>
          {validatedDocument.description ? (
            <p className="mt-2 text-sm text-slate-600">{validatedDocument.description}</p>
          ) : null}
        </div>
        <div className="rounded-md bg-civic-100 px-3 py-2 text-xs font-semibold text-civic-700">
          {validatedDocument.blocks.length} allowlisted blocks
        </div>
      </div>
      {metricBlocks.length > 0 ? (
        <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {metricBlocks.map((block) => (
            <div key={block.id}>{renderBlock(block)}</div>
          ))}
        </div>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-2">
        {otherBlocks.map((block) => (
          <div
            key={block.id}
            className={
              block.type === "SummaryBlock" ||
              block.type === "SourceMethodBlock" ||
              block.type === "TableBlock"
                ? "xl:col-span-2"
                : undefined
            }
          >
            {block.type === "FilterBlock" ? (
              <FilterBlockView
                {...block}
                values={filterValues}
                onChange={onFilterChange}
                onApply={onApplyFilters}
              />
            ) : (
              renderBlock(block)
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
