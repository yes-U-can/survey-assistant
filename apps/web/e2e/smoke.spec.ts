import {
  PackageMode,
  PackageStatus,
  PrismaClient,
  TemplateType,
  TemplateVisibility,
  UserRole,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { test, expect, APIRequestContext } from "@playwright/test";
import { loadTestEnv } from "./load-test-env";

loadTestEnv(process.cwd());

const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
const prisma = connectionString
  ? new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    })
  : null;

async function signInParticipant(
  request: APIRequestContext,
  params: { loginId: string; password: string },
) {
  const csrfResponse = await request.get("/api/auth/csrf");
  expect(csrfResponse.ok()).toBeTruthy();
  const csrfJson = (await csrfResponse.json()) as { csrfToken?: string };
  expect(typeof csrfJson.csrfToken).toBe("string");

  const callbackResponse = await request.post("/api/auth/callback/participant-credentials", {
    form: {
      csrfToken: csrfJson.csrfToken as string,
      loginId: params.loginId,
      password: params.password,
      callbackUrl: "/ko/participant",
      json: "true",
    },
  });

  expect(callbackResponse.ok()).toBeTruthy();
  const callbackJson = (await callbackResponse.json().catch(() => null)) as
    | { ok?: boolean; url?: string; error?: string }
    | null;
  expect(callbackJson).not.toBeNull();
  expect(callbackJson?.error ?? null).toBeNull();
}

test.describe("api smoke", () => {
  test("unauthenticated admin route is blocked", async ({ request }) => {
    const response = await request.get("/api/admin/packages");
    expect(response.status()).toBe(401);
  });

  test("participant signup -> login -> enroll -> respond flow works", async ({ request }) => {
    test.skip(!prisma, "DATABASE_URL or DIRECT_URL is required for seeded participant flow.");

    const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const ownerEmail = `owner_${suffix}@example.com`;
    const participantLoginId = `pt_${suffix}`;
    const participantPassword = "TestPassw0rd!";
    const packageCode = `PKG_${suffix}`.slice(0, 24);

    let ownerId: string | null = null;
    let templateId: string | null = null;
    let packageId: string | null = null;
    let participantId: string | null = null;

    try {
      const owner = await prisma!.user.create({
        data: {
          role: UserRole.RESEARCH_ADMIN,
          email: ownerEmail,
          displayName: `owner_${suffix}`,
          locale: "ko",
          isActive: true,
        },
        select: { id: true },
      });
      ownerId = owner.id;

      const template = await prisma!.template.create({
        data: {
          ownerId: owner.id,
          type: TemplateType.LIKERT,
          visibility: TemplateVisibility.PRIVATE,
          title: `템플릿_${suffix}`,
          schemaJson: {
            schemaVersion: 1,
            kind: "likert",
            min: 1,
            max: 5,
            labels: ["1", "2", "3", "4", "5"],
            questions: [
              {
                id: "q1",
                text: "테스트 문항",
              },
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
          title: `패키지_${suffix}`,
          mode: PackageMode.CROSS_SECTIONAL,
          status: PackageStatus.ACTIVE,
          maxResponsesPerParticipant: 1,
        },
        select: { id: true },
      });
      packageId = surveyPackage.id;

      await prisma!.packageTemplate.create({
        data: {
          packageId: surveyPackage.id,
          templateId: template.id,
          orderIndex: 0,
        },
      });

      const signupResponse = await request.post("/api/auth/participant/signup", {
        data: {
          loginId: participantLoginId,
          password: participantPassword,
          displayName: `participant_${suffix}`,
          locale: "ko",
        },
      });
      expect(signupResponse.status()).toBe(201);
      const signupJson = (await signupResponse.json()) as { ok: boolean; userId?: string };
      expect(signupJson.ok).toBeTruthy();
      participantId = signupJson.userId ?? null;
      expect(participantId).not.toBeNull();

      await signInParticipant(request, {
        loginId: participantLoginId,
        password: participantPassword,
      });

      const enrollResponse = await request.post("/api/participant/packages/enroll", {
        data: { code: packageCode },
      });
      expect([200, 201]).toContain(enrollResponse.status());

      const surveyResponse = await request.get(
        `/api/participant/packages/${encodeURIComponent(surveyPackage.id)}/survey`,
      );
      expect(surveyResponse.status()).toBe(200);
      const surveyJson = (await surveyResponse.json()) as {
        ok?: boolean;
        survey?: { templates?: Array<{ templateId: string }> };
      };
      expect(surveyJson.ok).toBeTruthy();
      expect(surveyJson.survey?.templates?.length ?? 0).toBeGreaterThan(0);

      const respondResponse = await request.post("/api/participant/packages/respond", {
        data: {
          packageId: surveyPackage.id,
          responses: [
            {
              templateId: template.id,
              responseJson: {
                answers: {
                  q1: 4,
                },
              },
            },
          ],
        },
      });
      expect(respondResponse.status()).toBe(201);
      const respondJson = (await respondResponse.json()) as { ok?: boolean; completedCount?: number };
      expect(respondJson.ok).toBeTruthy();
      expect(respondJson.completedCount).toBe(1);

      const packagesResponse = await request.get("/api/participant/packages");
      expect(packagesResponse.status()).toBe(200);
      const packagesJson = (await packagesResponse.json()) as {
        ok?: boolean;
        packages?: Array<{ packageId: string; completedCount: number }>;
      };
      expect(packagesJson.ok).toBeTruthy();
      const target = packagesJson.packages?.find((item) => item.packageId === surveyPackage.id);
      expect(target?.completedCount).toBe(1);
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
});

test.afterAll(async () => {
  await prisma?.$disconnect();
});
