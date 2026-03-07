"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type LocaleCode = "ko" | "en";

type SkillBookBrief = {
  id: string;
  title: string;
  description: string | null;
  locale: LocaleCode;
  visibility: "PRIVATE" | "INTERNAL" | "STORE";
  status: "DRAFT" | "READY" | "ARCHIVED";
  updatedAt: string;
};

type SkillBookListing = {
  id: string;
  skillBookId: string;
  sellerId: string;
  priceCredits: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  skillBook: SkillBookBrief;
  seller?: {
    id: string;
    loginId: string | null;
    displayName: string | null;
    role: string;
  };
  alreadyPurchased?: boolean;
  canPurchase?: boolean;
};

type ListingDraft = {
  priceCredits: number;
  isActive: boolean;
};

type Props = {
  locale: LocaleCode;
};

const refreshEventName = "sa-skillbook-library-changed";

const textMap = {
  ko: {
    title: "SkillBook �����",
    subtitle: "READY ������ STORE SkillBook�� ����ϰ� �ٸ� �������� ������� ������ �� �ֽ��ϴ�.",
    create: "����� ���",
    eligible: "��� ������ SkillBook",
    myListings: "�� ��� ���",
    market: "���� ���",
    noEligible: "��� ������ SkillBook�� �����ϴ�.",
    noListings: "��ϵ� ����� �����ϴ�.",
    noMarket: "���� ������ SkillBook�� �����ϴ�.",
    price: "����(credits)",
    active: "Ȱ��",
    buy: "����",
    update: "����",
    purchased: "���� �Ϸ�",
    seller: "�Ǹ���",
    loading: "ó�� ��...",
  },
  en: {
    title: "SkillBook Store",
    subtitle: "List READY STORE SkillBooks and purchase methodology from other researchers.",
    create: "Create listing",
    eligible: "Listable SkillBooks",
    myListings: "My listings",
    market: "Market listings",
    noEligible: "No listable SkillBook found.",
    noListings: "No listing yet.",
    noMarket: "No market listing found.",
    price: "Price (credits)",
    active: "Active",
    buy: "Buy",
    update: "Update",
    purchased: "Purchased",
    seller: "Seller",
    loading: "Processing...",
  },
} as const;

