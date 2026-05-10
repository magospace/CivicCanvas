import type { SampleRow } from "@texas-data-canvas/shared";

const texasZipCentroids: Record<string, { longitude: number; latitude: number }> = {
  "75201": { longitude: -96.799, latitude: 32.787 },
  "75204": { longitude: -96.787, latitude: 32.802 },
  "75208": { longitude: -96.839, latitude: 32.748 },
  "75211": { longitude: -96.879, latitude: 32.737 },
  "75214": { longitude: -96.747, latitude: 32.824 },
  "75216": { longitude: -96.794, latitude: 32.712 },
  "75217": { longitude: -96.68, latitude: 32.724 },
  "75220": { longitude: -96.862, latitude: 32.87 },
  "75224": { longitude: -96.839, latitude: 32.711 },
  "75227": { longitude: -96.683, latitude: 32.767 },
  "75228": { longitude: -96.681, latitude: 32.825 },
  "75231": { longitude: -96.748, latitude: 32.876 },
  "75232": { longitude: -96.838, latitude: 32.664 },
  "75243": { longitude: -96.737, latitude: 32.91 },
  "75248": { longitude: -96.797, latitude: 32.969 },
  "78702": { longitude: -97.718, latitude: 30.263 },
  "78703": { longitude: -97.766, latitude: 30.29 },
  "78704": { longitude: -97.762, latitude: 30.244 },
  "78712": { longitude: -97.733, latitude: 30.286 },
  "78731": { longitude: -97.762, latitude: 30.346 },
  "78741": { longitude: -97.714, latitude: 30.231 },
  "78745": { longitude: -97.792, latitude: 30.207 },
  "78748": { longitude: -97.823, latitude: 30.162 },
  "78749": { longitude: -97.855, latitude: 30.216 },
  "78750": { longitude: -97.802, latitude: 30.414 },
  "77002": { longitude: -95.369, latitude: 29.756 },
  "77003": { longitude: -95.344, latitude: 29.749 },
  "77004": { longitude: -95.36, latitude: 29.724 },
  "77006": { longitude: -95.389, latitude: 29.741 },
  "77007": { longitude: -95.413, latitude: 29.772 },
  "77008": { longitude: -95.411, latitude: 29.798 },
  "77009": { longitude: -95.363, latitude: 29.794 },
  "77011": { longitude: -95.308, latitude: 29.743 },
  "77017": { longitude: -95.257, latitude: 29.69 },
  "77023": { longitude: -95.319, latitude: 29.724 },
  "77024": { longitude: -95.515, latitude: 29.771 },
  "77027": { longitude: -95.445, latitude: 29.741 },
  "77030": { longitude: -95.4, latitude: 29.704 },
  "77046": { longitude: -95.43, latitude: 29.733 },
  "77056": { longitude: -95.47, latitude: 29.748 },
  "77057": { longitude: -95.488, latitude: 29.744 }
};

export function zipFeaturesForRows(rows: SampleRow[], geographyField: string) {
  return rows.flatMap((row) => {
    const zip = String(row[geographyField] ?? "");
    const centroid = texasZipCentroids[zip];
    if (!centroid) {
      return [];
    }
    return [{ id: zip, label: zip, ...centroid }];
  });
}
