const REDACTED = "[REDACTED]";
const REDACTED_QUERY = "[REDACTED_QUERY]";

const sensitiveKeyPattern = /(^|_)(api[_-]?key|authorization|bearer|token|secret|password|credential|signature|signed[_-]?url|request[_-]?id|provider[_-]?request[_-]?id|provider[_-]?response|raw)(_|$)/i;
const signedUrlParamPattern = /(^|[-_])(x-amz-signature|x-amz-credential|x-amz-security-token|signature|sig|token|key|expires|policy)([-_]|$)/i;

export function redactSecret(value) {
  return value ? REDACTED : "";
}

export function redactUrl(value) {
  if (typeof value !== "string") {
    return value;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    return redactText(value);
  }

  const hasSensitiveQuery = [...parsed.searchParams.keys()].some((key) => signedUrlParamPattern.test(key));
  if (!hasSensitiveQuery) {
    return value;
  }

  return `${parsed.origin}${parsed.pathname}?${REDACTED_QUERY}`;
}

export function redactText(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, `Bearer ${REDACTED}`)
    .replace(/Key\s+[A-Za-z0-9._~+/=-]+/gi, `Key ${REDACTED}`)
    .replace(/fal_[A-Za-z0-9._~+/=-]+/g, REDACTED)
    .replace(/(api[_-]?key|token|secret|signature|credential)=([^&\s]+)/gi, `$1=${REDACTED}`);
}

function shouldRedactKey(key) {
  return sensitiveKeyPattern.test(key);
}

export function redactProviderOutput(input) {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === "string") {
    return input.startsWith("http://") || input.startsWith("https://") ? redactUrl(input) : redactText(input);
  }

  if (typeof input !== "object") {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => redactProviderOutput(item));
  }

  return Object.fromEntries(Object.entries(input).map(([key, value]) => {
    if (shouldRedactKey(key)) {
      return [key, REDACTED];
    }
    return [key, redactProviderOutput(value)];
  }));
}