export function AdminSkillBookStorePanel({ locale }: Props) {
  const t = textMap[locale];
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ownedSkillBooks, setOwnedSkillBooks] = useState<SkillBookBrief[]>([]);
  const [myListings, setMyListings] = useState<SkillBookListing[]>([]);
  const [marketListings, setMarketListings] = useState<SkillBookListing[]>([]);
  const [selectedSkillBookId, setSelectedSkillBookId] = useState("");
  const [priceCredits, setPriceCredits] = useState(100);
  const [isActive, setIsActive] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, ListingDraft>>({});
  const purchaseNonceRef = useRef(0);

  const refresh = useCallback(async () => {
    const response = await fetch("/api/admin/skillbook-listings?limit=100", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as
      | {
          ok?: boolean;
          error?: string;
          ownedSkillBooks?: SkillBookBrief[];
          myListings?: SkillBookListing[];
          marketListings?: SkillBookListing[];
        }
      | null;
    if (!response.ok || !payload?.ok) {
      setMessage(payload?.error ?? "skillbook_store_load_failed");
      return;
    }
    const nextOwned = payload.ownedSkillBooks ?? [];
    const nextMyListings = payload.myListings ?? [];
    setOwnedSkillBooks(nextOwned);
    setMyListings(nextMyListings);
    setMarketListings(payload.marketListings ?? []);
    setSelectedSkillBookId((prev) => prev && nextOwned.some((item) => item.id === prev) ? prev : (nextOwned[0]?.id ?? ""));
    setDrafts(
      Object.fromEntries(
        nextMyListings.map((listing) => [listing.id, { priceCredits: listing.priceCredits, isActive: listing.isActive }]),
      ),
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => {
      window.clearTimeout(timer);
    };
  }, [refresh]);

  useEffect(() => {
    const handler = () => {
      void refresh();
    };
    window.addEventListener(refreshEventName, handler);
    return () => {
      window.removeEventListener(refreshEventName, handler);
    };
  }, [refresh]);

  const eligibleSkillBooks = useMemo(
    () => ownedSkillBooks.filter((item) => item.visibility === "STORE" && item.status === "READY"),
    [ownedSkillBooks],
  );

  const updateDraft = (listingId: string, patch: Partial<ListingDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [listingId]: {
        priceCredits: patch.priceCredits ?? prev[listingId]?.priceCredits ?? 1,
        isActive: patch.isActive ?? prev[listingId]?.isActive ?? true,
      },
    }));
  };

  const onCreateListing = async () => {
    if (!selectedSkillBookId) {
      return;
    }
    setIsLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/skillbook-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skillBookId: selectedSkillBookId, priceCredits, isActive }),
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !payload?.ok) {
      setMessage(payload?.error ?? "skillbook_listing_create_failed");
      setIsLoading(false);
      return;
    }
    await refresh();
    window.dispatchEvent(new Event(refreshEventName));
    setIsLoading(false);
  };

  const onUpdateListing = async (listingId: string) => {
    const draft = drafts[listingId];
    if (!draft) {
      return;
    }
    setIsLoading(true);
    setMessage("");
    const response = await fetch(`/api/admin/skillbook-listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !payload?.ok) {
      setMessage(payload?.error ?? "skillbook_listing_update_failed");
      setIsLoading(false);
      return;
    }
    await refresh();
    setIsLoading(false);
  };

  const onPurchase = async (listingId: string) => {
    setIsLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/skillbook-purchases", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Idempotency-Key": `skillbook_${listingId}_${purchaseNonceRef.current + 1}`,
      },
      body: JSON.stringify({ listingId }),
    });
    const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || !payload?.ok) {
      setMessage(payload?.error ?? "skillbook_purchase_failed");
      setIsLoading(false);
      return;
    }
    await refresh();
    window.dispatchEvent(new Event(refreshEventName));
    setIsLoading(false);
  };

  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, marginTop: 16 }}>
      <h2>{t.title}</h2>
      <p>{t.subtitle}</p>
      {message ? <p className="sa-inline-message">{message}</p> : null}

      <div style={{ display: "grid", gap: 16 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>{t.eligible}</h3>
          {eligibleSkillBooks.length === 0 ? <p>{t.noEligible}</p> : null}
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "minmax(0, 1fr) auto auto auto" }}>
            <select value={selectedSkillBookId} onChange={(event) => setSelectedSkillBookId(event.target.value)} disabled={isLoading}>
              {eligibleSkillBooks.map((skillBook) => (
                <option key={skillBook.id} value={skillBook.id}>{skillBook.title}</option>
              ))}
            </select>
            <input type="number" min={1} value={priceCredits} onChange={(event) => setPriceCredits(Number(event.target.value) || 1)} disabled={isLoading} aria-label={t.price} />
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} disabled={isLoading} />
              {t.active}
            </label>
            <button type="button" onClick={() => void onCreateListing()} disabled={isLoading || eligibleSkillBooks.length === 0}>{isLoading ? t.loading : t.create}</button>
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>{t.myListings}</h3>
          {myListings.length === 0 ? <p>{t.noListings}</p> : null}
          <div style={{ display: "grid", gap: 10 }}>
            {myListings.map((listing) => {
              const draft = drafts[listing.id] ?? { priceCredits: listing.priceCredits, isActive: listing.isActive };
              return (
                <div key={listing.id} style={{ border: "1px solid #d7e0e6", borderRadius: 10, padding: 10, display: "grid", gap: 8 }}>
                  <strong>{listing.skillBook.title}</strong>
                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "auto auto auto auto" }}>
                    <input type="number" min={1} value={draft.priceCredits} onChange={(event) => updateDraft(listing.id, { priceCredits: Number(event.target.value) || 1 })} disabled={isLoading} aria-label={t.price} />
                    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input type="checkbox" checked={draft.isActive} onChange={(event) => updateDraft(listing.id, { isActive: event.target.checked })} disabled={isLoading} />
                      {t.active}
                    </label>
                    <span>{listing.skillBook.locale}</span>
                    <button type="button" onClick={() => void onUpdateListing(listing.id)} disabled={isLoading}>{t.update}</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>{t.market}</h3>
          {marketListings.length === 0 ? <p>{t.noMarket}</p> : null}
          <div style={{ display: "grid", gap: 10 }}>
            {marketListings.map((listing) => (
              <div key={listing.id} style={{ border: "1px solid #d7e0e6", borderRadius: 10, padding: 10, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  <div>
                    <strong>{listing.skillBook.title}</strong>
                    <div style={{ fontSize: 13, opacity: 0.8 }}>{t.seller}: {listing.seller?.displayName ?? listing.seller?.loginId ?? listing.sellerId}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{listing.priceCredits}</div>
                </div>
                {listing.skillBook.description ? <p style={{ margin: 0 }}>{listing.skillBook.description}</p> : null}
                <div>
                  {listing.alreadyPurchased ? (
                    <span>{t.purchased}</span>
                  ) : (
                    <button type="button" onClick={() => void onPurchase(listing.id)} disabled={isLoading || !listing.canPurchase}>{isLoading ? t.loading : t.buy}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}




