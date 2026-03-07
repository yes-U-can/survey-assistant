import { CreditTxnType, Locale, PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { encode } from "next-auth/jwt";
import { test, expect, APIRequestContext } from "@playwright/test";

import { loadTestEnv } from "./load-test-env";

loadTestEnv(process.cwd());

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma = connectionString
  ? new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    })
  : null;

const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? "playwright-dev-secret-only";
const sessionCookieName =
  (process.env.NEXTAUTH_URL ?? "").startsWith("https://") || Boolean(process.env.VERCEL)
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

async function buildAdminCookie(params: {
  id: string;
  role: UserRole.RESEARCH_ADMIN | UserRole.PLATFORM_ADMIN;
  locale?: Locale;
  name?: string | null;
}) {
  const token = await encode({
    secret: nextAuthSecret,
    token: {
      uid: params.id,
      role: params.role,
      locale: params.locale ?? Locale.ko,
      name: params.name ?? undefined,
    },
  });

  return `${sessionCookieName}=${encodeURIComponent(token)}`;
}

async function apiJson<T>(
  request: APIRequestContext,
  params: {
    cookie: string;
    method?: "GET" | "POST";
    url: string;
    data?: unknown;
    headers?: Record<string, string>;
  },
) {
  const response = await request.fetch(params.url, {
    method: params.method ?? "GET",
    headers: {
      Cookie: params.cookie,
      ...(params.data ? { "Content-Type": "application/json" } : {}),
      ...(params.headers ?? {}),
    },
    data: params.data ? JSON.stringify(params.data) : undefined,
  });

  return {
    response,
    json: (await response.json().catch(() => null)) as T | null,
  };
}

test.describe("admin paid bm", () => {
  test("admin credit endpoint returns wallet balance and recent transactions", async ({ request }) => {
    test.skip(!prisma, "DATABASE_URL or DIRECT_URL is required.");

    const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const adminEmail = `paid_wallet_${suffix}@example.com`;
    let adminId: string | null = null;
    let walletId: string | null = null;

    try {
      const admin = await prisma!.user.create({
        data: {
          role: UserRole.RESEARCH_ADMIN,
          email: adminEmail,
          displayName: `Paid Wallet ${suffix}`,
          locale: Locale.ko,
          isActive: true,
        },
        select: { id: true, displayName: true },
      });
      adminId = admin.id;

      const wallet = await prisma!.creditWallet.create({
        data: {
          userId: admin.id,
          balance: 17,
        },
        select: { id: true },
      });
      walletId = wallet.id;

      await prisma!.creditTransaction.createMany({
        data: [
          {
            walletId: wallet.id,
            type: CreditTxnType.ISSUE,
            amount: 20,
            memo: "initial_issue",
          },
          {
            walletId: wallet.id,
            type: CreditTxnType.SPEND,
            amount: -3,
            memo: "managed_ai_chat_start:demo",
          },
        ],
      });

      const cookie = await buildAdminCookie({
        id: admin.id,
        role: UserRole.RESEARCH_ADMIN,
        name: admin.displayName,
      });

      const { response, json } = await apiJson<{
        ok?: boolean;
        wallet?: { balance?: number };
        transactions?: Array<{ memo?: string | null; amount?: number }>;
      }>(request, {
        cookie,
        url: "/api/admin/credits?limit=5",
      });

      expect(response.status()).toBe(200);
      expect(json?.ok).toBeTruthy();
      expect(json?.wallet?.balance).toBe(17);
      expect(json?.transactions?.length ?? 0).toBeGreaterThanOrEqual(2);
      expect(json?.transactions?.some((item) => item.memo === "managed_ai_chat_start:demo")).toBeTruthy();
    } finally {
      if (walletId) {
        await prisma!.creditTransaction.deleteMany({ where: { walletId } });
        await prisma!.creditWallet.deleteMany({ where: { id: walletId } });
      }
      if (adminId) {
        await prisma!.user.deleteMany({ where: { id: adminId } });
      }
    }
  });

  test("managed ai chat rejects requests without idempotency key", async ({ request }) => {
    test.skip(!prisma, "DATABASE_URL or DIRECT_URL is required.");

    const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const adminEmail = `paid_chat_${suffix}@example.com`;
    let adminId: string | null = null;

    try {
      const admin = await prisma!.user.create({
        data: {
          role: UserRole.RESEARCH_ADMIN,
          email: adminEmail,
          displayName: `Paid Chat ${suffix}`,
          locale: Locale.ko,
          isActive: true,
        },
        select: { id: true, displayName: true },
      });
      adminId = admin.id;

      const cookie = await buildAdminCookie({
        id: admin.id,
        role: UserRole.RESEARCH_ADMIN,
        name: admin.displayName,
      });

      const { response, json } = await apiJson<{ ok?: boolean; error?: string }>(request, {
        cookie,
        method: "POST",
        url: "/api/admin/ai/chat",
        data: {
          mode: "MANAGED",
          packageId: "pkg_demo",
          provider: "OPENAI",
          messages: [{ role: "user", content: "Explain this package." }],
        },
      });

      expect(response.status()).toBe(400);
      expect(json?.error).toBe("missing_idempotency_key");
    } finally {
      if (adminId) {
        await prisma!.user.deleteMany({ where: { id: adminId } });
      }
    }
  });

  test("skillbook builder rejects requests without idempotency key", async ({ request }) => {
    test.skip(!prisma, "DATABASE_URL or DIRECT_URL is required.");

    const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const adminEmail = `paid_builder_${suffix}@example.com`;
    let adminId: string | null = null;

    try {
      const admin = await prisma!.user.create({
        data: {
          role: UserRole.RESEARCH_ADMIN,
          email: adminEmail,
          displayName: `Paid Builder ${suffix}`,
          locale: Locale.ko,
          isActive: true,
        },
        select: { id: true, displayName: true },
      });
      adminId = admin.id;

      const cookie = await buildAdminCookie({
        id: admin.id,
        role: UserRole.RESEARCH_ADMIN,
        name: admin.displayName,
      });

      const { response, json } = await apiJson<{ ok?: boolean; error?: string }>(request, {
        cookie,
        method: "POST",
        url: "/api/admin/skillbooks/builder",
        data: {
          provider: "OPENAI",
          locale: "ko",
          goal: "Create a reusable interpretation skillbook.",
          methodologyNotes: "Start with descriptive statistics, then compare longitudinal changes.",
        },
      });

      expect(response.status()).toBe(400);
      expect(json?.error).toBe("missing_idempotency_key");
    } finally {
      if (adminId) {
        await prisma!.user.deleteMany({ where: { id: adminId } });
      }
    }
  });
});

test.afterAll(async () => {
  await prisma?.$disconnect();
});
