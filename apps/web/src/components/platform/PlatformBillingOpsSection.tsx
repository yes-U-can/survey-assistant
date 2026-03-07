"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type LocaleCode = "ko" | "en";
type BillingPlanCode = "FREE" | "CLOUD_BASIC" | "CLOUD_PRO";
type BillingRequestType = "SUBSCRIPTION" | "CREDIT_TOPUP";
type BillingRequestStatus = "REQUESTED" | "REVIEWING" | "APPROVED" | "FULFILLED" | "REJECTED" | "CANCELED";

type BillingProfileItem = {
  id: string;
  planCode: BillingPlanCode;
  autoRenew: boolean;
  currentPeriodStartsAt: string | null;
  currentPeriodEndsAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    role: string;
    loginId: string | null;
    displayName: string | null;
    isActive: boolean;
    walletBalance: number;
  };
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
  requester: {
    id: string;
    role: string;
    loginId: string | null;
    displayName: string | null;
  };
};

type Draft = {
  status: BillingRequestStatus;
  adminNote: string;
  grantedPlanCode: BillingPlanCode;
  grantCreditAmount: number;
  autoRenew: boolean;
  currentPeriodEndsAt: string;
};

function fmt(locale: LocaleCode, value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function who(user: { loginId: string | null; displayName: string | null }) {
  return user.displayName?.trim() || user.loginId?.trim() || "-";
}

export function PlatformBillingOpsSection({ locale }: { locale: LocaleCode }) {
  const isKo = locale === "ko";
  const tr = useCallback((ko: string, en: string) => (isKo ? ko : en), [isKo]);

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profiles, setProfiles] = useState<BillingProfileItem[]>([]);
  const [requests, setRequests] = useState<BillingRequestItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const [profilesRes, requestsRes] = await Promise.all([
        fetch("/api/platform-admin/billing/profiles?limit=100", { cache: "no-store" }),
        fetch("/api/platform-admin/billing/requests?limit=100", { cache: "no-store" }),
      ]);
      const profilesJson = await profilesRes.json().catch(() => null);
      const requestsJson = await requestsRes.json().catch(() => null);
      if (!profilesRes.ok || !profilesJson?.ok || !Array.isArray(profilesJson.profiles) || !requestsRes.ok || !requestsJson?.ok || !Array.isArray(requestsJson.requests)) {
        throw new Error("load_failed");
      }
      setProfiles(profilesJson.profiles);
      setRequests(requestsJson.requests);
      setDrafts(
        Object.fromEntries(
          requestsJson.requests.map((item: BillingRequestItem) => [
            item.id,
            {
              status: item.status,
              adminNote: item.adminNote ?? "",
              grantedPlanCode: item.requestedPlanCode ?? "CLOUD_BASIC",
              grantCreditAmount: item.requestedCreditAmount ?? 100,
              autoRenew: false,
              currentPeriodEndsAt: "",
            },
          ]),
        ),
      );
    } catch {
      setMessage(tr("寃곗젣 ?댁쁺 ?곗씠?곕? 遺덈윭?ㅼ? 紐삵뻽?듬땲??", "Failed to load billing ops data."));
    } finally {
      setIsLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activePaidProfiles = useMemo(
    () => profiles.filter((item) => item.planCode !== "FREE"),
    [profiles],
  );

  function updateDraft(requestId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [requestId]: {
        ...(current[requestId] ?? {
          status: "REQUESTED",
          adminNote: "",
          grantedPlanCode: "CLOUD_BASIC",
          grantCreditAmount: 100,
          autoRenew: false,
          currentPeriodEndsAt: "",
        }),
        ...patch,
      },
    }));
  }

  async function onApply(requestId: string) {
    const draft = drafts[requestId];
    if (!draft) return;
    setIsLoading(true);
    setMessage("");
    try {
      const payload: Record<string, unknown> = {
        status: draft.status,
        adminNote: draft.adminNote.trim() || undefined,
      };
      if (draft.status === "FULFILLED") {
        payload.grantedPlanCode = draft.grantedPlanCode;
        payload.grantCreditAmount = Math.max(1, Math.trunc(draft.grantCreditAmount));
        payload.autoRenew = draft.autoRenew;
        if (draft.currentPeriodEndsAt.trim()) {
          const date = new Date(draft.currentPeriodEndsAt);
          if (!Number.isNaN(date.getTime())) {
            payload.currentPeriodEndsAt = date.toISOString();
          }
        }
      }
      const response = await fetch(`/api/platform-admin/billing/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.ok) {
        setMessage(result?.error ?? tr("寃곗젣 ?붿껌 媛깆떊???ㅽ뙣?덉뒿?덈떎.", "Failed to update billing request."));
        setIsLoading(false);
        return;
      }
      await refresh();
      setMessage(tr("寃곗젣 ?붿껌??媛깆떊?섏뿀?듬땲??", "Billing request updated."));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section style={{ marginTop: 24, display: "grid", gap: 16 }}>
      <div>
        <h2>{tr("寃곗젣 ?댁쁺", "Billing operations")}</h2>
        <p style={{ margin: "8px 0 0", maxWidth: 760, color: "#3e5b6d" }}>
          {tr(
            "현재는 포트원/PG 심사 대기 중이라 실제 결제창과 자동 청구는 아직 연결하지 않았습니다. 이 화면에서는 요청 큐를 운영하고, 심사가 끝나면 같은 흐름에 실결제 이벤트를 연결합니다.",
            "External checkout and recurring charge execution are still deferred while PortOne and PG review is pending. This screen currently operates the request queue that will later connect to real payment events.",
          )}
        </p>
        {message ? <p className="sa-inline-message">{message}</p> : null}
        <button type="button" onClick={() => void refresh()} disabled={isLoading}>
          {isLoading ? tr("泥섎━ 以?..", "Processing...") : tr("?덈줈怨좎묠", "Refresh")}
        </button>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <article style={{ border: "1px solid #d7e0e6", borderRadius: 10, padding: 12, background: "#fff" }}>
          <div style={{ fontSize: 13, opacity: 0.75 }}>{tr("?좊즺 ?뚮옖 怨꾩젙", "Paid plan accounts")}</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{activePaidProfiles.length}</div>
        </article>
        <article style={{ border: "1px solid #d7e0e6", borderRadius: 10, padding: 12, background: "#fff" }}>
          <div style={{ fontSize: 13, opacity: 0.75 }}>{tr("?대┛ 寃곗젣 ?붿껌", "Open billing requests")}</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>
            {requests.filter((item) => ["REQUESTED", "REVIEWING", "APPROVED"].includes(item.status)).length}
          </div>
        </article>
      </div>

      <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
        <h3 style={{ marginTop: 0 }}>{tr("구독 프로필", "Subscription profiles")}</h3>
        {profiles.length === 0 ? (
          <p>{tr("?깅줉??援щ룆 ?꾨줈?꾩씠 ?놁뒿?덈떎.", "No billing profile found.")}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">{tr("怨꾩젙", "Account")}</th>
                <th align="left">{tr("?뚮옖", "Plan")}</th>
                <th align="right">{tr("크레딧", "Credits")}</th>
                <th align="left">{tr("留뚮즺", "Period ends")}</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((item) => (
                <tr key={item.id}>
                  <td>{who(item.user)}</td>
                  <td>{item.planCode}</td>
                  <td align="right">{item.user.walletBalance}</td>
                  <td>{fmt(locale, item.currentPeriodEndsAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
        <h3 style={{ marginTop: 0 }}>{tr("결제 요청 큐", "Billing request queue")}</h3>
        {requests.length === 0 ? (
          <p>{tr("?깅줉??寃곗젣 ?붿껌???놁뒿?덈떎.", "No billing request found.")}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">{tr("?붿껌 ?쒓컖", "Requested at")}</th>
                <th align="left">{tr("요청자", "Requester")}</th>
                <th align="left">{tr("?좏삎", "Type")}</th>
                <th align="left">{tr("?붿껌 ?댁슜", "Requested value")}</th>
                <th align="left">{tr("泥섎━", "Processing")}</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item) => {
                const draft = drafts[item.id];
                return (
                  <tr key={item.id}>
                    <td>{fmt(locale, item.requestedAt)}</td>
                    <td>{who(item.requester)}</td>
                    <td>{item.type === "SUBSCRIPTION" ? tr("援щ룆", "Subscription") : tr("?щ젅??異⑹쟾", "Credit top-up")}</td>
                    <td>{item.type === "SUBSCRIPTION" ? item.requestedPlanCode : item.requestedCreditAmount}</td>
                    <td>
                      <div style={{ display: "grid", gap: 8 }}>
                        <select value={draft?.status ?? item.status} onChange={(event) => updateDraft(item.id, { status: event.target.value as BillingRequestStatus })} disabled={isLoading}>
                          {["REQUESTED", "REVIEWING", "APPROVED", "FULFILLED", "REJECTED", "CANCELED"].map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        {item.type === "SUBSCRIPTION" ? (
                          <>
                            <select value={draft?.grantedPlanCode ?? item.requestedPlanCode ?? "CLOUD_BASIC"} onChange={(event) => updateDraft(item.id, { grantedPlanCode: event.target.value as BillingPlanCode })} disabled={isLoading}>
                              <option value="FREE">FREE</option>
                              <option value="CLOUD_BASIC">CLOUD_BASIC</option>
                              <option value="CLOUD_PRO">CLOUD_PRO</option>
                            </select>
                            <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <input type="checkbox" checked={draft?.autoRenew ?? false} onChange={(event) => updateDraft(item.id, { autoRenew: event.target.checked })} disabled={isLoading} />
                              <span>{tr("?먮룞 媛깆떊", "Auto-renew")}</span>
                            </label>
                            <input type="datetime-local" value={draft?.currentPeriodEndsAt ?? ""} onChange={(event) => updateDraft(item.id, { currentPeriodEndsAt: event.target.value })} disabled={isLoading} />
                          </>
                        ) : (
                          <input type="number" min={1} value={draft?.grantCreditAmount ?? item.requestedCreditAmount ?? 1} onChange={(event) => updateDraft(item.id, { grantCreditAmount: Number(event.target.value) || 1 })} disabled={isLoading} />
                        )}
                        <textarea rows={3} value={draft?.adminNote ?? item.adminNote ?? ""} onChange={(event) => updateDraft(item.id, { adminNote: event.target.value })} disabled={isLoading} />
                        <button type="button" onClick={() => void onApply(item.id)} disabled={isLoading}>{tr("諛섏쁺", "Apply")}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

