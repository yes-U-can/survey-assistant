# Survey Assistant Web (`apps/web`)

Next.js App Router frontend for Survey Assistant.

## Dev
```bash
corepack pnpm install
corepack pnpm --filter web dev
```

Or from `apps/web` directly:
```bash
corepack pnpm install
corepack pnpm dev
```

## Database (Neon + Prisma)
- Prisma schema: `prisma/schema.prisma`
- Generate client: `corepack pnpm --filter web prisma:generate`
- Apply migration: `corepack pnpm --filter web prisma:migrate:dev -- --name <migration_name>`
- DB health endpoint: `/api/health/db`

## Locale
- Default redirect: `/` -> `/ko`
- Supported locales: `/ko`, `/en`
- Mobile policy:
  - Participant flow: mobile + desktop supported
  - Admin / Platform Admin / Admin sign-in: desktop-only (mobile shows policy notice)

## Vercel
This app is linked to project `survey_sicp`.
- GitHub repository is connected.
- Root Directory: `apps/web`
- Framework Preset: `Next.js`

## Security Baseline
- Response headers:
  - `Content-Security-Policy`
  - `Strict-Transport-Security` (production only)
  - `X-Content-Type-Options`, `X-Frame-Options`
  - `Referrer-Policy`, `Permissions-Policy`
- `poweredByHeader` disabled
- Mutating APIs emit structured audit logs (`src/lib/audit-log.ts`)

## Auth (Current Baseline)
- Admin / Platform Admin: Google sign-in (`/api/auth/signin/google`)
- Participant: credentials sign-in (`participant-credentials`)
- Admin onboarding policy:
  - Existing active admin account: allowed
  - Valid invite required for new Google admin login
  - Uninvited admin login is blocked (`admin_not_invited`)
- Participant signup endpoint: `POST /api/auth/participant/signup`
- Participant package enrollment endpoint: `POST /api/participant/packages/enroll`
- Participant progress endpoint: `GET /api/participant/packages`
- Participant survey load endpoint: `GET /api/participant/packages/{packageId}/survey`
- Participant response submit endpoint: `POST /api/participant/packages/respond`

### Google OAuth Setup (Required Redirect URIs)
- Production callback URI: `https://surveysicp.vercel.app/api/auth/callback/google`
- Local callback URI: `http://localhost:3000/api/auth/callback/google`
- If you access a random deployment URL (`https://surveysicp-*.vercel.app`), Google can return `redirect_uri_mismatch`.
  - Use canonical domain `https://surveysicp.vercel.app` for admin login.
  - App-level canonical redirect is enforced from `src/proxy.ts` using `NEXTAUTH_URL`.
- Manual release verification checklist:
  - `docs/planning/OAuthManualChecklist_20260304.md`

## Admin APIs (Current Baseline)
- Template list/create: `GET/POST /api/admin/templates`
- Package list/create: `GET/POST /api/admin/packages`
- Package status update: `PATCH /api/admin/packages/{packageId}/status`
- Package responses CSV export: `GET /api/admin/packages/{packageId}/export?from=&to=&attempt=`
  - `from`, `to`: ISO datetime filter (`submittedAt`)
  - `attempt`: attempt number filter (`attemptNo`)
- AI analysis (BYOK/Managed with spend hook): `POST /api/admin/ai/analyze`
  - Managed credit policy: immediate charge (`SPEND`) and automatic `REFUND` on failure
  - Charge amount: `AI_MANAGED_CREDIT_PER_REQUEST`
- Special template requests: `GET/POST /api/admin/special-requests`
  - Request UI enforces explicit consent that deliverable source may be published under MIT.
  - Source publication and credit compensation are handled as separate policy tracks.
- Store listings: `GET/POST /api/admin/store/listings`
- Store listing update: `PATCH /api/admin/store/listings/{listingId}`
- Store purchases: `GET/POST /api/admin/store/purchases`
- Participant accounts list: `GET /api/admin/participants`
- Participant account status update: `PATCH /api/admin/participants/{participantId}` (`ACTIVATE`/`DEACTIVATE`/`ANONYMIZE`)
  - `ANONYMIZE` is soft anonymization: response/enrollment data is preserved, login identifiers are cleared.

## Platform Admin APIs (Current Baseline)
- Admin invite list/create: `GET/POST /api/platform-admin/admin-invites`
- Admin invite update: `PATCH /api/platform-admin/admin-invites/{inviteId}`
- Overview: `GET /api/platform-admin/overview`
- Credit ledger list: `GET /api/platform-admin/credits`
- Mutate admin credits (issue/spend/refund/reward/adjustment): `POST /api/platform-admin/credits`
- Migration jobs list: `GET /api/platform-admin/migration-jobs`
- Migration status update: `PATCH /api/platform-admin/migration-jobs/{jobId}/status`
- Special template requests: `GET /api/platform-admin/special-requests`
- Special request status update: `PATCH /api/platform-admin/special-requests/{requestId}/status`
- Store settlement summary: `GET /api/platform-admin/store/settlements`

## Special Template Runtime (Participant)
- Renderer plugin registry: `src/lib/template-runtime/special-renderers.tsx`
- Built-in kinds:
  - `emotion_stimulus_judgment_v1`
  - `self_aspect_inventory_v1`
- Unknown schema kinds fall back to JSON editor renderer.

## Secrets
Do not commit `.env*` real values. Use root `.env.example` as template.

## Session/Auth Env
- `AUTH_SESSION_MAX_AGE_SEC` (default `604800`)
- `AUTH_SESSION_UPDATE_AGE_SEC` (default `86400`)
- `AUTH_PARTICIPANT_LOGIN_RATE_LIMIT` (default `10`)
- `AUTH_PARTICIPANT_LOGIN_WINDOW_SEC` (default `60`)

## Platform Alert Thresholds (Optional)
- `PLATFORM_ALERT_MIN_TOTAL_CREDITS` (default `500`)
- `PLATFORM_ALERT_MAX_OPEN_SPECIAL_REQUESTS` (default `12`)
- `PLATFORM_ALERT_MAX_RUNNING_MIGRATIONS` (default `5`)
- `PLATFORM_ALERT_MAX_FAILED_MIGRATIONS` (default `3`)
- `PLATFORM_ALERT_STALE_SPECIAL_REQUEST_DAYS` (default `14`)
- `PLATFORM_ALERT_MAX_STALE_SPECIAL_REQUESTS` (default `0`)

## E2E Smoke
- Run: `corepack pnpm --filter web e2e:smoke`
- File: `apps/web/e2e/smoke.spec.ts`

## Legal Pages
- `/{locale}/legal/privacy`
- `/{locale}/legal/terms`

## Ops Runbooks
- `docs/planning/OpsRunbook_BackupRecovery_20260304.md`
- `docs/planning/OpsRunbook_IncidentResponse_20260304.md`
