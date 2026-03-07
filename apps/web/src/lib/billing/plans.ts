import { BillingPlanCode } from "@prisma/client";

export type BillingPlanCatalogItem = {
  code: BillingPlanCode;
  monthlyPriceKrw: number;
  managedAiIncluded: boolean;
  prioritySupport: boolean;
};

export const BILLING_PLAN_CATALOG: BillingPlanCatalogItem[] = [
  {
    code: BillingPlanCode.FREE,
    monthlyPriceKrw: 0,
    managedAiIncluded: false,
    prioritySupport: false,
  },
  {
    code: BillingPlanCode.CLOUD_BASIC,
    monthlyPriceKrw: 49000,
    managedAiIncluded: false,
    prioritySupport: false,
  },
  {
    code: BillingPlanCode.CLOUD_PRO,
    monthlyPriceKrw: 149000,
    managedAiIncluded: true,
    prioritySupport: true,
  },
];

export function serializeBillingPlanCatalog(locale: "ko" | "en") {
  return BILLING_PLAN_CATALOG.map((plan) => ({
    ...plan,
    label:
      locale === "ko"
        ? plan.code === BillingPlanCode.FREE
          ? "무료 / 셀프호스트"
          : plan.code === BillingPlanCode.CLOUD_BASIC
            ? "클라우드 베이직"
            : "클라우드 프로"
        : plan.code === BillingPlanCode.FREE
          ? "Free / Self-host"
          : plan.code === BillingPlanCode.CLOUD_BASIC
            ? "Cloud Basic"
            : "Cloud Pro",
    summary:
      locale === "ko"
        ? plan.code === BillingPlanCode.FREE
          ? "오픈소스 무료 코어를 직접 배포해 사용하는 플랜"
          : plan.code === BillingPlanCode.CLOUD_BASIC
            ? "공식 호스팅형 SaaS 사용권과 기본 운영 기능"
            : "공식 호스팅 + Managed AI 운영 + 우선 지원"
        : plan.code === BillingPlanCode.FREE
          ? "Self-host the open-source free core."
          : plan.code === BillingPlanCode.CLOUD_BASIC
            ? "Official hosted SaaS with core operations."
            : "Official hosted SaaS with managed AI and priority support.",
  }));
}
