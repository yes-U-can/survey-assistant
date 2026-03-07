import { expect, test } from "@playwright/test";

const ADMIN_CALLBACK_URL = "/en/admin";

function resolveExpectedOrigin() {
  return new URL(process.env.NEXTAUTH_URL ?? "http://127.0.0.1:3000").origin;
}

async function getCsrfToken(request: Parameters<typeof test>[0]["request"]) {
  const csrfResponse = await request.get("/api/auth/csrf");
  expect(csrfResponse.ok()).toBeTruthy();
  const csrfJson = (await csrfResponse.json()) as { csrfToken?: string };
  expect(typeof csrfJson.csrfToken).toBe("string");
  return csrfJson.csrfToken as string;
}

test.describe("oauth contract", () => {
  test("admin sign-in page renders configured oauth providers", async ({ page }) => {
    await page.goto("/en/auth/admin");

    await expect(page.getByRole("heading", { level: 1, name: "Research Admin Sign-In" })).toBeVisible();

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const googleButton = page.locator("a.sa-google-btn").first();
      await expect(googleButton).toBeVisible();

      const href = await googleButton.getAttribute("href");
      expect(href).toBeTruthy();

      const hrefUrl = new URL(href as string, "http://localhost");
      expect(hrefUrl.pathname).toBe("/api/auth/signin/google");
      expect(hrefUrl.searchParams.get("callbackUrl")).toBe(ADMIN_CALLBACK_URL);
    }
  });

  test("google sign-in endpoint returns redirect contract", async ({ request }) => {
    const csrfToken = await getCsrfToken(request);

    const response = await request.post("/api/auth/signin/google", {
      form: {
        csrfToken,
        callbackUrl: ADMIN_CALLBACK_URL,
        json: "true",
      },
      maxRedirects: 0,
    });

    expect([200, 302, 303, 307]).toContain(response.status());
    const location = response.headers()["location"];
    const responseJson = location
      ? null
      : ((await response.json().catch(() => null)) as { url?: string } | null);
    const extractedLocation = location ?? responseJson?.url;

    expect(extractedLocation).toBeTruthy();

    const oauthUrl = new URL(extractedLocation as string);
    if (oauthUrl.hostname.includes("google")) {
      const redirectUri = oauthUrl.searchParams.get("redirect_uri");
      expect(redirectUri).toBe(`${resolveExpectedOrigin()}/api/auth/callback/google`);
      expect(oauthUrl.searchParams.get("client_id")).toBeTruthy();
      return;
    }

    expect(oauthUrl.origin).toBe(resolveExpectedOrigin());
    expect(oauthUrl.pathname).toContain("/api/auth/error");
    expect(oauthUrl.searchParams.get("error")).toBeTruthy();
  });

  test("auth error code mapping is rendered on admin sign-in", async ({ page }) => {
    const cases = [
      {
        code: "admin_not_invited",
        pattern: /not invited for admin access/i,
      },
      {
        code: "admin_inactive",
        pattern: /admin account is inactive/i,
      },
      {
        code: "account_role_not_admin",
        pattern: /not an admin account/i,
      },
    ] as const;

    for (const item of cases) {
      await page.goto(`/en/auth/admin?error=${encodeURIComponent(item.code)}`);
      await expect(page.locator("main").first()).toContainText(item.pattern);
    }
  });
});
