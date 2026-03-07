import { NextResponse } from "next/server";

import { buildPackageExportZip } from "@/lib/package-export";
import { buildPackageExportArtifacts, loadOwnedPackageDataset } from "@/lib/package-dataset";
import { notFoundOrNoAccessResponse } from "@/lib/admin-scope";
import { requireAdminSession } from "@/lib/session-guard";

type RouteContext = {
  params: Promise<{ packageId: string }>;
};

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

export async function GET(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { packageId } = await context.params;
  if (!packageId) {
    return NextResponse.json({ ok: false, error: "missing_package_id" }, { status: 400 });
  }

  const url = new URL(request.url);
  const fromRaw = url.searchParams.get("from");
  const toRaw = url.searchParams.get("to");
  const attemptRaw = url.searchParams.get("attempt");
  const formatRaw = (url.searchParams.get("format") ?? "zip").trim().toLowerCase();

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

  if (formatRaw !== "zip" && formatRaw !== "csv") {
    return NextResponse.json({ ok: false, error: "invalid_format" }, { status: 400 });
  }

  const dataset = await loadOwnedPackageDataset(session.user.id, packageId, {
    from,
    to,
    attempt,
  });
  if (!dataset) {
    return notFoundOrNoAccessResponse();
  }

  const artifacts = buildPackageExportArtifacts(dataset);
  const suffix = from || to || attempt !== null ? "_filtered" : "";

  if (formatRaw === "csv") {
    return new Response(artifacts.masterCsv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${artifacts.packageSlug}_responses_long${suffix}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const zipBuffer = buildPackageExportZip(artifacts);
  return new Response(Buffer.from(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${artifacts.packageSlug}_export${suffix}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
