"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type LocaleCode = "ko" | "en";
type BillingPlanCode = "FREE" | "CLOUD_BASIC" | "CLOUD_PRO";
type BillingRequestType = "SUBSCRIPTION" | "CREDIT_TOPUP";
type BillingRequestStatus = "REQUESTED" | "REVIEWING" | "APPROVED" | "FULFILLED" | "REJECTED" | "CANCELED";

type BillingPlanItem = {
  code: BillingPlanCode;
  monthlyPriceKrw: number;
  managedAiIncluded: boolean;
  prioritySupport: boolean;
  label: string;
  summary: string;
};

type BillingProfile = {
  id: string | null;
  planCode: BillingPlanCode;
  autoRenew: boolean;
  currentPeriodStartsAt: string | null;
  currentPeriodEndsAt: string | null;
  note: string | null;
  updatedAt: string | null;
};

type BillingRequestItem = {
  id: string;
  type: BillingRequestType;
  status: BillingRequestStatus;
  requestedPlanCode: BillingPlanCode | null;
  requestedCreditAmount: number | null;
  requestNote: string | null;
  adminNote: string | null;
  requestedAt: string;
  resolvedAt: string | null;
};

type BillingPayload = {
  ok?: boolean;
  profile?: BillingProfile;
  wallet?: { balance: number; updatedAt: string | null };
  plans?: BillingPlanItem[];
  requests?: BillingRequestItem[];
};

