import {
  Locale,
  PackageMode,
  PackageStatus,
  PrismaClient,
  SkillBookStatus,
  SkillBookVisibility,
  TemplateType,
  TemplateVisibility,
  UserRole,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { unzipSync, strFromU8 } from "fflate";
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
    method?: "GET" | "POST" | "PATCH";
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

test.describe("admin free core", () => {
  test("package export returns zip bundle and master csv", async ({ request }) => {
    test.skip(!prisma, "DATABASE_URL or DIRECT_URL is required.");

    const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const ownerEmail = `admin_export_${suffix}@example.com`;
    const participantLoginId = `export_pt_${suffix}`;
    const packageCode = `EXPORT_${suffix}`.slice(0, 24);

    let ownerId: string | null = null;
    let participantId: string | null = null;
    let templateId: string | null = null;
    let packageId: string | null = null;

    try {
      const owner = await prisma!.user.create({
        data: {
          role: UserRole.RESEARCH_ADMIN,
          email: ownerEmail,
          displayName: `Export Admin ${suffix}`,
          locale: Locale.ko,
          isActive: true,
        },
        select: { id: true, displayName: true },
      });
      ownerId = owner.id;

      const participant = await prisma!.user.create({
        data: {
          role: UserRole.PARTICIPANT,
          loginId: participantLoginId,
          displayName: `Participant ${suffix}`,
          locale: Locale.ko,
          isActive: true,
        },
        select: { id: true },
      });
      participantId = participant.id;

      const template = await prisma!.template.create({
        data: {
          ownerId: owner.id,
          type: TemplateType.LIKERT,
          visibility: TemplateVisibility.PRIVATE,
          title: `Stress Scale ${suffix}`,
          schemaJson: {
            kind: "likert",
            scale: {
              min: 1,
              max: 5,
              labels: ["Never", "Rarely", "Sometimes", "Often", "Always"],
            },
            questions: [
              { id: "q1", text: "I felt calm today." },
              { id: "q2", text: "I felt tired today." },
            ],
          },
        },
        select: { id: true },
      });
      templateId = template.id;

      const surveyPackage = await prisma!.surveyPackage.create({
        data: {
          ownerId: owner.id,
          code: packageCode,
          title: `Export Package ${suffix}`,
          mode: PackageMode.CROSS_SECTIONAL,
          status: PackageStatus.ACTIVE,
          maxResponsesPerParticipant: 2,
        },
        select: { id: true },
      });
      packageId = surveyPackage.id;

      await prisma!.packageTemplate.create({
        data: {
          packageId: surveyPackage.id,
          templateId: template.id,
          orderIndex: 10,
        },
      });

      await prisma!.participantPackage.create({
        data: {
          packageId: surveyPackage.id,
          participantId: participant.id,
          completedCount: 1,
          lastRespondedAt: new Date("2026-03-07T10:30:00.000Z"),
        },
      });

      await prisma!.response.create({
        data: {
          packageId: surveyPackage.id,
          templateId: template.id,
          participantId: participant.id,
          attemptNo: 1,
          submittedAt: new Date("2026-03-07T10:30:00.000Z"),
          responseJson: {
            answers: {
              q1: 4,
              q2: 2,
            },
          },
        },
      });

      const cookie = await buildAdminCookie({
        id: owner.id,
        role: UserRole.RESEARCH_ADMIN,
        name: owner.displayName,
      });

      const zipResponse = await request.get(
        `/api/admin/packages/${encodeURIComponent(surveyPackage.id)}/export`,
        {
          headers: { Cookie: cookie },
        },
      );
      expect(zipResponse.status()).toBe(200);
      expect(zipResponse.headers()["content-type"]).toContain("application/zip");

      const zipBytes = await zipResponse.body();
      const zipFiles = unzipSync(new Uint8Array(zipBytes));
      const fileNames = Object.keys(zipFiles).sort();

      expect(fileNames).toContain("00_package_overview.csv");
      expect(fileNames).toContain("01_attempts.csv");
      expect(fileNames).toContain("02_codebook.csv");
      expect(fileNames).toContain("90_responses_long.csv");
      expect(fileNames.some((name) => name.endsWith(".csv") && name.startsWith("10_"))).toBeTruthy();

      const masterCsv = strFromU8(zipFiles["90_responses_long.csv"]);
      expect(masterCsv).toContain("package_code");
      expect(masterCsv).toContain(packageCode);
      expect(masterCsv).toContain("q1");
      expect(masterCsv).toContain("I felt calm today.");

      const csvResponse = await request.get(
        `/api/admin/packages/${encodeURIComponent(surveyPackage.id)}/export?format=csv`,
        {
          headers: { Cookie: cookie },
        },
      );
      expect(csvResponse.status()).toBe(200);
      expect(csvResponse.headers()["content-type"]).toContain("text/csv");
      const csvText = (await csvResponse.text()).replace(/^\uFEFF/, "");
      expect(csvText).toContain("package_code");
      expect(csvText).toContain(packageCode);
      expect(csvText).toContain("item_key");
    } finally {
      if (packageId) {
        await prisma!.response.deleteMany({ where: { packageId } });
        await prisma!.participantPackage.deleteMany({ where: { packageId } });
        await prisma!.packageTemplate.deleteMany({ where: { packageId } });
        await prisma!.surveyPackage.deleteMany({ where: { id: packageId } });
      }
      if (templateId) {
        await prisma!.template.deleteMany({ where: { id: templateId } });
      }
      if (participantId) {
        await prisma!.user.deleteMany({ where: { id: participantId } });
      }
      if (ownerId) {
        await prisma!.user.deleteMany({ where: { id: ownerId } });
      }
    }
  });

  test("ai chat blocks package access outside admin ownership scope", async ({ request }) => {
    test.skip(!prisma, "DATABASE_URL or DIRECT_URL is required.");

    const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const ownerAEmail = `scope_a_${suffix}@example.com`;
    const ownerBEmail = `scope_b_${suffix}@example.com`;
    const packageCode = `SCOPE_${suffix}`.slice(0, 24);

    let ownerAId: string | null = null;
    let ownerBId: string | null = null;
    let packageId: string | null = null;

    try {
      const [ownerA, ownerB] = await Promise.all([
        prisma!.user.create({
          data: {
            role: UserRole.RESEARCH_ADMIN,
            email: ownerAEmail,
            displayName: `Scope A ${suffix}`,
            locale: Locale.ko,
            isActive: true,
          },
          select: { id: true, displayName: true },
        }),
        prisma!.user.create({
          data: {
            role: UserRole.RESEARCH_ADMIN,
            email: ownerBEmail,
            displayName: `Scope B ${suffix}`,
            locale: Locale.ko,
            isActive: true,
          },
          select: { id: true },
        }),
      ]);
      ownerAId = ownerA.id;
      ownerBId = ownerB.id;

      const surveyPackage = await prisma!.surveyPackage.create({
        data: {
          ownerId: ownerB.id,
          code: packageCode,
          title: `Scope Package ${suffix}`,
          mode: PackageMode.CROSS_SECTIONAL,
          status: PackageStatus.ACTIVE,
          maxResponsesPerParticipant: 1,
        },
        select: { id: true },
      });
      packageId = surveyPackage.id;

      const cookie = await buildAdminCookie({
        id: ownerA.id,
        role: UserRole.RESEARCH_ADMIN,
        name: ownerA.displayName,
      });

      const { response, json } = await apiJson<{ ok?: boolean; error?: string }>(request, {
        cookie,
        method: "POST",
        url: "/api/admin/ai/chat",
        data: {
          packageId: surveyPackage.id,
          provider: "OPENAI",
          apiKey: "sk-test-invalid-but-long-enough",
          messages: [{ role: "user", content: "Summarize this dataset." }],
        },
      });

      expect(response.status()).toBe(404);
      expect(json?.ok).toBeFalsy();
      expect(json?.error).toBe("not_found_or_no_access");
    } finally {
      if (packageId) {
        await prisma!.surveyPackage.deleteMany({ where: { id: packageId } });
      }
      if (ownerAId) {
        await prisma!.user.deleteMany({ where: { id: ownerAId } });
      }
      if (ownerBId) {
        await prisma!.user.deleteMany({ where: { id: ownerBId } });
      }
    }
  });

  test("skillbook create -> compile -> listing -> purchase updates ledger", async ({ request }) => {
    test.skip(!prisma, "DATABASE_URL or DIRECT_URL is required.");

    const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const sellerEmail = `seller_${suffix}@example.com`;
    const buyerEmail = `buyer_${suffix}@example.com`;

    let sellerId: string | null = null;
    let buyerId: string | null = null;
    let listingId: string | null = null;
    let createdSkillBookId: string | null = null;

    try {
      const [seller, buyer] = await Promise.all([
        prisma!.user.create({
          data: {
            role: UserRole.RESEARCH_ADMIN,
            email: sellerEmail,
            displayName: `Seller ${suffix}`,
            locale: Locale.ko,
            isActive: true,
          },
          select: { id: true, displayName: true },
        }),
        prisma!.user.create({
          data: {
            role: UserRole.RESEARCH_ADMIN,
            email: buyerEmail,
            displayName: `Buyer ${suffix}`,
            locale: Locale.ko,
            isActive: true,
          },
          select: { id: true, displayName: true },
        }),
      ]);
      sellerId = seller.id;
      buyerId = buyer.id;

      await prisma!.creditWallet.create({
        data: {
          userId: buyer.id,
          balance: 40,
        },
      });

      const sellerCookie = await buildAdminCookie({
        id: seller.id,
        role: UserRole.RESEARCH_ADMIN,
        name: seller.displayName,
      });
      const buyerCookie = await buildAdminCookie({
        id: buyer.id,
        role: UserRole.RESEARCH_ADMIN,
        name: buyer.displayName,
      });

      const createResult = await apiJson<{
        ok?: boolean;
        skillBook?: { id: string; visibility: SkillBookVisibility; status: SkillBookStatus };
      }>(request, {
        cookie: sellerCookie,
        method: "POST",
        url: "/api/admin/skillbooks",
        data: {
          title: `Cognitive Interpretation ${suffix}`,
          description: "Interpret longitudinal mood survey responses.",
          locale: "ko",
          visibility: "STORE",
          status: "DRAFT",
          body: "Use descriptive statistics first. Compare attempt trends before interpretation.",
          sources: [
            {
              label: "Method note",
              content: "Focus on repeated-measures change and clinically meaningful deltas.",
            },
          ],
        },
      });
      expect(createResult.response.status()).toBe(201);
      expect(createResult.json?.ok).toBeTruthy();
      createdSkillBookId = createResult.json?.skillBook?.id ?? null;
      expect(createdSkillBookId).not.toBeNull();

      const compileResult = await apiJson<{
        ok?: boolean;
        skillBook?: { status: SkillBookStatus; compiledPrompt: string | null };
      }>(request, {
        cookie: sellerCookie,
        method: "POST",
        url: `/api/admin/skillbooks/${encodeURIComponent(createdSkillBookId as string)}/compile`,
      });
      expect(compileResult.response.status()).toBe(200);
      expect(compileResult.json?.skillBook?.status).toBe(SkillBookStatus.READY);
      expect((compileResult.json?.skillBook?.compiledPrompt ?? "").length).toBeGreaterThan(20);

      const listingResult = await apiJson<{
        ok?: boolean;
        listing?: { id: string; priceCredits: number };
      }>(request, {
        cookie: sellerCookie,
        method: "POST",
        url: "/api/admin/skillbook-listings",
        data: {
          skillBookId: createdSkillBookId,
          priceCredits: 25,
          isActive: true,
        },
      });
      expect(listingResult.response.status()).toBe(201);
      listingId = listingResult.json?.listing?.id ?? null;
      expect(listingId).not.toBeNull();
      expect(listingResult.json?.listing?.priceCredits).toBe(25);

      const purchaseResult = await apiJson<{
        ok?: boolean;
        purchase?: {
          priceCredits: number;
          sellerCredit: number;
          platformFeeCredits: number;
        };
        wallet?: { buyerBalance: number; sellerBalance: number };
        copiedSkillBook?: { id: string; visibility: SkillBookVisibility; status: SkillBookStatus };
      }>(request, {
        cookie: buyerCookie,
        method: "POST",
        url: "/api/admin/skillbook-purchases",
        data: {
          listingId,
        },
        headers: {
          "X-Idempotency-Key": `playwright-skillbook-${suffix}`,
        },
      });
      expect(purchaseResult.response.status(), JSON.stringify(purchaseResult.json)).toBe(201);
      expect(purchaseResult.json?.ok).toBeTruthy();
      expect(purchaseResult.json?.purchase?.priceCredits).toBe(25);
      expect(purchaseResult.json?.purchase?.sellerCredit).toBe(20);
      expect(purchaseResult.json?.purchase?.platformFeeCredits).toBe(5);
      expect(purchaseResult.json?.wallet?.buyerBalance).toBe(15);
      expect(purchaseResult.json?.wallet?.sellerBalance).toBe(20);
      expect(purchaseResult.json?.copiedSkillBook?.visibility).toBe(SkillBookVisibility.PRIVATE);
      expect(purchaseResult.json?.copiedSkillBook?.status).toBe(SkillBookStatus.READY);

      const purchaseRow = await prisma!.skillBookPurchase.findUnique({
        where: {
          listingId_buyerId: {
            listingId: listingId as string,
            buyerId: buyer.id,
          },
        },
        select: {
          priceCredits: true,
          sellerCredit: true,
          platformFeeCredits: true,
        },
      });
      expect(purchaseRow?.priceCredits).toBe(25);
      expect(purchaseRow?.sellerCredit).toBe(20);
      expect(purchaseRow?.platformFeeCredits).toBe(5);

      const [buyerWallet, sellerWallet] = await Promise.all([
        prisma!.creditWallet.findUnique({
          where: { userId: buyer.id },
          select: { balance: true },
        }),
        prisma!.creditWallet.findUnique({
          where: { userId: seller.id },
          select: { balance: true },
        }),
      ]);
      expect(buyerWallet?.balance).toBe(15);
      expect(sellerWallet?.balance).toBe(20);
    } finally {
      if (buyerId) {
        const buyerSkillBooks = await prisma!.skillBook.findMany({
          where: { ownerId: buyerId },
          select: { id: true },
        });

        if (buyerSkillBooks.length > 0) {
          await prisma!.skillBookSource.deleteMany({
            where: {
              skillBookId: { in: buyerSkillBooks.map((item) => item.id) },
            },
          });
          await prisma!.skillBook.deleteMany({
            where: {
              id: { in: buyerSkillBooks.map((item) => item.id) },
            },
          });
        }
      }

      if (listingId) {
        await prisma!.skillBookPurchase.deleteMany({ where: { listingId } });
        await prisma!.skillBookListing.deleteMany({ where: { id: listingId } });
      }

      if (createdSkillBookId) {
        await prisma!.skillBookSource.deleteMany({ where: { skillBookId: createdSkillBookId } });
        await prisma!.skillBook.deleteMany({ where: { id: createdSkillBookId } });
      }

      if (buyerId || sellerId) {
        await prisma!.creditTransaction.deleteMany({
          where: {
            wallet: {
              userId: { in: [buyerId, sellerId].filter((value): value is string => Boolean(value)) },
            },
          },
        });
        await prisma!.creditWallet.deleteMany({
          where: {
            userId: { in: [buyerId, sellerId].filter((value): value is string => Boolean(value)) },
          },
        });
      }

      if (buyerId) {
        await prisma!.user.deleteMany({ where: { id: buyerId } });
      }
      if (sellerId) {
        await prisma!.user.deleteMany({ where: { id: sellerId } });
      }
    }
  });
});

test.afterAll(async () => {
  await prisma?.$disconnect();
});
