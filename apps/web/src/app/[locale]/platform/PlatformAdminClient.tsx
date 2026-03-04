"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

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

type SpecialRequestStatus =
  | "REQUESTED"
  | "REVIEWING"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "REJECTED"
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

type SpecialRequestItem = {
  id: string;
  title: string;
  description: string;
  status: SpecialRequestStatus;
  consentPublicSource: boolean;
  consentAt: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
  requester: {
    id: string;
    loginId: string | null;
    displayName: string | null;
    role: string;
  };
};

type SettlementSummary = {
  purchaseCount: number;
  totalPriceCredits: number;
  totalSellerCredits: number;
  totalPlatformFeeCredits: number;
};

type SettlementPurchaseItem = {
  id: string;
  listingId: string;
  templateId: string;
  buyerId: string;
  sellerId: string;
  priceCredits: number;
  sellerCredit: number;
  platformFeeCredits: number;
  createdAt: string;
  buyer: {
    id: string;
    loginId: string | null;
    displayName: string | null;
    role: string;
  };
  seller: {
    id: string;
    loginId: string | null;
    displayName: string | null;
    role: string;
  };
  template: {
    id: string;
    title: string;
    version: number;
  };
};

type SellerSettlementItem = {
  seller: {
    id: string;
    loginId: string | null;
    displayName: string | null;
    role: string;
  };
  salesCount: number;
  totalPriceCredits: number;
  totalSellerCredits: number;
  totalPlatformFeeCredits: number;
};

type AlertThresholds = {
  minTotalCredits: number;
  maxOpenSpecialRequests: number;
  maxRunningMigrations: number;
  maxFailedMigrations: number;
  staleSpecialRequestDays: number;
  maxStaleSpecialRequests: number;
};

type OpsAlert = {
  id: string;
  severity: "warning" | "critical";
  title: string;
  message: string;
};

type JobDraftMap = Record<
  string,
  {
    status: MigrationStatus;
    resultNote: string;
  }
>;

type SpecialRequestDraftMap = Record<
  string,
  {
    status: SpecialRequestStatus;
    adminNote: string;
  }
>;

type Props = {
  locale: LocaleCode;
  initialOverview: Overview;
  initialAdminUsers: AdminUserItem[];
  initialWallets: WalletItem[];
  initialTransactions: TransactionItem[];
  initialJobs: MigrationJobItem[];
  initialSpecialRequests?: SpecialRequestItem[];
  initialSettlementSummary?: SettlementSummary;
  initialSettlementPurchases?: SettlementPurchaseItem[];
  initialSellerSettlements?: SellerSettlementItem[];
  initialAlertThresholds?: AlertThresholds;
};

const statusOptions: MigrationStatus[] = [
  "REQUESTED",
  "ACCEPTED",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "CANCELED",
];

