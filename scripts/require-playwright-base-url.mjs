const value = process.env.PLAYWRIGHT_BASE_URL;

if (!value) {
  console.error("PLAYWRIGHT_BASE_URL is required for pnpm test:e2e:remote.");
  process.exit(1);
}

try {
  new URL(value);
} catch {
  console.error(`PLAYWRIGHT_BASE_URL must be a valid absolute URL. Received: ${value}`);
  process.exit(1);
}
