import { expect, test } from "@playwright/test";

const ADMIN_CALLBACK_URL = "/en/admin";

test.describe("oauth contract", () => {
  test("admin sign-in page renders GIS shell when Google auth is configured", async ({ page }) => {
    await page.goto("/en/auth/admin");

    await expect(page.getByRole("heading", { level: 1, name: "Research Admin Sign-In" })).toBeVisible();

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const gisRoot = page.getByTestId("google-gis-root");
      await expect(gisRoot).toBeVisible();
      await expect(gisRoot).toHaveAttribute("data-provider", "google-id-token");
      await expect(gisRoot).toHaveAttribute("data-callback-url", ADMIN_CALLBACK_URL);
    }
  });

  test("auth providers expose google id token credentials when Google auth is configured", async ({ request }) => {
    const response = await request.get("/api/auth/providers");
    expect(response.ok()).toBeTruthy();

    const providers = (await response.json()) as Record<string, { id?: string }>;
    expect(providers["participant-credentials"]?.id).toBe("participant-credentials");

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      expect(providers["google-id-token"]?.id).toBe("google-id-token");
      expect(providers.google?.id).toBe("google");
    }
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
