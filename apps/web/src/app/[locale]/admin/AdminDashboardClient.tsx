"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";

type LocaleCode = "ko" | "en";

type TemplateItem = {
  id: string;
  type: "LIKERT" | "SPECIAL";
  visibility: "PRIVATE" | "STORE";
  title: string;
  description: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

type PackageTemplateItem = {
  templateId: string;
  orderIndex: number;
  title: string;
  type: "LIKERT" | "SPECIAL";
};

type PackageItem = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  mode: "CROSS_SECTIONAL" | "LONGITUDINAL";
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  maxResponsesPerParticipant: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  templates: PackageTemplateItem[];
};

type Props = {
  locale: LocaleCode;
  initialTemplates: TemplateItem[];
  initialPackages: PackageItem[];
};

const msg = {
  ko: {
    title: "관리자 홈",
    subtitle: "템플릿/패키지를 생성하고 상태를 운영하세요.",
    templateSection: "템플릿 관리",
    packageSection: "패키지 관리",
    createTemplate: "템플릿 생성",
    createPackage: "패키지 생성",
    refresh: "새로고침",
    save: "저장",
    loading: "처리 중...",
    templateTitle: "템플릿 제목",
    templateDesc: "설명",
    templateType: "유형",
    templateVisibility: "공개 범위",
    likertScaleMin: "최소 척도값",
    likertScaleMax: "최대 척도값",
    likertLabels: "척도 라벨(쉼표 또는 줄바꿈 구분)",
    likertQuestions: "문항(줄바꿈 구분)",
    specialSchema: "특수 템플릿 JSON",
    packageCode: "패키지 코드",
    packageTitle: "패키지 제목",
    packageDesc: "설명",
    packageMode: "연구 유형",
    packageMaxResponses: "1인당 응답 허용 횟수",
    packageStartsAt: "시작일시",
    packageEndsAt: "종료일시",
    packageTemplates: "포함 템플릿",
    status: "상태",
    mode: "유형",
    visibility: "공개",
    noTemplate: "생성된 템플릿이 없습니다.",
    noPackage: "생성된 패키지가 없습니다.",
    successTemplate: "템플릿이 생성되었습니다.",
    successPackage: "패키지가 생성되었습니다.",
    successStatus: "패키지 상태가 변경되었습니다.",
    failDefault: "요청 처리 중 오류가 발생했습니다.",
    failValidationTemplate: "템플릿 입력값을 확인하세요.",
    failValidationPackage: "패키지 입력값을 확인하세요.",
    failJson: "특수 템플릿 JSON 형식이 올바르지 않습니다.",
    failNeedTemplate: "패키지에 포함할 템플릿을 1개 이상 선택하세요.",
    statusDraft: "준비중",
    statusActive: "진행중",
    statusClosed: "종료",
    statusArchived: "보관",
    modeCross: "횡단",
    modeLong: "종단",
    typeLikert: "리커트",
    typeSpecial: "특수",
    visibilityPrivate: "비공개",
    visibilityStore: "스토어 공개",
    setDraft: "준비중으로",
    setActive: "진행중으로",
    setClosed: "종료로",
    setArchived: "보관으로",
  },
  en: {
    title: "Admin Home",
    subtitle: "Create templates/packages and operate status flows.",
    templateSection: "Template Management",
    packageSection: "Package Management",
    createTemplate: "Create Template",
    createPackage: "Create Package",
    refresh: "Refresh",
    save: "Save",
    loading: "Processing...",
    templateTitle: "Template title",
    templateDesc: "Description",
    templateType: "Type",
    templateVisibility: "Visibility",
    likertScaleMin: "Scale min",
    likertScaleMax: "Scale max",
    likertLabels: "Scale labels (comma/newline separated)",
    likertQuestions: "Questions (newline separated)",
    specialSchema: "Special template JSON",
    packageCode: "Package code",
    packageTitle: "Package title",
    packageDesc: "Description",
    packageMode: "Study mode",
    packageMaxResponses: "Max responses per participant",
    packageStartsAt: "Starts at",
    packageEndsAt: "Ends at",
    packageTemplates: "Templates in package",
    status: "Status",
    mode: "Mode",
    visibility: "Visibility",
    noTemplate: "No template created yet.",
    noPackage: "No package created yet.",
    successTemplate: "Template created.",
    successPackage: "Package created.",
    successStatus: "Package status updated.",
    failDefault: "Request failed.",
    failValidationTemplate: "Check template form values.",
    failValidationPackage: "Check package form values.",
    failJson: "Invalid JSON for special template.",
    failNeedTemplate: "Select at least one template.",
    statusDraft: "Draft",
    statusActive: "Active",
    statusClosed: "Closed",
    statusArchived: "Archived",
    modeCross: "Cross-sectional",
    modeLong: "Longitudinal",
    typeLikert: "Likert",
    typeSpecial: "Special",
    visibilityPrivate: "Private",
    visibilityStore: "Store",
    setDraft: "Set Draft",
    setActive: "Set Active",
    setClosed: "Set Closed",
    setArchived: "Set Archived",
  },
} as const;

