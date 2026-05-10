"use client";

import { ClipboardCopy } from "lucide-react";
import { useState } from "react";

const demoChecklist = [
  "Open /demo-readiness and confirm catalog health plus hosted blocker state.",
  "Open /sources and confirm Dallas live non-ZIP, Austin sample-first, and Houston sample-first statuses.",
  "Open /explore and run: Show Dallas 311 service requests by category and ZIP code for 2024.",
  "Run: Show Austin building permits by month and ZIP code for 2024.",
  "Run: Show Houston transportation incidents by ZIP and incident type for 2024.",
  "Run an unsupported sensitive prompt and confirm suggestions/refusal mode.",
  "Save a canvas locally, export a bundle, and verify unsafe import rejection.",
  "Generate Miro preview and confirm Source & Method frame is present.",
  "Before tagging: pnpm verify; pnpm verify:prod-local; pnpm smoke:deploy -- --url <public-url> --expect-version v1.2.0-hosted-trust; PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote."
].join("\n");

const releaseGateCommands = [
  "pnpm lint",
  "pnpm typecheck",
  "pnpm test",
  "pnpm build",
  "pnpm governance:audit",
  "pnpm verify",
  "pnpm verify:prod-local",
  "pnpm smoke:deploy -- --url <public-url> --expect-version v1.2.0-hosted-trust",
  "PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote"
].join("\n");

export function DemoChecklistActions() {
  const [copied, setCopied] = useState(false);

  async function copyChecklist() {
    await navigator.clipboard?.writeText(demoChecklist);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copyChecklist}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
    >
      <ClipboardCopy className="h-4 w-4" />
      {copied ? "Checklist copied" : "Copy demo checklist"}
    </button>
  );
}

export function ReleaseGateActions() {
  const [copied, setCopied] = useState(false);

  async function copyCommands() {
    await navigator.clipboard?.writeText(releaseGateCommands);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copyCommands}
      className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-civic-500 hover:text-civic-700 focus:border-civic-500 focus:outline-none focus:ring-2 focus:ring-civic-100"
    >
      <ClipboardCopy className="h-4 w-4" />
      {copied ? "Release gates copied" : "Copy release gates"}
    </button>
  );
}
