"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useMemo, useRef, useState } from "react";

import { AdminAiSkillBookPanel } from "@/components/admin/AdminAiSkillBookPanel";
import { AdminManagedAiPanel } from "@/components/admin/AdminManagedAiPanel";
import { AdminSkillBookStorePanel } from "@/components/admin/AdminSkillBookStorePanel";

type LocaleCode = "ko" | "en";
type ViewerRole = "RESEARCH_ADMIN" | "PLATFORM_ADMIN";
type AdminViewKey = "overview" | "templates" | "packages" | "results" | "special_store" | "participants";
type ParticipantFilter = "ALL" | "ACTIVE" | "INACTIVE" | "ANONYMIZED";

type TemplateItem = { id: string; type: "LIKERT" | "SPECIAL"; visibility: "PRIVATE" | "STORE"; title: string; description: string | null; version: number; createdAt: string; updatedAt: string; };
type PackageItem = { id: string; code: string; title: string; description: string | null; mode: "CROSS_SECTIONAL" | "LONGITUDINAL"; status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED"; maxResponsesPerParticipant: number; startsAt: string | null; endsAt: string | null; createdAt: string; updatedAt: string; templates: Array<{ templateId: string; orderIndex: number; title: string; type: "LIKERT" | "SPECIAL" }>; };
type SpecialRequestItem = { id: string; title: string; description: string; status: "REQUESTED" | "REVIEWING" | "IN_PROGRESS" | "DELIVERED" | "REJECTED" | "CANCELED"; consentPublicSource: boolean; consentAt: string; adminNote: string | null; createdAt: string; updatedAt: string; };
type MigrationJobItem = { id: string; sourceLabel: string; sourceFormat: string; status: "REQUESTED" | "ACCEPTED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELED"; requestNote: string | null; resultNote: string | null; requestedAt: string; completedAt: string | null; };
type StoreOwnedTemplateItem = { id: string; title: string; description: string | null; version: number; updatedAt: string; };
type StoreListingItem = { id: string; templateId: string; sellerId: string; priceCredits: number; isActive: boolean; createdAt: string; updatedAt: string; template: { id: string; title: string; description: string | null; version: number; isArchived: boolean; }; seller?: { id: string; loginId: string | null; displayName: string | null; role: string; }; alreadyPurchased?: boolean; canPurchase?: boolean; };
type StorePurchaseHistoryItem = { id: string; listingId: string; templateId: string; buyerId: string; sellerId: string; priceCredits: number; sellerCredit: number; platformFeeCredits: number; createdAt: string; listing: { id: string; priceCredits: number; template: { id: string; title: string; version: number; }; }; seller?: { id: string; loginId: string | null; displayName: string | null; role: string; }; buyer?: { id: string; loginId: string | null; displayName: string | null; role: string; }; };
type ParticipantAccountItem = { id: string; loginId: string | null; displayName: string | null; locale: "ko" | "en"; isActive: boolean; isAnonymized: boolean; enrollmentCount: number; responseCount: number; lastRespondedAt: string | null; createdAt: string; updatedAt: string; };

type Props = {
  locale: LocaleCode;
  viewerRole: ViewerRole;
  initialView?: AdminViewKey;
  initialTemplates: TemplateItem[];
  initialPackages: PackageItem[];
  initialSpecialRequests: SpecialRequestItem[];
  initialMigrationJobs: MigrationJobItem[];
  initialOwnedSpecialTemplates: StoreOwnedTemplateItem[];
  initialMyListings: StoreListingItem[];
  initialMarketListings: StoreListingItem[];
  initialPurchases: StorePurchaseHistoryItem[];
  initialSales: StorePurchaseHistoryItem[];
  initialParticipants: ParticipantAccountItem[];
};

const viewKeys: AdminViewKey[] = ["overview", "templates", "packages", "results", "special_store", "participants"];

function normView(value?: string | null): AdminViewKey {
  return viewKeys.includes((value ?? "") as AdminViewKey) ? (value as AdminViewKey) : "overview";
}

function parseJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null) as Promise<T | null>;
}

