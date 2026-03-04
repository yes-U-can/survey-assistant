"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";
import {
  resolveSpecialTemplateRenderer,
  type SpecialTemplateDraft,
} from "@/lib/template-runtime/special-renderers";

type LocaleCode = "ko" | "en";

type ParticipantPackageItem = {
  enrollmentId: string;
  packageId: string;
  code: string;
  title: string;
  mode: "CROSS_SECTIONAL" | "LONGITUDINAL";
  status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  joinedAt: string;
  startsAt: string | null;
  endsAt: string | null;
  completedCount: number;
  maxResponsesPerParticipant: number;
  remainingCount: number;
  lastRespondedAt: string | null;
  canRespondNow: boolean;
};

type PackageListResponse = {
  ok: boolean;
  packages?: ParticipantPackageItem[];
  error?: string;
};

type SurveyTemplateItem = {
  templateId: string;
  orderIndex: number;
  type: "LIKERT" | "SPECIAL";
  title: string;
  description: string | null;
  version: number;
  schemaJson: unknown;
};

type SurveyDetail = {
  packageId: string;
  code: string;
  title: string;
  mode: "CROSS_SECTIONAL" | "LONGITUDINAL";
  nextAttemptNo: number;
  templates: SurveyTemplateItem[];
};

type SurveyLoadResponse = {
  ok: boolean;
  survey?: SurveyDetail;
  error?: string;
};

type LikertQuestion = {
  id: string;
  text: string;
};

type LikertSchema = {
  kind: "likert";
  scale: {
    min: number;
    max: number;
    labels: string[];
  };
  questions: LikertQuestion[];
};

type TemplateDraft = {
  likertAnswers: Record<string, number>;
  special: SpecialTemplateDraft;
};

