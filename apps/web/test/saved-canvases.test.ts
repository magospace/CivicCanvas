import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSavedCanvas,
  validateCanvasDocument,
  type StorageLike
} from "@texas-data-canvas/shared";
import {
  createSavedCanvasShareLink,
  exportSavedCanvasesBundleJson,
  importSavedCanvasHash,
  importSavedCanvasJson,
  savedCanvasImportLimitBytes,
  savedCanvasShareHashKey,
  savedCanvasShareHashLimitChars,
  savedCanvasStorageKey,
  updateSavedCanvasMetadata
} from "../lib/saved-canvases";

class MemoryStorage implements StorageLike {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

class FailingSetItemStorage extends MemoryStorage {
  setItem() {
    throw new Error("quota exceeded");
  }
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function createSavedCanvasFixture() {
  const source = {
    datasetId: "dallas_311_requests",
    datasetTitle: "Dallas 311 Service Requests",
    sourceName: "City of Dallas Open Data",
    sourceUrl: "https://www.dallasopendata.com/",
    accessedAt: "2026-05-09T00:00:00.000Z",
    fieldsUsed: ["month"],
    filtersApplied: [],
    queryMethod: "Test",
    caveats: ["Sample data"],
    license: "Source terms"
  };
  const canvas = validateCanvasDocument({
    id: "canvas_saved_hash",
    title: "Saved Hash Canvas",
    createdAt: "2026-05-09T00:00:00.000Z",
    updatedAt: "2026-05-09T00:00:00.000Z",
    sources: [source],
    queries: [],
    blocks: [
      {
        id: "summary",
        type: "SummaryBlock",
        props: { heading: "Summary", text: "Safe summary", bullets: [] }
      },
      {
        id: "source",
        type: "SourceMethodBlock",
        props: { attribution: source, methodology: "Safe method" }
      }
    ]
  });

  return createSavedCanvas({
    canvas,
    prompt: "Show Dallas 311 saved canvas",
    savedAt: "2026-05-09T00:00:00.000Z"
  });
}

describe("saved canvas share hash import and export", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
    vi.stubGlobal("window", {
      location: { origin: "http://localhost:3000" },
      localStorage: storage
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips a valid share link hash into browser-local saved canvas storage", () => {
    const saved = createSavedCanvasFixture();
    const { url, bundle } = createSavedCanvasShareLink([saved], "/saved");
    const imported = importSavedCanvasHash(new URL(url).hash);

    expect(new URL(url).origin).toBe("http://localhost:3000");
    expect(new URL(url).pathname).toBe("/saved");
    expect(JSON.parse(bundle).canvases).toHaveLength(1);
    expect(imported).toHaveLength(1);
    expect(imported?.[0].canvasId).toBe(saved.canvasId);
    expect(JSON.parse(storage.getItem(savedCanvasStorageKey) ?? "[]")[0].prompt).toBe(saved.prompt);
  });

  it("returns null for hashes without the saved-canvas key", () => {
    const imported = importSavedCanvasHash("#other=value");

    expect(imported).toBeNull();
    expect(storage.getItem(savedCanvasStorageKey)).toBeNull();
  });

  it("rejects malformed share hash payloads without writing storage", () => {
    const malformedHash = `#${savedCanvasShareHashKey}=${encodeBase64Url("not json")}`;

    expect(() => importSavedCanvasHash(malformedHash)).toThrow();
    expect(storage.getItem(savedCanvasStorageKey)).toBeNull();
  });

  it("rejects oversized share hashes before decoding", () => {
    const oversizedHash = `#${savedCanvasShareHashKey}=${"a".repeat(savedCanvasShareHashLimitChars + 1)}`;

    expect(() => importSavedCanvasHash(oversizedHash)).toThrow(/hash exceeds/);
    expect(storage.getItem(savedCanvasStorageKey)).toBeNull();
  });

  it("rejects decoded share imports that exceed the saved-canvas byte limit", () => {
    const oversizedPayload = "x".repeat(savedCanvasImportLimitBytes + 1);
    const oversizedHash = `#${savedCanvasShareHashKey}=${encodeBase64Url(oversizedPayload)}`;

    expect(() => importSavedCanvasHash(oversizedHash)).toThrow(/Shared canvas exceeds/);
    expect(storage.getItem(savedCanvasStorageKey)).toBeNull();
  });


  it("updates saved canvas metadata through browser-local storage", () => {
    const saved = createSavedCanvasFixture();
    storage.setItem(savedCanvasStorageKey, JSON.stringify([saved]));

    const updated = updateSavedCanvasMetadata({
      canvasId: saved.canvasId,
      title: "Edited civic demo title",
      prompt: "Edited local prompt wording"
    });

    expect(updated).toHaveLength(1);
    expect(updated[0].title).toBe("Edited civic demo title");
    expect(updated[0].prompt).toBe("Edited local prompt wording");
    expect(updated[0].canvas.title).toBe("Edited civic demo title");
    expect(updated[0].canvas.prompt).toBe("Edited local prompt wording");
    expect(JSON.parse(storage.getItem(savedCanvasStorageKey) ?? "[]")[0].title).toBe("Edited civic demo title");
  });

  it("normalizes legacy canvas-document imports into editable browser-local saved records", () => {
    const legacyCanvas = createSavedCanvasFixture().canvas;
    const imported = importSavedCanvasJson(JSON.stringify(legacyCanvas));

    expect(imported).toHaveLength(1);
    expect(imported[0].canvasId).toBe(legacyCanvas.id);
    expect(imported[0].title).toBe(legacyCanvas.title);
    expect(imported[0].prompt).toBe(legacyCanvas.prompt ?? legacyCanvas.title);
    expect(imported[0].canvas.title).toBe(legacyCanvas.title);
    expect(JSON.parse(storage.getItem(savedCanvasStorageKey) ?? "[]")[0].canvasId).toBe(legacyCanvas.id);

    const updated = updateSavedCanvasMetadata({
      canvasId: legacyCanvas.id,
      title: "Edited imported legacy title",
      prompt: "Edited imported legacy prompt"
    });
    const exportedBundle = JSON.parse(exportSavedCanvasesBundleJson(updated));

    expect(updated[0].title).toBe("Edited imported legacy title");
    expect(updated[0].prompt).toBe("Edited imported legacy prompt");
    expect(updated[0].canvas.title).toBe("Edited imported legacy title");
    expect(updated[0].canvas.prompt).toBe("Edited imported legacy prompt");
    expect(exportedBundle.canvases[0].title).toBe("Edited imported legacy title");
  });

  it("surfaces browser-local storage quota failures without masking the local-only boundary", () => {
    const saved = createSavedCanvasFixture();
    const bundle = JSON.stringify({
      exportedAt: "2026-05-10T00:00:00.000Z",
      appVersion: "test",
      canvases: [saved]
    });
    const hash = `#${savedCanvasShareHashKey}=${encodeBase64Url(bundle)}`;
    storage = new FailingSetItemStorage();
    vi.stubGlobal("window", {
      location: { origin: "http://localhost:3000" },
      localStorage: storage
    });

    expect(() => importSavedCanvasHash(hash)).toThrow(/Browser-local saved-canvas storage failed while importing saved canvases/);
    expect(() => importSavedCanvasHash(hash)).toThrow(/Clear browser storage or export existing canvases/);
  });
});
