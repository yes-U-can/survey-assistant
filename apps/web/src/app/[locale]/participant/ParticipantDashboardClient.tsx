"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";

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
    openEnded: "제한 없음",
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
  },
} as const;

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

export function ParticipantDashboardClient({ locale, initialPackages }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [packages, setPackages] = useState<ParticipantPackageItem[]>(initialPackages);
  const [message, setMessage] = useState("");

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

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>{text.title}</h1>
      <p>{text.subtitle}</p>

      <form onSubmit={onEnroll} style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <label htmlFor="survey-code" style={{ display: "none" }}>
          {text.codeLabel}
        </label>
        <input
          id="survey-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={text.codePlaceholder}
          style={{ minWidth: 260, padding: "8px 10px" }}
        />
        <button type="submit" disabled={submitting} style={{ padding: "8px 12px" }}>
          {text.enrollButton}
        </button>
        <button type="button" onClick={() => void loadPackages()} style={{ padding: "8px 12px" }}>
          {text.refreshButton}
        </button>
      </form>

      {message ? <p style={{ marginTop: 12 }}>{message}</p> : null}

      <section style={{ marginTop: 24 }}>
        <h2>{text.sectionTitle}</h2>
        {loading ? <p>{text.loading}</p> : null}
        {!loading && packages.length === 0 ? <p>{text.empty}</p> : null}
        {!loading && packages.length > 0 ? (
          <div style={{ display: "grid", gap: 12 }}>
            {packages.map((pkg) => (
              <article
                key={pkg.enrollmentId}
                style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14 }}
              >
                <h3 style={{ margin: 0 }}>
                  {pkg.title} <small>({pkg.code})</small>
                </h3>
                <p style={{ margin: "8px 0 0 0" }}>
                  {text.status}: {statusLabel(pkg.status, locale)} | {text.mode}: {" "}
                  {modeLabel(pkg.mode, locale)}
                </p>
                <p style={{ margin: "4px 0 0 0" }}>
                  {text.period}: {formatDate(pkg.startsAt, locale, text.notSet)} ~{" "}
                  {formatDate(pkg.endsAt, locale, text.openEnded)}
                </p>
                <p style={{ margin: "4px 0 0 0" }}>
                  {text.completed}: {pkg.completedCount} / {text.max}: {" "}
                  {pkg.maxResponsesPerParticipant} / {text.remaining}: {pkg.remainingCount}
                </p>
                <p style={{ margin: "4px 0 0 0" }}>
                  {text.lastResponded}: {formatDate(pkg.lastRespondedAt, locale, text.notRespondedYet)}
                </p>
                <p style={{ margin: "4px 0 0 0" }}>
                  {text.joinedAt}: {formatDate(pkg.joinedAt, locale, text.notSet)}
                </p>
                <p style={{ margin: "4px 0 0 0" }}>
                  {text.canRespondNow}: {pkg.canRespondNow ? text.yes : text.no}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