function fmt(locale: LocaleCode, value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function isoOrNull(value: string) {
  if (!value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function who(user?: { loginId: string | null; displayName: string | null }) {
  if (!user) return "-";
  return user.displayName?.trim() || user.loginId?.trim() || "-";
}

function templateTypeLabel(locale: LocaleCode, type: "LIKERT" | "SPECIAL") {
  if (locale === "ko") return type === "SPECIAL" ? "특수" : "리커트";
  return type === "SPECIAL" ? "Special" : "Likert";
}

function templateVisibilityLabel(locale: LocaleCode, visibility: "PRIVATE" | "STORE") {
  if (locale === "ko") return visibility === "STORE" ? "스토어 공개" : "비공개";
  return visibility === "STORE" ? "Store" : "Private";
}

function packageModeLabel(locale: LocaleCode, mode: "CROSS_SECTIONAL" | "LONGITUDINAL") {
  if (locale === "ko") return mode === "LONGITUDINAL" ? "종단" : "횡단";
  return mode === "LONGITUDINAL" ? "Longitudinal" : "Cross-sectional";
}

function packageStatusLabel(locale: LocaleCode, status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED") {
  if (locale !== "ko") return status;
  if (status === "ACTIVE") return "진행 중";
  if (status === "CLOSED") return "종료";
  if (status === "ARCHIVED") return "보관";
  return "초안";
}

function specialRequestStatusLabel(
  locale: LocaleCode,
  status: "REQUESTED" | "REVIEWING" | "IN_PROGRESS" | "DELIVERED" | "REJECTED" | "CANCELED",
) {
  if (locale !== "ko") return status;
  if (status === "REQUESTED") return "접수";
  if (status === "REVIEWING") return "검토 중";
  if (status === "IN_PROGRESS") return "작업 중";
  if (status === "DELIVERED") return "전달 완료";
  if (status === "REJECTED") return "반려";
  return "취소";
}

function migrationStatusLabel(
  locale: LocaleCode,
  status: "REQUESTED" | "ACCEPTED" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELED",
) {
  if (locale !== "ko") return status;
  if (status === "REQUESTED") return "접수";
  if (status === "ACCEPTED") return "수락";
  if (status === "RUNNING") return "진행 중";
  if (status === "COMPLETED") return "완료";
  if (status === "FAILED") return "실패";
  return "취소";
}

function participantStatusLabel(
  locale: LocaleCode,
  participant: Pick<ParticipantAccountItem, "isActive" | "isAnonymized">,
) {
  if (participant.isAnonymized) return locale === "ko" ? "익명화됨" : "Anonymized";
  return participant.isActive ? (locale === "ko" ? "활성" : "Active") : (locale === "ko" ? "비활성" : "Inactive");
}

export function AdminDashboardClient(props: Props) {
  const { locale, viewerRole, initialView } = props;
  const isKo = locale === "ko";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const purchaseNonceRef = useRef(0);
  const activeView = normView(searchParams.get("view") ?? initialView ?? "overview");
  const tr = useCallback((ko: string, en: string) => (isKo ? ko : en), [isKo]);

  const [templates, setTemplates] = useState(props.initialTemplates);
  const [packages, setPackages] = useState(props.initialPackages);
  const [specialRequests, setSpecialRequests] = useState(props.initialSpecialRequests);
  const [migrationJobs, setMigrationJobs] = useState(props.initialMigrationJobs);
  const [ownedSpecialTemplates, setOwnedSpecialTemplates] = useState(props.initialOwnedSpecialTemplates);
  const [myListings, setMyListings] = useState(props.initialMyListings);
  const [marketListings, setMarketListings] = useState(props.initialMarketListings);
  const [purchaseHistory, setPurchaseHistory] = useState(props.initialPurchases);
  const [salesHistory, setSalesHistory] = useState(props.initialSales);
  const [participants, setParticipants] = useState(props.initialParticipants);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [templateType, setTemplateType] = useState<"LIKERT" | "SPECIAL">("LIKERT");
  const [templateVisibility, setTemplateVisibility] = useState<"PRIVATE" | "STORE">("PRIVATE");
  const [templateTitle, setTemplateTitle] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [likertMin, setLikertMin] = useState(1);
  const [likertMax, setLikertMax] = useState(5);
  const [likertLabels, setLikertLabels] = useState(isKo ? "전혀 아니다\n아니다\n보통이다\n그렇다\n매우 그렇다" : "Strongly disagree\nDisagree\nNeutral\nAgree\nStrongly agree");
  const [likertQuestions, setLikertQuestions] = useState("");
  const [specialSchemaText, setSpecialSchemaText] = useState('{\n  "kind": "special",\n  "version": 1\n}');

  const [packageCode, setPackageCode] = useState("");
  const [packageTitle, setPackageTitle] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [packageMode, setPackageMode] = useState<"CROSS_SECTIONAL" | "LONGITUDINAL">("CROSS_SECTIONAL");
  const [packageMaxResponses, setPackageMaxResponses] = useState(1);
  const [packageStartsAt, setPackageStartsAt] = useState("");
  const [packageEndsAt, setPackageEndsAt] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  const [specialTitle, setSpecialTitle] = useState("");
  const [specialDescription, setSpecialDescription] = useState("");
  const [specialConsent, setSpecialConsent] = useState(false);
  const [migrationSourceLabel, setMigrationSourceLabel] = useState("");
  const [migrationSourceFormat, setMigrationSourceFormat] = useState("CSV");
  const [migrationRequestNote, setMigrationRequestNote] = useState("");

  const [storeTemplateId, setStoreTemplateId] = useState(props.initialOwnedSpecialTemplates[0]?.id ?? "");
  const [storePrice, setStorePrice] = useState(100);
  const [storeActive, setStoreActive] = useState(true);
  const [listingDrafts, setListingDrafts] = useState<Record<string, { priceCredits: number; isActive: boolean }>>(() => Object.fromEntries(props.initialMyListings.map((listing) => [listing.id, { priceCredits: listing.priceCredits, isActive: listing.isActive }])));

  const [participantQuery, setParticipantQuery] = useState("");
  const [participantFilter, setParticipantFilter] = useState<ParticipantFilter>("ALL");
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportAttempt, setExportAttempt] = useState("");

  const changeView = useCallback((view: AdminViewKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "overview") params.delete("view");
    else params.set("view", view);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const [templateRes, packageRes, requestRes, migrationRes, listingRes, purchaseRes, participantRes] = await Promise.all([
        fetch("/api/admin/templates", { cache: "no-store" }),
        fetch("/api/admin/packages", { cache: "no-store" }),
        fetch("/api/admin/special-requests", { cache: "no-store" }),
        fetch("/api/admin/migration-jobs?limit=50", { cache: "no-store" }),
        fetch("/api/admin/store/listings?limit=100", { cache: "no-store" }),
        fetch("/api/admin/store/purchases?limit=50", { cache: "no-store" }),
        fetch("/api/admin/participants?limit=200", { cache: "no-store" }),
      ]);
      const templateJson = await parseJson<{ ok?: boolean; templates?: TemplateItem[] }>(templateRes);
      const packageJson = await parseJson<{ ok?: boolean; packages?: PackageItem[] }>(packageRes);
      const requestJson = await parseJson<{ ok?: boolean; requests?: SpecialRequestItem[] }>(requestRes);
      const migrationJson = await parseJson<{ ok?: boolean; jobs?: MigrationJobItem[] }>(migrationRes);
      const listingJson = await parseJson<{ ok?: boolean; ownedSpecialTemplates?: StoreOwnedTemplateItem[]; myListings?: StoreListingItem[]; marketListings?: StoreListingItem[] }>(listingRes);
      const purchaseJson = await parseJson<{ ok?: boolean; purchases?: StorePurchaseHistoryItem[]; sales?: StorePurchaseHistoryItem[] }>(purchaseRes);
      const participantJson = await parseJson<{ ok?: boolean; participants?: ParticipantAccountItem[] }>(participantRes);
      if (!templateRes.ok || !templateJson?.ok || !templateJson.templates || !packageRes.ok || !packageJson?.ok || !packageJson.packages || !requestRes.ok || !requestJson?.ok || !requestJson.requests || !migrationRes.ok || !migrationJson?.ok || !migrationJson.jobs || !listingRes.ok || !listingJson?.ok || !listingJson.ownedSpecialTemplates || !listingJson.myListings || !listingJson.marketListings || !purchaseRes.ok || !purchaseJson?.ok || !purchaseJson.purchases || !purchaseJson.sales || !participantRes.ok || !participantJson?.ok || !participantJson.participants) {
        throw new Error("refresh_failed");
      }
      setTemplates(templateJson.templates);
      setPackages(packageJson.packages);
      setSpecialRequests(requestJson.requests);
      setMigrationJobs(migrationJson.jobs);
      const ownedTemplates = listingJson.ownedSpecialTemplates;
      const ownListings = listingJson.myListings;
      const availableListings = listingJson.marketListings;
      const purchases = purchaseJson.purchases;
      const sales = purchaseJson.sales;
      const participantRows = participantJson.participants;
      setOwnedSpecialTemplates(ownedTemplates);
      setMyListings(ownListings);
      setMarketListings(availableListings);
      setPurchaseHistory(purchases);
      setSalesHistory(sales);
      setParticipants(participantRows);
      setStoreTemplateId((prev) =>
        prev && ownedTemplates.some((item) => item.id === prev) ? prev : (ownedTemplates[0]?.id ?? ""),
      );
      setListingDrafts(
        Object.fromEntries(
          ownListings.map((listing) => [
            listing.id,
            { priceCredits: listing.priceCredits, isActive: listing.isActive },
          ]),
        ),
      );
    } catch {
      setMessage(tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
    } finally {
      setIsLoading(false);
    }
  }, [tr]);
  const updateListingDraft = useCallback((listingId: string, patch: Partial<{ priceCredits: number; isActive: boolean }>) => {
    setListingDrafts((current) => ({
      ...current,
      [listingId]: {
        priceCredits: patch.priceCredits ?? current[listingId]?.priceCredits ?? 1,
        isActive: patch.isActive ?? current[listingId]?.isActive ?? true,
      },
    }));
  }, []);

  const onCreateTemplate = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      let schemaJson: Record<string, unknown>;
      if (templateType === "LIKERT") {
        const labels = likertLabels.split(/[\n,]/g).map((item) => item.trim()).filter(Boolean);
        const questions = likertQuestions.split(/\n/g).map((item, index) => ({ id: `Q${index + 1}`, text: item.trim() })).filter((item) => item.text.length > 0);
        if (labels.length !== likertMax - likertMin + 1) {
          setMessage(tr("척도 라벨 수가 최소/최대 범위와 맞지 않습니다.", "Scale labels do not match the min/max range."));
          setIsLoading(false);
          return;
        }
        if (questions.length === 0) {
          setMessage(tr("질문을 한 개 이상 입력해야 합니다.", "Enter at least one question."));
          setIsLoading(false);
          return;
        }
        schemaJson = { kind: "likert", scale: { min: likertMin, max: likertMax, labels }, questions };
      } else {
        try {
          schemaJson = JSON.parse(specialSchemaText) as Record<string, unknown>;
        } catch {
          setMessage(tr("특수 템플릿 JSON 형식이 올바르지 않습니다.", "Special template JSON is invalid."));
          setIsLoading(false);
          return;
        }
      }
      const response = await fetch("/api/admin/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: templateType, title: templateTitle.trim(), description: templateDescription.trim() || undefined, visibility: templateVisibility, schemaJson }) });
      const payload = await parseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
        setIsLoading(false);
        return;
      }
      await refreshAll();
      setTemplateTitle("");
      setTemplateDescription("");
      setLikertQuestions("");
      setMessage(tr("템플릿이 생성되었습니다.", "Template created."));
    } finally {
      setIsLoading(false);
    }
  };

  const onCreatePackage = async (event: FormEvent) => {
    event.preventDefault();
    if (selectedTemplateIds.length === 0) {
      setMessage(tr("패키지에 포함할 템플릿을 한 개 이상 선택해야 합니다.", "Select at least one template."));
      return;
    }
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/packages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: packageCode.trim(), title: packageTitle.trim(), description: packageDescription.trim() || undefined, mode: packageMode, maxResponsesPerParticipant: packageMaxResponses, startsAt: isoOrNull(packageStartsAt) ?? undefined, endsAt: isoOrNull(packageEndsAt) ?? undefined, templateIds: selectedTemplateIds }) });
      const payload = await parseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
        setIsLoading(false);
        return;
      }
      await refreshAll();
      setPackageCode("");
      setPackageTitle("");
      setPackageDescription("");
      setPackageStartsAt("");
      setPackageEndsAt("");
      setPackageMode("CROSS_SECTIONAL");
      setPackageMaxResponses(1);
      setSelectedTemplateIds([]);
      setMessage(tr("패키지가 생성되었습니다.", "Package created."));
    } finally {
      setIsLoading(false);
    }
  };

  const onChangePackageStatus = async (packageId: string, status: PackageItem["status"]) => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/packages/${packageId}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const payload = await parseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
        setIsLoading(false);
        return;
      }
      await refreshAll();
      setMessage(tr("패키지 상태가 변경되었습니다.", "Package status updated."));
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateSpecialRequest = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/special-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: specialTitle.trim(), description: specialDescription.trim(), consentPublicSource: specialConsent }) });
      const payload = await parseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
        setIsLoading(false);
        return;
      }
      await refreshAll();
      setSpecialTitle("");
      setSpecialDescription("");
      setSpecialConsent(false);
      setMessage(tr("특수 템플릿 의뢰가 등록되었습니다.", "Special request submitted."));
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateMigrationJob = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/migration-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceLabel: migrationSourceLabel.trim(),
          sourceFormat: migrationSourceFormat.trim(),
          requestNote: migrationRequestNote.trim() || undefined,
        }),
      });
      const payload = await parseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
        setIsLoading(false);
        return;
      }
      await refreshAll();
      setMigrationSourceLabel("");
      setMigrationSourceFormat("CSV");
      setMigrationRequestNote("");
      setMessage(tr("데이터 마이그레이션 의뢰가 등록되었습니다.", "Migration request submitted."));
    } finally {
      setIsLoading(false);
    }
  };

  const onCreateStoreListing = async (event: FormEvent) => {
    event.preventDefault();
    if (!storeTemplateId) return;
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/store/listings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateId: storeTemplateId, priceCredits: Math.max(1, Math.trunc(storePrice)), isActive: storeActive }) });
      const payload = await parseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
        setIsLoading(false);
        return;
      }
      await refreshAll();
      setMessage(tr("스토어 등록이 완료되었습니다.", "Store listing created."));
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdateStoreListing = async (listingId: string) => {
    const draft = listingDrafts[listingId];
    if (!draft) return;
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/store/listings/${listingId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ priceCredits: Math.max(1, Math.trunc(draft.priceCredits)), isActive: draft.isActive }) });
      const payload = await parseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
        setIsLoading(false);
        return;
      }
      await refreshAll();
      setMessage(tr("스토어 등록 정보가 수정되었습니다.", "Store listing updated."));
    } finally {
      setIsLoading(false);
    }
  };

  const onPurchaseListing = async (listingId: string) => {
    purchaseNonceRef.current += 1;
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/store/purchases", { method: "POST", headers: { "Content-Type": "application/json", "X-Idempotency-Key": `template_purchase_${listingId}_${purchaseNonceRef.current}` }, body: JSON.stringify({ listingId }) });
      const payload = await parseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
        setIsLoading(false);
        return;
      }
      await refreshAll();
      setMessage(tr("구매가 완료되었습니다.", "Purchase completed."));
    } finally {
      setIsLoading(false);
    }
  };

  const onParticipantAction = async (participantId: string, action: "ACTIVATE" | "DEACTIVATE" | "ANONYMIZE") => {
    if (action === "ANONYMIZE") {
      const ok = window.confirm(tr("정말 이 참가자 계정을 익명화할까요? 이 작업은 되돌릴 수 없습니다.", "Anonymize this participant account? This cannot be undone."));
      if (!ok) return;
    }
    setIsLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/participants/${participantId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const payload = await parseJson<{ ok?: boolean; error?: string }>(response);
      if (!response.ok || !payload?.ok) {
        setMessage(payload?.error ?? tr("요청 처리 중 오류가 발생했습니다.", "Request failed."));
        setIsLoading(false);
        return;
      }
      await refreshAll();
      setMessage(tr("피검자 상태가 변경되었습니다.", "Participant status updated."));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredParticipants = useMemo(() => {
    const q = participantQuery.trim().toLowerCase();
    return participants.filter((participant) => {
      if (participantFilter === "ACTIVE" && (!participant.isActive || participant.isAnonymized)) return false;
      if (participantFilter === "INACTIVE" && (participant.isActive || participant.isAnonymized)) return false;
      if (participantFilter === "ANONYMIZED" && !participant.isAnonymized) return false;
      if (!q) return true;
      return `${participant.loginId ?? ""} ${participant.displayName ?? ""}`.toLowerCase().includes(q);
    });
  }, [participantFilter, participantQuery, participants]);

  const isExportRangeInvalid = useMemo(() => exportFrom && exportTo ? new Date(exportTo).getTime() < new Date(exportFrom).getTime() : false, [exportFrom, exportTo]);
  const buildExportHref = useCallback((packageId: string, format: "zip" | "csv") => {
    const params = new URLSearchParams();
    params.set("format", format);
    const from = isoOrNull(exportFrom);
    const to = isoOrNull(exportTo);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const attempt = Number.parseInt(exportAttempt, 10);
    if (exportAttempt.trim() && Number.isInteger(attempt) && attempt > 0) params.set("attempt", String(attempt));
    return `/api/admin/packages/${packageId}/export?${params.toString()}`;
  }, [exportAttempt, exportFrom, exportTo]);

  const cards = [
    { label: tr("템플릿", "Templates"), value: templates.length },
    { label: tr("패키지", "Packages"), value: packages.length },
    { label: tr("열린 특수의뢰", "Open special requests"), value: specialRequests.filter((item) => ["REQUESTED", "REVIEWING", "IN_PROGRESS"].includes(item.status)).length },
    { label: tr("열린 마이그레이션 의뢰", "Open migration requests"), value: migrationJobs.filter((item) => ["REQUESTED", "ACCEPTED", "RUNNING"].includes(item.status)).length },
    { label: tr("관리 대상 피검자", "Managed participants"), value: participants.length },
    { label: tr("활성 특수 판매글", "Active special listings"), value: myListings.filter((item) => item.isActive).length },
  ];
  return (
    <main className="sa-page sa-desktop-only-page" style={{ gap: 20 }}>
      <section style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>{tr("연구자 콘솔", "Research Admin Console")}</h1>
          <p style={{ margin: 0, maxWidth: 760 }}>{tr("일반 설문 운영, 결과 내보내기, SkillBook 기반 AI 대화를 관리합니다.", "Manage standard survey operations, exports, and SkillBook-based AI chat.")}</p>
        </div>
        <button type="button" onClick={() => void refreshAll()} disabled={isLoading}>{isLoading ? tr("처리 중...", "Processing...") : tr("새로고침", "Refresh")}</button>
      </section>

      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {viewKeys.map((view) => {
          const label = view === "overview" ? tr("개요", "Overview") : view === "templates" ? tr("템플릿", "Templates") : view === "packages" ? tr("패키지·참여코드", "Packages") : view === "results" ? tr("결과·AI", "Results & AI") : view === "special_store" ? tr("특수의뢰·스토어", "Special & Store") : tr("피검자 관리", "Participants");
          const active = activeView === view;
          return <button key={view} type="button" onClick={() => changeView(view)} style={{ border: active ? "2px solid #2A5F7F" : "1px solid #c1d2dc", background: active ? "#eef5f8" : "#fff", color: "#1e4257", borderRadius: 999, padding: "8px 14px", fontWeight: active ? 700 : 500 }}>{label}</button>;
        })}
      </nav>

      {message ? <p className="sa-inline-message">{message}</p> : null}

      <section hidden={activeView !== "overview"} style={{ display: "grid", gap: 12 }}>
        <h2 style={{ margin: 0 }}>{tr("운영 요약", "Operations snapshot")}</h2>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {cards.map((card) => <article key={card.label} style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 14, background: "#fff" }}><div style={{ fontSize: 13, opacity: 0.7 }}>{card.label}</div><div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>{card.value}</div></article>)}
        </div>
      </section>

      <section hidden={activeView !== "templates"} style={{ display: "grid", gap: 16 }}>
        <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>{tr("템플릿 생성", "Create template")}</h2>
          <form onSubmit={onCreateTemplate} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>{tr("유형", "Type")}</span>
                <select value={templateType} onChange={(event) => setTemplateType(event.target.value as "LIKERT" | "SPECIAL")} disabled={isLoading}>
                  <option value="LIKERT">{tr("일반 리커트", "Standard Likert")}</option>
                  {viewerRole === "PLATFORM_ADMIN" ? <option value="SPECIAL">{tr("특수 템플릿", "Special template")}</option> : null}
                </select>
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>{tr("공개 범위", "Visibility")}</span>
                <select value={templateVisibility} onChange={(event) => setTemplateVisibility(event.target.value as "PRIVATE" | "STORE")} disabled={isLoading}>
                  <option value="PRIVATE">{tr("비공개", "Private")}</option>
                  <option value="STORE">{tr("스토어 공개", "Store")}</option>
                </select>
              </label>
            </div>
            <label style={{ display: "grid", gap: 6 }}><span>{tr("제목", "Title")}</span><input value={templateTitle} onChange={(event) => setTemplateTitle(event.target.value)} disabled={isLoading} /></label>
            <label style={{ display: "grid", gap: 6 }}><span>{tr("설명", "Description")}</span><textarea rows={3} value={templateDescription} onChange={(event) => setTemplateDescription(event.target.value)} disabled={isLoading} /></label>
            {templateType === "LIKERT" ? (
              <>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                  <label style={{ display: "grid", gap: 6 }}><span>{tr("최소 척도값", "Scale min")}</span><input type="number" value={likertMin} onChange={(event) => setLikertMin(Number(event.target.value) || 1)} disabled={isLoading} /></label>
                  <label style={{ display: "grid", gap: 6 }}><span>{tr("최대 척도값", "Scale max")}</span><input type="number" value={likertMax} onChange={(event) => setLikertMax(Number(event.target.value) || likertMin + 1)} disabled={isLoading} /></label>
                </div>
                <label style={{ display: "grid", gap: 6 }}><span>{tr("척도 라벨", "Scale labels")}</span><textarea rows={4} value={likertLabels} onChange={(event) => setLikertLabels(event.target.value)} disabled={isLoading} /></label>
                <label style={{ display: "grid", gap: 6 }}><span>{tr("질문 목록", "Questions")}</span><textarea rows={8} value={likertQuestions} onChange={(event) => setLikertQuestions(event.target.value)} disabled={isLoading} /></label>
              </>
            ) : <label style={{ display: "grid", gap: 6 }}><span>{tr("특수 템플릿 JSON", "Special template JSON")}</span><textarea rows={10} value={specialSchemaText} onChange={(event) => setSpecialSchemaText(event.target.value)} disabled={isLoading} /></label>}
            <button type="submit" disabled={isLoading} style={{ width: 180 }}>{isLoading ? tr("처리 중...", "Processing...") : tr("템플릿 생성", "Create template")}</button>
          </form>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {templates.length === 0 ? <p>{tr("등록된 템플릿이 없습니다.", "No template available.")}</p> : templates.map((template) => <article key={template.id} style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 14, background: "#fff" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><strong>{template.title}</strong><div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{templateTypeLabel(locale, template.type)} · {templateVisibilityLabel(locale, template.visibility)} · v{template.version}</div></div><div style={{ fontSize: 13, opacity: 0.75 }}>{fmt(locale, template.updatedAt)}</div></div>{template.description ? <p style={{ marginBottom: 0 }}>{template.description}</p> : null}</article>)}
        </div>
      </section>

      <section hidden={activeView !== "packages"} style={{ display: "grid", gap: 16 }}>
        <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>{tr("패키지 생성", "Create package")}</h2>
          <form onSubmit={onCreatePackage} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}><span>{tr("패키지 코드", "Package code")}</span><input value={packageCode} onChange={(event) => setPackageCode(event.target.value)} disabled={isLoading} /></label>
              <label style={{ display: "grid", gap: 6 }}><span>{tr("제목", "Title")}</span><input value={packageTitle} onChange={(event) => setPackageTitle(event.target.value)} disabled={isLoading} /></label>
            </div>
            <label style={{ display: "grid", gap: 6 }}><span>{tr("설명", "Description")}</span><textarea rows={3} value={packageDescription} onChange={(event) => setPackageDescription(event.target.value)} disabled={isLoading} /></label>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}><span>{tr("연구 형태", "Study mode")}</span><select value={packageMode} onChange={(event) => setPackageMode(event.target.value as "CROSS_SECTIONAL" | "LONGITUDINAL")} disabled={isLoading}><option value="CROSS_SECTIONAL">{tr("횡단", "Cross-sectional")}</option><option value="LONGITUDINAL">{tr("종단", "Longitudinal")}</option></select></label>
              <label style={{ display: "grid", gap: 6 }}><span>{tr("참가자별 최대 응답 횟수", "Max responses per participant")}</span><input type="number" min={1} value={packageMaxResponses} onChange={(event) => setPackageMaxResponses(Number(event.target.value) || 1)} disabled={isLoading} /></label>
              <label style={{ display: "grid", gap: 6 }}><span>{tr("시작 시각", "Starts at")}</span><input type="datetime-local" value={packageStartsAt} onChange={(event) => setPackageStartsAt(event.target.value)} disabled={isLoading} /></label>
              <label style={{ display: "grid", gap: 6 }}><span>{tr("종료 시각", "Ends at")}</span><input type="datetime-local" value={packageEndsAt} onChange={(event) => setPackageEndsAt(event.target.value)} disabled={isLoading} /></label>
            </div>
            <fieldset style={{ border: "1px solid #d7e0e6", borderRadius: 10, padding: 12 }}>
              <legend>{tr("포함 템플릿", "Included templates")}</legend>
              {templates.length === 0 ? <p>{tr("등록된 템플릿이 없습니다.", "No template available.")}</p> : <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>{templates.map((template) => <label key={template.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", border: "1px solid #e5ebef", borderRadius: 10, padding: 10 }}><input type="checkbox" checked={selectedTemplateIds.includes(template.id)} onChange={() => setSelectedTemplateIds((current) => current.includes(template.id) ? current.filter((id) => id !== template.id) : [...current, template.id])} /><span><strong>{template.title}</strong><br /><small>{templateTypeLabel(locale, template.type)}</small></span></label>)}</div>}
            </fieldset>
            <button type="submit" disabled={isLoading} style={{ width: 180 }}>{isLoading ? tr("처리 중...", "Processing...") : tr("패키지 생성", "Create package")}</button>
          </form>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {packages.length === 0 ? <p>{tr("등록된 패키지가 없습니다.", "No package available.")}</p> : packages.map((pkg) => <article key={pkg.id} style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 14, background: "#fff" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><strong>{pkg.title}</strong> ({pkg.code})<div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{tr("상태", "Status")}: {packageStatusLabel(locale, pkg.status)} · {tr("형태", "Mode")}: {packageModeLabel(locale, pkg.mode)}</div></div><div style={{ fontSize: 13, opacity: 0.75 }}>{fmt(locale, pkg.updatedAt)}</div></div>{pkg.description ? <p>{pkg.description}</p> : null}<div style={{ fontSize: 13, opacity: 0.85 }}>{pkg.templates.map((template) => template.title).join(", ") || "-"}</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}><button type="button" disabled={isLoading} onClick={() => void onChangePackageStatus(pkg.id, "DRAFT")}>{tr("초안", "Draft")}</button><button type="button" disabled={isLoading} onClick={() => void onChangePackageStatus(pkg.id, "ACTIVE")}>{tr("진행", "Active")}</button><button type="button" disabled={isLoading} onClick={() => void onChangePackageStatus(pkg.id, "CLOSED")}>{tr("종료", "Closed")}</button><button type="button" disabled={isLoading} onClick={() => void onChangePackageStatus(pkg.id, "ARCHIVED")}>{tr("보관", "Archived")}</button></div></article>)}
        </div>
      </section>
      <section hidden={activeView !== "results"} style={{ display: "grid", gap: 16 }}>
        <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>{tr("결과 내보내기", "Result export")}</h2>
          <p style={{ marginTop: 0 }}>{tr("기본 다운로드는 ZIP이며, master long CSV는 단일 CSV로도 받을 수 있습니다.", "Default download is ZIP. The master long CSV is also available as a single CSV.")}</p>
          <fieldset style={{ border: "1px solid #d7e0e6", borderRadius: 10, padding: 12 }}>
            <legend>{tr("내보내기 필터", "Export filters")}</legend>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}><span>{tr("응답 시작 시각", "Submitted from")}</span><input type="datetime-local" value={exportFrom} onChange={(event) => setExportFrom(event.target.value)} /></label>
              <label style={{ display: "grid", gap: 6 }}><span>{tr("응답 종료 시각", "Submitted to")}</span><input type="datetime-local" value={exportTo} onChange={(event) => setExportTo(event.target.value)} /></label>
              <label style={{ display: "grid", gap: 6 }}><span>{tr("응답 차수", "Attempt no")}</span><input type="number" min={1} value={exportAttempt} onChange={(event) => setExportAttempt(event.target.value)} /></label>
            </div>
            <small>{tr("비우면 전체 차수를 내보냅니다.", "Leave blank to export all attempts.")}</small>
            {isExportRangeInvalid ? <p style={{ color: "#b00020", marginBottom: 0 }}>{tr("CSV 필터 기간을 확인하세요. 종료 시각은 시작 시각 이후여야 합니다.", "Check the export date range. End must be after start.")}</p> : null}
          </fieldset>
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {packages.length === 0 ? <p>{tr("등록된 패키지가 없습니다.", "No package available.")}</p> : packages.map((pkg) => <article key={pkg.id} style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}><strong>{pkg.title}</strong> ({pkg.code})<div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}><a href={buildExportHref(pkg.id, "zip")} onClick={(event) => { if (isExportRangeInvalid) event.preventDefault(); }} style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", border: "1px solid #c1d2dc", borderRadius: 8, textDecoration: "none", color: "inherit", opacity: isExportRangeInvalid ? 0.5 : 1, pointerEvents: isExportRangeInvalid ? "none" : "auto" }}>{tr("ZIP 내보내기", "Export ZIP")}</a><a href={buildExportHref(pkg.id, "csv")} onClick={(event) => { if (isExportRangeInvalid) event.preventDefault(); }} style={{ display: "inline-flex", alignItems: "center", padding: "6px 10px", border: "1px solid #c1d2dc", borderRadius: 8, textDecoration: "none", color: "inherit", opacity: isExportRangeInvalid ? 0.5 : 1, pointerEvents: isExportRangeInvalid ? "none" : "auto" }}>{tr("Master CSV", "Master CSV")}</a></div></article>)}
          </div>
        </div>
        <AdminAiSkillBookPanel locale={locale} packages={packages.map((pkg) => ({ id: pkg.id, code: pkg.code, title: pkg.title }))} />
        <AdminManagedAiPanel locale={locale} packages={packages.map((pkg) => ({ id: pkg.id, code: pkg.code, title: pkg.title }))} />
      </section>

      <section hidden={activeView !== "special_store"} style={{ display: "grid", gap: 16 }}>
        <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>{tr("데이터 마이그레이션 의뢰", "Data migration request")}</h2>
          <form onSubmit={onCreateMigrationJob} style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <label style={{ display: "grid", gap: 6 }}>
                <span>{tr("이전 시스템 이름", "Legacy system label")}</span>
                <input
                  value={migrationSourceLabel}
                  onChange={(event) => setMigrationSourceLabel(event.target.value)}
                  placeholder={tr("예: 구 웹사이트 설문 시스템", "Example: Legacy lab survey system")}
                  disabled={isLoading}
                />
              </label>
              <label style={{ display: "grid", gap: 6 }}>
                <span>{tr("백업 형식", "Backup format")}</span>
                <input
                  value={migrationSourceFormat}
                  onChange={(event) => setMigrationSourceFormat(event.target.value)}
                  placeholder={tr("예: CSV / XLSX / SQL dump / GAS export", "Example: CSV / XLSX / SQL dump / GAS export")}
                  disabled={isLoading}
                />
              </label>
            </div>
            <label style={{ display: "grid", gap: 6 }}>
              <span>{tr("요청 메모", "Request note")}</span>
              <textarea
                rows={5}
                value={migrationRequestNote}
                onChange={(event) => setMigrationRequestNote(event.target.value)}
                placeholder={tr("어떤 데이터를 옮겨야 하는지, 주의사항은 무엇인지 적어 주세요.", "Describe what should be migrated and any constraints.")}
                disabled={isLoading}
              />
            </label>
            <button
              type="submit"
              disabled={isLoading || !migrationSourceLabel.trim() || !migrationSourceFormat.trim()}
              style={{ width: 220 }}
            >
              {isLoading ? tr("처리 중...", "Processing...") : tr("마이그레이션 의뢰 등록", "Submit migration request")}
            </button>
          </form>
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {migrationJobs.length === 0 ? (
              <p>{tr("등록된 마이그레이션 의뢰가 없습니다.", "No migration request found.")}</p>
            ) : (
              migrationJobs.map((job) => (
                <article key={job.id} style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <strong>{job.sourceLabel}</strong>
                      <div style={{ fontSize: 13, opacity: 0.75 }}>{job.sourceFormat}</div>
                    </div>
                    <span>{migrationStatusLabel(locale, job.status)}</span>
                  </div>
                  {job.requestNote ? <p style={{ marginBottom: 8 }}>{job.requestNote}</p> : null}
                  <div style={{ fontSize: 13, opacity: 0.75 }}>
                    {tr("요청 시각", "Requested at")}: {fmt(locale, job.requestedAt)}
                  </div>
                  {job.resultNote ? (
                    <div style={{ marginTop: 8, fontSize: 13 }}>
                      <strong>{tr("처리 메모", "Result note")}:</strong> {job.resultNote}
                    </div>
                  ) : null}
                  {job.completedAt ? (
                    <div style={{ marginTop: 6, fontSize: 13, opacity: 0.75 }}>
                      {tr("완료 시각", "Completed at")}: {fmt(locale, job.completedAt)}
                    </div>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>

        <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>{tr("특수 템플릿 의뢰", "Special template request")}</h2>
          <form onSubmit={onCreateSpecialRequest} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}><span>{tr("의뢰 제목", "Request title")}</span><input value={specialTitle} onChange={(event) => setSpecialTitle(event.target.value)} disabled={isLoading} /></label>
            <label style={{ display: "grid", gap: 6 }}><span>{tr("요구사항 상세", "Requirements")}</span><textarea rows={5} value={specialDescription} onChange={(event) => setSpecialDescription(event.target.value)} disabled={isLoading} /></label>
            <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}><input type="checkbox" checked={specialConsent} onChange={(event) => setSpecialConsent(event.target.checked)} disabled={isLoading} /><span>{tr("의뢰 구현 코드는 MIT 정책에 따라 공개 저장소에 게시될 수 있음에 동의합니다.", "I understand implementation code may be published in a public repository under MIT.")}</span></label>
            <button type="submit" disabled={isLoading || !specialConsent} style={{ width: 180 }}>{isLoading ? tr("처리 중...", "Processing...") : tr("의뢰 등록", "Submit request")}</button>
          </form>
          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {specialRequests.length === 0 ? <p>{tr("등록된 의뢰가 없습니다.", "No request found.")}</p> : specialRequests.map((request) => <article key={request.id} style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><strong>{request.title}</strong><span>{specialRequestStatusLabel(locale, request.status)}</span></div><p>{request.description}</p><div style={{ fontSize: 13, opacity: 0.75 }}>{fmt(locale, request.createdAt)}</div>{request.adminNote ? <div style={{ marginTop: 8, fontSize: 13 }}><strong>Admin:</strong> {request.adminNote}</div> : null}</article>)}
          </div>
        </div>

        <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>{tr("특수 템플릿 스토어", "Special template store")}</h2>
          <div style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>{tr("스토어 등록", "Create listing")}</h3>
            {ownedSpecialTemplates.length === 0 ? <p>{tr("등록 가능한 특수 템플릿이 없습니다.", "No special template available for listing.")}</p> : <form onSubmit={onCreateStoreListing} style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", alignItems: "end" }}><label style={{ display: "grid", gap: 6 }}><span>{tr("등록할 템플릿", "Template")}</span><select value={storeTemplateId} onChange={(event) => setStoreTemplateId(event.target.value)} disabled={isLoading}>{ownedSpecialTemplates.map((template) => <option key={template.id} value={template.id}>{template.title} (v{template.version})</option>)}</select></label><label style={{ display: "grid", gap: 6 }}><span>{tr("가격(credits)", "Price (credits)")}</span><input type="number" min={1} value={storePrice} onChange={(event) => setStorePrice(Number(event.target.value) || 1)} disabled={isLoading} /></label><label style={{ display: "flex", gap: 8, alignItems: "center", minHeight: 42 }}><input type="checkbox" checked={storeActive} onChange={(event) => setStoreActive(event.target.checked)} disabled={isLoading} /><span>{tr("활성", "Active")}</span></label><button type="submit" disabled={isLoading}>{isLoading ? tr("처리 중...", "Processing...") : tr("스토어 등록", "Create listing")}</button></form>}
          </div>
          <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            <div><h3>{tr("내 등록 목록", "My listings")}</h3>{myListings.length === 0 ? <p>{tr("등록된 판매글이 없습니다.", "No listing found.")}</p> : <div style={{ display: "grid", gap: 10 }}>{myListings.map((listing) => { const draft = listingDrafts[listing.id] ?? { priceCredits: listing.priceCredits, isActive: listing.isActive }; return <article key={listing.id} style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}><strong>{listing.template.title}</strong><div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginTop: 10 }}><label style={{ display: "grid", gap: 6 }}><span>{tr("가격", "Price")}</span><input type="number" min={1} value={draft.priceCredits} onChange={(event) => updateListingDraft(listing.id, { priceCredits: Number(event.target.value) || 1 })} disabled={isLoading} /></label><label style={{ display: "flex", gap: 8, alignItems: "center", minHeight: 42 }}><input type="checkbox" checked={draft.isActive} onChange={(event) => updateListingDraft(listing.id, { isActive: event.target.checked })} disabled={isLoading} /><span>{tr("활성", "Active")}</span></label><button type="button" onClick={() => void onUpdateStoreListing(listing.id)} disabled={isLoading}>{tr("수정", "Update")}</button></div></article>; })}</div>}</div>
            <div><h3>{tr("구매 가능한 목록", "Market listings")}</h3>{marketListings.length === 0 ? <p>{tr("구매 가능한 판매글이 없습니다.", "No market listing found.")}</p> : <div style={{ display: "grid", gap: 10 }}>{marketListings.map((listing) => <article key={listing.id} style={{ border: "1px solid #e5ebef", borderRadius: 10, padding: 12 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><strong>{listing.template.title}</strong><div style={{ fontSize: 13, opacity: 0.75 }}>{tr("판매자", "Seller")}: {who(listing.seller)}</div></div><div style={{ fontWeight: 700 }}>{listing.priceCredits}</div></div><div style={{ marginTop: 10 }}><button type="button" disabled={isLoading || listing.canPurchase === false || listing.alreadyPurchased} onClick={() => void onPurchaseListing(listing.id)}>{listing.alreadyPurchased ? tr("구매 완료", "Purchased") : tr("구매", "Buy")}</button></div></article>)}</div>}</div>
            <div><h3>{tr("내 구매 이력", "My purchases")}</h3>{purchaseHistory.length === 0 ? <p>{tr("구매 이력이 없습니다.", "No purchase history.")}</p> : <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">{tr("구매 시각", "Purchased at")}</th><th align="left">{tr("템플릿", "Template")}</th><th align="left">{tr("판매자", "Seller")}</th><th align="right">{tr("가격", "Price")}</th><th align="right">{tr("수수료", "Fee")}</th></tr></thead><tbody>{purchaseHistory.map((item) => <tr key={item.id}><td>{fmt(locale, item.createdAt)}</td><td>{item.listing.template.title}</td><td>{who(item.seller)}</td><td align="right">{item.priceCredits}</td><td align="right">{item.platformFeeCredits}</td></tr>)}</tbody></table>}</div>
            <div><h3>{tr("내 판매 이력", "My sales")}</h3>{salesHistory.length === 0 ? <p>{tr("판매 이력이 없습니다.", "No sales history.")}</p> : <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">{tr("판매 시각", "Sold at")}</th><th align="left">{tr("템플릿", "Template")}</th><th align="left">{tr("구매자", "Buyer")}</th><th align="right">{tr("가격", "Price")}</th><th align="right">{tr("판매자 정산", "Seller credit")}</th></tr></thead><tbody>{salesHistory.map((item) => <tr key={item.id}><td>{fmt(locale, item.createdAt)}</td><td>{item.listing.template.title}</td><td>{who(item.buyer)}</td><td align="right">{item.priceCredits}</td><td align="right">{item.sellerCredit}</td></tr>)}</tbody></table>}</div>
          </div>
        </div>
        <AdminSkillBookStorePanel locale={locale} />
      </section>

      <section hidden={activeView !== "participants"} style={{ display: "grid", gap: 16 }}>
        <div style={{ border: "1px solid #d7e0e6", borderRadius: 12, padding: 16, background: "#fff" }}>
          <h2 style={{ marginTop: 0 }}>{tr("피검자 계정", "Participant accounts")}</h2>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginBottom: 16 }}>
            <label style={{ display: "grid", gap: 6 }}><span>{tr("검색", "Search")}</span><input value={participantQuery} onChange={(event) => setParticipantQuery(event.target.value)} placeholder={tr("ID 또는 표시 이름 검색", "Search by ID or display name")} /></label>
            <label style={{ display: "grid", gap: 6 }}><span>{tr("상태 필터", "Status filter")}</span><select value={participantFilter} onChange={(event) => setParticipantFilter(event.target.value as ParticipantFilter)}><option value="ALL">{tr("전체", "All")}</option><option value="ACTIVE">{tr("활성", "Active")}</option><option value="INACTIVE">{tr("비활성", "Inactive")}</option><option value="ANONYMIZED">{tr("익명화", "Anonymized")}</option></select></label>
          </div>
          {filteredParticipants.length === 0 ? <p>{tr("관리 가능한 피검자 계정이 없습니다.", "No manageable participant account.")}</p> : <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th align="left">{tr("로그인 ID", "Login ID")}</th><th align="left">{tr("표시 이름", "Display name")}</th><th align="left">{tr("언어", "Locale")}</th><th align="left">{tr("상태", "Status")}</th><th align="right">{tr("등록 패키지", "Enrollments")}</th><th align="right">{tr("응답 수", "Responses")}</th><th align="left">{tr("최근 응답", "Last response")}</th><th align="left">{tr("가입일", "Joined at")}</th><th align="left">{tr("작업", "Action")}</th></tr></thead><tbody>{filteredParticipants.map((participant) => <tr key={participant.id}><td>{participant.loginId ?? "-"}</td><td>{participant.displayName ?? "-"}</td><td>{participant.locale}</td><td>{participantStatusLabel(locale, participant)}</td><td align="right">{participant.enrollmentCount}</td><td align="right">{participant.responseCount}</td><td>{fmt(locale, participant.lastRespondedAt)}</td><td>{fmt(locale, participant.createdAt)}</td><td><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{!participant.isAnonymized ? <button type="button" disabled={isLoading} onClick={() => void onParticipantAction(participant.id, participant.isActive ? "DEACTIVATE" : "ACTIVATE")}>{participant.isActive ? tr("비활성", "Deactivate") : tr("복원", "Restore")}</button> : null}{!participant.isAnonymized ? <button type="button" disabled={isLoading} onClick={() => void onParticipantAction(participant.id, "ANONYMIZE")}>{tr("익명화", "Anonymize")}</button> : null}</div></td></tr>)}</tbody></table>}
        </div>
      </section>
    </main>
  );
}
