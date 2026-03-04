# Environment Setup (Survey Assistant)

## 1) Safety First
- 절대 업로드 금지: 레거시 DB, 응답 원본, 개인정보/접속로그
- 커밋 전 검사: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\check-repo-safety.ps1`

## 2) GitHub
- Repository: `yes-U-can/survey-assistant` (public)
- 원칙: 민감 데이터는 `archive/` 보관 + `.gitignore` 제외 유지

## 3) Vercel
- Linked project: `survey_sicp`
- Link command (already done in `apps/web`):
  - `vercel link --yes --project survey_sicp`

## 4) Neon
- Organization: `SICP (org-spring-mountain-53946345)`
- Project: `survey-sicp`
- Region: `aws-us-east-1`
- 주의: DB 접속 문자열은 비밀정보이므로 커밋 금지

## 5) Local Env Template
- 루트 `.env.example`를 복사해 `.env`로 사용
- 실제 비밀값은 로컬/Vercel 환경변수에만 저장

## 6) Next Steps
1. Prisma 초기화 및 핵심 스키마 작성
2. Google SSO(관리자) + 익명형 피검자 인증 분리 구현
3. CSV export 파이프라인 MVP 구현
