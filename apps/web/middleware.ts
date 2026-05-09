import { NextResponse, type NextRequest } from "next/server";

type RateLimitRule = {
  pathname: string;
  limit: number;
  windowMs: number;
};

const minute = 60_000;
const rules: RateLimitRule[] = [
  { pathname: "/api/canvas/generate", limit: 20, windowMs: minute },
  { pathname: "/api/query", limit: 60, windowMs: minute },
  { pathname: "/api/export/miro-spec", limit: 20, windowMs: minute },
  { pathname: "/api/canvas/save", limit: 20, windowMs: minute }
];

const buckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: NextRequest, rule: RateLimitRule) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return `${forwarded || realIp || "unknown"}:${rule.pathname}`;
}

function rateLimit(request: NextRequest, rule: RateLimitRule) {
  const now = Date.now();
  const key = clientKey(request, rule);
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + rule.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: rule.limit - 1, resetAt };
  }

  if (bucket.count >= rule.limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: rule.limit - bucket.count, resetAt: bucket.resetAt };
}

function withRateLimitHeaders(response: NextResponse, rule: RateLimitRule, remaining: number, resetAt: number) {
  response.headers.set("X-RateLimit-Limit", String(rule.limit));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(remaining, 0)));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
  return response;
}

export function middleware(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.next();
  }

  const rule = rules.find((candidate) => candidate.pathname === request.nextUrl.pathname);
  if (!rule) {
    return NextResponse.next();
  }

  const result = rateLimit(request, rule);
  if (!result.ok) {
    return withRateLimitHeaders(
      NextResponse.json(
        { ok: false, error: { code: "rate_limited", message: "Too many requests. Try again shortly." } },
        { status: 429 }
      ),
      rule,
      result.remaining,
      result.resetAt
    );
  }

  return withRateLimitHeaders(NextResponse.next(), rule, result.remaining, result.resetAt);
}

export const config = {
  matcher: [
    "/api/canvas/generate",
    "/api/query",
    "/api/export/miro-spec",
    "/api/canvas/save"
  ]
};
