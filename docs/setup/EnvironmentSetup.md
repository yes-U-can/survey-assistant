# Environment Setup (Survey Assistant)

## Snapshot Date
- 2026-03-04

## 1) Safety First
- 절대 업로드 금지: 레거시 DB, 응답 원본, 개인정보/접속로그
- 커밋 전 검사:
  - `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repo-safety.ps1`

## 2) GitHub
- Repository: `yes-U-can/survey-assistant` (public)
- Remote: `origin -> https://github.com/yes-U-can/survey-assistant.git`
- 원칙: 민감 데이터는 `archive/` 보관 + `.gitignore` 제외 유지

## 3) Vercel
- Project: `survey_sicp`
- Production URL: `https://surveysicp.vercel.app`
- GitHub repository connection: connected
- Current inspect result:
  - Root Directory: `apps/web`
  - Framework Preset: `Next.js`
- Env status:
  - `DATABASE_URL`, `DIRECT_URL` set for `development`, `preview`, `production`

## 4) Neon
- Organization: `SICP (org-spring-mountain-53946345)`
- Project: `survey-sicp`
- Region: `aws-us-east-1`
- Prisma migration applied: `20260304044123_init_core`
- 주의: DB 접속 문자열은 비밀정보이므로 커밋 금지

## 5) Package Manager Baseline
- Standard: `pnpm` (via `corepack`)
- Root `package.json` includes:
  - `"packageManager": "pnpm@10.17.0"`
- Lockfile policy:
  - Keep: `/pnpm-lock.yaml`
  - Block: `**/package-lock.json`, `**/yarn.lock`

## 6) Local Env Template
- 루트 `.env.example`를 복사해 `.env`로 사용
- 실제 비밀값은 로컬/Vercel 환경변수에만 저장

## 7) CLI Note on Windows PowerShell
- 실행 정책으로 `vercel`/`neon` ps1이 막히는 경우가 있음
- 이 경우 `vercel.cmd`, `neon.cmd`를 사용

## 8) Next Actions
1. Auth split 구현 시작 (관리자 Google SSO / 피검자 anonymous-style)
2. Participant/Admin 기본 화면 + API 골격 구현
3. CSV export MVP 구현