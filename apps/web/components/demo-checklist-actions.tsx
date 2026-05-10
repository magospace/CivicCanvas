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
  "Before tagging: pnpm verify; pnpm verify:prod-local; pnpm smoke:deploy -- --url <public-url> --expect-version v1.3.0-hosted-launch-readiness; PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote."
].join("\n");

const releaseGateCommands = [
  "pnpm lint",
  "pnpm typecheck",
  "pnpm test",
  "pnpm build",
  "pnpm governance:audit",
  "pnpm data:quality",
  "pnpm verify",
  "pnpm verify:prod-local",
  "pnpm release:check",
  "pnpm smoke:deploy -- --url <public-url> --expect-version v1.3.0-hosted-launch-readiness",
  "PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote"
].join("\n");

const hostedHandoffChecklist = [
  "Create or link the Vercel project for apps/web.",
  "Use install command: pnpm install --frozen-lockfile.",
  "Use build command: pnpm --filter @texas-data-canvas/web build.",
  "Set NEXT_PUBLIC_APP_ENV=hosted-beta.",
  "Set NEXT_PUBLIC_APP_VERSION=v1.3.0-hosted-launch-readiness.",
  "Optionally set NEXT_PUBLIC_SITE_URL=<public-url>.",
  "Enable Vercel firewall/rate limits before broad sharing.",
  "Run pnpm smoke:deploy -- --url <public-url> --expect-version v1.3.0-hosted-launch-readiness.",
  "Run PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote.",
  "Record the hosted result in docs/release-evidence.json before tagging."
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

export function HostedHandoffActions() {
  const [copied, setCopied] = useState(false);

  async function copyChecklist() {
    await navigator.clipboard?.writeText(hostedHandoffChecklist);
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
      {copied ? "Handoff copied" : "Copy hosted handoff"}
    </button>
  );
}
