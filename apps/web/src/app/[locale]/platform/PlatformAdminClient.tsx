"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";

type LocaleCode = "ko" | "en";

type CreditAction = "ISSUE" | "SPEND" | "REFUND" | "REWARD" | "ADJUSTMENT";
type AdjustmentDirection = "INCREASE" | "DECREASE";

type MigrationStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

type Overview = {
  users: {
    participantCount: number;
    researchAdminCount: number;
    platformAdminCount: number;
  };
  credits: {
    walletCount: number;
    totalBalance: number;
    transactionCount: number;
  };
  migrationJobs: Record<MigrationStatus, number>;
};

type AdminUserItem = {
  id: string;
  role: string;
  loginId: string | null;
  displayName: string | null;
  isActive: boolean;
  createdAt: string;
};

type WalletItem = {
  id: string;
  balance: number;
  updatedAt: string;
  user: {
    id: string;
    role: string;
    loginId: string | null;
    displayName: string | null;
    isActive: boolean;
  };
};

type TransactionItem = {
  id: string;
  type: string;
  amount: number;
  memo: string | null;
  referenceId: string | null;
  createdAt: string;
  user: {
    id: string;
    role: string;
    loginId: string | null;
    displayName: string | null;
  };
};

type MigrationJobItem = {
  id: string;
  sourceLabel: string;
  sourceFormat: string;
  status: MigrationStatus;
  requestNote: string | null;
  resultNote: string | null;
  requestedAt: string;
  completedAt: string | null;
  requester: {
    id: string;
    loginId: string | null;
    displayName: string | null;
    role: string;
  };
};

type JobDraftMap = Record<
  string,
  {
    status: MigrationStatus;
    resultNote: string;
  }
>;

type Props = {
  locale: LocaleCode;
  initialOverview: Overview;
  initialAdminUsers: AdminUserItem[];
  initialWallets: WalletItem[];
  initialTransactions: TransactionItem[];
  initialJobs: MigrationJobItem[];
};

const statusOptions: MigrationStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELED",
];

const creditActions: CreditAction[] = [
  "ISSUE",
  "SPEND",
  "REFUND",
  "REWARD",
  "ADJUSTMENT",
];

const msg = {
  ko: {
    title: "플랫폼 어드민",
    subtitle: "관리자 크레딧 원장과 마이그레이션 요청을 운영합니다.",
    refresh: "새로고침",
    loading: "처리 중...",
    failDefault: "요청 처리에 실패했습니다.",
    overview: "운영 현황",
    wallets: "관리자 지갑 잔액",
    txns: "최근 크레딧 거래",
    migrations: "마이그레이션 요청",
    status: "상태",
    requester: "요청자",
    source: "원본",
    note: "메모",
    resultNote: "결과 메모",
    apply: "상태 반영",
    okStatus: "마이그레이션 상태가 변경되었습니다.",
    creditTitle: "관리자 크레딧 거래",
    targetUser: "대상 관리자",
    action: "거래 유형",
    amount: "금액",
    memo: "메모",
    submitCredit: "거래 실행",
    okCredit: "크레딧 거래가 반영되었습니다.",
    needTargetUser: "대상 관리자를 선택해주세요.",
    needAmount: "금액은 1 이상이어야 합니다.",
    noAdminUsers: "등록된 관리자 계정이 없습니다.",
    adjustmentDirection: "조정 방향",
    adjustmentIncrease: "증가(+)",
    adjustmentDecrease: "감소(-)",
  },
  en: {
    title: "Platform Admin",
    subtitle: "Operate admin credit ledger and migration workflows.",
    refresh: "Refresh",
    loading: "Processing...",
    failDefault: "Request failed.",
    overview: "Overview",
    wallets: "Admin wallet balances",
    txns: "Recent credit transactions",
    migrations: "Migration requests",
    status: "Status",
    requester: "Requester",
    source: "Source",
    note: "Memo",
    resultNote: "Result note",
    apply: "Apply status",
    okStatus: "Migration status updated.",
    creditTitle: "Admin credit mutation",
    targetUser: "Target admin",
    action: "Transaction type",
    amount: "Amount",
    memo: "Memo",
    submitCredit: "Execute transaction",
    okCredit: "Credit transaction applied.",
    needTargetUser: "Select a target admin user.",
    needAmount: "Amount must be at least 1.",
    noAdminUsers: "No admin users available.",
    adjustmentDirection: "Adjustment direction",
    adjustmentIncrease: "Increase (+)",
    adjustmentDecrease: "Decrease (-)",
  },
} as const;

