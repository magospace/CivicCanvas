import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { apiErrorResponseSchema, isGovernedError, runtimeLimits, type ApiValidationIssue } from "@texas-data-canvas/shared";

export function createRequestId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `req_${Date.now().toString(36)}`;
}

function zodIssues(error: ZodError): ApiValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String),
    code: issue.code,
    message: issue.message
  }));
}

function isSafeInputErrorMessage(message: string) {
  return message === "Request body must be valid JSON." ||
    /^Request body exceeds \d+ bytes\.$/.test(message);
}

function publicErrorMessage(error: unknown) {
  if (error instanceof ZodError) {
    return "Request validation failed.";
  }

  if (error instanceof Error && isSafeInputErrorMessage(error.message)) {
    return error.message;
  }

  if (isGovernedError(error)) {
    return error.message;
  }

  return "Request failed.";
}

export async function parseJsonRequest<T>(
  request: Request,
  schema: ZodSchema<T>,
  maxBytes = runtimeLimits.maxJsonBodyBytes
) {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error(`Request body exceeds ${maxBytes} bytes.`);
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new Error(`Request body exceeds ${maxBytes} bytes.`);
  }

  try {
    return schema.parse(JSON.parse(text));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Request body must be valid JSON.");
    }
    throw error;
  }
}

export function apiError(
  error: unknown,
  {
    code = "bad_request",
    status = 400,
    requestId = createRequestId()
  }: {
    code?: string;
    status?: number;
    requestId?: string;
  } = {}
) {
  const issues = error instanceof ZodError ? zodIssues(error) : undefined;
  const message = publicErrorMessage(error);
  const response = apiErrorResponseSchema.parse({
    ok: false,
    error: {
      code,
      message,
      requestId,
      issues
    }
  });

  return NextResponse.json(response, { status });
}
