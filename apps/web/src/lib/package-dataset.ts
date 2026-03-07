import { Locale, Prisma, SkillBook, TemplateType } from "@prisma/client";

import { withOwnerScope } from "@/lib/admin-scope";
import { prisma } from "@/lib/prisma";

export type PackageDatasetFilter = {
  from?: Date | null;
  to?: Date | null;
  attempt?: number | null;
};

export type PackageDataset = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  mode: string;
  status: string;
  maxResponsesPerParticipant: number;
  startsAt: string | null;
  endsAt: string | null;
  enrollments: Array<{
    participantId: string;
    loginId: string | null;
    displayName: string | null;
    joinedAt: string;
    completedCount: number;
    lastRespondedAt: string | null;
  }>;
  templates: Array<{
    templateId: string;
    orderIndex: number;
    title: string;
    description: string | null;
    type: TemplateType;
    version: number;
    schemaJson: unknown;
  }>;
  responses: Array<{
    id: string;
    templateId: string;
    participantId: string;
    participantLoginId: string | null;
    participantDisplayName: string | null;
    attemptNo: number;
    submittedAt: string;
    responseJson: unknown;
  }>;
};

export type ExportArtifact = {
  fileName: string;
  content: string;
};

export type PackageExportArtifacts = {
  packageSlug: string;
  overviewCsv: string;
  attemptsCsv: string;
  codebookCsv: string;
  masterCsv: string;
  templateWideCsvs: ExportArtifact[];
};

type LikertSchema = {
  kind: "likert";
  scale: {
    min: number;
    max: number;
    labels: string[];
  };
  questions: Array<{
    id: string;
    text: string;
  }>;
};

type AttemptSummary = {
  participantId: string;
  participantLoginId: string | null;
  participantDisplayName: string | null;
  attemptNo: number;
  responseCount: number;
  firstSubmittedAt: string;
  lastSubmittedAt: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeFileName(input: string) {
  const normalized = input.trim();
  if (!normalized) {
    return "package";
  }
  return normalized.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function stringifyCell(value: unknown): string {
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

function buildCsv(headers: string[], rows: Array<Record<string, unknown>>) {
  const lines: string[] = [];
  lines.push(headers.join(","));
  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(stringifyCell(row[header]))).join(","));
  }
  return `\uFEFF${lines.join("\r\n")}`;
}

function flattenValue(value: unknown, prefix = "response") {
  const output: Record<string, string> = {};

  const walk = (current: unknown, path: string) => {
    if (
      current === null ||
      typeof current === "string" ||
      typeof current === "number" ||
      typeof current === "boolean"
    ) {
      output[path] = stringifyCell(current);
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

    if (isObject(current)) {
      const entries = Object.entries(current).sort((a, b) => a[0].localeCompare(b[0]));
      if (entries.length === 0) {
        output[path] = "{}";
        return;
      }
      for (const [key, nested] of entries) {
        walk(nested, path ? `${path}.${key}` : key);
      }
      return;
    }

    output[path] = stringifyCell(current);
  };

  walk(value, prefix);
  return output;
}

function parseLikertSchema(schema: unknown): LikertSchema | null {
  if (!isObject(schema) || schema.kind !== "likert") {
    return null;
  }

  if (!isObject(schema.scale) || !Array.isArray(schema.questions)) {
    return null;
  }

  const min = Number(schema.scale.min);
  const max = Number(schema.scale.max);
  const labels = Array.isArray(schema.scale.labels)
    ? schema.scale.labels
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0)
    : [];

  if (!Number.isInteger(min) || !Number.isInteger(max) || min >= max) {
    return null;
  }

  const questions = schema.questions
    .map((question) => {
      if (!isObject(question)) {
        return null;
      }
      const id = typeof question.id === "string" ? question.id.trim() : "";
      const text = typeof question.text === "string" ? question.text.trim() : "";
      if (!id || !text) {
        return null;
      }
      return { id, text };
    })
    .filter((item): item is { id: string; text: string } => Boolean(item));

  if (questions.length === 0) {
    return null;
  }

  return {
    kind: "likert",
    scale: { min, max, labels },
    questions,
  };
}

function getLikertLabel(schema: LikertSchema, numericValue: number) {
  const index = numericValue - schema.scale.min;
  if (!Number.isInteger(index) || index < 0 || index >= schema.scale.labels.length) {
    return "";
  }
  return schema.scale.labels[index] ?? "";
}

