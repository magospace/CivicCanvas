import { existsSync } from "node:fs";
import { join } from "node:path";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();

const planPath = "docs/LOCAL_PERSISTENCE_SPIKE.md";
const defaultForbiddenRuntimeFiles = [
  "prisma/schema.prisma",
  "drizzle.config.ts",
  "supabase/config.toml",
  "apps/web/data/local-canvas.sqlite",
  "data/local-canvas.sqlite"
];
const defaultForbiddenEnvNames = ["DATABASE_URL", "LOCAL_CANVAS_DATABASE_URL", "SUPABASE_URL"];
const explicitEnableEnv = "ENABLE_LOCAL_CANVAS_PERSISTENCE";

const foundRuntimeFiles = defaultForbiddenRuntimeFiles.filter((path) => existsSync(join(root, path)));
const persistenceGateEnabled = process.env[explicitEnableEnv] === "1";
const presentEnvNames = defaultForbiddenEnvNames.filter((name) => Boolean(process.env[name]));

const output = {
  schemaVersion: "1.0",
  ok: true,
  checkedAt: new Date().toISOString(),
  mutatesFiles: false,
  network: "not_used",
  persistenceImplemented: false,
  persistenceGate: {
    envName: explicitEnableEnv,
    enabled: persistenceGateEnabled,
    note: "Current app code does not implement backend saved-canvas persistence; this gate name is reserved for a future explicitly approved Task 55 implementation."
  },
  browserLocalDefaultPreserved: true,
  currentDefault: "browser_local_storage_and_url_hash_share_links",
  apiSaveBehavior: "validation_stub_no_server_write",
  plan: {
    path: planPath,
    present: existsSync(join(root, planPath))
  },
  taskReferences: ["TASKS.md item 55", "docs/LOCAL_PERSISTENCE_SPIKE.md"],
  databaseRuntimeFiles: {
    checked: defaultForbiddenRuntimeFiles,
    found: foundRuntimeFiles
  },
  databaseEnv: {
    checkedNames: defaultForbiddenEnvNames,
    presentNames: presentEnvNames,
    valuesEchoed: false
  },
  readiness: {
    canStartImplementationWithoutApproval: false,
    requiredBeforeImplementation: [
      "explicit approval for Task 55",
      "local/dev database target selection",
      "migration/rollback plan",
      "seed/reset commands scoped to local/dev only",
      "tests preserving browser-local fallback"
    ]
  },
  knownBoundaries: [
    "No production database access is required or checked by this script.",
    "No database files are created by this script.",
    "Default demos continue to use browser localStorage and hash bundles."
  ]
};

if (foundRuntimeFiles.length > 0) {
  output.ok = false;
}

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Local persistence readiness ${output.ok ? "OK" : "NEEDS REVIEW"}: backend persistence implemented=${output.persistenceImplemented}.`);
  console.log(`- default: ${output.currentDefault}`);
  console.log(`- plan: ${output.plan.present ? output.plan.path : "missing"}`);
  console.log(`- runtime DB files found: ${foundRuntimeFiles.length}`);
}

if (!output.ok) {
  process.exitCode = 1;
}
