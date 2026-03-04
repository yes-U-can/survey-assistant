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

## Vercel
This app is linked to project `survey_sicp`.
- GitHub repository is connected.
- Root Directory: `apps/web`
- Framework Preset: `Next.js`

## Auth (Current Baseline)
- Admin / Platform Admin: Google sign-in (`/api/auth/signin/google`)
- Participant: credentials sign-in (`participant-credentials`)
- Participant signup endpoint: `POST /api/auth/participant/signup`
- Participant package enrollment endpoint: `POST /api/participant/packages/enroll`
- Participant progress endpoint: `GET /api/participant/packages`
- Participant survey load endpoint: `GET /api/participant/packages/{packageId}/survey`
- Participant response submit endpoint: `POST /api/participant/packages/respond`

## Admin APIs (Current Baseline)
- Template list/create: `GET/POST /api/admin/templates`
- Package list/create: `GET/POST /api/admin/packages`
- Package status update: `PATCH /api/admin/packages/{packageId}/status`
- Package responses CSV export: `GET /api/admin/packages/{packageId}/export?from=&to=&attempt=`
  - `from`, `to`: ISO datetime filter (`submittedAt`)
  - `attempt`: attempt number filter (`attemptNo`)
- AI analysis (BYOK/Managed with spend hook): `POST /api/admin/ai/analyze`

## Platform Admin APIs (Current Baseline)
- Overview: `GET /api/platform-admin/overview`
- Credit ledger list: `GET /api/platform-admin/credits`
- Mutate admin credits (issue/spend/refund/reward/adjustment): `POST /api/platform-admin/credits`
- Migration jobs list: `GET /api/platform-admin/migration-jobs`
- Migration status update: `PATCH /api/platform-admin/migration-jobs/{jobId}/status`

## Special Template Runtime (Participant)
- Renderer plugin registry: `src/lib/template-runtime/special-renderers.tsx`
- Built-in kinds:
  - `emotion_stimulus_judgment_v1`
  - `self_aspect_inventory_v1`
- Unknown schema kinds fall back to JSON editor renderer.

## Secrets
Do not commit `.env*` real values. Use root `.env.example` as template.
