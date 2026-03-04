"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";

type LocaleCode = "ko" | "en";

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

const msg = {
  ko: {
    title: "플랫폼 어드민",
    subtitle: "크레딧 원장과 마이그레이션 요청을 운영합니다.",
    refresh: "새로고침",
    issueTitle: "피검자 크레딧 지급",
    loginId: "피검자 ID",
    amount: "지급 크레딧",
    memo: "메모",
    issueButton: "크레딧 지급",
    loading: "처리 중...",
    okIssue: "크레딧이 지급되었습니다.",
    failDefault: "요청 처리에 실패했습니다.",
    needLoginId: "피검자 ID를 입력해주세요.",
    needAmount: "지급 크레딧은 1 이상이어야 합니다.",
    overview: "운영 현황",
    wallets: "지갑 잔액",
    txns: "최근 크레딧 거래",
    migrations: "마이그레이션 요청",
    status: "상태",
    requester: "요청자",
    source: "원본",
    note: "메모",
    resultNote: "결과 메모",
    apply: "상태 반영",
    okStatus: "마이그레이션 상태가 변경되었습니다.",
  },
  en: {
    title: "Platform Admin",
    subtitle: "Operate credit ledger and migration workflows.",
    refresh: "Refresh",
    issueTitle: "Issue credits to participant",
    loginId: "Participant ID",
    amount: "Credit amount",
    memo: "Memo",
    issueButton: "Issue credits",
    loading: "Processing...",
    okIssue: "Credits issued.",
    failDefault: "Request failed.",
    needLoginId: "Enter participant ID.",
    needAmount: "Credit amount must be at least 1.",
    overview: "Overview",
    wallets: "Wallet balances",
    txns: "Recent transactions",
    migrations: "Migration requests",
    status: "Status",
    requester: "Requester",
    source: "Source",
    note: "Note",
    resultNote: "Result note",
    apply: "Apply status",
    okStatus: "Migration status updated.",
  },
} as const;

async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export function PlatformAdminClient({
  locale,
  initialOverview,
  initialWallets,
  initialTransactions,
  initialJobs,
}: Props) {
  const t = useMemo(() => msg[locale], [locale]);

  const [overview, setOverview] = useState<Overview | null>(initialOverview);
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

  const [loginId, setLoginId] = useState("");
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
  }, [t.failDefault]);

  const onIssueCredits = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      setMessage("");

      if (!loginId.trim()) {
        setMessage(t.needLoginId);
        return;
      }
      if (!Number.isFinite(amount) || amount < 1) {
        setMessage(t.needAmount);
        return;
      }

      setIsLoading(true);
      const response = await fetch("/api/platform-admin/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loginId: loginId.trim(),
          amount: Math.trunc(amount),
          memo: memo.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const body = await parseJson<{ error?: string }>(response);
        setMessage(body?.error ?? t.failDefault);
        setIsLoading(false);
        return;
      }

      setLoginId("");
      setAmount(100);
      setMemo("");
      setMessage(t.okIssue);
      await refreshAll();
      setIsLoading(false);
    },
    [amount, loginId, memo, refreshAll, t.failDefault, t.needAmount, t.needLoginId, t.okIssue],
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
            <li>Wallets: {overview.credits.walletCount}</li>
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
        <h2>{t.issueTitle}</h2>
        <form onSubmit={onIssueCredits} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <label>
            {t.loginId}
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              disabled={isLoading}
              style={{ display: "block", width: "100%" }}
            />
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
            {isLoading ? t.loading : t.issueButton}
          </button>
        </form>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t.wallets}</h2>
        {wallets.length === 0 ? (
          <p>-</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Login ID</th>
                <th align="left">Name</th>
                <th align="left">Role</th>
                <th align="right">Balance</th>
                <th align="left">Updated</th>
              </tr>
            </thead>
            <tbody>
              {wallets.map((wallet) => (
                <tr key={wallet.id}>
                  <td>{wallet.user.loginId ?? "-"}</td>
                  <td>{wallet.user.displayName ?? "-"}</td>
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
                  <td>{txn.user.loginId ?? txn.user.displayName ?? "-"}</td>
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
                    <td>{job.requester.loginId ?? job.requester.displayName ?? "-"}</td>
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