function actionLabel(locale: LocaleCode, action: CreditAction) {
  if (locale === "en") {
    return action;
  }
  if (action === "ISSUE") return "발행(+)";
  if (action === "SPEND") return "사용(-)";
  if (action === "REFUND") return "환불(+)";
  if (action === "REWARD") return "보상(+)";
  return "조정(±)";
}

async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

function formatUserLabel(user: AdminUserItem) {
  const name = user.displayName?.trim() ? user.displayName.trim() : user.loginId ?? user.id;
  return `${name} (${user.role})`;
}

export function PlatformAdminClient({
  locale,
  initialOverview,
  initialAdminUsers,
  initialWallets,
  initialTransactions,
  initialJobs,
}: Props) {
  const t = useMemo(() => msg[locale], [locale]);

  const [overview, setOverview] = useState<Overview | null>(initialOverview);
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>(initialAdminUsers);
  const [wallets, setWallets] = useState<WalletItem[]>(initialWallets);
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [jobs, setJobs] = useState<MigrationJobItem[]>(initialJobs);
  const [jobDrafts, setJobDrafts] = useState<JobDraftMap>(() => {
    const initialMap: JobDraftMap = {};
    for (const job of initialJobs) {
      initialMap[job.id] = {
        status: job.status,
        resultNote: job.resultNote ?? "",
      };
    }
    return initialMap;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [targetUserId, setTargetUserId] = useState(initialAdminUsers[0]?.id ?? "");
  const [action, setAction] = useState<CreditAction>("ISSUE");
  const [adjustmentDirection, setAdjustmentDirection] = useState<AdjustmentDirection>("INCREASE");
  const [amount, setAmount] = useState(100);
  const [memo, setMemo] = useState("");

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    const [overviewRes, creditsRes, migrationRes] = await Promise.all([
      fetch("/api/platform-admin/overview", { cache: "no-store" }),
      fetch("/api/platform-admin/credits?limit=20", { cache: "no-store" }),
      fetch("/api/platform-admin/migration-jobs?limit=50", { cache: "no-store" }),
    ]);

    const overviewJson = await parseJson<{ ok?: boolean; overview?: Overview }>(overviewRes);
    const creditsJson = await parseJson<{
      ok?: boolean;
      adminUsers?: AdminUserItem[];
      wallets?: WalletItem[];
      transactions?: TransactionItem[];
    }>(creditsRes);
    const migrationJson = await parseJson<{ ok?: boolean; jobs?: MigrationJobItem[] }>(
      migrationRes,
    );

    if (
      !overviewRes.ok ||
      !creditsRes.ok ||
      !migrationRes.ok ||
      !overviewJson?.ok ||
      !creditsJson?.ok ||
      !migrationJson?.ok
    ) {
      setMessage(t.failDefault);
      setIsLoading(false);
      return;
    }

    setOverview(overviewJson.overview ?? null);
    const loadedUsers = creditsJson.adminUsers ?? [];
    setAdminUsers(loadedUsers);
    if (!targetUserId && loadedUsers.length > 0) {
      setTargetUserId(loadedUsers[0].id);
    }
    setWallets(creditsJson.wallets ?? []);
    setTransactions(creditsJson.transactions ?? []);
    const loadedJobs = migrationJson.jobs ?? [];
    setJobs(loadedJobs);
    setJobDrafts((prev) => {
      const next: JobDraftMap = {};
      for (const job of loadedJobs) {
        const existing = prev[job.id];
        next[job.id] = {
          status: existing?.status ?? job.status,
          resultNote: existing?.resultNote ?? (job.resultNote ?? ""),
        };
      }
      return next;
    });
    setIsLoading(false);
  }, [t.failDefault, targetUserId]);

  const onMutateCredits = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setMessage("");

      if (!targetUserId) {
        setMessage(t.needTargetUser);
        return;
      }
      if (!Number.isFinite(amount) || Math.trunc(amount) < 1) {
        setMessage(t.needAmount);
        return;
      }

      const normalizedAmount = Math.trunc(amount);
      const payload =
        action === "ADJUSTMENT"
          ? {
              targetUserId,
              type: action,
              amount: adjustmentDirection === "INCREASE" ? normalizedAmount : -normalizedAmount,
              memo: memo.trim() || undefined,
            }
          : {
              targetUserId,
              type: action,
              amount: normalizedAmount,
              memo: memo.trim() || undefined,
            };

      setIsLoading(true);
      const response = await fetch("/api/platform-admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await parseJson<{ error?: string }>(response);
        setMessage(body?.error ?? t.failDefault);
        setIsLoading(false);
        return;
      }

      setAmount(100);
      setMemo("");
      setMessage(t.okCredit);
      await refreshAll();
      setIsLoading(false);
    },
    [
      action,
      adjustmentDirection,
      amount,
      memo,
      refreshAll,
      t.failDefault,
      t.needAmount,
      t.needTargetUser,
      t.okCredit,
      targetUserId,
    ],
  );

  const updateJobDraft = useCallback(
    (jobId: string, patch: Partial<JobDraftMap[string]>) => {
      setJobDrafts((prev) => ({
        ...prev,
        [jobId]: {
          status: patch.status ?? prev[jobId]?.status ?? "REQUESTED",
          resultNote: patch.resultNote ?? prev[jobId]?.resultNote ?? "",
        },
      }));
    },
    [],
  );

  const onUpdateJob = useCallback(
    async (jobId: string) => {
      const draft = jobDrafts[jobId];
      if (!draft) {
        return;
      }

      setIsLoading(true);
      const response = await fetch(`/api/platform-admin/migration-jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draft.status,
          resultNote: draft.resultNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const body = await parseJson<{ error?: string }>(response);
        setMessage(body?.error ?? t.failDefault);
        setIsLoading(false);
        return;
      }

      setMessage(t.okStatus);
      await refreshAll();
      setIsLoading(false);
    },
    [jobDrafts, refreshAll, t.failDefault, t.okStatus],
  );

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>{t.title}</h1>
      <p>{t.subtitle}</p>
      <button type="button" onClick={() => void refreshAll()} disabled={isLoading}>
        {isLoading ? t.loading : t.refresh}
      </button>
      {message ? <p>{message}</p> : null}

      <section style={{ marginTop: 24 }}>
        <h2>{t.overview}</h2>
        {overview ? (
          <ul>
            <li>Participants: {overview.users.participantCount}</li>
            <li>Research Admins: {overview.users.researchAdminCount}</li>
            <li>Platform Admins: {overview.users.platformAdminCount}</li>
            <li>Admin Wallets: {overview.credits.walletCount}</li>
            <li>Total Credits: {overview.credits.totalBalance}</li>
            <li>Transactions: {overview.credits.transactionCount}</li>
            <li>Migration Requested: {overview.migrationJobs.REQUESTED}</li>
            <li>Migration Running: {overview.migrationJobs.RUNNING}</li>
            <li>Migration Completed: {overview.migrationJobs.COMPLETED}</li>
          </ul>
        ) : (
          <p>-</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t.creditTitle}</h2>
        {adminUsers.length === 0 ? (
          <p>{t.noAdminUsers}</p>
        ) : (
          <form onSubmit={onMutateCredits} style={{ display: "grid", gap: 8, maxWidth: 540 }}>
            <label>
              {t.targetUser}
              <select
                value={targetUserId}
                onChange={(event) => setTargetUserId(event.target.value)}
                disabled={isLoading}
                style={{ display: "block", width: "100%" }}
              >
                {adminUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {formatUserLabel(user)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.action}
              <select
                value={action}
                onChange={(event) => setAction(event.target.value as CreditAction)}
                disabled={isLoading}
                style={{ display: "block", width: "100%" }}
              >
                {creditActions.map((value) => (
                  <option key={value} value={value}>
                    {actionLabel(locale, value)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              {t.amount}
              <input
                type="number"
                min={1}
                max={1_000_000}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                disabled={isLoading}
                style={{ display: "block", width: "100%" }}
              />
            </label>

            {action === "ADJUSTMENT" ? (
              <label>
                {t.adjustmentDirection}
                <select
                  value={adjustmentDirection}
                  onChange={(event) =>
                    setAdjustmentDirection(event.target.value as AdjustmentDirection)
                  }
                  disabled={isLoading}
                  style={{ display: "block", width: "100%" }}
                >
                  <option value="INCREASE">{t.adjustmentIncrease}</option>
                  <option value="DECREASE">{t.adjustmentDecrease}</option>
                </select>
              </label>
            ) : null}

            <label>
              {t.memo}
              <input
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                disabled={isLoading}
                style={{ display: "block", width: "100%" }}
              />
            </label>

            <button type="submit" disabled={isLoading}>
              {isLoading ? t.loading : t.submitCredit}
            </button>
          </form>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t.wallets}</h2>
        {wallets.length === 0 ? (
          <p>-</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">User</th>
                <th align="left">Role</th>
                <th align="right">Balance</th>
                <th align="left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => (
                <tr key={wallet.id}>
                  <td>{wallet.user.loginId ?? wallet.user.displayName ?? wallet.user.id}</td>
                  <td>{wallet.user.role}</td>
                  <td align="right">{wallet.balance}</td>
                  <td>{new Date(wallet.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t.txns}</h2>
        {transactions.length === 0 ? (
          <p>-</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Time</th>
                <th align="left">User</th>
                <th align="left">Type</th>
                <th align="right">Amount</th>
                <th align="left">{t.note}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{new Date(txn.createdAt).toLocaleString()}</td>
                  <td>{txn.user.loginId ?? txn.user.displayName ?? txn.user.id}</td>
                  <td>{txn.type}</td>
                  <td align="right">{txn.amount}</td>
                  <td>{txn.memo ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t.migrations}</h2>
        {jobs.length === 0 ? (
          <p>-</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Requested</th>
                <th align="left">{t.requester}</th>
                <th align="left">{t.source}</th>
                <th align="left">{t.status}</th>
                <th align="left">{t.resultNote}</th>
                <th align="left">Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const draft = jobDrafts[job.id] ?? {
                  status: job.status,
                  resultNote: job.resultNote ?? "",
                };
                return (
                  <tr key={job.id}>
                    <td>{new Date(job.requestedAt).toLocaleString()}</td>
                    <td>
                      {job.requester.loginId ?? job.requester.displayName ?? job.requester.id}
                    </td>
                    <td>
                      {job.sourceLabel} ({job.sourceFormat})
                    </td>
                    <td>
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          updateJobDraft(job.id, {
                            status: event.target.value as MigrationStatus,
                          })
                        }
                        disabled={isLoading}
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={draft.resultNote}
                        onChange={(event) =>
                          updateJobDraft(job.id, {
                            resultNote: event.target.value,
                          })
                        }
                        disabled={isLoading}
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => void onUpdateJob(job.id)}
                        disabled={isLoading}
                      >
                        {t.apply}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
