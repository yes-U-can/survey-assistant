import { NextResponse } from "next/server";

import { notFoundOrNoAccessResponse, withOwnerScope } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session-guard";

type RouteContext = {
  params: Promise<{ packageId: string }>;
};

type FlatMap = Record<string, string>;

const baseHeaders = [
  "package_id",
  "package_code",
  "package_title",
  "participant_id",
  "participant_login_id",
  "participant_display_name",
  "attempt_no",
  "template_id",
  "template_title",
  "template_type",
  "submitted_at",
  "response_json",
] as const;

function safeFileName(input: string) {
  const normalized = input.trim();
  if (!normalized) {
    return "package";
  }
  return normalized.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(",") || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toStringValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") {
    return String(value);
  }
  return JSON.stringify(value);
}

function parseIsoDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

function flattenJson(value: unknown, prefix = "response"): FlatMap {
  const output: FlatMap = {};

  function walk(current: unknown, path: string) {
    if (
      current === null ||
      typeof current === "string" ||
      typeof current === "number" ||
      typeof current === "boolean"
    ) {
      output[path] = toStringValue(current);
      return;
    }

    if (Array.isArray(current)) {
      if (current.length === 0) {
        output[path] = "[]";
        return;
      }
      current.forEach((item, index) => {
        walk(item, `${path}[${index}]`);
      });
      return;
    }

    if (typeof current === "object") {
      const entries = Object.entries(current as Record<string, unknown>).sort((a, b) =>
        a[0].localeCompare(b[0]),
      );
      if (entries.length === 0) {
        output[path] = "{}";
        return;
      }
      for (const [key, nested] of entries) {
        const nextPath = path ? `${path}.${key}` : key;
        walk(nested, nextPath);
      }
      return;
    }

    output[path] = toStringValue(current);
  }

  walk(value, prefix);
  return output;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const fromRaw = url.searchParams.get("from");
  const toRaw = url.searchParams.get("to");
  const attemptRaw = url.searchParams.get("attempt");

  const from = parseIsoDate(fromRaw);
  const to = parseIsoDate(toRaw);

  if (fromRaw && !from) {
    return NextResponse.json({ ok: false, error: "invalid_from" }, { status: 400 });
  }
  if (toRaw && !to) {
    return NextResponse.json({ ok: false, error: "invalid_to" }, { status: 400 });
  }
  if (from && to && to < from) {
    return NextResponse.json({ ok: false, error: "invalid_range" }, { status: 400 });
  }

  let attempt: number | null = null;
  if (attemptRaw) {
    const parsedAttempt = Number.parseInt(attemptRaw, 10);
    if (!Number.isInteger(parsedAttempt) || parsedAttempt < 1 || parsedAttempt > 500) {
      return NextResponse.json({ ok: false, error: "invalid_attempt" }, { status: 400 });
    }
    attempt = parsedAttempt;
  }

  const responseWhere: {
    attemptNo?: number;
    submittedAt?: { gte?: Date; lte?: Date };
  } = {};
  if (attempt !== null) {
    responseWhere.attemptNo = attempt;
  }
  if (from || to) {
    responseWhere.submittedAt = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }

  const { packageId } = await context.params;
  if (!packageId) {
    return NextResponse.json({ ok: false, error: "missing_package_id" }, { status: 400 });
  }

  const targetPackage = await prisma.surveyPackage.findFirst({
    where: withOwnerScope(session.user.id, {
      id: packageId,
    }),
    select: {
      id: true,
      code: true,
      title: true,
      responses: {
        where: responseWhere,
        orderBy: [{ attemptNo: "asc" }, { submittedAt: "asc" }],
        select: {
          participantId: true,
          attemptNo: true,
          templateId: true,
          submittedAt: true,
          responseJson: true,
          participant: {
            select: {
              loginId: true,
              displayName: true,
            },
          },
          template: {
            select: {
              title: true,
              type: true,
            },
          },
        },
      },
    },
  });

  if (!targetPackage) {
    return notFoundOrNoAccessResponse();
  }

  const records: Record<string, string>[] = [];
  const dynamicHeaderSet = new Set<string>();

  for (const row of targetPackage.responses) {
    const flat = flattenJson(row.responseJson, "response");
    for (const key of Object.keys(flat)) {
      dynamicHeaderSet.add(key);
    }

    records.push({
      package_id: targetPackage.id,
      package_code: targetPackage.code,
      package_title: targetPackage.title,
      participant_id: row.participantId,
      participant_login_id: row.participant.loginId ?? "",
      participant_display_name: row.participant.displayName ?? "",
      attempt_no: String(row.attemptNo),
      template_id: row.templateId,
      template_title: row.template.title,
      template_type: row.template.type,
      submitted_at: row.submittedAt.toISOString(),
      response_json: JSON.stringify(row.responseJson),
      ...flat,
    });
  }

  const dynamicHeaders = [...dynamicHeaderSet].sort((a, b) => a.localeCompare(b));
  const allHeaders = [...baseHeaders, ...dynamicHeaders];

  const lines: string[] = [];
  lines.push(allHeaders.join(","));

  for (const record of records) {
    const cells = allHeaders.map((header) => csvEscape(record[header] ?? ""));
    lines.push(cells.join(","));
  }

  const csvBody = `\uFEFF${lines.join("\r\n")}`;
  const filename = `${safeFileName(targetPackage.code)}_responses${from || to || attempt !== null ? "_filtered" : ""}.csv`;

  return new Response(csvBody, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