function fmt(locale: LocaleCode, value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminBillingPanel({ locale }: { locale: LocaleCode }) {
  const isKo = locale === "ko";
  const tr = useCallback((ko: string, en: string) => (isKo ? ko : en), [isKo]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [plans, setPlans] = useState<BillingPlanItem[]>([]);
  const [requests, setRequests] = useState<BillingRequestItem[]>([]);
  const [requestedPlanCode, setRequestedPlanCode] = useState<BillingPlanCode>("CLOUD_BASIC");
  const [creditAmount, setCreditAmount] = useState(100);
  const [subscriptionNote, setSubscriptionNote] = useState("");
  const [creditNote, setCreditNote] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/billing?limit=20", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as BillingPayload | null;
      if (!response.ok || !payload?.ok || !payload.profile || !payload.plans || !payload.requests || !payload.wallet) {
        throw new Error("load_failed");
      }
      setProfile(payload.profile);
      setPlans(payload.plans);
      setRequests(payload.requests);
      setWalletBalance(payload.wallet.balance);
    } catch {
      setMessage(tr("寃곗젣/?뚮옖 ?뺣낫瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??", "Failed to load billing data."));
    } finally {
      setIsLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activePlan = useMemo(
    () => plans.find((plan) => plan.code === (profile?.planCode ?? "FREE")) ?? null,
    [plans, profile?.planCode],
  );

  async function onCreateSubscriptionRequest(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/billing/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SUBSCRIPTION",
          requestedPlanCode,
          requestNote: subscriptionNote.trim() || undefined,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("?뚮옖 ?붿껌 ?깅줉???ㅽ뙣?덉뒿?덈떎.", "Failed to create plan request."));
        setIsLoading(false);
        return;
      }
      await refresh();
      setSubscriptionNote("");
      setMessage(tr("?뚮옖 ?붿껌???깅줉?섏뿀?듬땲??", "Plan request submitted."));
    } finally {
      setIsLoading(false);
    }
  }

  async function onCreateCreditRequest(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/billing/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "CREDIT_TOPUP",
          requestedCreditAmount: Math.max(1, Math.trunc(creditAmount)),
          requestNote: creditNote.trim() || undefined,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("?щ젅??異⑹쟾 ?붿껌 ?깅줉???ㅽ뙣?덉뒿?덈떎.", "Failed to create top-up request."));
        setIsLoading(false);
        return;
      }
      await refresh();
      setCreditNote("");
      setMessage(tr("?щ젅??異⑹쟾 ?붿껌???깅줉?섏뿀?듬땲??", "Credit top-up request submitted."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <h2 style={{ margin: 0 }}>{tr("?뚮옖쨌寃곗젣", "Plans & Billing")}</h2>
            <p style={{ margin: "8px 0 0", maxWidth: 760 }}>
              {tr("怨듭떇 ?몄뒪??援щ룆 ?뚮옖怨??щ젅??異⑹쟾 ?붿껌??愿由ы빀?덈떎.", "Manage hosted subscription plans and credit top-up requests.")}
            </p>
            <p style={{ margin: "8px 0 0", maxWidth: 760, color: "#3e5b6d" }}>
              {tr(
                "현재는 포트원/PG 심사 대기 중이라 실제 온라인 결제창은 아직 연결하지 않았습니다. 지금은 플랜 변경 요청과 크레딧 충전 요청을 먼저 등록하고, 추후 결제창 또는 운영 승인 흐름에 연결합니다.",
                "External checkout is intentionally deferred while PortOne and PG review is pending. For now, this section records plan-change and credit top-up requests that will later connect to checkout or ops fulfillment.",
              )}
            </p>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={isLoading}>
            {isLoading ? tr("泥섎━ 以?..", "Processing...") : tr("?덈줈怨좎묠", "Refresh")}
          </button>
        </div>
        {message ? <p className="sa-inline-message">{message}</p> : null}
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", marginTop: 14 }}>
          <article style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 13, opacity: 0.75 }}>{tr("?꾩옱 ?뚮옖", "Current plan")}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{activePlan?.label ?? profile?.planCode ?? "FREE"}</div>
          </article>
          <article style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 13, opacity: 0.75 }}>{tr("현재 크레딧", "Current credits")}</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>{walletBalance}</div>
          </article>
          <article style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 13, opacity: 0.75 }}>{tr("援щ룆 留뚮즺", "Current period ends")}</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>{fmt(locale, profile?.currentPeriodEndsAt ?? null)}</div>
          </article>
        </div>
      </div>

      <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
        <h3 style={{ marginTop: 0 }}>{tr("?뚮옖 移댄깉濡쒓렇", "Plan catalog")}</h3>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          {plans.map((plan) => (
            <article key={plan.code} style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}>
              <strong>{plan.label}</strong>
              <div style={{ marginTop: 6 }}>{plan.summary}</div>
              <div style={{ marginTop: 10, fontWeight: 700 }}>
                {plan.monthlyPriceKrw === 0 ? tr("臾대즺", "Free") : `${plan.monthlyPriceKrw.toLocaleString(locale === "ko" ? "ko-KR" : "en-US")} KRW/mo`}
              </div>
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.8 }}>
                {tr("Managed AI ?ы븿", "Managed AI included")}: {plan.managedAiIncluded ? "Y" : "N"}
              </div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>
                {tr("우선 지원", "Priority support")}: {plan.prioritySupport ? "Y" : "N"}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
        <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>{tr("援щ룆 ?뚮옖 ?붿껌", "Subscription request")}</h3>
          <form onSubmit={onCreateSubscriptionRequest} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>{tr("?붿껌 ?뚮옖", "Requested plan")}</span>
              <select value={requestedPlanCode} onChange={(event) => setRequestedPlanCode(event.target.value as BillingPlanCode)} disabled={isLoading}>
                <option value="CLOUD_BASIC">{tr("클라우드 베이직", "Cloud Basic")}</option>
                <option value="CLOUD_PRO">{tr("?대씪?곕뱶 ?꾨줈", "Cloud Pro")}</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>{tr("硫붾え", "Note")}</span>
              <textarea rows={4} value={subscriptionNote} onChange={(event) => setSubscriptionNote(event.target.value)} disabled={isLoading} />
            </label>
            <button type="submit" disabled={isLoading}>{tr("?뚮옖 ?붿껌 ?깅줉", "Submit plan request")}</button>
          </form>
        </div>

        <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h3 style={{ marginTop: 0 }}>{tr("?щ젅??異⑹쟾 ?붿껌", "Credit top-up request")}</h3>
          <form onSubmit={onCreateCreditRequest} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>{tr("요청 크레딧", "Requested credits")}</span>
              <input type="number" min={1} value={creditAmount} onChange={(event) => setCreditAmount(Number(event.target.value) || 1)} disabled={isLoading} />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span>{tr("硫붾え", "Note")}</span>
              <textarea rows={4} value={creditNote} onChange={(event) => setCreditNote(event.target.value)} disabled={isLoading} />
            </label>
            <button type="submit" disabled={isLoading}>{tr("異⑹쟾 ?붿껌 ?깅줉", "Submit top-up request")}</button>
          </form>
        </div>
      </div>

      <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
        <h3 style={{ marginTop: 0 }}>{tr("理쒓렐 寃곗젣 ?붿껌", "Recent billing requests")}</h3>
        {requests.length === 0 ? (
          <p>{tr("?깅줉??寃곗젣 ?붿껌???놁뒿?덈떎.", "No billing request found.")}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">{tr("?붿껌 ?쒓컖", "Requested at")}</th>
                <th align="left">{tr("?좏삎", "Type")}</th>
                <th align="left">{tr("?붿껌 ?댁슜", "Requested value")}</th>
                <th align="left">{tr("?곹깭", "Status")}</th>
                <th align="left">{tr("愿由?硫붾え", "Admin note")}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => (
                <tr key={item.id}>
                  <td>{fmt(locale, item.requestedAt)}</td>
                  <td>{item.type === "SUBSCRIPTION" ? tr("援щ룆", "Subscription") : tr("?щ젅??異⑹쟾", "Credit top-up")}</td>
                  <td>{item.type === "SUBSCRIPTION" ? item.requestedPlanCode : item.requestedCreditAmount}</td>
                  <td>{item.status}</td>
                  <td>{item.adminNote ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}


