import { defineConfig } from "@playwright/test";
import { loadTestEnv } from "./e2e/load-test-env";

loadTestEnv(process.cwd());

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const shouldStartWebServer = !process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: shouldStartWebServer
    ? {
        command: "corepack pnpm dev",
        port: 3000,
        env: {
          ...process.env,
          NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? baseURL,
          NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? "playwright-dev-secret-only",
          GOOGLE_CLIENT_ID:
            process.env.GOOGLE_CLIENT_ID ??
            "playwright-contract-client.apps.googleusercontent.com",
          GOOGLE_CLIENT_SECRET:
            process.env.GOOGLE_CLIENT_SECRET ?? "playwright-contract-secret",
          DATABASE_URL:
            process.env.DATABASE_URL ??
            "postgresql://postgres:postgres@127.0.0.1:5432/survey_assistant?sslmode=disable",
        },
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});