function buildAttemptSummaries(dataset: PackageDataset) {
  const grouped = new Map<string, AttemptSummary>();

  for (const row of dataset.responses) {
    const key = `${row.participantId}:${row.attemptNo}`;
    const prev = grouped.get(key);
    if (!prev) {
      grouped.set(key, {
        participantId: row.participantId,
        participantLoginId: row.participantLoginId,
        participantDisplayName: row.participantDisplayName,
        attemptNo: row.attemptNo,
        responseCount: 1,
        firstSubmittedAt: row.submittedAt,
        lastSubmittedAt: row.submittedAt,
      });
      continue;
    }

    prev.responseCount += 1;
    if (new Date(row.submittedAt) < new Date(prev.firstSubmittedAt)) {
      prev.firstSubmittedAt = row.submittedAt;
    }
    if (new Date(row.submittedAt) > new Date(prev.lastSubmittedAt)) {
      prev.lastSubmittedAt = row.submittedAt;
    }
  }

  return [...grouped.values()].sort((a, b) => {
    const participantCompare = a.participantId.localeCompare(b.participantId);
    if (participantCompare !== 0) {
      return participantCompare;
    }
    return a.attemptNo - b.attemptNo;
  });
}

function buildCodebookRows(dataset: PackageDataset) {
  const rows: Array<Record<string, unknown>> = [];

  for (const template of dataset.templates) {
    const likert = parseLikertSchema(template.schemaJson);
    if (likert) {
      for (const question of likert.questions) {
        rows.push({
          template_id: template.templateId,
          template_title: template.title,
          template_type: template.type,
          question_id: question.id,
          question_text: question.text,
          scale_min: likert.scale.min,
          scale_max: likert.scale.max,
          scale_labels: likert.scale.labels.join(" | "),
        });
      }
      continue;
    }

    rows.push({
      template_id: template.templateId,
      template_title: template.title,
      template_type: template.type,
      question_id: "special_payload",
      question_text: template.description ?? template.title,
      scale_min: "",
      scale_max: "",
      scale_labels: "",
    });
  }

  return rows;
}

function buildMasterRows(dataset: PackageDataset) {
  const templateMap = new Map(dataset.templates.map((template) => [template.templateId, template]));
  const rows: Array<Record<string, unknown>> = [];

  for (const response of dataset.responses) {
    const template = templateMap.get(response.templateId);
    if (!template) {
      continue;
    }

    const likert = parseLikertSchema(template.schemaJson);
    const submittedAt = response.submittedAt;

    if (likert && isObject(response.responseJson) && isObject(response.responseJson.answers)) {
      for (const question of likert.questions) {
        const rawValue = response.responseJson.answers[question.id];
        if (rawValue === undefined) {
          continue;
        }
        const numericValue = Number(rawValue);
        rows.push({
          package_id: dataset.id,
          package_code: dataset.code,
          package_title: dataset.title,
          participant_id: response.participantId,
          participant_login_id: response.participantLoginId ?? "",
          participant_display_name: response.participantDisplayName ?? "",
          attempt_no: response.attemptNo,
          submitted_at: submittedAt,
          template_id: template.templateId,
          template_title: template.title,
          template_type: template.type,
          item_key: question.id,
          item_label: question.text,
          value: Number.isFinite(numericValue) ? numericValue : stringifyCell(rawValue),
          value_label: Number.isFinite(numericValue) ? getLikertLabel(likert, numericValue) : "",
          raw_json: "",
        });
      }
      continue;
    }

    const flat = flattenValue(response.responseJson, "response");
    for (const [key, value] of Object.entries(flat)) {
      rows.push({
        package_id: dataset.id,
        package_code: dataset.code,
        package_title: dataset.title,
        participant_id: response.participantId,
        participant_login_id: response.participantLoginId ?? "",
        participant_display_name: response.participantDisplayName ?? "",
        attempt_no: response.attemptNo,
        submitted_at: submittedAt,
        template_id: template.templateId,
        template_title: template.title,
        template_type: template.type,
        item_key: key,
        item_label: key,
        value,
        value_label: "",
        raw_json: JSON.stringify(response.responseJson),
      });
    }
  }

  return rows;
}

