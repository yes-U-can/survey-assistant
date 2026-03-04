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

type SpecialRequestStatus =
  | "REQUESTED"
  | "REVIEWING"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELED";

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
};

type StoreOwnedTemplateItem = {
  id: string;
  title: string;
  description: string | null;
  version: number;
  updatedAt: string;
};

type StoreListingTemplateItem = {
  id: string;
  title: string;
  description: string | null;
  version: number;
  isArchived: boolean;
};

type StoreListingItem = {
  id: string;
  templateId: string;
  sellerId: string;
  priceCredits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  template: StoreListingTemplateItem;
  seller?: {
    id: string;
    loginId: string | null;
    displayName: string | null;
    role: string;
  };
  alreadyPurchased?: boolean;
  canPurchase?: boolean;
};

type StorePurchaseHistoryItem = {
  id: string;
  listingId: string;
  templateId: string;
  buyerId: string;
  sellerId: string;
  priceCredits: number;
  sellerCredit: number;
  platformFeeCredits: number;
  createdAt: string;
  listing: {
    id: string;
    priceCredits: number;
    template: {
      id: string;
      title: string;
      version: number;
    };
  };
  seller?: {
    id: string;
    loginId: string | null;
    displayName: string | null;
    role: string;
  };
  buyer?: {
    id: string;
    loginId: string | null;
    displayName: string | null;
    role: string;
  };
};