const specialRequestStatusOptions: SpecialRequestStatus[] = [
  "REQUESTED",
  "REVIEWING",
  "IN_PROGRESS",
  "DELIVERED",
  "REJECTED",
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
    specialRequests: "특수 템플릿 의뢰",
    requestTitle: "의뢰 제목",
    requestDesc: "요구사항",
    requestConsent: "공개 동의",
    requestCreatedAt: "요청일시",
    requestAdminNote: "어드민 메모",
    requestApply: "의뢰 상태 반영",
    requestUpdated: "의뢰 상태가 변경되었습니다.",
    settlements: "스토어 정산",
    settlementSummary: "정산 요약",
    settlementRecent: "최근 구매",
    settlementBySeller: "판매자별 정산",
    totalPurchaseCredits: "총 거래액",
    totalSellerCredits: "총 판매자 정산",
    totalPlatformFeeCredits: "총 플랫폼 수수료",
    purchaseCount: "구매 건수",
    overviewParticipants: "피검자",
    overviewResearchAdmins: "연구 관리자",
    overviewPlatformAdmins: "플랫폼 어드민",
    overviewWallets: "관리자 지갑 수",
    overviewTotalCredits: "총 크레딧 잔액",
    overviewTransactions: "크레딧 거래 수",
    overviewMigrationRequested: "마이그레이션 요청",
    overviewMigrationRunning: "마이그레이션 진행중",
    overviewMigrationCompleted: "마이그레이션 완료",
    overviewStorePurchases: "스토어 구매 수",
    overviewPlatformFees: "스토어 수수료 누적",
    filterAll: "전체",
    specialRequestFilter: "의뢰 상태 필터",
    migrationFilter: "마이그레이션 상태 필터",
    alerts: "운영 알림",
    noAlerts: "현재 임계치 초과 알림이 없습니다.",
    severityWarning: "주의",
    severityCritical: "위험",
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
    specialRequests: "Special template requests",
    requestTitle: "Request title",
    requestDesc: "Requirements",
    requestConsent: "Consent",
    requestCreatedAt: "Requested at",
    requestAdminNote: "Admin note",
    requestApply: "Apply request status",
    requestUpdated: "Request status updated.",
    settlements: "Store settlements",
    settlementSummary: "Settlement summary",
    settlementRecent: "Recent purchases",
    settlementBySeller: "Per-seller settlement",
    totalPurchaseCredits: "Total sales credits",
    totalSellerCredits: "Total seller credits",
    totalPlatformFeeCredits: "Total platform fee credits",
    purchaseCount: "Purchase count",
    overviewParticipants: "Participants",
    overviewResearchAdmins: "Research admins",
    overviewPlatformAdmins: "Platform admins",
    overviewWallets: "Admin wallets",
    overviewTotalCredits: "Total credit balance",
    overviewTransactions: "Credit transactions",
    overviewMigrationRequested: "Migration requested",
    overviewMigrationRunning: "Migration running",
    overviewMigrationCompleted: "Migration completed",
    overviewStorePurchases: "Store purchases",
    overviewPlatformFees: "Store platform fees",
    filterAll: "All",
    specialRequestFilter: "Request status filter",
    migrationFilter: "Migration status filter",
    alerts: "Operational Alerts",
    noAlerts: "No threshold alerts at the moment.",
    severityWarning: "Warning",
    severityCritical: "Critical",
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

function displayUserName(user: { loginId: string | null; displayName: string | null } | null | undefined) {
  if (!user) {
    return "-";
  }
  return user.displayName?.trim() || user.loginId?.trim() || "-";
}

function specialRequestStatusLabel(locale: LocaleCode, status: SpecialRequestStatus) {
  if (locale === "en") {
    return status;
  }
  if (status === "REQUESTED") return "접수됨";
  if (status === "REVIEWING") return "검토중";
  if (status === "IN_PROGRESS") return "개발중";
  if (status === "DELIVERED") return "전달완료";
  if (status === "REJECTED") return "반려";
  return "취소";
}

function migrationStatusLabel(locale: LocaleCode, status: MigrationStatus) {
  if (locale === "en") {
    return status;
  }
  if (status === "REQUESTED") return "접수됨";
  if (status === "ACCEPTED") return "접수완료";
  if (status === "RUNNING") return "진행중";
  if (status === "COMPLETED") return "완료";
  if (status === "FAILED") return "실패";
  return "취소";
}

export function PlatformAdminClient({
  locale,
  initialOverview,
  initialAdminUsers,
  initialWallets,
  initialTransactions,
  initialJobs,
  initialSpecialRequests = [],
  initialSettlementSummary = {
    purchaseCount: 0,
    totalPriceCredits: 0,
    totalSellerCredits: 0,
    totalPlatformFeeCredits: 0,
  },
  initialSettlementPurchases = [],
  initialSellerSettlements = [],
  initialAlertThresholds = {
    minTotalCredits: 500,
    maxOpenSpecialRequests: 12,
    maxRunningMigrations: 5,
    maxFailedMigrations: 3,
    staleSpecialRequestDays: 14,
    maxStaleSpecialRequests: 0,
  },
}: Props) {
  const t = useMemo(() => msg[locale], [locale]);

  const [overview, setOverview] = useState<Overview | null>(initialOverview);
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>(initialAdminUsers);
  const [wallets, setWallets] = useState<WalletItem[]>(initialWallets);
  const [transactions, setTransactions] = useState<TransactionItem[]>(initialTransactions);
  const [jobs, setJobs] = useState<MigrationJobItem[]>(initialJobs);
  const [specialRequests, setSpecialRequests] = useState<SpecialRequestItem[]>(initialSpecialRequests);
  const [settlementSummary, setSettlementSummary] = useState<SettlementSummary>(
    initialSettlementSummary,
  );
  const [settlementPurchases, setSettlementPurchases] =
    useState<SettlementPurchaseItem[]>(initialSettlementPurchases);
  const [sellerSettlements, setSellerSettlements] =
    useState<SellerSettlementItem[]>(initialSellerSettlements);
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
  const [specialRequestDrafts, setSpecialRequestDrafts] = useState<SpecialRequestDraftMap>(() => {
    const initialMap: SpecialRequestDraftMap = {};
    for (const request of initialSpecialRequests) {
      initialMap[request.id] = {
        status: request.status,
        adminNote: request.adminNote ?? "",
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
  const [nowMs, setNowMs] = useState(0);
  const [specialRequestFilter, setSpecialRequestFilter] = useState<"ALL" | SpecialRequestStatus>(
    "ALL",
  );
  const [migrationFilter, setMigrationFilter] = useState<"ALL" | MigrationStatus>("ALL");

  const filteredSpecialRequests = useMemo(() => {
    if (specialRequestFilter === "ALL") {
      return specialRequests;
    }
    return specialRequests.filter((item) => item.status === specialRequestFilter);
  }, [specialRequestFilter, specialRequests]);

  const filteredJobs = useMemo(() => {
    if (migrationFilter === "ALL") {
      return jobs;
    }
    return jobs.filter((item) => item.status === migrationFilter);
  }, [jobs, migrationFilter]);

  const opsAlerts = useMemo<OpsAlert[]>(() => {
    if (!overview) {
      return [];
    }

    const alerts: OpsAlert[] = [];
    const openRequestStatuses: SpecialRequestStatus[] = ["REQUESTED", "REVIEWING", "IN_PROGRESS"];
    const openSpecialCount = specialRequests.filter((item) =>
      openRequestStatuses.includes(item.status),
    ).length;
    const staleThresholdMs = initialAlertThresholds.staleSpecialRequestDays * 24 * 60 * 60 * 1000;
    const staleOpenSpecialCount = specialRequests.filter((item) => {
      if (!openRequestStatuses.includes(item.status)) {
        return false;
      }
      return nowMs > 0 && nowMs - new Date(item.createdAt).getTime() >= staleThresholdMs;
    }).length;

    if (overview.credits.totalBalance < initialAlertThresholds.minTotalCredits) {
      const criticalCutoff = Math.floor(initialAlertThresholds.minTotalCredits / 2);
      const severity: OpsAlert["severity"] =
        overview.credits.totalBalance < criticalCutoff ? "critical" : "warning";
      alerts.push({
        id: "low_total_credits",
        severity,
        title:
          locale === "ko" ? "관리자 총 크레딧 잔액 부족" : "Low admin total credit balance",
        message:
          locale === "ko"
            ? `현재 ${overview.credits.totalBalance} / 기준 ${initialAlertThresholds.minTotalCredits}`
            : `Current ${overview.credits.totalBalance} / threshold ${initialAlertThresholds.minTotalCredits}`,
      });
    }

    if (openSpecialCount > initialAlertThresholds.maxOpenSpecialRequests) {
      alerts.push({
        id: "special_requests_backlog",
        severity:
          openSpecialCount > initialAlertThresholds.maxOpenSpecialRequests * 2
            ? "critical"
            : "warning",
        title: locale === "ko" ? "특수 템플릿 의뢰 적체" : "Special template request backlog",
        message:
          locale === "ko"
            ? `처리중 ${openSpecialCount}건 / 기준 ${initialAlertThresholds.maxOpenSpecialRequests}건`
            : `Open ${openSpecialCount} / threshold ${initialAlertThresholds.maxOpenSpecialRequests}`,
      });
    }

    if (staleOpenSpecialCount > initialAlertThresholds.maxStaleSpecialRequests) {
      alerts.push({
        id: "stale_special_requests",
        severity: "warning",
        title:
          locale === "ko" ? "장기 미처리 특수 의뢰 존재" : "Stale special requests detected",
        message:
          locale === "ko"
            ? `${initialAlertThresholds.staleSpecialRequestDays}일 이상 미처리 ${staleOpenSpecialCount}건`
            : `${staleOpenSpecialCount} open request(s) older than ${initialAlertThresholds.staleSpecialRequestDays} day(s)`,
      });
    }

    if (overview.migrationJobs.RUNNING > initialAlertThresholds.maxRunningMigrations) {
      alerts.push({
        id: "running_migrations_high",
        severity: "warning",
        title:
          locale === "ko"
            ? "동시 마이그레이션 실행량 초과"
            : "Concurrent running migrations over threshold",
        message:
          locale === "ko"
            ? `진행중 ${overview.migrationJobs.RUNNING}건 / 기준 ${initialAlertThresholds.maxRunningMigrations}건`
            : `Running ${overview.migrationJobs.RUNNING} / threshold ${initialAlertThresholds.maxRunningMigrations}`,
      });
    }

    if (overview.migrationJobs.FAILED > initialAlertThresholds.maxFailedMigrations) {
      alerts.push({
        id: "failed_migrations_high",
        severity: "critical",
        title: locale === "ko" ? "마이그레이션 실패 건수 초과" : "Migration failures over threshold",
        message:
          locale === "ko"
            ? `실패 ${overview.migrationJobs.FAILED}건 / 기준 ${initialAlertThresholds.maxFailedMigrations}건`
            : `Failed ${overview.migrationJobs.FAILED} / threshold ${initialAlertThresholds.maxFailedMigrations}`,
      });
    }

    if (settlementSummary.purchaseCount > 0 && settlementSummary.totalPlatformFeeCredits === 0) {
      alerts.push({
        id: "settlement_fee_zero",
        severity: "warning",
        title:
          locale === "ko"
            ? "정산 데이터 점검 필요(수수료 0)"
            : "Settlement data check required (zero platform fee)",
        message:
          locale === "ko"
            ? "구매가 존재하지만 플랫폼 수수료 누적이 0입니다."
            : "Purchases exist while total platform fee is zero.",
      });
    }

    return alerts;
  }, [initialAlertThresholds, locale, nowMs, overview, settlementSummary, specialRequests]);

  useEffect(() => {
    const updateNow = () => {
      setNowMs(Date.now());
    };
    updateNow();
    const timer = window.setInterval(updateNow, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    const [overviewRes, creditsRes, migrationRes, specialRes, settlementRes] = await Promise.all([
      fetch("/api/platform-admin/overview", { cache: "no-store" }),
      fetch("/api/platform-admin/credits?limit=20", { cache: "no-store" }),
      fetch("/api/platform-admin/migration-jobs?limit=50", { cache: "no-store" }),
      fetch("/api/platform-admin/special-requests?limit=50", { cache: "no-store" }),
      fetch("/api/platform-admin/store/settlements?limit=50", { cache: "no-store" }),
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
    const specialJson = await parseJson<{ ok?: boolean; requests?: SpecialRequestItem[] }>(
      specialRes,
    );
    const settlementJson = await parseJson<{
      ok?: boolean;
      summary?: SettlementSummary;
      recentPurchases?: SettlementPurchaseItem[];
      sellerSettlements?: SellerSettlementItem[];
    }>(settlementRes);

    if (
      !overviewRes.ok ||
      !creditsRes.ok ||
      !migrationRes.ok ||
      !specialRes.ok ||
      !settlementRes.ok ||
      !overviewJson?.ok ||
      !creditsJson?.ok ||
      !migrationJson?.ok ||
      !specialJson?.ok ||
      !settlementJson?.ok
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
    const loadedRequests = specialJson.requests ?? [];
    setSpecialRequests(loadedRequests);
    setSettlementSummary(
      settlementJson.summary ?? {
        purchaseCount: 0,
        totalPriceCredits: 0,
        totalSellerCredits: 0,
        totalPlatformFeeCredits: 0,
      },
    );
    setSettlementPurchases(settlementJson.recentPurchases ?? []);
    setSellerSettlements(settlementJson.sellerSettlements ?? []);
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
    setSpecialRequestDrafts((prev) => {
      const next: SpecialRequestDraftMap = {};
      for (const request of loadedRequests) {
        const existing = prev[request.id];
        next[request.id] = {
          status: existing?.status ?? request.status,
          adminNote: existing?.adminNote ?? (request.adminNote ?? ""),
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

  const updateSpecialRequestDraft = useCallback(
    (requestId: string, patch: Partial<SpecialRequestDraftMap[string]>) => {
      setSpecialRequestDrafts((prev) => ({
        ...prev,
        [requestId]: {
          status: patch.status ?? prev[requestId]?.status ?? "REQUESTED",
          adminNote: patch.adminNote ?? prev[requestId]?.adminNote ?? "",
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

  const onUpdateSpecialRequest = useCallback(
    async (requestId: string) => {
      const draft = specialRequestDrafts[requestId];
      if (!draft) {
        return;
      }

      setIsLoading(true);
      const response = await fetch(`/api/platform-admin/special-requests/${requestId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: draft.status,
          adminNote: draft.adminNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const body = await parseJson<{ error?: string }>(response);
        setMessage(body?.error ?? t.failDefault);
        setIsLoading(false);
        return;
      }

      setMessage(t.requestUpdated);
      await refreshAll();
      setIsLoading(false);
    },
    [refreshAll, specialRequestDrafts, t.failDefault, t.requestUpdated],
  );

  return (
    <main className="sa-page">
      <h1>{t.title}</h1>
      <p>{t.subtitle}</p>
      <button type="button" onClick={() => void refreshAll()} disabled={isLoading}>
        {isLoading ? t.loading : t.refresh}
      </button>
      {message ? <p className="sa-inline-message">{message}</p> : null}

      <section style={{ marginTop: 24 }}>
        <h2>{t.overview}</h2>
        {overview ? (
          <div className="sa-metric-grid">
            <article className="sa-metric-card">
              <strong>{overview.users.participantCount}</strong>
              <small>{t.overviewParticipants}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{overview.users.researchAdminCount}</strong>
              <small>{t.overviewResearchAdmins}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{overview.users.platformAdminCount}</strong>
              <small>{t.overviewPlatformAdmins}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{overview.credits.walletCount}</strong>
              <small>{t.overviewWallets}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{overview.credits.totalBalance}</strong>
              <small>{t.overviewTotalCredits}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{overview.credits.transactionCount}</strong>
              <small>{t.overviewTransactions}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{overview.migrationJobs.REQUESTED}</strong>
              <small>{t.overviewMigrationRequested}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{overview.migrationJobs.RUNNING}</strong>
              <small>{t.overviewMigrationRunning}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{overview.migrationJobs.COMPLETED}</strong>
              <small>{t.overviewMigrationCompleted}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{settlementSummary.purchaseCount}</strong>
              <small>{t.overviewStorePurchases}</small>
            </article>
            <article className="sa-metric-card">
              <strong>{settlementSummary.totalPlatformFeeCredits}</strong>
              <small>{t.overviewPlatformFees}</small>
            </article>
          </div>
        ) : (
          <p>-</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t.alerts}</h2>
        {opsAlerts.length === 0 ? (
          <p>{t.noAlerts}</p>
        ) : (
          <div className="sa-alert-grid">
            {opsAlerts.map((alert) => (
              <article
                key={alert.id}
                className={`sa-alert-card ${alert.severity === "critical" ? "is-critical" : "is-warning"}`}
              >
                <strong>
                  {alert.severity === "critical" ? t.severityCritical : t.severityWarning}
                </strong>
                <h3>{alert.title}</h3>
                <p>{alert.message}</p>
              </article>
            ))}
          </div>
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
        <h2>{t.specialRequests}</h2>
        <div style={{ marginBottom: 8 }}>
          <label>
            {t.specialRequestFilter}
            <select
              value={specialRequestFilter}
              onChange={(event) =>
                setSpecialRequestFilter(event.target.value as "ALL" | SpecialRequestStatus)
              }
              disabled={isLoading}
              style={{ marginLeft: 8 }}
            >
              <option value="ALL">{t.filterAll}</option>
              {specialRequestStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {specialRequestStatusLabel(locale, status)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {filteredSpecialRequests.length === 0 ? (
          <p>-</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">{t.requestCreatedAt}</th>
                <th align="left">{t.requester}</th>
                <th align="left">{t.requestTitle}</th>
                <th align="left">{t.status}</th>
                <th align="left">{t.requestAdminNote}</th>
                <th align="left">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecialRequests.map((request) => {
                const draft = specialRequestDrafts[request.id] ?? {
                  status: request.status,
                  adminNote: request.adminNote ?? "",
                };

                return (
                  <tr key={request.id}>
                    <td>{new Date(request.createdAt).toLocaleString()}</td>
                    <td>{displayUserName(request.requester)}</td>
                    <td>
                      <strong>{request.title}</strong>
                      <br />
                      <small>{request.description}</small>
                      <br />
                      <small>
                        {t.requestConsent}: {request.consentPublicSource ? "Y" : "N"}
                      </small>
                    </td>
                    <td>
                      <select
                        value={draft.status}
                        onChange={(event) =>
                          updateSpecialRequestDraft(request.id, {
                            status: event.target.value as SpecialRequestStatus,
                          })
                        }
                        disabled={isLoading}
                      >
                        {specialRequestStatusOptions.map((status) => (
                          <option key={status} value={status}>
                            {specialRequestStatusLabel(locale, status)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        value={draft.adminNote}
                        onChange={(event) =>
                          updateSpecialRequestDraft(request.id, {
                            adminNote: event.target.value,
                          })
                        }
                        disabled={isLoading}
                        style={{ width: "100%" }}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => void onUpdateSpecialRequest(request.id)}
                        disabled={isLoading}
                      >
                        {t.requestApply}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t.settlements}</h2>
        <h3>{t.settlementSummary}</h3>
        <ul>
          <li>
            {t.purchaseCount}: {settlementSummary.purchaseCount}
          </li>
          <li>
            {t.totalPurchaseCredits}: {settlementSummary.totalPriceCredits}
          </li>
          <li>
            {t.totalSellerCredits}: {settlementSummary.totalSellerCredits}
          </li>
          <li>
            {t.totalPlatformFeeCredits}: {settlementSummary.totalPlatformFeeCredits}
          </li>
        </ul>

        <h3>{t.settlementRecent}</h3>
        {settlementPurchases.length === 0 ? (
          <p>-</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">Time</th>
                <th align="left">{locale === "ko" ? "템플릿" : "Template"}</th>
                <th align="left">{locale === "ko" ? "구매자" : "Buyer"}</th>
                <th align="left">{locale === "ko" ? "판매자" : "Seller"}</th>
                <th align="right">{locale === "ko" ? "거래액" : "Price"}</th>
                <th align="right">{locale === "ko" ? "수수료" : "Fee"}</th>
              </tr>
            </thead>
            <tbody>
              {settlementPurchases.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{item.template.title}</td>
                  <td>{displayUserName(item.buyer)}</td>
                  <td>{displayUserName(item.seller)}</td>
                  <td align="right">{item.priceCredits}</td>
                  <td align="right">{item.platformFeeCredits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h3>{t.settlementBySeller}</h3>
        {sellerSettlements.length === 0 ? (
          <p>-</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">{locale === "ko" ? "판매자" : "Seller"}</th>
                <th align="right">{locale === "ko" ? "판매건" : "Sales"}</th>
                <th align="right">{t.totalPurchaseCredits}</th>
                <th align="right">{t.totalSellerCredits}</th>
                <th align="right">{t.totalPlatformFeeCredits}</th>
              </tr>
            </thead>
            <tbody>
              {sellerSettlements.map((item) => (
                <tr key={item.seller.id}>
                  <td>{displayUserName(item.seller)}</td>
                  <td align="right">{item.salesCount}</td>
                  <td align="right">{item.totalPriceCredits}</td>
                  <td align="right">{item.totalSellerCredits}</td>
                  <td align="right">{item.totalPlatformFeeCredits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>{t.migrations}</h2>
        <div style={{ marginBottom: 8 }}>
          <label>
            {t.migrationFilter}
            <select
              value={migrationFilter}
              onChange={(event) => setMigrationFilter(event.target.value as "ALL" | MigrationStatus)}
              disabled={isLoading}
              style={{ marginLeft: 8 }}
            >
              <option value="ALL">{t.filterAll}</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {migrationStatusLabel(locale, status)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {filteredJobs.length === 0 ? (
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
              {filteredJobs.map((job) => {
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
                            {migrationStatusLabel(locale, status)}
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