function buildTemplateWideCsvs(dataset: PackageDataset) {
  const responseGroups = new Map<string, Array<PackageDataset["responses"][number]>>();
  for (const row of dataset.responses) {
    const prev = responseGroups.get(row.templateId) ?? [];
    prev.push(row);
    responseGroups.set(row.templateId, prev);
  }

  const files: ExportArtifact[] = [];

  for (const template of dataset.templates) {
    const templateResponses = responseGroups.get(template.templateId) ?? [];
    const likert = parseLikertSchema(template.schemaJson);
    const baseHeaders = [
      "package_id",
      "package_code",
      "package_title",
      "participant_id",
      "participant_login_id",
      "participant_display_name",
      "attempt_no",
      "submitted_at",
    ];

    const dynamicHeaders = new Set<string>();
    const rows: Array<Record<string, unknown>> = [];

    for (const response of templateResponses) {
      const baseRow: Record<string, unknown> = {
        package_id: dataset.id,
        package_code: dataset.code,
        package_title: dataset.title,
        participant_id: response.participantId,
        participant_login_id: response.participantLoginId ?? "",
        participant_display_name: response.participantDisplayName ?? "",
        attempt_no: response.attemptNo,
        submitted_at: response.submittedAt,
      };

      if (likert && isObject(response.responseJson) && isObject(response.responseJson.answers)) {
        for (const question of likert.questions) {
          dynamicHeaders.add(question.id);
          baseRow[question.id] = response.responseJson.answers[question.id] ?? "";
        }
      } else {
        const flat = flattenValue(response.responseJson, "response");
        for (const [key, value] of Object.entries(flat)) {
          dynamicHeaders.add(key);
          baseRow[key] = value;
        }
      }

      rows.push(baseRow);
    }

    const allHeaders = [...baseHeaders, ...[...dynamicHeaders].sort((a, b) => a.localeCompare(b))];
    files.push({
      fileName: `${String(template.orderIndex).padStart(2, "0")}_${safeFileName(template.title)}.csv`,
      content: buildCsv(allHeaders, rows),
    });
  }

  return files;
}

