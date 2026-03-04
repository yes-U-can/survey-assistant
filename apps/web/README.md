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

## Secrets
Do not commit `.env*` real values. Use root `.env.example` as template.
