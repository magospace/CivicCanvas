import {
  type CanvasDocument,
  type DatasetMetadata,
  type SourceAttribution,
  validateCanvasDocument
} from "@texas-data-canvas/shared";
import { findDataset, getSampleRows } from "./data";

type Row = Record<string, string | number | boolean | null>;

function countBy(rows: Row[], field: string, limit = 8) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const value = String(row[field] ?? "Unknown");
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function countByMonth(rows: Row[]) {
  return countBy(rows, "month", 12).sort((a, b) => a.name.localeCompare(b.name));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function createSeedCanvasDocument(datasets: DatasetMetadata[]): CanvasDocument {
  const dataset = findDataset(datasets, "dallas_311_requests");
  const rows = getSampleRows(dataset.id);
  const byCategory = countBy(rows, "category", 6);
  const byMonth = countByMonth(rows);
  const byZip = countBy(rows, "zip_code", 6);
  const statusCounts = countBy(rows, "status", 4);
  const topCategory = byCategory[0]?.name ?? "Unknown";
  const generatedAt = new Date().toISOString();

  const source: SourceAttribution = {
    datasetId: dataset.id,
    datasetTitle: dataset.title,
    sourceName: dataset.sourceName,
    sourceUrl: dataset.sourceUrl,
    accessedAt: generatedAt,
    fieldsUsed: ["created_date", "month", "category", "status", "zip_code"],
    filtersApplied: ["created_date between 2024-01-01 and 2024-12-31"],
    queryMethod: "Starter sample aggregate prepared from approved local JSON.",
    dataMode: "sample",
    caveats: dataset.caveats,
    license: "Refer to source portal terms"
  };

  return validateCanvasDocument({
    id: "canvas_dallas_311_seed",
    title: "Dallas 311 Service Requests Explorer",
    description: "Sample Dallas 311 starter — try your own prompt above to generate a fresh dashboard.",
    createdAt: generatedAt,
    updatedAt: generatedAt,
    sources: [source],
    queries: [
      {
        queryId: "q_dallas_311_seed",
        datasetId: dataset.id,
        label: "Dallas 311 requests by category and ZIP code for 2024"
      }
    ],
    blocks: [
      {
        id: "summary-1",
        type: "SummaryBlock",
        props: {
          heading: "Dallas 311 sample view",
          text: `The seed canvas summarizes ${formatNumber(rows.length)} sample 311 service request records for Dallas. ${topCategory} is the highest-count category in this local demo slice.`,
          bullets: [
            "Built from approved catalog metadata and local sample data.",
            "Uses aggregate views by month, category, status, and ZIP code.",
            "Try your own supported prompt above to generate a fresh governed dashboard."
          ]
        }
      },
      {
        id: "metric-total",
        type: "MetricBlock",
        props: {
          label: "Sample requests",
          value: formatNumber(rows.length),
          helperText: "Rows in local Dallas 311 sample",
          tone: "neutral"
        }
      },
      {
        id: "metric-top-category",
        type: "MetricBlock",
        props: {
          label: "Top category",
          value: topCategory,
          helperText: `${formatNumber(byCategory[0]?.count ?? 0)} sample records`,
          tone: "good"
        }
      },
      {
        id: "trend-chart",
        type: "ChartBlock",
        props: {
          title: "Requests over time",
          chartType: "line",
          xField: "name",
          yField: "count",
          data: byMonth
        }
      },
      {
        id: "zip-map",
        type: "MapBlock",
        props: {
          title: "ZIP-level request concentration",
          geographyField: "name",
          metricField: "count",
          data: byZip,
          note: "Static geography placeholder for P1. MapLibre or GeoJSON layers come later."
        }
      },
      {
        id: "category-table",
        type: "TableBlock",
        props: {
          title: "Top request categories",
          columns: [
            { field: "name", label: "Category" },
            { field: "count", label: "Requests" }
          ],
          rows: byCategory
        }
      },
      {
        id: "filters-1",
        type: "FilterBlock",
        props: {
          title: "Available filters",
          filters: [
            { field: "city", label: "City", type: "select", options: ["Dallas", "Austin"] },
            {
              field: "created_date",
              label: "Date range",
              type: "dateRange"
            },
            {
              field: "category",
              label: "Category",
              type: "select",
              options: byCategory.map((item) => item.name)
            },
            {
              field: "status",
              label: "Status",
              type: "select",
              options: statusCounts.map((item) => item.name)
            }
          ]
        }
      },
      {
        id: "dataset-card-1",
        type: "DatasetCardBlock",
        props: {
          dataset
        }
      },
      {
        id: "source-method-1",
        type: "SourceMethodBlock",
        props: {
          attribution: source,
          methodology:
            "This P1 dashboard uses bounded, aggregate-only sample data loaded from the approved catalog. It does not execute model-generated SQL, HTML, JavaScript, or external scripts."
        }
      }
    ]
  });
}
