import { Locale, SkillBookStatus, SkillBookVisibility } from "@prisma/client";

export type SkillBookSourceInput = {
  label?: string | null;
  content: string;
};

export function normalizeSkillBookVisibility(value: string | null | undefined) {
  if (value === SkillBookVisibility.INTERNAL) {
    return SkillBookVisibility.INTERNAL;
  }
  if (value === SkillBookVisibility.STORE) {
    return SkillBookVisibility.STORE;
  }
  return SkillBookVisibility.PRIVATE;
}

export function normalizeSkillBookStatus(value: string | null | undefined) {
  if (value === SkillBookStatus.READY) {
    return SkillBookStatus.READY;
  }
  if (value === SkillBookStatus.ARCHIVED) {
    return SkillBookStatus.ARCHIVED;
  }
  return SkillBookStatus.DRAFT;
}

export function normalizeLocale(value: string | null | undefined) {
  return value === Locale.en ? Locale.en : Locale.ko;
}

export function normalizeSkillBookSources(sources: SkillBookSourceInput[] | undefined) {
  return (sources ?? [])
    .map((source) => ({
      label: source.label?.trim() || null,
      content: source.content.trim(),
    }))
    .filter((source) => source.content.length > 0)
    .map((source, index) => ({
      ...source,
      orderIndex: index,
    }));
}

export function compileSkillBookPrompt(params: {
  title: string;
  description?: string | null;
  body: string;
  locale: Locale;
  sources: Array<{ label: string | null; content: string }>;
}) {
  const intro =
    params.locale === Locale.ko
      ? [
          `SkillBook: ${params.title}`,
          params.description?.trim() ? `����: ${params.description.trim()}` : null,
          "���� ����а� �ؼ� ��Ģ�� �켱 �����Ѵ�.",
        ]
      : [
          `SkillBook: ${params.title}`,
          params.description?.trim() ? `Description: ${params.description.trim()}` : null,
          "Prioritize the following methodology and interpretation rules.",
        ];

  const sourceBlock = params.sources.length
    ? params.sources
        .map((source, index) => {
          const label = source.label?.trim() || `Source ${index + 1}`;
          return `[${label}]\n${source.content.trim()}`;
        })
        .join("\n\n")
    : params.locale === Locale.ko
      ? "[���� ���� ����]"
      : "[No source excerpts]";

  return [...intro.filter(Boolean), "Core Instructions:", params.body.trim(), "Source Excerpts:", sourceBlock]
    .join("\n\n")
    .trim();
}