const messageMap = {
  ko: {
    title: "피검자 홈",
    subtitle: "설문 코드를 등록하고 진행 현황을 확인하세요.",
    codeLabel: "설문 코드",
    codePlaceholder: "예: SICP-2026-ABCD",
    enrollButton: "코드 등록",
    refreshButton: "새로고침",
    loading: "불러오는 중...",
    empty: "등록된 설문 패키지가 없습니다.",
    sectionTitle: "내 설문 현황",
    completed: "완료",
    remaining: "남은 횟수",
    max: "총 허용 횟수",
    lastResponded: "최근 응답",
    period: "진행 기간",
    status: "상태",
    mode: "연구 유형",
    joinedAt: "등록일",
    canRespondNow: "지금 응답 가능",
    yes: "예",
    no: "아니오",
    notRespondedYet: "아직 응답 기록 없음",
    notSet: "미설정",
    openEnded: "기한 없음",
    enrollOk: "설문 코드 등록이 완료되었습니다.",
    enrollAlready: "이미 등록된 설문 코드입니다.",
    errorInvalid: "코드 형식이 올바르지 않습니다.",
    errorNotFound: "존재하지 않는 설문 코드입니다.",
    errorInactive: "현재 참여 가능한 설문이 아닙니다.",
    errorAuth: "로그인이 필요합니다.",
    errorDefault: "요청 처리 중 오류가 발생했습니다.",
    modeCross: "횡단",
    modeLong: "종단",
    statusDraft: "준비중",
    statusActive: "진행중",
    statusClosed: "종료",
    statusArchived: "보관",
    startSurvey: "응답 시작",
    closeSurvey: "폼 닫기",
    submitSurvey: "응답 제출",
    surveyLoading: "설문을 준비하는 중...",
    surveySubmitting: "제출 중...",
    surveyTemplate: "템플릿",
    surveyAttempt: "응답 차수",
    surveySubmitted: "설문 응답이 제출되었습니다.",
    surveyNeedAllAnswers: "리커트 문항을 모두 응답해주세요.",
    surveyInvalidJson: "특수 템플릿 JSON 형식이 올바르지 않습니다.",
    surveyUnavailable: "현재 이 패키지는 응답이 불가능합니다.",
  },
  en: {
    title: "Participant Home",
    subtitle: "Enroll with a survey code and check your response progress.",
    codeLabel: "Survey code",
    codePlaceholder: "e.g. SICP-2026-ABCD",
    enrollButton: "Enroll",
    refreshButton: "Refresh",
    loading: "Loading...",
    empty: "No enrolled survey package yet.",
    sectionTitle: "My Survey Progress",
    completed: "Completed",
    remaining: "Remaining",
    max: "Max responses",
    lastResponded: "Last response",
    period: "Period",
    status: "Status",
    mode: "Study mode",
    joinedAt: "Enrolled at",
    canRespondNow: "Available now",
    yes: "Yes",
    no: "No",
    notRespondedYet: "No response yet",
    notSet: "Not set",
    openEnded: "Open-ended",
    enrollOk: "Survey code enrolled successfully.",
    enrollAlready: "This survey code is already enrolled.",
    errorInvalid: "Invalid survey code payload.",
    errorNotFound: "Survey code not found.",
    errorInactive: "This package is not available now.",
    errorAuth: "Sign-in is required.",
    errorDefault: "Something went wrong.",
    modeCross: "Cross-sectional",
    modeLong: "Longitudinal",
    statusDraft: "Draft",
    statusActive: "Active",
    statusClosed: "Closed",
    statusArchived: "Archived",
    startSurvey: "Start response",
    closeSurvey: "Close form",
    submitSurvey: "Submit response",
    surveyLoading: "Preparing survey...",
    surveySubmitting: "Submitting...",
    surveyTemplate: "Template",
    surveyAttempt: "Attempt",
    surveySubmitted: "Survey response submitted.",
    surveyNeedAllAnswers: "Please answer all Likert questions.",
    surveyInvalidJson: "Invalid JSON for special template.",
    surveyUnavailable: "This package is currently unavailable.",
  },
} as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseLikertSchema(schema: unknown): LikertSchema | null {
  if (!isObject(schema)) {
    return null;
  }

  if (schema.kind !== "likert") {
    return null;
  }

  const scale = schema.scale;
  const questions = schema.questions;

  if (!isObject(scale) || !Array.isArray(questions)) {
    return null;
  }

  const min = Number(scale.min);
  const max = Number(scale.max);
  const labels = Array.isArray(scale.labels)
    ? scale.labels
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter((item) => item.length > 0)
    : [];

  if (!Number.isInteger(min) || !Number.isInteger(max) || min >= max) {
    return null;
  }

  const normalizedQuestions: LikertQuestion[] = [];
  for (const question of questions) {
    if (!isObject(question)) {
      return null;
    }
    const id = typeof question.id === "string" ? question.id.trim() : "";
    const text = typeof question.text === "string" ? question.text.trim() : "";
    if (!id || !text) {
      return null;
    }
    normalizedQuestions.push({ id, text });
  }

  if (normalizedQuestions.length === 0) {
    return null;
  }

  return {
    kind: "likert",
    scale: {
      min,
      max,
      labels,
    },
    questions: normalizedQuestions,
  };
}

function formatDate(value: string | null, locale: LocaleCode, emptyText: string) {
  if (!value) {
    return emptyText;
  }
  const date = new Date(value);
  const formatter = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return formatter.format(date);
}

function getEnrollErrorMessage(code: string | undefined, locale: LocaleCode) {
  const msg = messageMap[locale];
  switch (code) {
    case "invalid_payload":
      return msg.errorInvalid;
    case "package_not_found":
      return msg.errorNotFound;
    case "package_not_active":
    case "package_not_started":
    case "package_closed":
      return msg.errorInactive;
    case "unauthorized":
      return msg.errorAuth;
    default:
      return msg.errorDefault;
  }
}

function getSurveyErrorMessage(code: string | undefined, locale: LocaleCode) {
  const msg = messageMap[locale];
  switch (code) {
    case "package_not_active":
    case "package_not_started":
    case "package_closed":
    case "response_limit_reached":
      return msg.surveyUnavailable;
    case "unauthorized":
      return msg.errorAuth;
    default:
      return msg.errorDefault;
  }
}

function modeLabel(mode: ParticipantPackageItem["mode"], locale: LocaleCode) {
  if (mode === "LONGITUDINAL") {
    return locale === "ko" ? messageMap.ko.modeLong : messageMap.en.modeLong;
  }
  return locale === "ko" ? messageMap.ko.modeCross : messageMap.en.modeCross;
}

