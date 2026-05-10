import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { readReleaseMetadata } from "./lib/release-metadata.mjs";

const root = process.cwd();
const releaseMetadata = readReleaseMetadata(root);

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      server.close(() => resolve(port));
    });
  });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    ...options
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

async function waitForHealth(url, timeoutMs = 30000) {
  const started = Date.now();
  let lastError;

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${url}/api/health`, { cache: "no-store" });
      if (response.ok) {
        return;
      }
      lastError = new Error(`Health returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}/api/health${lastError ? `: ${lastError}` : ""}`);
}

async function main() {
  const port = await findAvailablePort();
  const url = `http://127.0.0.1:${port}`;
  let server;

  try {
    run("pnpm", ["--filter", "@texas-data-canvas/web", "build"]);

    server = spawn("pnpm", [
      "--filter",
      "@texas-data-canvas/web",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port)
    ], {
      cwd: root,
      stdio: "inherit",
      env: {
        ...process.env,
        NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? "hosted-beta",
        NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? releaseMetadata.devFallbackVersion,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? url
      }
    });

    const exitPromise = once(server, "exit").then(([code]) => {
      if (code !== null && code !== 0) {
        throw new Error(`next start exited early with code ${code}`);
      }
    });

    await Promise.race([waitForHealth(url), exitPromise]);

    run("pnpm", [
      "smoke:deploy",
      "--",
      "--url",
      url,
      "--expect-version",
      process.env.NEXT_PUBLIC_APP_VERSION ?? releaseMetadata.devFallbackVersion
    ]);

    run("pnpm", ["test:e2e:remote"], {
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: url
      }
    });
  } finally {
    if (server && !server.killed) {
      server.kill("SIGTERM");
      await Promise.race([
        once(server, "exit").catch(() => undefined),
        new Promise((resolve) => setTimeout(resolve, 5000))
      ]);
      if (!server.killed) {
        server.kill("SIGKILL");
      }
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