function statusLabel(locale: LocaleCode, value: PackageItem["status"]) {
  const t = msg[locale];
  if (value === "ACTIVE") return t.statusActive;
  if (value === "CLOSED") return t.statusClosed;
  if (value === "ARCHIVED") return t.statusArchived;
  return t.statusDraft;
}

function modeLabel(locale: LocaleCode, value: PackageItem["mode"]) {
  const t = msg[locale];
  return value === "LONGITUDINAL" ? t.modeLong : t.modeCross;
}

function templateTypeLabel(locale: LocaleCode, value: TemplateItem["type"]) {
  const t = msg[locale];
  return value === "SPECIAL" ? t.typeSpecial : t.typeLikert;
}

function visibilityLabel(locale: LocaleCode, value: TemplateItem["visibility"]) {
  const t = msg[locale];
  return value === "STORE" ? t.visibilityStore : t.visibilityPrivate;
}

export function AdminDashboardClient({
  locale,
  initialTemplates,
  initialPackages,
}: Props) {
  const t = useMemo(() => msg[locale], [locale]);

  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [templateType, setTemplateType] = useState<"LIKERT" | "SPECIAL">("LIKERT");
  const [templateVisibility, setTemplateVisibility] = useState<"PRIVATE" | "STORE">("PRIVATE");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [likertMin, setLikertMin] = useState(1);
  const [likertMax, setLikertMax] = useState(5);
  const [likertLabels, setLikertLabels] = useState(
    locale === "ko"
      ? "전혀 아니다,아니다,보통이다,그렇다,매우 그렇다"
      : "Strongly disagree,Disagree,Neutral,Agree,Strongly agree",
  );
  const [likertQuestions, setLikertQuestions] = useState(
    locale === "ko"
      ? "나는 오늘 집중이 잘 된다."
      : "I can focus well today.",
  );
  const [specialSchemaText, setSpecialSchemaText] = useState(
    JSON.stringify({ kind: "special", version: 1, fields: [] }, null, 2),
  );

  const [packageCode, setPackageCode] = useState("");
  const [packageTitle, setPackageTitle] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageMode, setPackageMode] = useState<"CROSS_SECTIONAL" | "LONGITUDINAL">(
    "CROSS_SECTIONAL",
  );
  const [packageMaxResponses, setPackageMaxResponses] = useState(1);
  const [packageStartsAt, setPackageStartsAt] = useState("");
  const [packageEndsAt, setPackageEndsAt] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    const [tplRes, pkgRes] = await Promise.all([
      fetch("/api/admin/templates", { cache: "no-store" }),
      fetch("/api/admin/packages", { cache: "no-store" }),
    ]);

    const tplJson = (await tplRes.json().catch(() => null)) as
      | { ok?: boolean; templates?: TemplateItem[] }
      | null;
    const pkgJson = (await pkgRes.json().catch(() => null)) as
      | { ok?: boolean; packages?: PackageItem[] }
      | null;

    if (!tplRes.ok || !pkgRes.ok || !tplJson?.ok || !pkgJson?.ok) {
      setMessage(t.failDefault);
      setIsLoading(false);
      return;
    }

    setTemplates(tplJson.templates ?? []);
    setPackages(pkgJson.packages ?? []);
    setIsLoading(false);
  }, [t.failDefault]);

  const buildTemplateSchema = () => {
    if (templateType === "SPECIAL") {
      try {
        const parsed = JSON.parse(specialSchemaText);
        if (parsed === null || typeof parsed !== "object") {
          return null;
        }
        return parsed as Record<string, unknown>;
      } catch {
        return null;
      }
    }

    const labels = likertLabels
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter(Boolean);
    const questions = likertQuestions
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    if (labels.length < 2 || questions.length < 1 || likertMin >= likertMax) {
      return null;
    }

    return {
      kind: "likert",
      scale: { min: likertMin, max: likertMax, labels },
      questions: questions.map((q, i) => ({ id: `q${i + 1}`, text: q })),
    };
  };

  const onCreateTemplate = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!templateTitle.trim()) {
      setMessage(t.failValidationTemplate);
      return;
    }

    const schema = buildTemplateSchema();
    if (!schema) {
      setMessage(templateType === "SPECIAL" ? t.failJson : t.failValidationTemplate);
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/admin/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: templateType,
        title: templateTitle.trim(),
        description: templateDescription.trim() || undefined,
        visibility: templateVisibility,
        schemaJson: schema,
      }),
    });

    if (!response.ok) {
      setMessage(t.failDefault);
      setIsLoading(false);
      return;
    }

    setTemplateTitle("");
    setTemplateDescription("");
    await refreshAll();
    setMessage(t.successTemplate);
    setIsLoading(false);
  };

  const onToggleTemplate = (templateId: string) => {
    setSelectedTemplateIds((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId],
    );
  };

  const toIsoOrUndefined = (value: string) => {
    if (!value.trim()) {
      return undefined;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  };

  const onCreatePackage = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!packageCode.trim() || !packageTitle.trim()) {
      setMessage(t.failValidationPackage);
      return;
    }
    if (selectedTemplateIds.length < 1) {
      setMessage(t.failNeedTemplate);
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/admin/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: packageCode.trim(),
        title: packageTitle.trim(),
        description: packageDescription.trim() || undefined,
        mode: packageMode,
        maxResponsesPerParticipant: packageMaxResponses,
        startsAt: toIsoOrUndefined(packageStartsAt),
        endsAt: toIsoOrUndefined(packageEndsAt),
        templateIds: selectedTemplateIds,
      }),
    });

    if (!response.ok) {
      setMessage(t.failDefault);
      setIsLoading(false);
      return;
    }

    setPackageCode("");
    setPackageTitle("");
    setPackageDescription("");
    setPackageMode("CROSS_SECTIONAL");
    setPackageMaxResponses(1);
    setPackageStartsAt("");
    setPackageEndsAt("");
    setSelectedTemplateIds([]);
    await refreshAll();
    setMessage(t.successPackage);
    setIsLoading(false);
  };

  const onChangePackageStatus = async (
    packageId: string,
    status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED",
  ) => {
    setIsLoading(true);
    setMessage("");

    const response = await fetch(`/api/admin/packages/${packageId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setMessage(t.failDefault);
      setIsLoading(false);
      return;
    }

    await refreshAll();
    setMessage(t.successStatus);
    setIsLoading(false);
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", display: "grid", gap: 20 }}>
      <section>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        <button
          type="button"
          onClick={() => void refreshAll()}
          disabled={isLoading}
          style={{ padding: "8px 12px" }}
        >
          {isLoading ? t.loading : t.refresh}
        </button>
        {message ? <p style={{ marginTop: 10 }}>{message}</p> : null}
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14 }}>
        <h2>{t.templateSection}</h2>
        <form onSubmit={onCreateTemplate} style={{ display: "grid", gap: 10, marginTop: 8 }}>
          <label>
            {t.templateType}
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value as "LIKERT" | "SPECIAL")}
              style={{ marginLeft: 8 }}
            >
              <option value="LIKERT">{t.typeLikert}</option>
              <option value="SPECIAL">{t.typeSpecial}</option>
            </select>
          </label>

          <label>
            {t.templateVisibility}
            <select
              value={templateVisibility}
              onChange={(e) =>
                setTemplateVisibility(e.target.value as "PRIVATE" | "STORE")
              }
              style={{ marginLeft: 8 }}
            >
              <option value="PRIVATE">{t.visibilityPrivate}</option>
              <option value="STORE">{t.visibilityStore}</option>
            </select>
          </label>

          <label>
            {t.templateTitle}
            <input
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              style={{ marginLeft: 8, minWidth: 320 }}
            />
          </label>

          <label>
            {t.templateDesc}
            <input
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              style={{ marginLeft: 8, minWidth: 320 }}
            />
          </label>

          {templateType === "LIKERT" ? (
            <>
              <label>
                {t.likertScaleMin}
                <input
                  type="number"
                  value={likertMin}
                  onChange={(e) => setLikertMin(Number(e.target.value))}
                  style={{ marginLeft: 8, width: 80 }}
                />
              </label>
              <label>
                {t.likertScaleMax}
                <input
                  type="number"
                  value={likertMax}
                  onChange={(e) => setLikertMax(Number(e.target.value))}
                  style={{ marginLeft: 8, width: 80 }}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                {t.likertLabels}
                <textarea
                  value={likertLabels}
                  onChange={(e) => setLikertLabels(e.target.value)}
                  rows={2}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                {t.likertQuestions}
                <textarea
                  value={likertQuestions}
                  onChange={(e) => setLikertQuestions(e.target.value)}
                  rows={4}
                />
              </label>
            </>
          ) : (
            <label style={{ display: "grid", gap: 6 }}>
              {t.specialSchema}
              <textarea
                value={specialSchemaText}
                onChange={(e) => setSpecialSchemaText(e.target.value)}
                rows={8}
                style={{ fontFamily: "monospace" }}
              />
            </label>
          )}

          <button type="submit" disabled={isLoading} style={{ padding: "8px 12px", width: 140 }}>
            {isLoading ? t.loading : t.createTemplate}
          </button>
        </form>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {templates.length === 0 ? (
            <p>{t.noTemplate}</p>
          ) : (
            templates.map((tpl) => (
              <article key={tpl.id} style={{ border: "1px solid #eee", padding: 10 }}>
                <strong>{tpl.title}</strong> ({templateTypeLabel(locale, tpl.type)}) |{" "}
                {t.visibility}: {visibilityLabel(locale, tpl.visibility)}
                <br />
                <small>{tpl.description ?? ""}</small>
              </article>
            ))
          )}
        </div>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14 }}>
        <h2>{t.packageSection}</h2>
        <form onSubmit={onCreatePackage} style={{ display: "grid", gap: 10, marginTop: 8 }}>
          <label>
            {t.packageCode}
            <input
              value={packageCode}
              onChange={(e) => setPackageCode(e.target.value)}
              style={{ marginLeft: 8, minWidth: 220 }}
            />
          </label>
          <label>
            {t.packageTitle}
            <input
              value={packageTitle}
              onChange={(e) => setPackageTitle(e.target.value)}
              style={{ marginLeft: 8, minWidth: 320 }}
            />
          </label>
          <label>
            {t.packageDesc}
            <input
              value={packageDescription}
              onChange={(e) => setPackageDescription(e.target.value)}
              style={{ marginLeft: 8, minWidth: 320 }}
            />
          </label>
          <label>
            {t.packageMode}
            <select
              value={packageMode}
              onChange={(e) =>
                setPackageMode(e.target.value as "CROSS_SECTIONAL" | "LONGITUDINAL")
              }
              style={{ marginLeft: 8 }}
            >
              <option value="CROSS_SECTIONAL">{t.modeCross}</option>
              <option value="LONGITUDINAL">{t.modeLong}</option>
            </select>
          </label>
          <label>
            {t.packageMaxResponses}
            <input
              type="number"
              min={1}
              value={packageMaxResponses}
              onChange={(e) => setPackageMaxResponses(Number(e.target.value))}
              style={{ marginLeft: 8, width: 80 }}
            />
          </label>
          <label>
            {t.packageStartsAt}
            <input
              type="datetime-local"
              value={packageStartsAt}
              onChange={(e) => setPackageStartsAt(e.target.value)}
              style={{ marginLeft: 8 }}
            />
          </label>
          <label>
            {t.packageEndsAt}
            <input
              type="datetime-local"
              value={packageEndsAt}
              onChange={(e) => setPackageEndsAt(e.target.value)}
              style={{ marginLeft: 8 }}
            />
          </label>

          <fieldset style={{ border: "1px solid #eee", padding: 10 }}>
            <legend>{t.packageTemplates}</legend>
            {templates.length === 0 ? (
              <p>{t.noTemplate}</p>
            ) : (
              <div style={{ display: "grid", gap: 6 }}>
                {templates.map((tpl) => (
                  <label key={tpl.id}>
                    <input
                      type="checkbox"
                      checked={selectedTemplateIds.includes(tpl.id)}
                      onChange={() => onToggleTemplate(tpl.id)}
                    />
                    <span style={{ marginLeft: 6 }}>
                      {tpl.title} ({templateTypeLabel(locale, tpl.type)})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <button type="submit" disabled={isLoading} style={{ padding: "8px 12px", width: 140 }}>
            {isLoading ? t.loading : t.createPackage}
          </button>
        </form>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          {packages.length === 0 ? (
            <p>{t.noPackage}</p>
          ) : (
            packages.map((pkg) => (
              <article key={pkg.id} style={{ border: "1px solid #eee", padding: 10 }}>
                <strong>{pkg.title}</strong> ({pkg.code})<br />
                {t.status}: {statusLabel(locale, pkg.status)} | {t.mode}:{" "}
                {modeLabel(locale, pkg.mode)} | max {pkg.maxResponsesPerParticipant}
                <br />
                <small>
                  templates:{" "}
                  {pkg.templates.map((tpl) => tpl.title).join(", ") || "-"}
                </small>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => void onChangePackageStatus(pkg.id, "DRAFT")}
                    disabled={isLoading}
                  >
                    {t.setDraft}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onChangePackageStatus(pkg.id, "ACTIVE")}
                    disabled={isLoading}
                  >
                    {t.setActive}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onChangePackageStatus(pkg.id, "CLOSED")}
                    disabled={isLoading}
                  >
                    {t.setClosed}
                  </button>
                  <button
                    type="button"
                    onClick={() => void onChangePackageStatus(pkg.id, "ARCHIVED")}
                    disabled={isLoading}
                  >
                    {t.setArchived}
                  </button>
                  <a
                    href={`/api/admin/packages/${pkg.id}/export`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 8px",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      textDecoration: "none",
                      color: "inherit",
                      fontSize: 13,
                    }}
                  >
                    {locale === "ko" ? "CSV" : "Export CSV"}
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