type ParticipantAccountItem = {
  id: string;
  loginId: string | null;
  displayName: string | null;
  locale: "ko" | "en";
  isActive: boolean;
  isAnonymized: boolean;
  enrollmentCount: number;
  responseCount: number;
  lastRespondedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  locale: LocaleCode;
  viewerRole: "RESEARCH_ADMIN" | "PLATFORM_ADMIN";
  initialTemplates: TemplateItem[];
  initialPackages: PackageItem[];
  initialSpecialRequests: SpecialRequestItem[];
  initialOwnedSpecialTemplates: StoreOwnedTemplateItem[];
  initialMyListings: StoreListingItem[];
  initialMarketListings: StoreListingItem[];
  initialPurchases: StorePurchaseHistoryItem[];
  initialSales: StorePurchaseHistoryItem[];
  initialParticipants: ParticipantAccountItem[];
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
    csvFilters: "CSV 필터",
    csvFrom: "응답 시작일시",
    csvTo: "응답 종료일시",
    csvAttempt: "응답 회차",
    csvAttemptHint: "비워두면 전체 회차",
    csvInvalidRange: "CSV 필터 기간을 확인하세요. 종료일시는 시작일시 이후여야 합니다.",
    exportCsv: "CSV",
    specialRequestSection: "특수 템플릿 의뢰",
    specialRequestTitle: "의뢰 제목",
    specialRequestDescription: "요구사항 상세",
    specialRequestConsent:
      "필수 동의: 의뢰 산출물(특수 템플릿 구현 코드)은 MIT 정책에 따라 공개 저장소(GitHub)에 게시될 수 있음을 이해합니다.",
    specialRequestConsentSub:
      "소스 공개 여부와 크레딧 보상 지급은 별개 정책으로 처리됩니다.",
    specialRequestSubmit: "의뢰 등록",
    specialRequestStatus: "진행상태",
    specialRequestAdminNote: "어드민 메모",
    specialRequestNoData: "등록된 의뢰가 없습니다.",
    specialRequestNeedConsent: "의뢰 등록을 위해 공개 동의 체크가 필요합니다.",
    specialRequestCreated: "특수 템플릿 의뢰가 등록되었습니다.",
    storeSection: "특수 템플릿 스토어",
    storeCreateListing: "내 특수 템플릿 등록",
    storeTemplateSelect: "템플릿 선택",
    storePrice: "판매 가격(크레딧)",
    storeActive: "판매 활성화",
    storeListButton: "스토어 등록",
    storeMyListings: "내 등록 목록",
    storeMarketListings: "구매 가능 목록",
    storePurchases: "내 구매 내역",
    storeSales: "내 판매 내역",
    storeNoOwnedTemplates: "등록 가능한 특수 템플릿이 없습니다.",
    storeNoMyListings: "내 등록 목록이 없습니다.",
    storeNoMarketListings: "구매 가능한 목록이 없습니다.",
    storeNoPurchases: "구매 내역이 없습니다.",
    storeNoSales: "판매 내역이 없습니다.",
    storeListingCreated: "스토어 등록이 완료되었습니다.",
    storeListingUpdated: "등록 정보가 변경되었습니다.",
    storePurchased: "템플릿 구매가 완료되었습니다.",
    storeAlreadyPurchased: "이미 구매함",
    storeBuy: "구매",
    storeUpdate: "수정",
    storeSeller: "판매자",
    storeTemplate: "템플릿",
    storeCreatedAt: "등록일시",
    storeBoughtAt: "구매일시",
    storePriceLabel: "가격",
    storeFeeLabel: "수수료",
    storeSellerCreditLabel: "판매자 정산",
    participantSection: "피검자 계정 관리",
    participantNoData: "관리 가능한 피검자 계정이 없습니다.",
    participantLoginId: "로그인 ID",
    participantDisplayName: "표시 이름",
    participantLocale: "언어",
    participantStatus: "상태",
    participantEnrollments: "등록 패키지",
    participantResponses: "응답 수",
    participantLastRespondedAt: "최근 응답",
    participantCreatedAt: "가입일시",
    participantAction: "액션",
    participantActive: "활성",
    participantInactive: "비활성",
    participantDeactivate: "비활성화",
    participantRestore: "복원",
    participantUpdated: "피검자 계정 상태가 업데이트되었습니다.",
    dashboardSection: "운영 요약",
    dashboardTemplates: "템플릿",
    dashboardPackages: "패키지",
    dashboardSpecialOpen: "의뢰 처리중",
    dashboardStoreActive: "활성 스토어 등록",
    dashboardParticipantsActive: "활성 피검자",
    dashboardParticipantsAnonymized: "익명화 피검자",
    participantSearchLabel: "피검자 검색",
    participantSearchPlaceholder: "ID/표시이름 검색",
    participantFilterLabel: "상태 필터",
    filterAll: "전체",
    filterActive: "활성",
    filterInactive: "비활성",
    filterAnonymized: "익명화",
    specialRequestFilterLabel: "의뢰 상태 필터",
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
    csvFilters: "CSV Filters",
    csvFrom: "Submitted from",
    csvTo: "Submitted to",
    csvAttempt: "Attempt no",
    csvAttemptHint: "Leave blank for all attempts",
    csvInvalidRange: "Check CSV filter range. End datetime must be after start datetime.",
    exportCsv: "Export CSV",
    specialRequestSection: "Special Template Requests",
    specialRequestTitle: "Request title",
    specialRequestDescription: "Requirement details",
    specialRequestConsent:
      "Required consent: deliverable implementation code for this special template may be published to a public GitHub repository under MIT.",
    specialRequestConsentSub:
      "Source publication and credit compensation are handled as separate policies.",
    specialRequestSubmit: "Submit request",
    specialRequestStatus: "Status",
    specialRequestAdminNote: "Admin note",
    specialRequestNoData: "No request yet.",
    specialRequestNeedConsent: "Consent is required before submitting request.",
    specialRequestCreated: "Special template request submitted.",
    storeSection: "Special Template Store",
    storeCreateListing: "List my special template",
    storeTemplateSelect: "Template",
    storePrice: "Price (credits)",
    storeActive: "Listing active",
    storeListButton: "Create listing",
    storeMyListings: "My listings",
    storeMarketListings: "Market listings",
    storePurchases: "My purchases",
    storeSales: "My sales",
    storeNoOwnedTemplates: "No special template available for listing.",
    storeNoMyListings: "No listing yet.",
    storeNoMarketListings: "No listing to buy.",
    storeNoPurchases: "No purchase history.",
    storeNoSales: "No sales history.",
    storeListingCreated: "Listing created.",
    storeListingUpdated: "Listing updated.",
    storePurchased: "Template purchased.",
    storeAlreadyPurchased: "Purchased",
    storeBuy: "Buy",
    storeUpdate: "Update",
    storeSeller: "Seller",
    storeTemplate: "Template",
    storeCreatedAt: "Listed at",
    storeBoughtAt: "Purchased at",
    storePriceLabel: "Price",
    storeFeeLabel: "Platform fee",
    storeSellerCreditLabel: "Seller credit",
    participantSection: "Participant Accounts",
    participantNoData: "No manageable participant account.",
    participantLoginId: "Login ID",
    participantDisplayName: "Display name",
    participantLocale: "Locale",
    participantStatus: "Status",
    participantEnrollments: "Enrollments",
    participantResponses: "Responses",
    participantLastRespondedAt: "Last response",
    participantCreatedAt: "Joined at",
    participantAction: "Action",
    participantActive: "Active",
    participantInactive: "Inactive",
    participantDeactivate: "Deactivate",
    participantRestore: "Restore",
    participantUpdated: "Participant account status updated.",
    dashboardSection: "Operations Snapshot",
    dashboardTemplates: "Templates",
    dashboardPackages: "Packages",
    dashboardSpecialOpen: "Open requests",
    dashboardStoreActive: "Active store listings",
    dashboardParticipantsActive: "Active participants",
    dashboardParticipantsAnonymized: "Anonymized participants",
    participantSearchLabel: "Participant search",
    participantSearchPlaceholder: "Search by ID/display name",
    participantFilterLabel: "Status filter",
    filterAll: "All",
    filterActive: "Active",
    filterInactive: "Inactive",
    filterAnonymized: "Anonymized",
    specialRequestFilterLabel: "Request status filter",
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

function specialRequestStatusLabel(
  locale: LocaleCode,
  status: SpecialRequestStatus,
) {
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

function displayUserName(
  user:
    | {
        loginId: string | null;
        displayName: string | null;
      }
    | undefined,
) {
  if (!user) {
    return "-";
  }
  return user.displayName?.trim() || user.loginId?.trim() || "-";
}

function formatMaybeDate(locale: LocaleCode, value: string | null) {
  if (!value) {
    return "-";
  }
  const formatter = new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return formatter.format(new Date(value));
}

function participantStatusLabel(
  locale: LocaleCode,
  participant: Pick<ParticipantAccountItem, "isActive" | "isAnonymized">,
) {
  if (participant.isAnonymized) {
    return locale === "ko" ? "익명화됨" : "Anonymized";
  }
  return participant.isActive
    ? locale === "ko"
      ? "활성"
      : "Active"
    : locale === "ko"
      ? "비활성"
      : "Inactive";
}

export function AdminDashboardClient({
  locale,
  viewerRole,
  initialTemplates,
  initialPackages,
  initialSpecialRequests,
  initialOwnedSpecialTemplates,
  initialMyListings,
  initialMarketListings,
  initialPurchases,
  initialSales,
  initialParticipants,
}: Props) {
  const t = useMemo(() => msg[locale], [locale]);
  const canAuthorSpecialTemplate = viewerRole === "PLATFORM_ADMIN";

  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [specialRequests, setSpecialRequests] = useState<SpecialRequestItem[]>(initialSpecialRequests);
  const [ownedSpecialTemplates, setOwnedSpecialTemplates] = useState<StoreOwnedTemplateItem[]>(
    initialOwnedSpecialTemplates,
  );
  const [myListings, setMyListings] = useState<StoreListingItem[]>(initialMyListings);
  const [marketListings, setMarketListings] = useState<StoreListingItem[]>(initialMarketListings);
  const [purchaseHistory, setPurchaseHistory] = useState<StorePurchaseHistoryItem[]>(initialPurchases);
  const [salesHistory, setSalesHistory] = useState<StorePurchaseHistoryItem[]>(initialSales);
  const [participants, setParticipants] = useState<ParticipantAccountItem[]>(initialParticipants);
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
  const [aiMode, setAiMode] = useState<"BYOK" | "MANAGED">("MANAGED");
  const [aiPackageId, setAiPackageId] = useState(initialPackages[0]?.id ?? "");
  const [aiQuestion, setAiQuestion] = useState(
    locale === "ko"
      ? "이 패키지 응답 데이터의 핵심 경향과 해석 시 주의점을 요약해줘."
      : "Summarize key trends in this package and interpretation caveats.",
  );
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiMeta, setAiMeta] = useState("");
  const [aiIsRunning, setAiIsRunning] = useState(false);
  const [specialRequestTitle, setSpecialRequestTitle] = useState("");
  const [specialRequestDescription, setSpecialRequestDescription] = useState("");
  const [specialRequestConsent, setSpecialRequestConsent] = useState(false);
  const [storeTemplateId, setStoreTemplateId] = useState(initialOwnedSpecialTemplates[0]?.id ?? "");
  const [storePriceCredits, setStorePriceCredits] = useState(100);
  const [storeIsActive, setStoreIsActive] = useState(true);
  const [listingDrafts, setListingDrafts] = useState<
    Record<string, { priceCredits: number; isActive: boolean }>
  >(() =>
    Object.fromEntries(
      initialMyListings.map((listing) => [
        listing.id,
        { priceCredits: listing.priceCredits, isActive: listing.isActive },
      ]),
    ),
  );
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exportAttempt, setExportAttempt] = useState("");
  const [participantQuery, setParticipantQuery] = useState("");
  const [participantFilter, setParticipantFilter] = useState<
    "ALL" | "ACTIVE" | "INACTIVE" | "ANONYMIZED"
  >("ALL");
  const [specialRequestFilter, setSpecialRequestFilter] = useState<"ALL" | SpecialRequestStatus>(
    "ALL",
  );

  const adminSnapshot = useMemo(() => {
    const openRequestCount = specialRequests.filter((item) =>
      ["REQUESTED", "REVIEWING", "IN_PROGRESS"].includes(item.status),
    ).length;
    const activeListingCount = myListings.filter((item) => item.isActive).length;
    const activeParticipantCount = participants.filter(
      (item) => !item.isAnonymized && item.isActive,
    ).length;
    const anonymizedParticipantCount = participants.filter((item) => item.isAnonymized).length;

    return {
      templateCount: templates.length,
      packageCount: packages.length,
      openRequestCount,
      activeListingCount,
      activeParticipantCount,
      anonymizedParticipantCount,
    };
  }, [myListings, packages.length, participants, specialRequests, templates.length]);

  const filteredSpecialRequests = useMemo(() => {
    if (specialRequestFilter === "ALL") {
      return specialRequests;
    }
    return specialRequests.filter((item) => item.status === specialRequestFilter);
  }, [specialRequestFilter, specialRequests]);

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = participantQuery.trim().toLowerCase();
    return participants.filter((item) => {
      const statusMatched =
        participantFilter === "ALL"
          ? true
          : participantFilter === "ANONYMIZED"
            ? item.isAnonymized
            : participantFilter === "ACTIVE"
              ? !item.isAnonymized && item.isActive
              : !item.isAnonymized && !item.isActive;

      if (!statusMatched) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const loginId = item.loginId?.toLowerCase() ?? "";
      const displayName = item.displayName?.toLowerCase() ?? "";
      return loginId.includes(normalizedQuery) || displayName.includes(normalizedQuery);
    });
  }, [participantFilter, participantQuery, participants]);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    const [tplRes, pkgRes, specialRes, listingsRes, purchasesRes, participantsRes] = await Promise.all([
      fetch("/api/admin/templates", { cache: "no-store" }),
      fetch("/api/admin/packages", { cache: "no-store" }),
      fetch("/api/admin/special-requests", { cache: "no-store" }),
      fetch("/api/admin/store/listings?limit=100", { cache: "no-store" }),
      fetch("/api/admin/store/purchases?limit=50", { cache: "no-store" }),
      fetch("/api/admin/participants?limit=200", { cache: "no-store" }),
    ]);

    const tplJson = (await tplRes.json().catch(() => null)) as
      | { ok?: boolean; templates?: TemplateItem[] }
      | null;
    const pkgJson = (await pkgRes.json().catch(() => null)) as
      | { ok?: boolean; packages?: PackageItem[] }
      | null;
    const specialJson = (await specialRes.json().catch(() => null)) as
      | { ok?: boolean; requests?: SpecialRequestItem[] }
      | null;
    const listingsJson = (await listingsRes.json().catch(() => null)) as
      | {
          ok?: boolean;
          ownedSpecialTemplates?: StoreOwnedTemplateItem[];
          myListings?: StoreListingItem[];
          marketListings?: StoreListingItem[];
        }
      | null;
    const purchasesJson = (await purchasesRes.json().catch(() => null)) as
      | { ok?: boolean; purchases?: StorePurchaseHistoryItem[]; sales?: StorePurchaseHistoryItem[] }
      | null;
    const participantsJson = (await participantsRes.json().catch(() => null)) as
      | { ok?: boolean; participants?: ParticipantAccountItem[] }
      | null;

    if (
      !tplRes.ok ||
      !pkgRes.ok ||
      !specialRes.ok ||
      !listingsRes.ok ||
      !purchasesRes.ok ||
      !participantsRes.ok ||
      !tplJson?.ok ||
      !pkgJson?.ok ||
      !specialJson?.ok ||
      !listingsJson?.ok ||
      !purchasesJson?.ok ||
      !participantsJson?.ok
    ) {
      setMessage(t.failDefault);
      setIsLoading(false);
      return;
    }

    const nextTemplates = tplJson.templates ?? [];
    const nextPackages = pkgJson.packages ?? [];
    const nextRequests = specialJson.requests ?? [];
    const nextOwnedSpecialTemplates = listingsJson.ownedSpecialTemplates ?? [];
    const nextMyListings = listingsJson.myListings ?? [];
    const nextMarketListings = listingsJson.marketListings ?? [];
    const nextPurchases = purchasesJson.purchases ?? [];
    const nextSales = purchasesJson.sales ?? [];
    const nextParticipants = participantsJson.participants ?? [];

    setTemplates(nextTemplates);
    setPackages(nextPackages);
    setSpecialRequests(nextRequests);
    setOwnedSpecialTemplates(nextOwnedSpecialTemplates);
    setMyListings(nextMyListings);
    setMarketListings(nextMarketListings);
    setPurchaseHistory(nextPurchases);
    setSalesHistory(nextSales);
    setParticipants(nextParticipants);
    setListingDrafts(
      Object.fromEntries(
        nextMyListings.map((listing) => [
          listing.id,
          { priceCredits: listing.priceCredits, isActive: listing.isActive },
        ]),
      ),
    );
    setStoreTemplateId((prev) =>
      prev && nextOwnedSpecialTemplates.some((tpl) => tpl.id === prev)
        ? prev
        : (nextOwnedSpecialTemplates[0]?.id ?? ""),
    );
    setAiPackageId((prev) =>
      prev && nextPackages.some((pkg) => pkg.id === prev) ? prev : (nextPackages[0]?.id ?? ""),
    );
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

    if (templateType === "SPECIAL" && !canAuthorSpecialTemplate) {
      setMessage(locale === "ko" ? "특수 템플릿은 의뢰를 통해서만 제작됩니다." : "Special templates are request-only.");
      return;
    }

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

  const toIsoOrNull = (value: string) => {
    if (!value.trim()) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  };

  const isExportRangeInvalid = useMemo(() => {
    const from = toIsoOrNull(exportFrom);
    const to = toIsoOrNull(exportTo);
    if (!from || !to) {
      return false;
    }
    return new Date(to).getTime() < new Date(from).getTime();
  }, [exportFrom, exportTo]);

  const buildExportHref = (packageId: string) => {
    const params = new URLSearchParams();

    const from = toIsoOrNull(exportFrom);
    const to = toIsoOrNull(exportTo);
    if (from) {
      params.set("from", from);
    }
    if (to) {
      params.set("to", to);
    }

    const parsedAttempt = Number.parseInt(exportAttempt, 10);
    if (exportAttempt.trim() && Number.isInteger(parsedAttempt) && parsedAttempt > 0) {
      params.set("attempt", String(parsedAttempt));
    }

    const query = params.toString();
    if (!query) {
      return `/api/admin/packages/${packageId}/export`;
    }
    return `/api/admin/packages/${packageId}/export?${query}`;
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

  const onCreateSpecialRequest = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!specialRequestTitle.trim() || !specialRequestDescription.trim()) {
      setMessage(t.failDefault);
      return;
    }
    if (!specialRequestConsent) {
      setMessage(t.specialRequestNeedConsent);
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/admin/special-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: specialRequestTitle.trim(),
        description: specialRequestDescription.trim(),
        consentPublicSource: true,
      }),
    });

    if (!response.ok) {
      setMessage(t.failDefault);
      setIsLoading(false);
      return;
    }

    setSpecialRequestTitle("");
    setSpecialRequestDescription("");
    setSpecialRequestConsent(false);
    setMessage(t.specialRequestCreated);
    await refreshAll();
    setIsLoading(false);
  };

  const updateListingDraft = (listingId: string, patch: Partial<{ priceCredits: number; isActive: boolean }>) => {
    setListingDrafts((prev) => ({
      ...prev,
      [listingId]: {
        priceCredits: patch.priceCredits ?? prev[listingId]?.priceCredits ?? 1,
        isActive: patch.isActive ?? prev[listingId]?.isActive ?? true,
      },
    }));
  };

  const onCreateStoreListing = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");

    if (!storeTemplateId || !Number.isFinite(storePriceCredits) || Math.trunc(storePriceCredits) < 1) {
      setMessage(t.failDefault);
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/admin/store/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateId: storeTemplateId,
        priceCredits: Math.trunc(storePriceCredits),
        isActive: storeIsActive,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? t.failDefault);
      setIsLoading(false);
      return;
    }

    setMessage(t.storeListingCreated);
    await refreshAll();
    setIsLoading(false);
  };

  const onUpdateStoreListing = async (listingId: string) => {
    const draft = listingDrafts[listingId];
    if (!draft) {
      return;
    }
    if (!Number.isFinite(draft.priceCredits) || Math.trunc(draft.priceCredits) < 1) {
      setMessage(t.failDefault);
      return;
    }

    setIsLoading(true);
    const response = await fetch(`/api/admin/store/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        priceCredits: Math.trunc(draft.priceCredits),
        isActive: draft.isActive,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? t.failDefault);
      setIsLoading(false);
      return;
    }

    setMessage(t.storeListingUpdated);
    await refreshAll();
    setIsLoading(false);
  };

  const onPurchaseListing = async (listingId: string) => {
    setIsLoading(true);
    setMessage("");

    const response = await fetch("/api/admin/store/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? t.failDefault);
      setIsLoading(false);
      return;
    }

    setMessage(t.storePurchased);
    await refreshAll();
    setIsLoading(false);
  };

  const onParticipantAction = async (
    participantId: string,
    action: "ACTIVATE" | "DEACTIVATE" | "ANONYMIZE",
  ) => {
    if (action === "ANONYMIZE") {
      const ok = window.confirm(
        locale === "ko"
          ? "이 계정을 익명화하면 로그인 식별 정보(ID/비밀번호/표시이름)가 제거됩니다. 계속할까요?"
          : "This will anonymize login identifiers (ID/password/display name). Continue?",
      );
      if (!ok) {
        return;
      }
    }

    setIsLoading(true);
    setMessage("");

    const response = await fetch(`/api/admin/participants/${participantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? t.failDefault);
      setIsLoading(false);
      return;
    }

    await refreshAll();
    setMessage(t.participantUpdated);
    setIsLoading(false);
  };

  const onRunAiAnalysis = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setAiMeta("");

    if (!aiPackageId || !aiQuestion.trim()) {
      setMessage(
        locale === "ko"
          ? "AI 분석을 위해 패키지와 질문을 입력하세요."
          : "Select a package and enter a question.",
      );
      return;
    }

    if (aiMode === "BYOK" && !aiApiKey.trim()) {
      setMessage(locale === "ko" ? "BYOK 모드에서는 API 키가 필요합니다." : "BYOK mode requires API key.");
      return;
    }

    setAiIsRunning(true);
    setAiResult("");

    const response = await fetch("/api/admin/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId: aiPackageId,
        question: aiQuestion.trim(),
        mode: aiMode,
        provider: "openai",
        apiKey: aiMode === "BYOK" ? aiApiKey.trim() : undefined,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
          answer?: string;
          model?: string;
          usage?: { totalTokens?: number | null };
          credits?: { charged?: number; balanceAfter?: number; policyMode?: string } | null;
        }
      | null;

    if (!response.ok || !payload?.ok || !payload.answer) {
      setMessage(payload?.error ?? t.failDefault);
      setAiIsRunning(false);
      return;
    }

    setAiResult(payload.answer);
    const usageText =
      typeof payload.usage?.totalTokens === "number"
        ? `tokens=${payload.usage.totalTokens}`
        : "tokens=unknown";
    const creditText =
      payload.credits && typeof payload.credits.charged === "number"
        ? `credits_charged=${payload.credits.charged}, balance=${payload.credits.balanceAfter ?? "unknown"}, policy=${payload.credits.policyMode ?? "unknown"}`
        : "credits_charged=0";
    setAiMeta(`model=${payload.model ?? "unknown"}, ${usageText}, ${creditText}`);
    setAiIsRunning(false);
  };

  const roleLabel =
    locale === "ko"
      ? viewerRole === "PLATFORM_ADMIN"
        ? "현재 권한: 플랫폼 어드민 (관리자 기능 포함)"
        : "현재 권한: 연구 관리자"
      : viewerRole === "PLATFORM_ADMIN"
        ? "Current role: Platform admin (includes research admin capabilities)"
        : "Current role: Research admin";

  const adminFlowSteps =
    locale === "ko"
      ? ["템플릿을 만들고 문항/스키마를 확정합니다.", "템플릿 묶음으로 설문 패키지를 생성하고 참여코드를 발급합니다.", "피검자가 코드로 참여한 응답을 CSV로 내려받아 분석합니다."]
      : [
          "Create templates and finalize question/schema.",
          "Build a survey package from templates and issue participation code.",
          "Download participant responses as CSV for analysis.",
        ];

  return (
    <main className="sa-page sa-admin-grid" style={{ display: "grid", gap: 20 }}>
      <section>
        <h1>{t.title}</h1>
        <p>{t.subtitle}</p>
        <p className="sa-role-pill">{roleLabel}</p>
        <button
          type="button"
          onClick={() => void refreshAll()}
          disabled={isLoading}
          style={{ padding: "8px 12px" }}
        >
          {isLoading ? t.loading : t.refresh}
        </button>
        {message ? <p className="sa-inline-message">{message}</p> : null}
      </section>

      <section className="sa-role-flow">
        <h2>{locale === "ko" ? "연구 운영 표준 흐름" : "Research operation flow"}</h2>
        <ol className="sa-role-flow-list">
          {adminFlowSteps.map((step, idx) => (
            <li key={step}>
              <span>{idx + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>{t.dashboardSection}</h2>
        <div className="sa-metric-grid">
          <article className="sa-metric-card">
            <strong>{adminSnapshot.templateCount}</strong>
            <small>{t.dashboardTemplates}</small>
          </article>
          <article className="sa-metric-card">
            <strong>{adminSnapshot.packageCount}</strong>
            <small>{t.dashboardPackages}</small>
          </article>
          <article className="sa-metric-card">
            <strong>{adminSnapshot.openRequestCount}</strong>
            <small>{t.dashboardSpecialOpen}</small>
          </article>
          <article className="sa-metric-card">
            <strong>{adminSnapshot.activeListingCount}</strong>
            <small>{t.dashboardStoreActive}</small>
          </article>
          <article className="sa-metric-card">
            <strong>{adminSnapshot.activeParticipantCount}</strong>
            <small>{t.dashboardParticipantsActive}</small>
          </article>
          <article className="sa-metric-card">
            <strong>{adminSnapshot.anonymizedParticipantCount}</strong>
            <small>{t.dashboardParticipantsAnonymized}</small>
          </article>
        </div>
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
              {canAuthorSpecialTemplate ? <option value="SPECIAL">{t.typeSpecial}</option> : null}
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
        <h2>{t.specialRequestSection}</h2>
        <form onSubmit={onCreateSpecialRequest} style={{ display: "grid", gap: 10, marginTop: 8 }}>
          <label>
            {t.specialRequestTitle}
            <input
              value={specialRequestTitle}
              onChange={(event) => setSpecialRequestTitle(event.target.value)}
              style={{ marginLeft: 8, minWidth: 320 }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            {t.specialRequestDescription}
            <textarea
              value={specialRequestDescription}
              onChange={(event) => setSpecialRequestDescription(event.target.value)}
              rows={5}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={specialRequestConsent}
              onChange={(event) => setSpecialRequestConsent(event.target.checked)}
            />
            <span style={{ marginLeft: 6 }}>{t.specialRequestConsent}</span>
          </label>
          <small>{t.specialRequestConsentSub}</small>
          <button type="submit" disabled={isLoading} style={{ width: 140 }}>
            {isLoading ? t.loading : t.specialRequestSubmit}
          </button>
        </form>

        <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <label>
              {t.specialRequestFilterLabel}
              <select
                value={specialRequestFilter}
                onChange={(event) =>
                  setSpecialRequestFilter(event.target.value as "ALL" | SpecialRequestStatus)
                }
                style={{ marginLeft: 8 }}
              >
                <option value="ALL">{t.filterAll}</option>
                <option value="REQUESTED">{specialRequestStatusLabel(locale, "REQUESTED")}</option>
                <option value="REVIEWING">{specialRequestStatusLabel(locale, "REVIEWING")}</option>
                <option value="IN_PROGRESS">
                  {specialRequestStatusLabel(locale, "IN_PROGRESS")}
                </option>
                <option value="DELIVERED">{specialRequestStatusLabel(locale, "DELIVERED")}</option>
                <option value="REJECTED">{specialRequestStatusLabel(locale, "REJECTED")}</option>
                <option value="CANCELED">{specialRequestStatusLabel(locale, "CANCELED")}</option>
              </select>
            </label>
          </div>
          {filteredSpecialRequests.length === 0 ? (
            <p>{t.specialRequestNoData}</p>
          ) : (
            filteredSpecialRequests.map((item) => (
              <article key={item.id} style={{ border: "1px solid #eee", padding: 10 }}>
                <strong>{item.title}</strong> | {t.specialRequestStatus}:{" "}
                {specialRequestStatusLabel(locale, item.status)}
                <br />
                <small>{new Date(item.createdAt).toLocaleString()}</small>
                <p style={{ margin: "8px 0" }}>{item.description}</p>
                <small>
                  {t.specialRequestAdminNote}: {item.adminNote?.trim() || "-"}
                </small>
              </article>
            ))
          )}
        </div>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14 }}>
        <h2>{t.storeSection}</h2>

        <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
          <h3 style={{ marginTop: 0 }}>{t.storeCreateListing}</h3>
          {ownedSpecialTemplates.length === 0 ? (
            <p>{t.storeNoOwnedTemplates}</p>
          ) : (
            <form onSubmit={onCreateStoreListing} style={{ display: "grid", gap: 10, maxWidth: 560 }}>
              <label>
                {t.storeTemplateSelect}
                <select
                  value={storeTemplateId}
                  onChange={(event) => setStoreTemplateId(event.target.value)}
                  style={{ marginLeft: 8, minWidth: 300 }}
                >
                  {ownedSpecialTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.title} (v{tpl.version})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t.storePrice}
                <input
                  type="number"
                  min={1}
                  max={1_000_000}
                  value={storePriceCredits}
                  onChange={(event) => setStorePriceCredits(Number(event.target.value))}
                  style={{ marginLeft: 8, width: 120 }}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={storeIsActive}
                  onChange={(event) => setStoreIsActive(event.target.checked)}
                />
                <span style={{ marginLeft: 6 }}>{t.storeActive}</span>
              </label>
              <button type="submit" disabled={isLoading} style={{ width: 140 }}>
                {isLoading ? t.loading : t.storeListButton}
              </button>
            </form>
          )}
        </div>

        <div style={{ marginTop: 14 }}>
          <h3>{t.storeMyListings}</h3>
          {myListings.length === 0 ? (
            <p>{t.storeNoMyListings}</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {myListings.map((listing) => {
                const draft = listingDrafts[listing.id] ?? {
                  priceCredits: listing.priceCredits,
                  isActive: listing.isActive,
                };
                return (
                  <article key={listing.id} style={{ border: "1px solid #eee", padding: 10 }}>
                    <strong>{listing.template.title}</strong> (v{listing.template.version})
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
                      <label>
                        {t.storePriceLabel}
                        <input
                          type="number"
                          min={1}
                          max={1_000_000}
                          value={draft.priceCredits}
                          onChange={(event) =>
                            updateListingDraft(listing.id, { priceCredits: Number(event.target.value) })
                          }
                          style={{ marginLeft: 8, width: 110 }}
                        />
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={draft.isActive}
                          onChange={(event) =>
                            updateListingDraft(listing.id, { isActive: event.target.checked })
                          }
                        />
                        <span style={{ marginLeft: 6 }}>{t.storeActive}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => void onUpdateStoreListing(listing.id)}
                        disabled={isLoading}
                      >
                        {t.storeUpdate}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ marginTop: 14 }}>
          <h3>{t.storeMarketListings}</h3>
          {marketListings.length === 0 ? (
            <p>{t.storeNoMarketListings}</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">{t.storeTemplate}</th>
                  <th align="left">{t.storeSeller}</th>
                  <th align="right">{t.storePriceLabel}</th>
                  <th align="left">{t.storeCreatedAt}</th>
                  <th align="left">Action</th>
                </tr>
              </thead>
              <tbody>
                {marketListings.map((listing) => (
                  <tr key={listing.id}>
                    <td>{listing.template.title}</td>
                    <td>{displayUserName(listing.seller)}</td>
                    <td align="right">{listing.priceCredits}</td>
                    <td>{new Date(listing.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => void onPurchaseListing(listing.id)}
                        disabled={isLoading || listing.canPurchase === false}
                      >
                        {listing.alreadyPurchased ? t.storeAlreadyPurchased : t.storeBuy}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: 14 }}>
          <h3>{t.storePurchases}</h3>
          {purchaseHistory.length === 0 ? (
            <p>{t.storeNoPurchases}</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">{t.storeBoughtAt}</th>
                  <th align="left">{t.storeTemplate}</th>
                  <th align="left">{t.storeSeller}</th>
                  <th align="right">{t.storePriceLabel}</th>
                  <th align="right">{t.storeFeeLabel}</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{item.listing.template.title}</td>
                    <td>{displayUserName(item.seller)}</td>
                    <td align="right">{item.priceCredits}</td>
                    <td align="right">{item.platformFeeCredits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ marginTop: 14 }}>
          <h3>{t.storeSales}</h3>
          {salesHistory.length === 0 ? (
            <p>{t.storeNoSales}</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">{t.storeBoughtAt}</th>
                  <th align="left">{t.storeTemplate}</th>
                  <th align="left">{locale === "ko" ? "구매자" : "Buyer"}</th>
                  <th align="right">{t.storePriceLabel}</th>
                  <th align="right">{t.storeSellerCreditLabel}</th>
                </tr>
              </thead>
              <tbody>
                {salesHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.createdAt).toLocaleString()}</td>
                    <td>{item.listing.template.title}</td>
                    <td>{displayUserName(item.buyer)}</td>
                    <td align="right">{item.priceCredits}</td>
                    <td align="right">{item.sellerCredit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        <fieldset style={{ border: "1px solid #eee", padding: 10, marginTop: 14 }}>
          <legend>{t.csvFilters}</legend>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <label>
              {t.csvFrom}
              <input
                type="datetime-local"
                value={exportFrom}
                onChange={(event) => setExportFrom(event.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
            <label>
              {t.csvTo}
              <input
                type="datetime-local"
                value={exportTo}
                onChange={(event) => setExportTo(event.target.value)}
                style={{ marginLeft: 8 }}
              />
            </label>
            <label>
              {t.csvAttempt}
              <input
                type="number"
                min={1}
                value={exportAttempt}
                onChange={(event) => setExportAttempt(event.target.value)}
                style={{ marginLeft: 8, width: 96 }}
              />
            </label>
            <small>{t.csvAttemptHint}</small>
          </div>
          {isExportRangeInvalid ? (
            <p style={{ marginTop: 8, color: "#b00020" }}>{t.csvInvalidRange}</p>
          ) : null}
        </fieldset>

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
                    href={buildExportHref(pkg.id)}
                    onClick={(event) => {
                      if (isExportRangeInvalid) {
                        event.preventDefault();
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "2px 8px",
                      border: "1px solid #ccc",
                      borderRadius: 4,
                      textDecoration: "none",
                      color: "inherit",
                      fontSize: 13,
                      opacity: isExportRangeInvalid ? 0.55 : 1,
                      pointerEvents: isExportRangeInvalid ? "none" : "auto",
                    }}
                  >
                    {t.exportCsv}
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14 }}>
        <h2>{t.participantSection}</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <label>
            {t.participantSearchLabel}
            <input
              value={participantQuery}
              onChange={(event) => setParticipantQuery(event.target.value)}
              placeholder={t.participantSearchPlaceholder}
              style={{ marginLeft: 8, minWidth: 220 }}
            />
          </label>
          <label>
            {t.participantFilterLabel}
            <select
              value={participantFilter}
              onChange={(event) =>
                setParticipantFilter(
                  event.target.value as "ALL" | "ACTIVE" | "INACTIVE" | "ANONYMIZED",
                )
              }
              style={{ marginLeft: 8 }}
            >
              <option value="ALL">{t.filterAll}</option>
              <option value="ACTIVE">{t.filterActive}</option>
              <option value="INACTIVE">{t.filterInactive}</option>
              <option value="ANONYMIZED">{t.filterAnonymized}</option>
            </select>
          </label>
        </div>
        {filteredParticipants.length === 0 ? (
          <p>{t.participantNoData}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th align="left">{t.participantLoginId}</th>
                <th align="left">{t.participantDisplayName}</th>
                <th align="left">{t.participantLocale}</th>
                <th align="left">{t.participantStatus}</th>
                <th align="right">{t.participantEnrollments}</th>
                <th align="right">{t.participantResponses}</th>
                <th align="left">{t.participantLastRespondedAt}</th>
                <th align="left">{t.participantCreatedAt}</th>
                <th align="left">{t.participantAction}</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((participant) => (
                <tr key={participant.id}>
                  <td>{participant.loginId ?? "-"}</td>
                  <td>{participant.displayName ?? "-"}</td>
                  <td>{participant.locale}</td>
                  <td>{participantStatusLabel(locale, participant)}</td>
                  <td align="right">{participant.enrollmentCount}</td>
                  <td align="right">{participant.responseCount}</td>
                  <td>{formatMaybeDate(locale, participant.lastRespondedAt)}</td>
                  <td>{formatMaybeDate(locale, participant.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {!participant.isAnonymized ? (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() =>
                            void onParticipantAction(
                              participant.id,
                              participant.isActive ? "DEACTIVATE" : "ACTIVATE",
                            )
                          }
                        >
                          {participant.isActive ? t.participantDeactivate : t.participantRestore}
                        </button>
                      ) : null}
                      {!participant.isAnonymized ? (
                        <button
                          type="button"
                          disabled={isLoading}
                          style={{ color: "#b00020", borderColor: "#b00020" }}
                          onClick={() => void onParticipantAction(participant.id, "ANONYMIZE")}
                        >
                          {locale === "ko" ? "말소(익명화)" : "Anonymize"}
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 14 }}>
        <h2>{locale === "ko" ? "AI 분석" : "AI Analysis"}</h2>
        <form onSubmit={onRunAiAnalysis} style={{ display: "grid", gap: 10, marginTop: 8 }}>
          <label>
            {locale === "ko" ? "패키지" : "Package"}
            <select
              value={aiPackageId}
              onChange={(event) => setAiPackageId(event.target.value)}
              style={{ marginLeft: 8, minWidth: 280 }}
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title} ({pkg.code})
                </option>
              ))}
            </select>
          </label>
          <label>
            {locale === "ko" ? "모드" : "Mode"}
            <select
              value={aiMode}
              onChange={(event) => setAiMode(event.target.value as "BYOK" | "MANAGED")}
              style={{ marginLeft: 8 }}
            >
              <option value="MANAGED">
                {locale === "ko" ? "Managed (플랫폼 키/크레딧 차감)" : "Managed (platform key + credits)"}
              </option>
              <option value="BYOK">{locale === "ko" ? "BYOK (내 키)" : "BYOK (your key)"}</option>
            </select>
          </label>
          {aiMode === "BYOK" ? (
            <label>
              OpenAI API Key
              <input
                type="password"
                value={aiApiKey}
                onChange={(event) => setAiApiKey(event.target.value)}
                style={{ marginLeft: 8, minWidth: 420 }}
              />
            </label>
          ) : null}
          <label style={{ display: "grid", gap: 6 }}>
            {locale === "ko" ? "질문" : "Question"}
            <textarea
              value={aiQuestion}
              onChange={(event) => setAiQuestion(event.target.value)}
              rows={3}
            />
          </label>
          <button type="submit" disabled={aiIsRunning || isLoading} style={{ width: 180 }}>
            {aiIsRunning
              ? locale === "ko"
                ? "AI 분석 실행 중..."
                : "Running AI analysis..."
              : locale === "ko"
                ? "AI 분석 실행"
                : "Run AI analysis"}
          </button>
        </form>
        {aiMeta ? <p style={{ marginTop: 10, fontSize: 13 }}>{aiMeta}</p> : null}
        {aiResult ? (
          <pre
            style={{
              marginTop: 10,
              whiteSpace: "pre-wrap",
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 10,
              background: "#fafafa",
            }}
          >
            {aiResult}
          </pre>
        ) : null}
      </section>
    </main>
  );
}
