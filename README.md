# Survey Assistant (설문조사 도우미)

오픈소스 설문조사 미들웨어 프로젝트.

## Vision
- 연구소/학교/기관이 자체 설문 시스템을 운영할 수 있도록 지원
- 일반 템플릿 + 특수 템플릿 + CSV 중심 분석 워크플로우
- 향후 AI 분석 보조 기능(BYOK) 지원

## Current Repository Layout
- `apps/`: 실행 애플리케이션 (web/api)
- `packages/`: 공통 도메인/라이브러리
- `docs/planning/`: 계획, 실행 로그, 의사결정 문서
- `docs/setup/`: 연동/환경 세팅 문서
- `archive/`: 레거시/프로토타입 자산 보관 (공개 제외 대상 다수)

## Security Notice
레거시 자산에는 민감 데이터/구형 설정이 포함될 수 있습니다.
커밋 전에 반드시 `.gitignore`와 `SECURITY.md`를 확인하세요.

## Environment Bootstrap
- Web app: `apps/web` (Next.js)
- Linked Vercel project: `survey_sicp`
- Neon project: `survey-sicp` (PostgreSQL)
- Setup guide: `docs/setup/EnvironmentSetup.md`

## Open-Source Boundary
- 공개 대상: 미들웨어 코드, 문서, 샘플/더미 데이터
- 비공개 대상: 레거시 DB 덤프, 응답 원본, 개인정보/접속로그
- 특수 템플릿 구현 코드는 MIT 정책 하에 공개될 수 있으며, 의뢰 플로우에서 동의 문구를 명시한다.

## Smoke Check
- 배포 스모크 체크: `corepack pnpm smoke:web`
- 기본 대상 URL: `https://surveysicp.vercel.app`

## Quality Gate
- 로컬 검증: `corepack pnpm verify:local`
- Push 전 자동검증 훅 설치: `corepack pnpm hooks:install`

## Consistency Recovery (2026-03-04)
- 인증/권한:
  - Auth.js 유지
  - 관리자 Google 로그인은 초대 기반(`AdminInvite`)으로 통제
  - `PLATFORM_ADMIN_EMAILS`는 초기 부트스트랩 용도로만 사용
- 세션/로그아웃:
  - 세션 수명 정책(`AUTH_SESSION_MAX_AGE_SEC`, `AUTH_SESSION_UPDATE_AGE_SEC`) 명시
  - `/api/auth/signout` 링크 제거, 공통 `LogoutButton` 사용
- 경계/원장:
  - `/api/admin/*` 소유권 경계 위반 응답 통일: `404 not_found_or_no_access`
  - 원장 idempotency(`CreditTransaction.idempotencyKey`) 및 음수잔액 방지 적용
- 남용 방지:
  - 가입/로그인/코드등록/AI분석/특수의뢰 엔드포인트 rate limit 적용

## Ops Docs
- 릴리스 체크리스트: `docs/planning/ReleaseReadinessChecklist_20260304.md`
- 특수 템플릿 운영 런북: `docs/planning/OpsRunbook_SpecialTemplateWorkflow_20260304.md`
- 백업/복구 런북: `docs/planning/OpsRunbook_BackupRecovery_20260304.md`
- 장애 대응 런북: `docs/planning/OpsRunbook_IncidentResponse_20260304.md`
- 세션 종합 인수인계: `docs/planning/EndOfDay_ContextDump_20260304.md`