function statusLabel(status: ParticipantPackageItem["status"], locale: LocaleCode) {
  const msg = messageMap[locale];
  switch (status) {
    case "ACTIVE":
      return msg.statusActive;
    case "CLOSED":
      return msg.statusClosed;
    case "ARCHIVED":
      return msg.statusArchived;
    default:
      return msg.statusDraft;
  }
}

type Props = {
  locale: LocaleCode;
  initialPackages: ParticipantPackageItem[];
};

function rangeInclusive(start: number, end: number): number[] {
  const output: number[] = [];
  for (let i = start; i <= end; i += 1) {
    output.push(i);
  }
  return output;
}

export function ParticipantDashboardClient({ locale, initialPackages }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [packages, setPackages] = useState<ParticipantPackageItem[]>(initialPackages);
  const [message, setMessage] = useState("");

  const [activeSurvey, setActiveSurvey] = useState<SurveyDetail | null>(null);
  const [surveyLoadingPackageId, setSurveyLoadingPackageId] = useState<string | null>(null);
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const [surveyMessage, setSurveyMessage] = useState("");
  const [templateDrafts, setTemplateDrafts] = useState<Record<string, TemplateDraft>>({});

  const text = useMemo(() => messageMap[locale], [locale]);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/participant/packages", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as PackageListResponse | null;
    if (!response.ok || !payload?.ok || !payload.packages) {
      setMessage(text.errorDefault);
      setPackages([]);
      setLoading(false);
      return;
    }
    setPackages(payload.packages);
    setLoading(false);
  }, [text.errorDefault]);

  const onEnroll = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/participant/packages/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; alreadyEnrolled?: boolean; error?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setMessage(getEnrollErrorMessage(payload?.error, locale));
      setSubmitting(false);
      return;
    }

    setMessage(payload.alreadyEnrolled ? text.enrollAlready : text.enrollOk);
    setCode("");
    await loadPackages();
    setSubmitting(false);
  };

  const initializeDrafts = useCallback((survey: SurveyDetail) => {
    const nextDrafts: Record<string, TemplateDraft> = {};
    for (const template of survey.templates) {
      const likert = parseLikertSchema(template.schemaJson);
      if (template.type === "LIKERT" && likert) {
        const likertAnswers: Record<string, number> = {};
        for (const q of likert.questions) {
          likertAnswers[q.id] = Number.NaN;
        }
        nextDrafts[template.templateId] = {
          likertAnswers,
          special: {
            jsonText: "{}",
            state: {},
          },
        };
        continue;
      }

      const specialRenderer = resolveSpecialTemplateRenderer(template.schemaJson);
      nextDrafts[template.templateId] = {
        likertAnswers: {},
        special: specialRenderer.createInitialDraft(template.schemaJson),
      };
    }
    setTemplateDrafts(nextDrafts);
  }, []);

  const onOpenSurvey = useCallback(
    async (packageId: string) => {
      setSurveyMessage("");
      setSurveyLoadingPackageId(packageId);

      const response = await fetch(`/api/participant/packages/${packageId}/survey`, {
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as SurveyLoadResponse | null;

      if (!response.ok || !payload?.ok || !payload.survey) {
        setSurveyLoadingPackageId(null);
        setSurveyMessage(getSurveyErrorMessage(payload?.error, locale));
        return;
      }

      setActiveSurvey(payload.survey);
      initializeDrafts(payload.survey);
      setSurveyLoadingPackageId(null);
    },
    [initializeDrafts, locale],
  );

  const onCloseSurvey = useCallback(() => {
    setActiveSurvey(null);
    setTemplateDrafts({});
    setSurveyMessage("");
  }, []);

  const onSelectLikertValue = useCallback(
    (templateId: string, questionId: string, value: number) => {
      setTemplateDrafts((prev) => ({
        ...prev,
        [templateId]: {
          ...prev[templateId],
          likertAnswers: {
            ...(prev[templateId]?.likertAnswers ?? {}),
            [questionId]: value,
          },
          special: prev[templateId]?.special ?? { jsonText: "{}", state: {} },
        },
      }));
    },
    [],
  );

  const onChangeSpecialDraft = useCallback((templateId: string, value: SpecialTemplateDraft) => {
    setTemplateDrafts((prev) => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        likertAnswers: prev[templateId]?.likertAnswers ?? {},
        special: value,
      },
    }));
  }, []);

  const onSubmitSurvey = useCallback(async () => {
    if (!activeSurvey) {
      return;
    }

    setSurveySubmitting(true);
    setSurveyMessage("");

    const responses: Array<{ templateId: string; responseJson: unknown }> = [];

    for (const template of activeSurvey.templates) {
      const draft = templateDrafts[template.templateId];
      const likert = template.type === "LIKERT" ? parseLikertSchema(template.schemaJson) : null;

      if (template.type === "LIKERT" && likert) {
        const answers: Record<string, number> = {};
        let missing = false;

        for (const question of likert.questions) {
          const value = draft?.likertAnswers?.[question.id];
          if (!Number.isFinite(value)) {
            missing = true;
            break;
          }
          answers[question.id] = Number(value);
        }

        if (missing) {
          setSurveyMessage(text.surveyNeedAllAnswers);
          setSurveySubmitting(false);
          return;
        }

        responses.push({
          templateId: template.templateId,
          responseJson: {
            kind: "likert_response",
            answers,
          },
        });
        continue;
      }

      const specialRenderer = resolveSpecialTemplateRenderer(template.schemaJson);
      const specialResult = specialRenderer.buildResponse({
        schema: template.schemaJson,
        draft: draft?.special ?? specialRenderer.createInitialDraft(template.schemaJson),
      });
      if (!specialResult.ok) {
        setSurveyMessage(
          specialResult.errorCode === "incomplete_answers"
            ? text.surveyNeedAllAnswers
            : text.surveyInvalidJson,
        );
        setSurveySubmitting(false);
        return;
      }
      responses.push({
        templateId: template.templateId,
        responseJson: specialResult.responseJson,
      });
    }

    const response = await fetch("/api/participant/packages/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: activeSurvey.packageId,
        responses,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; error?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setSurveyMessage(getSurveyErrorMessage(payload?.error, locale));
      setSurveySubmitting(false);
      return;
    }

    setSurveyMessage(text.surveySubmitted);
    await loadPackages();
    onCloseSurvey();
    setSurveySubmitting(false);
  }, [
    activeSurvey,
    loadPackages,
    locale,
    onCloseSurvey,
    templateDrafts,
    text.surveyInvalidJson,
    text.surveyNeedAllAnswers,
    text.surveySubmitted,
  ]);

  return (
    <main className="sa-page">
      <h1>{text.title}</h1>
      <p>{text.subtitle}</p>

      <form onSubmit={onEnroll} className="sa-participant-enroll-form">
        <label htmlFor="survey-code" style={{ display: "none" }}>
          {text.codeLabel}
        </label>
        <input
          id="survey-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={text.codePlaceholder}
          className="sa-participant-code-input"
        />
        <button type="submit" disabled={submitting}>
          {text.enrollButton}
        </button>
        <button type="button" onClick={() => void loadPackages()}>
          {text.refreshButton}
        </button>
      </form>

      {message ? <p className="sa-inline-message">{message}</p> : null}

      <section>
        <h2>{text.sectionTitle}</h2>
        {loading ? <p>{text.loading}</p> : null}
        {!loading && packages.length === 0 ? <p>{text.empty}</p> : null}
        {!loading && packages.length > 0 ? (
          <div className="sa-participant-package-list">
            {packages.map((pkg) => {
              const isLoadingSurvey = surveyLoadingPackageId === pkg.packageId;
              const isActiveSurvey = activeSurvey?.packageId === pkg.packageId;

              return (
                <article key={pkg.enrollmentId} className="sa-participant-package-card">
                  <h3 className="sa-participant-package-title">
                    {pkg.title} <small>({pkg.code})</small>
                  </h3>
                  <p className="sa-participant-meta">
                    {text.status}: {statusLabel(pkg.status, locale)} | {text.mode}:{" "}
                    {modeLabel(pkg.mode, locale)}
                  </p>
                  <p className="sa-participant-meta">
                    {text.period}: {formatDate(pkg.startsAt, locale, text.notSet)} ~{" "}
                    {formatDate(pkg.endsAt, locale, text.openEnded)}
                  </p>
                  <p className="sa-participant-meta">
                    {text.completed}: {pkg.completedCount} / {text.max}:{" "}
                    {pkg.maxResponsesPerParticipant} / {text.remaining}: {pkg.remainingCount}
                  </p>
                  <p className="sa-participant-meta">
                    {text.lastResponded}:{" "}
                    {formatDate(pkg.lastRespondedAt, locale, text.notRespondedYet)}
                  </p>
                  <p className="sa-participant-meta">
                    {text.joinedAt}: {formatDate(pkg.joinedAt, locale, text.notSet)}
                  </p>
                  <p className="sa-participant-meta">
                    {text.canRespondNow}: {pkg.canRespondNow ? text.yes : text.no}
                  </p>

                  <div className="sa-participant-actions">
                    {!isActiveSurvey ? (
                      <button
                        type="button"
                        disabled={!pkg.canRespondNow || isLoadingSurvey}
                        onClick={() => void onOpenSurvey(pkg.packageId)}
                      >
                        {isLoadingSurvey ? text.surveyLoading : text.startSurvey}
                      </button>
                    ) : (
                      <button type="button" onClick={onCloseSurvey}>
                        {text.closeSurvey}
                      </button>
                    )}
                  </div>

                  {isActiveSurvey && activeSurvey ? (
                    <section className="sa-participant-survey-shell">
                      <p className="sa-participant-attempt">
                        {text.surveyAttempt}: {activeSurvey.nextAttemptNo}
                      </p>

                      <div className="sa-participant-template-list">
                        {activeSurvey.templates.map((template) => {
                          const likert = parseLikertSchema(template.schemaJson);
                          const draft = templateDrafts[template.templateId];
                          const specialRenderer = resolveSpecialTemplateRenderer(
                            template.schemaJson,
                          );

                          return (
                            <article key={template.templateId} className="sa-participant-template-card">
                              <h4 className="sa-participant-template-title">
                                {text.surveyTemplate} {template.orderIndex + 1}: {template.title}
                              </h4>
                              {template.description ? (
                                <p className="sa-participant-template-desc">{template.description}</p>
                              ) : null}

                              {template.type === "LIKERT" && likert ? (
                                <div className="sa-likert-question-list">
                                  {likert.questions.map((question) => (
                                    <fieldset key={question.id} className="sa-likert-question">
                                      <legend>{question.text}</legend>
                                      <div className="sa-likert-options">
                                        {rangeInclusive(likert.scale.min, likert.scale.max).map(
                                          (score) => {
                                            const label =
                                              likert.scale.labels[score - likert.scale.min] ??
                                              String(score);
                                            const checked =
                                              draft?.likertAnswers?.[question.id] === score;
                                            return (
                                              <label key={score} className="sa-likert-option">
                                                <input
                                                  className="sa-likert-radio"
                                                  type="radio"
                                                  name={`${template.templateId}-${question.id}`}
                                                  checked={checked}
                                                  onChange={() =>
                                                    onSelectLikertValue(
                                                      template.templateId,
                                                      question.id,
                                                      score,
                                                    )
                                                  }
                                                />
                                                <span className="sa-likert-option-label">
                                                  {score}. {label}
                                                </span>
                                              </label>
                                            );
                                          },
                                        )}
                                      </div>
                                    </fieldset>
                                  ))}
                                </div>
                              ) : (
                                <div className="sa-special-render-wrap">
                                  {specialRenderer.render({
                                    locale,
                                    schema: template.schemaJson,
                                    draft:
                                      draft?.special ??
                                      specialRenderer.createInitialDraft(template.schemaJson),
                                    disabled: surveySubmitting,
                                    onChangeDraft: (next) =>
                                      onChangeSpecialDraft(template.templateId, next),
                                  })}
                                </div>
                              )}
                            </article>
                          );
                        })}
                      </div>

                      <div className="sa-participant-submit-actions">
                        <button
                          type="button"
                          disabled={surveySubmitting}
                          onClick={() => void onSubmitSurvey()}
                        >
                          {surveySubmitting ? text.surveySubmitting : text.submitSurvey}
                        </button>
                      </div>
                    </section>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : null}
      </section>

      {surveyMessage ? <p className="sa-inline-message">{surveyMessage}</p> : null}
    </main>
  );
}
