# Environment Setup (Survey Assistant)

## Snapshot Date
- 2026-03-04

## 1) Safety First
- Never commit sensitive legacy data (DB dumps, raw responses, user/IP logs).
- Run before commit:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repo-safety.ps1`

## 2) GitHub
- Repository: `yes-U-can/survey-assistant` (public)
- Remote: `origin -> https://github.com/yes-U-can/survey-assistant.git`
- Rule: keep legacy archives under `archive/` and excluded by `.gitignore`.

## 3) Vercel
- Project: `survey_sicp`
- Production URL: `https://surveysicp.vercel.app`
- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- Key env vars:
  - `DATABASE_URL`, `DIRECT_URL` for `development`, `preview`, `production`
  - `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `PLATFORM_ADMIN_EMAILS` for `development`, `production`
  - AI runtime: `OPENAI_API_KEY`, `AI_OPENAI_MODEL`, `AI_OPENAI_TEMPERATURE`, `AI_MANAGED_CREDIT_PER_REQUEST`

## 4) Neon
- Organization: `SICP (org-spring-mountain-53946345)`
- Project: `survey-sicp`
- Region: `aws-us-east-1`
- Prisma migration baseline: `20260304044123_init_core`

## 5) Package Manager Baseline
- Standard: `pnpm` via `corepack`
- Root `packageManager`: `pnpm@10.17.0`
- Keep lockfile: `pnpm-lock.yaml`

## 6) Local Env Template
- Copy root `.env.example` to `.env` for local development.
- Never commit real secrets.

## 7) Windows PowerShell Note
- If `vercel`/`neon` PowerShell wrappers are blocked by execution policy, use `cmd /c ...` form.

## 8) Preview Env Branch Rule
- This Vercel project enforces branch-scoped preview env configuration for `PLATFORM_ADMIN_EMAILS`.
- Use script:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\vercel-set-platform-admin-emails-preview.ps1`
- Script behavior:
  - On `main`: skip (production branch).
  - On pushed feature branch: set preview env for that branch.

## 9) Next Actions
1. Participant response UI (Likert renderer) integration.
2. CSV export MVP for package results.
3. AI usage metering hook that writes `SPEND` transactions.
