# Survey Assistant (설문조사 도우미)

오픈소스 설문조사 미들웨어 프로젝트.

## Free Core (Open-Source Baseline)
이 저장소에서 무료로 완결하려는 핵심 기능은 다음입니다.

- 일반 리커트 척도 템플릿 제작
- 템플릿을 묶은 패키지 생성 및 설문 실행
- 패키지 결과 다운로드
  - 기본: ZIP 번들
  - 호환: 단일 master CSV(`format=csv`)
- 연구자가 자신의 API 키(BYOK)를 넣고 웹앱 안에서 패키지 데이터와 AI 대화

즉, `설문 실행 -> 결과 다운로드 -> BYOK AI 해석`까지가 무료 코어입니다.

## Vision
- 연구소/학교/기관이 자체 설문 시스템을 운영할 수 있도록 지원
- 일반 템플릿 + 특수 템플릿 + CSV 중심 분석 워크플로우
- 패키지 데이터를 `ZIP + master CSV`로 내보내고 재사용
- SkillBook을 통해 연구 방법론을 저장/재사용/유통
- 연구자 BYOK AI와 플랫폼 제공 AI를 분리한 하이브리드 구조

## Current Product Shape
- Participant
  - 익명형 가입/로그인
  - 참여코드 등록
  - 설문 응답 및 응답 진행상태 확인
- Research Admin
  - 리커트 템플릿 생성
  - 패키지 생성/상태 관리
  - 결과 export(ZIP / master CSV)
  - BYOK AI chat(OpenAI / Gemini / Anthropic)
  - SkillBook 작성/컴파일/선택
  - SPECIAL 템플릿 의뢰 및 스토어
- Platform Admin
  - 운영 콘솔
  - 크레딧/정산/운영 현황 확인
  - SkillBook 정산 요약 확인

## Export Contract
패키지 결과 기본 다운로드는 ZIP입니다.

- `00_package_overview.csv`
- `01_attempts.csv`
- `02_codebook.csv`
- `90_responses_long.csv`
- 템플릿별 wide CSV

`format=csv`를 붙이면 `90_responses_long.csv`와 같은 master CSV 1개만 받습니다.

## AI and SkillBook
- 무료 코어 AI:
  - 연구자가 자기 API 키를 넣어 대화형으로 사용
  - 지원 provider: OpenAI / Gemini / Anthropic
  - API 키는 DB에 저장하지 않음
- 유료 BM AI:
  - 플랫폼 제공 AI 키를 `크레딧`으로 사용하는 Managed AI chat
  - SkillBook Builder가 연구 메모를 SkillBook 초안으로 변환
  - 정책:
    - 실행 시작 시 즉시 차감
    - 실패 시 자동 환불
- SkillBook:
  - 연구 방법론/해석 지침을 저장하는 AI용 지식 자산
  - 현재 범위:
    - 관리자 CRUD
    - compile
    - AI chat에 선택 적용
    - listing / purchase / settlement foundation
    - Builder 초안 생성 및 저장
  - 후속 범위:
    - 플랫폼 크레딧 과금
    - 실결제 / 구독

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
  - 현재 포함:
    - web lint
    - web build
    - participant smoke e2e
    - admin free-core e2e
    - oauth contract e2e
- Push 전 자동검증 훅 설치: `corepack pnpm hooks:install`
- 추가 E2E:
  - `corepack pnpm --filter web e2e:smoke`
  - `corepack pnpm --filter web e2e:admin-core`
  - `corepack pnpm --filter web e2e:admin-paid`
  - `corepack pnpm --filter web e2e -- e2e/oauth-contract.spec.ts`

## OAuth Contract Test
- 로컬 실행: `corepack pnpm --filter web e2e -- e2e/oauth-contract.spec.ts`
- CI 워크플로: `.github/workflows/web-e2e-oauth-contract.yml`
- 범위: Google OAuth 계약(redirect/callback/error mapping) 자동검증

## Release Automation
- 태그를 push하면 GitHub Release draft가 자동 생성됩니다.
- 워크플로: `.github/workflows/release-on-tag.yml`
- 운영 절차:
  1. `git tag <tag-name>`
  2. `git push origin <tag-name>`
  3. 생성된 draft release에서 notes 확인 후 publish

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
