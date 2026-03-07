"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getDefaultModel, type AiProvider } from "@/lib/ai/providers";

type LocaleCode = "ko" | "en";

type PackageOption = {
  id: string;
  code: string;
  title: string;
};

type SkillBookOption = {
  id: string;
  title: string;
};

type CreditTransactionItem = {
  id: string;
  type: string;
  amount: number;
  memo: string | null;
  referenceId: string | null;
  createdAt: string;
};

type BuilderDraft = {
  title: string;
  description: string;
  body: string;
  sourceSummary: string;
  compiledPrompt: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Props = {
  locale: LocaleCode;
  packages: PackageOption[];
};

const refreshEventName = "sa-skillbook-library-changed";
const providers: AiProvider[] = ["OPENAI", "GEMINI", "ANTHROPIC"];

const copy = {
  ko: {
    title: "유료 AI 도구",
    subtitle: "플랫폼 크레딧으로 Managed AI chat과 SkillBook Builder를 사용합니다.",
    wallet: "내 크레딧",
    recentTransactions: "최근 크레딧 내역",
    noTransactions: "최근 크레딧 내역이 없습니다.",
    managedChat: "Managed AI chat",
    builder: "SkillBook Builder",
    packageLabel: "패키지",
    providerLabel: "Provider",
    modelLabel: "모델",
    skillBookLabel: "참고 SkillBook",
    messageLabel: "질문",
    send: "Managed AI 실행",
    clearChat: "대화 비우기",
    builderGoal: "빌더 목표",
    builderTitleHint: "제목 힌트",
    builderDescriptionHint: "설명 힌트",
    builderNotes: "방법론 메모",
    buildDraft: "SkillBook 초안 생성",
    saveDraft: "초안을 SkillBook으로 저장",
    refreshWallet: "지갑 새로고침",
    loading: "처리 중...",
    noPackages: "패키지가 있어야 Managed AI chat을 사용할 수 있습니다.",
    noSkillBooks: "선택 가능한 SkillBook이 없습니다.",
    noDraft: "아직 생성된 초안이 없습니다.",
    balance: "잔액",
    charged: "차감",
    refunded: "환불",
    saveDone: "Builder 초안을 SkillBook으로 저장했습니다.",
    buildDone: "SkillBook Builder 초안이 생성되었습니다.",
    askPlaceholder: "예: 이 패키지 결과에서 가장 먼저 볼 만한 추세를 설명해줘.",
    goalPlaceholder: "예: 반복 측정 자료를 해석할 수 있는 SkillBook 초안을 만들어줘.",
    notesPlaceholder: "연구 계획, 가설, 해석 규칙, 통계 방법 메모를 붙여 넣으세요.",
    titleHintPlaceholder: "예: 우울/불안 반복측정 해석 규칙",
    descriptionHintPlaceholder: "예: 횡단/종단 설문 결과를 연구자 관점에서 해석하기 위한 규칙",
    none: "없음",
    creditsPolicy: "정책: 실행 시작 시 즉시 차감되고, 실패하면 자동 환불됩니다.",
  },
  en: {
    title: "Paid AI Tools",
    subtitle: "Use platform credits for Managed AI chat and the SkillBook Builder.",
    wallet: "My Credits",
    recentTransactions: "Recent credit activity",
    noTransactions: "No recent credit activity.",
    managedChat: "Managed AI chat",
    builder: "SkillBook Builder",
    packageLabel: "Package",
    providerLabel: "Provider",
    modelLabel: "Model",
    skillBookLabel: "Reference SkillBook",
    messageLabel: "Question",
    send: "Run Managed AI",
    clearChat: "Clear chat",
    builderGoal: "Builder goal",
    builderTitleHint: "Title hint",
    builderDescriptionHint: "Description hint",
    builderNotes: "Methodology notes",
    buildDraft: "Generate SkillBook draft",
    saveDraft: "Save draft as SkillBook",
    refreshWallet: "Refresh wallet",
    loading: "Processing...",
    noPackages: "A package is required before using Managed AI chat.",
    noSkillBooks: "No SkillBook available.",
    noDraft: "No generated draft yet.",
    balance: "Balance",
    charged: "Charged",
    refunded: "Refunded",
    saveDone: "Saved the Builder draft as a SkillBook.",
    buildDone: "Generated a SkillBook Builder draft.",
    askPlaceholder: "e.g. Explain the first trends I should inspect in this package.",
    goalPlaceholder: "e.g. Create a reusable interpretation SkillBook for repeated mood surveys.",
    notesPlaceholder: "Paste research plans, hypotheses, interpretation rules, or statistics notes.",
    titleHintPlaceholder: "e.g. Longitudinal mood interpretation rules",
    descriptionHintPlaceholder: "e.g. Rules for interpreting cross-sectional and longitudinal survey results",
    none: "None",
    creditsPolicy: "Policy: charge immediately on start, automatic refund on failure.",
  },
} as const;

function errorMessage(locale: LocaleCode, code: string | undefined) {
  if (!code) {
    return "unknown_error";
  }
  if (locale === "ko") {
    switch (code) {
      case "insufficient_balance":
        return "크레딧이 부족합니다.";
      case "missing_managed_provider_api_key":
        return "플랫폼 제공 AI 키가 아직 설정되지 않았습니다.";
      case "missing_idempotency_key":
        return "내부 요청 키가 누락되었습니다.";
      case "builder_invalid_response":
        return "Builder가 초안을 안정적으로 만들지 못했습니다.";
      case "provider_auth_error":
        return "플랫폼 AI 제공자 인증에 실패했습니다.";
      case "provider_rate_limited":
        return "플랫폼 AI 호출 한도에 걸렸습니다.";
      case "refund_failed_after_provider_error":
      case "refund_failed_after_internal_error":
        return "실패 후 환불 처리까지 실패했습니다. 원장 확인이 필요합니다.";
      default:
        return code;
    }
  }
  switch (code) {
    case "insufficient_balance":
      return "Insufficient credits.";
    case "missing_managed_provider_api_key":
      return "Managed provider key is not configured.";
    case "missing_idempotency_key":
      return "Missing internal idempotency key.";
    case "builder_invalid_response":
      return "Builder returned an unusable draft.";
    case "provider_auth_error":
      return "Managed provider authentication failed.";
    case "provider_rate_limited":
      return "Managed provider rate limit exceeded.";
    case "refund_failed_after_provider_error":
    case "refund_failed_after_internal_error":
      return "The request failed and the refund flow also failed.";
    default:
      return code;
  }
}

export function AdminManagedAiPanel({ locale, packages }: Props) {
  const t = copy[locale];
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransactionItem[]>([]);
  const [skillBooks, setSkillBooks] = useState<SkillBookOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [chatPackageId, setChatPackageId] = useState(packages[0]?.id ?? "");
  const [chatProvider, setChatProvider] = useState<AiProvider>("OPENAI");
  const [chatModel, setChatModel] = useState(getDefaultModel("OPENAI"));
  const [chatSkillBookId, setChatSkillBookId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatMeta, setChatMeta] = useState("");

  const [builderProvider, setBuilderProvider] = useState<AiProvider>("OPENAI");
  const [builderModel, setBuilderModel] = useState(getDefaultModel("OPENAI"));
  const [builderGoal, setBuilderGoal] = useState("");
  const [builderTitleHint, setBuilderTitleHint] = useState("");
  const [builderDescriptionHint, setBuilderDescriptionHint] = useState("");
  const [builderNotes, setBuilderNotes] = useState("");
  const [draft, setDraft] = useState<BuilderDraft | null>(null);

  const idempotencyRef = useRef(0);

  useEffect(() => {
    setChatModel(getDefaultModel(chatProvider));
  }, [chatProvider]);

  useEffect(() => {
    setBuilderModel(getDefaultModel(builderProvider));
  }, [builderProvider]);

  const refreshWallet = useCallback(async () => {
    const response = await fetch("/api/admin/credits?limit=10", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          wallet?: { balance?: number };
          transactions?: CreditTransactionItem[];
          error?: string;
        }
      | null;

    if (!response.ok || !payload?.ok) {
      setMessage(payload?.error ?? "credits_load_failed");
      return;
    }

    setWalletBalance(payload.wallet?.balance ?? 0);
    setTransactions(payload.transactions ?? []);
  }, []);

  const refreshSkillBooks = useCallback(async () => {
    const response = await fetch("/api/admin/skillbooks", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; skillBooks?: Array<{ id: string; title: string }>; error?: string }
      | null;

    if (!response.ok || !payload?.ok || !payload.skillBooks) {
      return;
    }

    setSkillBooks(payload.skillBooks.map((item) => ({ id: item.id, title: item.title })));
    setChatSkillBookId((current) =>
      current && payload.skillBooks?.some((item) => item.id === current)
        ? current
        : "",
    );
  }, []);

  useEffect(() => {
    void refreshWallet();
    void refreshSkillBooks();
  }, [refreshSkillBooks, refreshWallet]);

  useEffect(() => {
    const handler = () => {
      void refreshSkillBooks();
    };
    window.addEventListener(refreshEventName, handler);
    return () => {
      window.removeEventListener(refreshEventName, handler);
    };
  }, [refreshSkillBooks]);

  const issueIdempotencyKey = useCallback((prefix: string) => {
    idempotencyRef.current += 1;
    return `${prefix}_${idempotencyRef.current}`;
  }, []);

  const onManagedChat = async (event: FormEvent) => {
    event.preventDefault();
    if (!chatPackageId) {
      setMessage(t.noPackages);
      return;
    }
    if (!chatInput.trim()) {
      return;
    }

    const nextMessages = [...chatMessages, { role: "user", content: chatInput.trim() } as ChatMessage];
    setChatMessages(nextMessages);
    setChatInput("");
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": issueIdempotencyKey("managed_chat"),
      },
      body: JSON.stringify({
        mode: "MANAGED",
        packageId: chatPackageId,
        provider: chatProvider,
        model: chatModel.trim() || undefined,
        skillBookId: chatSkillBookId || undefined,
        messages: nextMessages,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
          assistantMessage?: string;
          model?: string;
          usage?: { totalTokens?: number | null };
          credits?: { charged?: number; refunded?: boolean; balanceAfter?: number };
        }
      | null;

    if (!response.ok || !payload?.ok || !payload.assistantMessage) {
      setChatMessages(chatMessages);
      setMessage(errorMessage(locale, payload?.error));
      setIsLoading(false);
      await refreshWallet();
      return;
    }

    setChatMessages([...nextMessages, { role: "assistant", content: payload.assistantMessage }]);
    setChatMeta(
      [
        `model=${payload.model ?? chatModel}`,
        `tokens=${payload.usage?.totalTokens ?? "unknown"}`,
        `${t.charged}=${payload.credits?.charged ?? 0}`,
      ].join(", "),
    );
    setIsLoading(false);
    await refreshWallet();
  };

  const onBuildDraft = async (event: FormEvent) => {
    event.preventDefault();
    if (!builderGoal.trim() || !builderNotes.trim()) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/skillbooks/builder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": issueIdempotencyKey("skillbook_builder"),
      },
      body: JSON.stringify({
        provider: builderProvider,
        model: builderModel.trim() || undefined,
        titleHint: builderTitleHint.trim() || undefined,
        descriptionHint: builderDescriptionHint.trim() || undefined,
        goal: builderGoal.trim(),
        methodologyNotes: builderNotes.trim(),
        locale,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
          draft?: BuilderDraft;
          credits?: { charged?: number };
        }
      | null;

    if (!response.ok || !payload?.ok || !payload.draft) {
      setMessage(errorMessage(locale, payload?.error));
      setIsLoading(false);
      await refreshWallet();
      return;
    }

    setDraft(payload.draft);
    setMessage(`${t.buildDone} ${t.charged}: ${payload.credits?.charged ?? 0}`);
    setIsLoading(false);
    await refreshWallet();
  };

  const onSaveDraft = async () => {
    if (!draft) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/skillbooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: draft.title,
        description: draft.description || undefined,
        locale,
        visibility: "PRIVATE",
        status: "DRAFT",
        body: draft.body,
        sources: [{ label: locale === "ko" ? "Builder Source" : "Builder Source", content: draft.sourceSummary }],
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { ok?: boolean; error?: string }
      | null;

    if (!response.ok || !payload?.ok) {
      setMessage(payload?.error ?? "skillbook_save_failed");
      setIsLoading(false);
      return;
    }

    setMessage(t.saveDone);
    window.dispatchEvent(new Event(refreshEventName));
    await refreshSkillBooks();
    setIsLoading(false);
  };

  const walletUpdatedLabel = useMemo(() => {
    const first = transactions[0];
    if (!first) {
      return null;
    }
    return new Date(first.createdAt).toLocaleString(locale === "ko" ? "ko-KR" : "en-US");
  }, [locale, transactions]);

  return (
    <section style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
      <h2 style={{ marginTop: 0 }}>{t.title}</h2>
      <p style={{ marginTop: 0 }}>{t.subtitle}</p>
      <p style={{ marginTop: 0, fontSize: 13, opacity: 0.8 }}>{t.creditsPolicy}</p>
      {message ? <p className="sa-inline-message">{message}</p> : null}

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "minmax(260px, 320px) minmax(0, 1fr)" }}>
        <aside style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <strong>{t.wallet}</strong>
            <button type="button" onClick={() => void refreshWallet()} disabled={isLoading}>
              {t.refreshWallet}
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: 28, fontWeight: 800 }}>{walletBalance}</div>
          <div style={{ fontSize: 13, opacity: 0.75 }}>
            {t.balance}
            {walletUpdatedLabel ? ` · ${walletUpdatedLabel}` : ""}
          </div>

          <div style={{ marginTop: 16 }}>
            <strong>{t.recentTransactions}</strong>
            {transactions.length === 0 ? (
              <p>{t.noTransactions}</p>
            ) : (
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {transactions.map((item) => (
                  <div
                    key={item.id}
                    style={{ border: "1px solid #eef2f4", borderRadius: 8, padding: 10, fontSize: 13 }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {item.type} · {item.amount}
                    </div>
                    <div>{item.memo ?? "-"}</div>
                    <div style={{ opacity: 0.7 }}>
                      {new Date(item.createdAt).toLocaleString(locale === "ko" ? "ko-KR" : "en-US")}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div style={{ display: "grid", gap: 16 }}>
          <section style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>{t.managedChat}</h3>
            <form onSubmit={onManagedChat} style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.packageLabel}
                  <select value={chatPackageId} onChange={(event) => setChatPackageId(event.target.value)} disabled={isLoading}>
                    {packages.length === 0 ? <option value="">{t.none}</option> : null}
                    {packages.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title} ({item.code})
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.skillBookLabel}
                  <select value={chatSkillBookId} onChange={(event) => setChatSkillBookId(event.target.value)} disabled={isLoading}>
                    <option value="">{t.none}</option>
                    {skillBooks.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.providerLabel}
                  <select value={chatProvider} onChange={(event) => setChatProvider(event.target.value as AiProvider)} disabled={isLoading}>
                    {providers.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.modelLabel}
                  <input value={chatModel} onChange={(event) => setChatModel(event.target.value)} disabled={isLoading} />
                </label>
              </div>

              <div style={{ minHeight: 180, border: "1px solid #eef2f4", borderRadius: 10, padding: 12, display: "grid", gap: 10 }}>
                {chatMessages.map((item, index) => (
                  <div key={`${item.role}_${index}`} style={{ justifySelf: item.role === "user" ? "end" : "start", maxWidth: "88%" }}>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{item.role === "user" ? "You" : "AI"}</div>
                    <div style={{ border: "1px solid #d7e0e6", borderRadius: 10, padding: 10, whiteSpace: "pre-wrap", background: item.role === "user" ? "#eef5f8" : "#f7f9fa" }}>
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>
              {chatMeta ? <p style={{ margin: 0, fontSize: 13 }}>{chatMeta}</p> : null}
              <label style={{ display: "grid", gap: 6 }}>
                {t.messageLabel}
                <textarea rows={4} value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder={t.askPlaceholder} disabled={isLoading} />
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="submit" disabled={isLoading || packages.length === 0}>
                  {isLoading ? t.loading : t.send}
                </button>
                <button type="button" disabled={isLoading} onClick={() => setChatMessages([])}>
                  {t.clearChat}
                </button>
              </div>
            </form>
          </section>

          <section style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>{t.builder}</h3>
            <form onSubmit={onBuildDraft} style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.providerLabel}
                  <select value={builderProvider} onChange={(event) => setBuilderProvider(event.target.value as AiProvider)} disabled={isLoading}>
                    {providers.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.modelLabel}
                  <input value={builderModel} onChange={(event) => setBuilderModel(event.target.value)} disabled={isLoading} />
                </label>
              </div>

              <label style={{ display: "grid", gap: 6 }}>
                {t.builderGoal}
                <input value={builderGoal} onChange={(event) => setBuilderGoal(event.target.value)} placeholder={t.goalPlaceholder} disabled={isLoading} />
              </label>
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.builderTitleHint}
                  <input value={builderTitleHint} onChange={(event) => setBuilderTitleHint(event.target.value)} placeholder={t.titleHintPlaceholder} disabled={isLoading} />
                </label>
                <label style={{ display: "grid", gap: 6 }}>
                  {t.builderDescriptionHint}
                  <input value={builderDescriptionHint} onChange={(event) => setBuilderDescriptionHint(event.target.value)} placeholder={t.descriptionHintPlaceholder} disabled={isLoading} />
                </label>
              </div>
              <label style={{ display: "grid", gap: 6 }}>
                {t.builderNotes}
                <textarea rows={8} value={builderNotes} onChange={(event) => setBuilderNotes(event.target.value)} placeholder={t.notesPlaceholder} disabled={isLoading} />
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="submit" disabled={isLoading}>
                  {isLoading ? t.loading : t.buildDraft}
                </button>
                <button type="button" disabled={isLoading || !draft} onClick={() => void onSaveDraft()}>
                  {t.saveDraft}
                </button>
              </div>
            </form>

            <div style={{ marginTop: 16, border: "1px solid #eef2f4", borderRadius: 10, padding: 12 }}>
              {draft ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <strong>{draft.title}</strong>
                    {draft.description ? <p style={{ marginBottom: 0 }}>{draft.description}</p> : null}
                  </div>
                  <label style={{ display: "grid", gap: 6 }}>
                    Body
                    <textarea readOnly rows={8} value={draft.body} />
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    Source Summary
                    <textarea readOnly rows={5} value={draft.sourceSummary} />
                  </label>
                  <label style={{ display: "grid", gap: 6 }}>
                    Compiled Prompt
                    <textarea readOnly rows={6} value={draft.compiledPrompt} />
                  </label>
                </div>
              ) : (
                <p>{t.noDraft}</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
