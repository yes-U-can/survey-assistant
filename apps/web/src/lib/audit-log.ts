import { createHash, randomUUID } from "crypto";

type AuditResult = "SUCCESS" | "FAILURE";
type AuditSeverity = "INFO" | "WARN" | "ERROR";

type AuditLogInput = {
  action: string;
  result: AuditResult;
  request: Request;
  actorId?: string | null;
  actorRole?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  statusCode?: number;
  errorCode?: string | null;
  detail?: Record<string, unknown> | null;
  severity?: AuditSeverity;
};

function getHeader(request: Request, name: string) {
  const value = request.headers.get(name);
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getIpHash(request: Request) {
  const forwarded = getHeader(request, "x-forwarded-for");
  const realIp = getHeader(request, "x-real-ip");
  const candidate = forwarded?.split(",")[0]?.trim() ?? realIp;

  if (!candidate) {
    return null;
  }

  return createHash("sha256").update(candidate).digest("hex").slice(0, 16);
}

function truncateString(value: string, maxLength = 180) {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}...`;
}

function sanitizeDetail(
  value: Record<string, unknown> | null | undefined,
): Record<string, unknown> | undefined {
  if (!value) {
    return undefined;
  }

  const blockedKeyPattern =
    /(password|secret|token|api[-_]?key|authorization|cookie|session)/i;
  const result: Record<string, unknown> = {};
  for (const [key, raw] of Object.entries(value)) {
    if (blockedKeyPattern.test(key)) {
      result[key] = "[REDACTED]";
      continue;
    }

    if (raw === null || raw === undefined) {
      result[key] = raw;
      continue;
    }

    if (typeof raw === "string") {
      result[key] = truncateString(raw);
      continue;
    }

    if (
      typeof raw === "number" ||
      typeof raw === "boolean" ||
      Array.isArray(raw)
    ) {
      result[key] = raw;
      continue;
    }

    result[key] = "[OBJECT]";
  }

  return result;
}

export function writeAuditLog(input: AuditLogInput) {
  const requestId = getHeader(input.request, "x-request-id") ?? randomUUID();

  const payload = {
    ts: new Date().toISOString(),
    type: "audit",
    requestId,
    action: input.action,
    result: input.result,
    severity:
      input.severity ??
      (input.result === "FAILURE" ? "WARN" : ("INFO" satisfies AuditSeverity)),
    method: input.request.method,
    path: new URL(input.request.url).pathname,
    ipHash: getIpHash(input.request),
    actor: {
      id: input.actorId ?? null,
      role: input.actorRole ?? null,
    },
    target: {
      type: input.targetType ?? null,
      id: input.targetId ?? null,
    },
    statusCode: input.statusCode ?? null,
    errorCode: input.errorCode ?? null,
    detail: sanitizeDetail(input.detail),
  };

  console.log(JSON.stringify(payload));
}

