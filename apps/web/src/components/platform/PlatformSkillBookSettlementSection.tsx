"use client";

import { useEffect, useState } from "react";

type LocaleCode = "ko" | "en";

type SettlementSummary = {
  purchaseCount: number;
  totalPriceCredits: number;
  totalSellerCredits: number;
  totalPlatformFeeCredits: number;
};

type SettlementPurchase = {
  id: string;
  createdAt: string;
  priceCredits: number;
  platformFeeCredits: number;
  buyer: { id: string; loginId: string | null; displayName: string | null; role: string };
  seller: { id: string; loginId: string | null; displayName: string | null; role: string };
  skillBook: { id: string; title: string; locale: string };
};

type SellerSettlement = {
  seller: { id: string; loginId: string | null; displayName: string | null; role: string };
  salesCount: number;
  totalPriceCredits: number;
  totalSellerCredits: number;
  totalPlatformFeeCredits: number;
};

export function PlatformSkillBookSettlementSection({ locale }: { locale: LocaleCode }) {
  const isKo = locale === "ko";
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<SettlementSummary | null>(null);
  const [purchases, setPurchases] = useState<SettlementPurchase[]>([]);
  const [sellerSettlements, setSellerSettlements] = useState<SellerSettlement[]>([]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      try {
        const response = await fetch("/api/platform-admin/skillbook-settlements", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as
          | { ok?: boolean; summary?: SettlementSummary; purchases?: SettlementPurchase[]; sellerSettlements?: SellerSettlement[] }
          | null;
        if (!alive) return;
        if (response.ok && payload?.ok && payload.summary) {
          setSummary(payload.summary);
          setPurchases(payload.purchases ?? []);
          setSellerSettlements(payload.sellerSettlements ?? []);
        }
      } finally {
        if (alive) setIsLoading(false);
      }
    };
    void run();
    return () => {
      alive = false;
    };
  }, []);

  const txt = (ko: string, en: string) => (isKo ? ko : en);
  const who = (user: { id: string; loginId: string | null; displayName: string | null }) => user.displayName ?? user.loginId ?? user.id;

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 14, marginTop: 16 }}>
      <h2>{txt("SkillBook 정산", "SkillBook Settlements")}</h2>
      {isLoading ? <p>{txt("불러오는 중...", "Loading...")}</p> : null}
      {!isLoading && !summary ? <p>{txt("데이터 없음", "No data")}</p> : null}
      {summary ? (
        <ul>
          <li>{txt("구매 건수", "Purchase count")}: {summary.purchaseCount}</li>
          <li>{txt("총 거래액", "Total sales")}: {summary.totalPriceCredits}</li>
          <li>{txt("총 판매자 정산", "Total seller settlement")}: {summary.totalSellerCredits}</li>
          <li>{txt("총 플랫폼 수수료", "Total platform fee")}: {summary.totalPlatformFeeCredits}</li>
        </ul>
      ) : null}
      <h3>{txt("최근 구매", "Recent purchases")}</h3>
      {purchases.length === 0 ? <p>{txt("데이터 없음", "No data")}</p> : null}
      {purchases.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">{txt("시각", "At")}</th>
              <th align="left">SkillBook</th>
              <th align="left">{txt("구매자", "Buyer")}</th>
              <th align="left">{txt("판매자", "Seller")}</th>
              <th align="right">{txt("가격", "Price")}</th>
              <th align="right">{txt("수수료", "Fee")}</th>
            </tr>
          </thead>
          <tbody>
            {purchases.slice(0, 10).map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.createdAt).toLocaleString()}</td>
                <td>{item.skillBook.title}</td>
                <td>{who(item.buyer)}</td>
                <td>{who(item.seller)}</td>
                <td align="right">{item.priceCredits}</td>
                <td align="right">{item.platformFeeCredits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <h3>{txt("판매자별 정산", "Per-seller settlement")}</h3>
      {sellerSettlements.length === 0 ? <p>{txt("데이터 없음", "No data")}</p> : null}
      {sellerSettlements.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">{txt("판매자", "Seller")}</th>
              <th align="right">{txt("판매 횟수", "Sales")}</th>
              <th align="right">Gross</th>
              <th align="right">{txt("판매자 정산", "Seller")}</th>
              <th align="right">{txt("수수료", "Fee")}</th>
            </tr>
          </thead>
          <tbody>
            {sellerSettlements.map((item) => (
              <tr key={item.seller.id}>
                <td>{who(item.seller)}</td>
                <td align="right">{item.salesCount}</td>
                <td align="right">{item.totalPriceCredits}</td>
                <td align="right">{item.totalSellerCredits}</td>
                <td align="right">{item.totalPlatformFeeCredits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
