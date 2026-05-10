import { readFileSync } from "node:fs";
import { join } from "node:path";

function readConstValue(source, key) {
  const match = source.match(new RegExp(`${key}:\\s*"([^"]+)"`));
  if (!match) {
    throw new Error(`Could not read release metadata field: ${key}`);
  }
  return match[1];
}

export function readReleaseMetadata(root = process.cwd()) {
  const source = readFileSync(join(root, "packages/shared/src/release/index.ts"), "utf8");

  return {
    packageVersion: readConstValue(source, "packageVersion"),
    releaseVersion: readConstValue(source, "releaseVersion"),
    devFallbackVersion: readConstValue(source, "devFallbackVersion"),
    releaseChannel: readConstValue(source, "releaseChannel")
  };
}
