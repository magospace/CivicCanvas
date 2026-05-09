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
  "78750": { longitude: -97.802, latitude: 30.414 }
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