export async function loadOwnedPackageDataset(
  ownerId: string,
  packageId: string,
  filter: PackageDatasetFilter = {},
): Promise<PackageDataset | null> {
  const submittedAtWhere =
    filter.from || filter.to
      ? {
          ...(filter.from ? { gte: filter.from } : {}),
          ...(filter.to ? { lte: filter.to } : {}),
        }
      : undefined;

  const targetPackage = await prisma.surveyPackage.findFirst({
    where: withOwnerScope(ownerId, {
      id: packageId,
    }),
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      mode: true,
      status: true,
      maxResponsesPerParticipant: true,
      startsAt: true,
      endsAt: true,
      enrollments: {
        orderBy: { joinedAt: "asc" },
        select: {
          participantId: true,
          joinedAt: true,
          completedCount: true,
          lastRespondedAt: true,
          participant: {
            select: {
              loginId: true,
              displayName: true,
            },
          },
        },
      },
      templates: {
        orderBy: { orderIndex: "asc" },
        select: {
          templateId: true,
          orderIndex: true,
          template: {
            select: {
              title: true,
              description: true,
              type: true,
              version: true,
              schemaJson: true,
            },
          },
        },
      },
      responses: {
        where: {
          ...(filter.attempt ? { attemptNo: filter.attempt } : {}),
          ...(submittedAtWhere ? { submittedAt: submittedAtWhere } : {}),
        },
        orderBy: [{ attemptNo: "asc" }, { submittedAt: "asc" }],
        select: {
          id: true,
          templateId: true,
          participantId: true,
          attemptNo: true,
          submittedAt: true,
          responseJson: true,
          participant: {
            select: {
              loginId: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!targetPackage) {
    return null;
  }

  return {
    id: targetPackage.id,
    code: targetPackage.code,
    title: targetPackage.title,
    description: targetPackage.description,
    mode: targetPackage.mode,
    status: targetPackage.status,
    maxResponsesPerParticipant: targetPackage.maxResponsesPerParticipant,
    startsAt: targetPackage.startsAt?.toISOString() ?? null,
    endsAt: targetPackage.endsAt?.toISOString() ?? null,
    enrollments: targetPackage.enrollments.map((entry) => ({
      participantId: entry.participantId,
      loginId: entry.participant.loginId,
      displayName: entry.participant.displayName,
      joinedAt: entry.joinedAt.toISOString(),
      completedCount: entry.completedCount,
      lastRespondedAt: entry.lastRespondedAt?.toISOString() ?? null,
    })),
    templates: targetPackage.templates.map((entry) => ({
      templateId: entry.templateId,
      orderIndex: entry.orderIndex,
      title: entry.template.title,
      description: entry.template.description,
      type: entry.template.type,
      version: entry.template.version,
      schemaJson: entry.template.schemaJson as Prisma.JsonValue,
    })),
    responses: targetPackage.responses.map((entry) => ({
      id: entry.id,
      templateId: entry.templateId,
      participantId: entry.participantId,
      participantLoginId: entry.participant.loginId,
      participantDisplayName: entry.participant.displayName,
      attemptNo: entry.attemptNo,
      submittedAt: entry.submittedAt.toISOString(),
      responseJson: entry.responseJson as Prisma.JsonValue,
    })),
  };
}

export function buildPackageExportArtifacts(dataset: PackageDataset): PackageExportArtifacts {
  const packageSlug = safeFileName(dataset.code || dataset.title || dataset.id);
  const attemptRows = buildAttemptSummaries(dataset);
  const codebookRows = buildCodebookRows(dataset);
  const masterRows = buildMasterRows(dataset);
  const templateWideCsvs = buildTemplateWideCsvs(dataset);

  const overviewCsv = buildCsv(
    [
      "package_id",
      "package_code",
      "package_title",
      "package_description",
      "mode",
      "status",
      "template_count",
      "enrollment_count",
      "response_row_count",
      "attempt_count",
      "starts_at",
      "ends_at",
      "template_titles",
    ],
    [
      {
        package_id: dataset.id,
        package_code: dataset.code,
        package_title: dataset.title,
        package_description: dataset.description ?? "",
        mode: dataset.mode,
        status: dataset.status,
        template_count: dataset.templates.length,
        enrollment_count: dataset.enrollments.length,
        response_row_count: dataset.responses.length,
        attempt_count: attemptRows.length,
        starts_at: dataset.startsAt ?? "",
        ends_at: dataset.endsAt ?? "",
        template_titles: dataset.templates.map((item) => item.title).join(" | "),
      },
    ],
  );

  const attemptsCsv = buildCsv(
    [
      "participant_id",
      "participant_login_id",
      "participant_display_name",
      "attempt_no",
      "response_count",
      "first_submitted_at",
      "last_submitted_at",
    ],
    attemptRows,
  );

  const codebookCsv = buildCsv(
    [
      "template_id",
      "template_title",
      "template_type",
      "question_id",
      "question_text",
      "scale_min",
      "scale_max",
      "scale_labels",
    ],
    codebookRows,
  );

  const masterCsv = buildCsv(
    [
      "package_id",
      "package_code",
      "package_title",
      "participant_id",
      "participant_login_id",
      "participant_display_name",
      "attempt_no",
      "submitted_at",
      "template_id",
      "template_title",
      "template_type",
      "item_key",
      "item_label",
      "value",
      "value_label",
      "raw_json",
    ],
    masterRows,
  );

  return {
    packageSlug,
    overviewCsv,
    attemptsCsv,
    codebookCsv,
    masterCsv,
    templateWideCsvs,
  };
}

export function buildPackageChatContext(params: {
  dataset: PackageDataset;
  skillBook: Pick<SkillBook, "title" | "body" | "compiledPrompt"> | null;
  locale: Locale;
}) {
  const artifacts = buildPackageExportArtifacts(params.dataset);
  const templateSummary = params.dataset.templates
    .map((template) => `- ${template.title} (${template.type})`)
    .join("\n");
  const skillBookBlock = params.skillBook
    ? [
        `SkillBook Title: ${params.skillBook.title}`,
        "SkillBook Instructions:",
        params.skillBook.compiledPrompt?.trim() || params.skillBook.body,
      ].join("\n")
    : "No SkillBook selected.";

  const basePrompt = [
    params.locale === "ko"
      ? "����� �������� ������� ���� �м� ���� AI�Դϴ�. �����Ϳ� ������� �������� �����ϵ�, �����̳� �Ƿ��� Ȯ�� �Ǵ�ó�� ������ ������."
      : "You are Survey Assistant's research analysis helper. Explain from the data and methodology, but do not present output as a diagnosis or medical certainty.",
    `Package: ${params.dataset.title} (${params.dataset.code})`,
    `Mode: ${params.dataset.mode}`,
    `Templates:\n${templateSummary || "- none"}`,
    skillBookBlock,
    "Codebook CSV:",
    artifacts.codebookCsv,
    "Master Responses CSV:",
    artifacts.masterCsv.length > 120000 ? `${artifacts.masterCsv.slice(0, 120000)}\n[truncated]` : artifacts.masterCsv,
  ].join("\n\n");

  return {
    systemPrompt: basePrompt,
    artifacts,
  };
}

