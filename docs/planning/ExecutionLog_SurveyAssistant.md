# Survey Assistant - Execution Log & Feedback Loop

- Last Updated: 2026-03-04
- Purpose: 세션 간 연속성 보장, 다른 AI/개발자 인수인계, 계획-구현 정합성 점검

## 1) How to Use This Log

- 새 작업 시작 전:
  - MasterPlan 문서 확인
  - 이 Log의 "Current Focus" 및 "Open Decisions" 확인
- 작업 종료 시:
  - "Work Session Entry" 템플릿으로 기록
  - 변경된 결정/범위/리스크 반영

## 2) Current Focus

- 오픈소스 미들웨어를 최종 목표로 확정
- 역할 3분할 확정: 피검자 / 관리자 / 플랫폼 어드민
- 산출물 CSV 우선 정책 확정
- 특수 템플릿 + 스토어 + 크레딧 경제 시스템 도입 방향 확정
- BYOK 기반 AI 분석 도입 방향 확정

## 3) Verified Environment Facts

- Vercel CLI installed: 50.25.6
- Neon CLI installed: 2.21.2
- neonctl installed: 2.21.2
- Git repository initialized and connected to `yes-U-can/survey-assistant`

## 4) Open Decisions

- Auth provider final choice (Auth.js vs Clerk)
- Monorepo tooling choice (pnpm/turborepo 여부)
- AI adapter 패키지 분리 수준
- 크레딧 과금 정책(의뢰/등록/다운로드 각각)
- 스토어 공개 정책(검수 기준, 라이선스 형태)

## 5) Feedback Loop Protocol

### 5.1 Cadence
- 매 작업 단위 종료마다 보고
- 큰 기능 완료 시 요약 보고 + 변경요청 수렴

### 5.2 Mandatory Checkpoints
1. 계획 정합성 체크
- 이번 변경이 MasterPlan의 어떤 항목을 만족하는가?
- 벗어난 항목이 있는가?

2. 품질 체크
- 기능 테스트 결과
- 보안/개인정보 리스크

3. 문서 동기화
- 결정사항 반영 여부
- 미결정/리스크 업데이트 여부

### 5.3 Report Template (to owner)
- 목표 대비 진행률:
- 이번 작업 결과:
- 남은 이슈:
- 결정 필요 사항:
- 제안 변경사항:

## 6) Work Session Entry Template

### Session
- Date:
- Owner Request:
- Working Branch:

### Planned
1.
2.
3.

### Done
1.
2.
3.

### Verification
- Tests run:
- Manual checks:
- Known gaps:

### Decision Updates
- New decisions:
- Changed decisions:
- Deferred decisions:

### Risks / Blockers
- 

### Next Actions
1.
2.
3.

## 7) Decision Log (Initial)

- 2026-03-04: 제품명 한국어는 "설문조사 도우미"로 확정
- 2026-03-04: 영문명은 "Survey Assistant"를 우선 추천
- 2026-03-04: 최종 목표를 오픈소스 미들웨어로 확정
- 2026-03-04: 3 역할 모델 확정(피검자/관리자/어드민)
- 2026-03-04: 데이터 산출 기본 포맷 CSV 확정

## 8) Change Request Log Template

- CR-ID:
- Requested by:
- Date:
- Current behavior:
- Desired behavior:
- Impacted modules:
- Priority:
- Decision:

## 9) Handoff Notes for Any Future AI

- Do not assume GAS continuation; current direction is non-GAS open-source middleware.
- Legacy assets are reference/migration sources, not target runtime.
- Always update both MasterPlan and this ExecutionLog when scope changes.
- Keep owner in loop at every major milestone.

## 10) Scope Update (2026-03-04)
- Added localization constraint: ko default + en only
- Added auth split: Google SSO(admin), anonymous-style participant registration
- Added migration feature/service as first-class platform capability
- Reorganized repository into archive-first structure to reduce accidental disclosure risk

## 11) Policy Update (2026-03-04)
- Added explicit policy for special template source-code public disclosure under MIT.
- Added separation rule: publication vs credit compensation.
- Added dedicated migration policy docs and service direction.

## 12) Work Session Entry (2026-03-04, Setup Continuation)

### Session
- Date: 2026-03-04
- Owner Request: 민감정보 비공개 재확인 + 개발환경 세팅 지속
- Working Branch: main

### Planned
1. 민감정보 공개 여부 재검증 (local + remote)
2. Neon/Vercel 연동 상태 고정
3. 문서/환경변수 템플릿 업데이트

### Done
1. `scripts/check-repo-safety.ps1` 재실행 PASS
2. GitHub remote tree 재검증 (민감 백업/덤프 미포함 확인)
3. Neon 신규 프로젝트 생성: `survey-sicp`
4. Vercel `apps/web` 링크 완료: `survey-sicp`
5. `.env.example`, `docs/setup/EnvironmentSetup.md`, README 업데이트

### Verification
- Tests run: safety script only
- Manual checks: remote tree path inspection, git status
- Known gaps: Prisma schema 및 실제 DB 마이그레이션 미착수

### Decision Updates
- New decisions: 없음
- Changed decisions: 없음
- Deferred decisions: Neon credential rotation policy (optional)

### Risks / Blockers
- CLI 출력에 비밀값이 노출될 수 있으므로 로그 공유시 반드시 마스킹 필요

### Next Actions
1. Prisma 도입 + 초기 스키마 작성
2. Auth 분리(관리자 Google SSO / 피검자 익명형) 모델링
3. CSV export 최소 파이프라인 구현

## 13) Work Session Entry (2026-03-04, Naming/Policy Confirmation)

### Session
- Date: 2026-03-04
- Owner Request: 계획 기록 누락 방지 확인 + Vercel 프로젝트명 `survey_sicp` 정리
- Working Branch: main

### Planned
1. 핵심 정책 문서화 상태 재검증
2. Vercel 프로젝트명 정리
3. 안전검사 스크립트 오탐 수정

### Done
1. 특수 템플릿 공개/보상 분리 정책 문서 존재 확인:
   - `docs/legal/SpecialTemplatePolicy.md`
   - `docs/planning/MasterPlan_SurveyAssistant_20260304.md` 섹션 18
2. Vercel 프로젝트 `survey_sicp` 생성 및 `apps/web` 재링크 완료
3. 기존 `survey-sicp` 프로젝트 제거 완료
4. `scripts/check-repo-safety.ps1`에서 `.env.example` 오탐 수정

### Verification
- Tests run: `scripts/check-repo-safety.ps1` PASS
- Manual checks: `vercel project ls`에서 `survey_sicp`만 남았는지 확인
- Known gaps: Prisma/DB schema 미착수

### Decision Updates
- New decisions: Vercel 프로젝트 표준명은 `survey_sicp` 사용
- Changed decisions: 초기 Vercel 이름 `survey-sicp`를 `survey_sicp`로 정정
- Deferred decisions: 없음

### Risks / Blockers
- CLI 출력에 비밀값(접속정보)이 보일 수 있으므로 보고 시 마스킹 필수

### Next Actions
1. Prisma 모델 설계(roles/templates/packages/responses/credits/migration)
2. Auth 분리 구현 초안
3. CSV export MVP

## 14) Work Session Entry (2026-03-04, Full Setup Readiness)

### Session
- Date: 2026-03-04
- Owner Request: Vercel/Neon/GitHub 실연동 기준으로 작업 준비 완료
- Working Branch: main

### Planned
1. Vercel/GitHub/Neon 연동 상태 검증
2. Vercel 환경변수 주입
3. Prisma+Neon 초기 스키마 적용 및 빌드 검증

### Done
1. Vercel 프로젝트명 정리 후 `survey_sicp` 단일 유지 확인
2. Neon `survey-sicp` 연결문자열 기반 Vercel env 설정
   - `DATABASE_URL`, `DIRECT_URL` for development/production
3. Prisma 도입 및 초기 도메인 스키마 작성
   - roles/templates/packages/responses/credits/migration jobs
4. Neon DB 마이그레이션 적용
   - `20260304044123_init_core`
5. DB 헬스체크 API 추가
   - `apps/web/src/app/api/health/db/route.ts`
6. Next.js 16 권고 반영
   - `middleware.ts` -> `proxy.ts`

### Verification
- `npm run lint` PASS (`apps/web`)
- `npm run build` PASS (`apps/web`)
- `prisma migrate status` PASS (Neon up-to-date)
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions: 없음
- Changed decisions: 없음
- Deferred decisions:
  - Vercel Git auto-deploy 연결은 GitHub-Vercel 권한 승인 후 재시도

### Risks / Blockers
- Vercel `git connect`가 현재 repository access/integration 권한 문제로 실패
- Preview 환경변수는 Git 연결 전까지 브랜치 타깃 지정이 불가

### Next Actions
1. GitHub-Vercel integration 권한 승인 후 `vercel git connect` 재실행
2. preview 환경변수(`DATABASE_URL`, `DIRECT_URL`) 추가
3. Auth split 구현 시작 (Google SSO + participant anonymous-style)

## 15) Work Session Entry (2026-03-04, Baseline Stabilization)

### Session
- Date: 2026-03-04
- Owner Request: "뭐부터 할까" 기준으로 실제 개발 시작
- Working Branch: main

### Planned
1. 패키지 매니저 기준선 통일
2. 연동 상태 재검증 (GitHub/Vercel/Neon)
3. 문서 동기화

### Done
1. Root `package.json` BOM 제거 + `packageManager: pnpm@10.17.0` 고정
2. `corepack pnpm install` 완료, `pnpm-lock.yaml` 생성
3. `apps/web/package-lock.json` 제거
4. 안전 점검 PASS (`scripts/check-repo-safety.ps1`)
5. 검증 PASS (`pnpm --filter web prisma:generate`, `lint`, `build`)
6. 연동 확인:
   - GitHub remote: `yes-U-can/survey-assistant`
   - Vercel project: `survey_sicp` (GitHub connected)
   - Neon project: `survey-sicp`
7. 문서 업데이트:
   - `docs/setup/EnvironmentSetup.md`
   - `apps/web/README.md`

### Verification
- Tests run:
  - `corepack pnpm --filter web prisma:generate`
  - `corepack pnpm --filter web lint`
  - `corepack pnpm --filter web build`
  - `powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/check-repo-safety.ps1`
- Known gaps:
  - Vercel Dashboard의 `Root Directory`/`Framework Preset` 값은 아직 `.`/`Other` 상태

### Decision Updates
- New decisions:
  - 완료 전 개발 단계 표기는 버전(`v1/v2`) 대신 날짜 스냅샷 중심으로 관리
- Changed decisions: 없음
- Deferred decisions:
  - Auth UI 상세 흐름(관리자 온보딩/승인 정책)

### Risks / Blockers
- Windows PowerShell 실행정책으로 `vercel.ps1`, `neon.ps1` 직접 실행이 차단될 수 있음 (`*.cmd` 사용으로 우회 가능)

### Next Actions
1. Auth split 골격 구현 (관리자 Google SSO / 피검자 anonymous-style)
2. 역할별 접근제어 미들웨어/가드 추가
3. Participant 패키지 참여/진행현황 API + 기본 화면 착수

## 16) Work Session Entry (2026-03-04, Vercel CLI Automation)

### Session
- Date: 2026-03-04
- Owner Request: Vercel 작업도 모두 Codex가 직접 진행
- Working Branch: main

### Planned
1. Vercel 프로젝트 설정(root/framework) CLI 반영
2. Preview 환경변수 완성
3. 배포 검증

### Done
1. Vercel API PATCH로 프로젝트 설정 직접 수정
   - `rootDirectory: apps/web`
   - `framework: nextjs`
2. Preview 환경변수 반영 완료
   - `DATABASE_URL`: `development, preview`
   - `DIRECT_URL`: `development, preview`
3. 배포 파일 과다 업로드 방지 설정 추가
   - `.vercelignore`
   - `apps/web/.vercelignore`

### Verification
- `vercel project inspect survey_sicp`:
  - Root Directory = `apps/web`
  - Framework Preset = `Next.js`
- `vercel env ls`:
  - `DATABASE_URL`, `DIRECT_URL`이 `development, preview, production` 커버

### Risks / Blockers
- `vercel --prod` 로컬 업로드 배포는 Hobby 한도(`api-upload-free`, 5000+)에 도달하여 금일 제한
- 해결 방식: GitHub push 기반 자동 배포 사용

### Next Actions
1. 현재 변경사항 커밋/푸시로 Git 자동배포 트리거
2. 배포 후 `/api/health/db` 재검증
3. Auth split 구현 시작

## 17) Work Session Entry (2026-03-04, Auth Split Skeleton)

### Session
- Date: 2026-03-04
- Owner Request: 설정 작업을 Codex가 끝까지 자동 처리 + 기능 개발 착수
- Working Branch: main

### Planned
1. Auth.js 기반 인증 분리 골격 구현
2. 피검자 가입 API 추가
3. 역할별 진입 화면 골격 추가

### Done
1. Auth.js 도입 (`next-auth`) + credentials/google provider 분리
2. 피검자 가입 API 추가
   - `POST /api/auth/participant/signup`
3. 인증 라우트 추가
   - `api/auth/[...nextauth]`
4. 역할별 페이지 골격 추가
   - `/{locale}/auth/participant`
   - `/{locale}/auth/admin`
   - `/{locale}/participant`
   - `/{locale}/admin`
5. Prisma `User.passwordHash` 필드 반영
   - schema + migration SQL 기록
   - Neon DB는 `prisma db push`로 동기화 완료

### Verification
- `pnpm --filter web lint` PASS
- `pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Risks / Blockers
- Prisma `migrate dev`는 Neon advisory lock(P1002)로 불안정
- 현재는 `migration.sql` 기록 + `db push`로 스키마 동기화

### Next Actions
1. Auth 페이지 UX 개선(에러 메시지/상태/세션 표시)
2. Participant 패키지 등록/진행현황 API 착수
3. Admin 템플릿/패키지 CRUD 첫 엔드포인트 착수

## 18) Work Session Entry (2026-03-04, Participant Code Enrollment + Progress)

### Session
- Date: 2026-03-04
- Owner Request: "시작해" 이후 참가자 핵심 기능 구현 착수
- Working Branch: main

### Planned
1. 참가자 설문코드 등록 API 구현
2. 참가자 진행현황 조회 API 구현
3. 참가자 홈 화면을 실제 대시보드로 교체

### Done
1. 참가자 세션 가드 유틸 추가
   - `src/lib/session-guard.ts`
2. 참가자 진행현황 API 추가
   - `GET /api/participant/packages`
3. 참가자 설문코드 등록 API 추가
   - `POST /api/participant/packages/enroll`
4. 참가자 홈 화면 교체
   - 코드 등록 폼
   - 등록된 패키지 목록
   - 완료/남은 횟수
   - 최근 응답 일시
   - 현재 응답 가능 여부
5. 문서 업데이트
   - `apps/web/README.md` API 목록 반영

### Verification
- `pnpm --filter web lint` PASS
- `pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Risks / Blockers
- 응답 제출 API가 아직 없어서 `completedCount`/`lastRespondedAt` 갱신은 다음 단계 구현 필요

### Next Actions
1. 응답 제출 API 구현으로 `completedCount`/`lastRespondedAt` 자동 갱신
2. 관리자 템플릿/패키지 CRUD 엔드포인트 착수
3. CSV export MVP 연결

## 19) Work Session Entry (2026-03-04, Participant Response Submission API)

### Session
- Date: 2026-03-04
- Owner Request: 진행 지속 + 계획 정합성 유지
- Working Branch: main

### Planned
1. 참가자 응답 제출 API 추가
2. 제출 시 진행현황 자동 갱신
3. 배포/운영 이슈 점검

### Done
1. 참가자 응답 제출 API 추가
   - `POST /api/participant/packages/respond`
2. API 검증 규칙 추가
   - 참여 등록 여부 확인
   - ACTIVE/기간 검증
   - 응답 횟수 제한 검증
   - 패키지 템플릿 전체 제출 검증
3. 제출 처리 트랜잭션 적용
   - `Response` 다건 생성
   - `ParticipantPackage.completedCount` 증가
   - `ParticipantPackage.lastRespondedAt` 갱신
4. 운영 이슈 수정
   - Vercel `NEXTAUTH_SECRET` 누락으로 인한 500 해결
   - development/preview/production 환경변수 반영 후 production redeploy

### Verification
- `pnpm --filter web lint` PASS
- `pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS
- production health: `GET /api/health/db` -> `{"ok":true,"db":"connected"}`

### Risks / Blockers
- 실제 설문 UI(템플릿 렌더러) 연결 전이라 응답 제출은 API 중심 단계

### Next Actions
1. 템플릿 렌더러(리커트 우선)와 `respond` API 연결
2. 관리자 템플릿/패키지 CRUD 첫 엔드포인트 구현
3. CSV export MVP 구현

## 20) Work Session Entry (2026-03-04, GCloud Setup + Admin API Skeleton)

### Session
- Date: 2026-03-04
- Owner Request: 필요한 조치 전부 진행 + 다음 단계 착수
- Working Branch: main

### Planned
1. gcloud CLI 설치/로그인 확인
2. OAuth 클라이언트와 매칭되는 GCP 프로젝트 고정
3. 관리자 템플릿/패키지 API 골격 구현

### Done
1. gcloud CLI 설치 완료 (`Google Cloud SDK 559.0.0`)
2. gcloud 로그인 상태 확인 (`sicpseoul@gmail.com`)
3. OAuth client number 매칭 프로젝트 확인 및 기본 프로젝트 설정
   - project: `gen-lang-client-0562843170`
4. 관리자 API 추가
   - `GET/POST /api/admin/templates`
   - `GET/POST /api/admin/packages`
   - `PATCH /api/admin/packages/{packageId}/status`
5. 관리자 홈 페이지 한글 깨짐 수정 및 API 안내 반영
6. README 업데이트 (Admin APIs 섹션)

### Verification
- `pnpm --filter web lint` PASS
- `pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Risks / Blockers
- OAuth 동의화면이 테스트 모드이므로 테스트 사용자 등록 계정만 관리자 로그인 가능

### Next Actions
1. 관리자 API를 실제 화면(Form/Table)과 연결
2. 템플릿 리커트 빌더 최소 UI 구현
3. 패키지 활성화/종료 버튼 및 상태 전환 UX 구현

## 21) Work Session Entry (2026-03-04, Admin Dashboard UI Wiring)

### Session
- Date: 2026-03-04
- Owner Request: 계획 정합성 유지하며 계속 구현
- Working Branch: main

### Planned
1. 관리자 API를 화면에서 직접 사용할 수 있도록 연결
2. 템플릿 생성 폼(리커트/특수) 구현
3. 패키지 생성/상태변경 UI 구현

### Done
1. 관리자 대시보드 클라이언트 추가
   - `AdminDashboardClient.tsx`
2. 템플릿 생성 UI 구현
   - LIKERT: 척도/라벨/문항 입력 -> `schemaJson` 생성
   - SPECIAL: JSON 입력/검증
3. 패키지 생성 UI 구현
   - 코드/제목/모드/횟수/기간/템플릿 선택
4. 패키지 상태 전환 버튼 구현
   - DRAFT/ACTIVE/CLOSED/ARCHIVED
5. 관리자 페이지 한글 깨짐 수정 + 서버 초기데이터 로딩 연결

### Verification
- `pnpm --filter web lint` PASS
- `pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Next Actions
1. 관리자 대시보드에 템플릿/패키지 수정 기능 추가
2. 리커트 템플릿 프리뷰/응답화면 연결
3. CSV export MVP 구현

## 22) Work Session Entry (2026-03-04, Platform Admin Bootstrap)

### Session
- Date: 2026-03-04
- Owner Request: `sicpseoul@gmail.com` 계정을 플랫폼 어드민으로 등록 가능하게 설정
- Working Branch: main

### Planned
1. Google 로그인 시 이메일 기반으로 플랫폼 어드민 권한 부여
2. 환경변수 템플릿/배포 환경 반영
3. 린트/빌드/안전검사로 회귀 확인

### Done
1. 인증 로직 개선
   - `apps/web/src/lib/auth.ts`
   - `PLATFORM_ADMIN_EMAILS`(comma-separated) 파싱 추가
   - Google 로그인 시 이메일이 allowlist에 있으면 `PLATFORM_ADMIN`, 아니면 `RESEARCH_ADMIN`
   - `upsert.update.role`에도 동일 로직 적용하여 기존 계정도 재로그인 시 권한 동기화
2. 환경변수 템플릿 업데이트
   - `.env.example`에 `PLATFORM_ADMIN_EMAILS=` 추가
3. Vercel 환경 변수 반영
   - `development`: 반영 완료
   - `production`: 반영 완료
   - `preview`: Vercel CLI의 브랜치 정책으로 일반 preview 변수 추가가 차단되어 후속 조치 필요

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Notes
- 플랫폼 어드민 권한은 "DB 수동 수정"이 아니라 "해당 Google 계정으로 1회 로그인" 시 자동 적용됨
- 민감정보(레거시 백업/회원정보/IP/응답원본) 업로드 금지 원칙 유지

## 23) Work Session Entry (2026-03-04, Platform Admin Console Baseline)

### Session
- Date: 2026-03-04
- Owner Request: 프로 SaaS 방식으로 계속 구현 + 진행내역 기록 지속
- Working Branch: main

### Planned
1. 3역할 구조에서 Platform Admin 전용 기능 최소선 구현
2. Platform Admin API + 화면 추가
3. 문서/로그 동기화 + 회귀 검증

### Done
1. 세션 가드 확장
   - `requirePlatformAdminSession` 추가
2. Platform Admin API 추가
   - `GET /api/platform-admin/overview`
   - `GET/POST /api/platform-admin/credits` (초기 베이스라인)
   - `GET /api/platform-admin/migration-jobs`
   - `PATCH /api/platform-admin/migration-jobs/{jobId}/status`
3. Platform Admin 화면 추가
   - `/{locale}/platform` 페이지
   - 운영 현황/지갑 잔액/거래 내역/마이그레이션 상태 변경 UI
4. 인증 UX 보강
   - 관리자 로그인 페이지에 `callbackUrl` 처리 추가
   - `/admin`, `/platform` 미로그인 접근 시 원래 경로로 복귀 가능
5. 네비게이션 정리
   - 로케일 홈에서 Platform Admin console 링크 추가
   - 관리자 화면 footer에 Platform Admin 링크(플랫폼 어드민 계정일 때만)

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - Platform Admin 최소 운영 기능(크레딧 원장/마이그레이션 상태관리)을 코어 MVP에 포함
- Changed decisions:
  - 없음
- Deferred decisions:
  - 크레딧 차감/환불/정산 세부 정책(ISSUE 외 트랜잭션 UX)

### Risks / Blockers
- Platform Admin UI는 기능 중심 MVP이며, 디자인 시스템/접근성 고도화는 후속 단계 필요
- Preview 환경 변수(`PLATFORM_ADMIN_EMAILS`)는 Vercel branch 정책 이슈로 별도 후속 조치 필요

### Next Actions
1. Participant 설문 응답 UI(리커트 렌더러)와 응답 API 완전 연결
2. CSV export MVP(패키지 결과 다운로드) 구현
3. Platform Admin 크레딧 정책(차감/환불/정산) 확장 설계

## 24) Work Session Entry (2026-03-04, Credit Model Correction to Admin Billing)

### Session
- Date: 2026-03-04
- Owner Request: 크레딧 모델 의도 재확인(피검자 대상 아님) + 프로 방식으로 정렬
- Working Branch: main

### Planned
1. 크레딧 모델을 관리자 과금 모델로 수정
2. 거래 유형 확장(발행/사용/환불/보상/조정)
3. 문서 정책 동기화 + 검증

### Done
1. 크레딧 원장 유틸 분리
   - `src/lib/credit-ledger.ts`
   - `ISSUE/SPEND/REFUND/REWARD/ADJUSTMENT` 공통 처리
   - 잔액 부족(`insufficient_balance`) 차단
2. Platform Admin credits API 수정
   - 대상: 관리자 계정(`RESEARCH_ADMIN`, `PLATFORM_ADMIN`)
   - `GET /api/platform-admin/credits`: 관리자 목록 + 관리자 지갑/거래 반환
   - `POST /api/platform-admin/credits`: 5개 거래 유형 처리
3. Platform Admin 콘솔 UI 수정
   - "피검자 크레딧" 개념 제거
   - 관리자 대상 거래 폼(대상 관리자/거래유형/금액/메모) 반영
4. Platform 페이지 서버 프리로드 데이터 수정
   - 관리자 기준 지갑/거래 집계로 정렬
5. 계획 문서 보강
   - `MasterPlan`에 플랫폼 제공 API 키 + 관리자 크레딧 정책 명시

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - 크레딧은 "피검자 기능"이 아니라 "관리자 과금/운영 자산"으로 고정
  - 거래 원장 최소 유형 5개 지원 고정
- Changed decisions:
  - 23번 세션의 임시 표현/해석(피검자 지급)은 폐기
- Deferred decisions:
  - 플랫폼 제공 API 키의 실제 요청 과금 단위(토큰/요청/모델별 단가) 정책

### Risks / Blockers
- Preview 환경변수 `PLATFORM_ADMIN_EMAILS`는 Vercel CLI 브랜치 정책으로 자동 일괄 반영이 제한됨(후속 자동화 필요)

### Next Actions
1. CSV export MVP 구현 (패키지 결과 다운로드)
2. 관리자 AI 호출 경로에 `SPEND` 자동 차감 훅 연결
3. Preview env 자동화 스크립트 또는 API 기반 반영 방식 확정

## 25) Work Session Entry (2026-03-04, CSV Export MVP)

### Session
- Date: 2026-03-04
- Owner Request: "계속 진행" (계획대로 다음 단계 구현)
- Working Branch: main

### Planned
1. 관리자 패키지 결과 CSV export API 구현
2. 관리자 대시보드에서 패키지별 CSV 다운로드 연결
3. 문서/검증 동기화

### Done
1. CSV export API 추가
   - `GET /api/admin/packages/{packageId}/export`
   - 소유자 범위 검증(`requireAdminSession` + package owner check)
   - CSV 기본 컬럼 + 동적 `response.*` flatten 컬럼 지원
   - UTF-8 BOM + attachment 응답 처리
2. 관리자 대시보드에 다운로드 액션 추가
   - 패키지 카드 액션 영역에 `CSV / Export CSV` 링크 추가
3. 문서 업데이트
   - `apps/web/README.md` Admin API 목록에 export endpoint 반영

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - CSV export MVP는 "응답 1행 = 템플릿 1개 응답" 형태를 기본으로 채택
  - 원본 JSON(`response_json`)과 flatten 컬럼(`response.*`)을 함께 제공
- Changed decisions:
  - 없음
- Deferred decisions:
  - 연구/분석 용 "participant-attempt wide CSV" 2차 포맷 제공 여부

### Risks / Blockers
- 템플릿별 응답 스키마가 자유형이므로 flatten 컬럼 폭이 넓어질 수 있음

### Next Actions
1. CSV export에 필터(기간/시도차수) 옵션 추가
2. 관리자 AI 호출 경로에 `SPEND` 자동 차감 훅 연결
3. Participant 리커트 응답 UI와 export 데이터 일관성 점검

## 26) Work Session Entry (2026-03-04, Participant Response UI Baseline)

### Session
- Date: 2026-03-04
- Owner Request: 계속 진행
- Working Branch: main

### Planned
1. 피검자 응답 화면(MVP) 연결
2. 패키지별 설문 로드 API 추가
3. 문서/검증 동기화

### Done
1. 설문 로드 API 추가
   - `GET /api/participant/packages/{packageId}/survey`
   - 참여 등록/상태/기간/응답횟수 제한 검증 포함
2. 피검자 대시보드 개편
   - 패키지 카드에서 `응답 시작` 버튼 제공
   - 리커트 템플릿 렌더링(문항/척도 라디오)
   - 특수 템플릿은 JSON fallback 입력으로 제출 가능
   - 기존 진행현황/코드등록 흐름 유지
3. 문서 업데이트
   - `apps/web/README.md`에 participant survey load endpoint 반영

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - 피검자 응답 MVP는 "패키지 카드 내 인라인 폼"으로 시작
  - 리커트 우선 렌더링 + 특수 템플릿 JSON fallback 전략 채택
- Changed decisions:
  - 없음
- Deferred decisions:
  - 특수 템플릿 전용 런타임(커스텀 프론트 컴포넌트 샌드박스) 도입 방식

### Risks / Blockers
- 특수 템플릿은 현재 JSON fallback이므로 UX가 제한적

### Next Actions
1. 특수 템플릿 렌더러 플러그인 인터페이스 설계
2. CSV export 필터(기간/attempt) 추가
3. AI 사용 시 `SPEND` 자동 차감 훅 연결

## 27) Work Session Entry (2026-03-04, AI Spend Hook + Admin AI Endpoint)

### Session
- Date: 2026-03-04
- Owner Request: 계속 진행
- Working Branch: main

### Planned
1. 관리자 AI 분석 호출 경로 구현
2. Managed 모드에서 자동 `SPEND` 차감 연결
3. 관리자 화면에서 실행 가능한 최소 UI 연결

### Done
1. 관리자 AI 분석 API 추가
   - `POST /api/admin/ai/analyze`
   - 입력: packageId, question, mode(BYOK/MANAGED), provider(openai), apiKey(optional)
   - 패키지 owner 검증 + 응답요약 컨텍스트 구성 후 OpenAI 호출
2. 자동 크레딧 차감 훅 연결
   - Managed 모드 성공 시 `CreditTxnType.SPEND` 기록
   - `AI_MANAGED_CREDIT_PER_REQUEST` 기반 차감 (기본 1)
   - 잔액 부족 시 `402 insufficient_balance`
3. 관리자 UI 연결
   - Admin dashboard에 AI 분석 실행 섹션 추가
   - Managed/BYOK 전환, 패키지 선택, 질문 입력, 결과/메타 표시
4. 환경변수 템플릿 보강
   - `.env.example`에 `AI_OPENAI_MODEL`, `AI_OPENAI_TEMPERATURE`, `AI_MANAGED_CREDIT_PER_REQUEST` 추가
5. 문서 업데이트
   - `apps/web/README.md` Admin API 목록에 `POST /api/admin/ai/analyze` 반영

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - AI 비용 차감 단위는 일단 "요청당 고정 크레딧"으로 운영
  - 토큰 기반 정밀 과금은 후속 단계로 이관
- Changed decisions:
  - 없음
- Deferred decisions:
  - 모델별/토큰별 차등 과금 정책

### Risks / Blockers
- OpenAI provider에 우선 연결했으므로 다중 provider 어댑터는 후속 구현 필요

### Next Actions
1. 특수 템플릿 렌더러 플러그인 인터페이스 설계/구현
2. CSV export 필터(기간/attempt) 추가
3. AI 차감 정책 고도화(토큰 기반 단가)

## 28) Work Session Entry (2026-03-04, Special Template Renderer Plugin Runtime)

### Session
- Date: 2026-03-04
- Owner Request: 계속 진행
- Working Branch: main

### Planned
1. 특수 템플릿 렌더러를 플러그인 구조로 분리
2. 피검자 응답 화면에 플러그인 런타임 연결
3. 문서화 + 회귀 검증

### Done
1. 렌더러 플러그인 런타임 추가
   - `apps/web/src/lib/template-runtime/special-renderers.tsx`
   - 인터페이스: `matches`, `createInitialDraft`, `render`, `buildResponse`
2. 내장 렌더러 추가
   - `emotion_stimulus_judgment_v1`
   - `self_aspect_inventory_v1`
   - `special.json-fallback`
3. 피검자 대시보드 연동
   - SPECIAL 템플릿 렌더링/검증/응답 빌드에 resolver 적용
4. 문서화
   - `docs/planning/SpecialTemplateRuntime.md`
   - `apps/web/README.md`에 runtime 섹션 추가

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - 특수 템플릿은 schema kind 기반 플러그인 매칭 전략으로 확정
  - 매칭 실패 시 JSON fallback 렌더러를 기본 보장
- Changed decisions:
  - 없음
- Deferred decisions:
  - 의뢰받은 특수 템플릿 코드를 별도 패키지/레포로 분리할지 여부

### Risks / Blockers
- 템플릿 schema 품질이 낮으면 fallback 비중이 높아질 수 있음

### Next Actions
1. CSV export 필터(기간/attempt) 추가
2. AI 차감 정책 고도화(토큰 기반 단가)
3. 특수 템플릿 의뢰-배포 워크플로우(소스 공개 동의) 연결

## 29) Work Session Entry (2026-03-04, Admin CSV Export Filters)

### Session
- Date: 2026-03-04
- Owner Request: 계속 진행
- Working Branch: main

### Planned
1. CSV export API에 기간/응답회차 필터 추가
2. 관리자 화면에서 필터를 설정해 다운로드하도록 연결
3. 문서/검증 동기화

### Done
1. Export API 필터 지원 추가
   - `GET /api/admin/packages/{packageId}/export`
   - 쿼리 파라미터: `from`, `to`, `attempt`
   - 유효성 검증: `invalid_from`, `invalid_to`, `invalid_range`, `invalid_attempt`
   - 필터 적용 시 파일명 suffix `_filtered` 사용
2. 관리자 대시보드 필터 UI 추가
   - 패키지 섹션에 CSV 필터 필드셋(시작일시/종료일시/응답회차) 추가
   - 패키지별 CSV 다운로드 링크가 필터 쿼리를 반영하도록 수정
   - 기간 범위 오류 시 링크 비활성화 처리
3. 문서 업데이트
   - `apps/web/README.md`에 export 필터 쿼리 규약 반영

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - CSV export는 API/화면 모두 동일 필터 파라미터(`from`, `to`, `attempt`)를 표준으로 사용
- Changed decisions:
  - 없음
- Deferred decisions:
  - 필터 프리셋(최근 7일/30일) 및 wide format 동시 export 여부

### Risks / Blockers
- `datetime-local` 입력은 사용자 로컬시간 기반이므로, 결과 해석 시 UTC 변환 기준을 운영 문서에서 안내할 필요가 있음

### Next Actions
1. AI 차감 정책 고도화(요청당 고정 -> 토큰/모델 단가 기반)
2. 특수 템플릿 의뢰-배포 워크플로우(소스 공개 동의) 연결
3. CSV export 고급 옵션(와이드 포맷/컬럼 선택) 검토

## 30) Work Session Entry (2026-03-04, Managed AI Token-Based Credit Charge)

### Session
- Date: 2026-03-04
- Owner Request: 계속 진행
- Working Branch: main

### Planned
1. Managed AI 과금 정책을 토큰 기반으로 고도화
2. 기존 요청당 고정 과금과의 하위호환 유지
3. 문서/정책 기록 동기화

### Done
1. 관리자 AI 분석 API 과금 로직 고도화
   - 파일: `apps/web/src/app/api/admin/ai/analyze/route.ts`
   - 정책:
     - 기본: `input/output per 1K tokens` 기반 차감
     - floor: `AI_MANAGED_CREDIT_MIN_PER_REQUEST`
     - fallback: `AI_MANAGED_CREDIT_PER_REQUEST`
   - 결과 메타에 `policyMode` 포함
2. 관리자 UI 메타 표시 확장
   - 파일: `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
   - AI 결과 메타에 `policy=<...>` 표시
3. 환경변수/계획 문서 업데이트
   - `.env.example` 신규 항목 추가
   - `apps/web/README.md`에 Managed 과금 변수 설명 추가
   - `MasterPlan` 섹션 21에 토큰 기반 과금 원칙 명시

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - Managed AI 과금 기본값을 토큰 단가 기반으로 전환
  - 요청당 고정값은 하위호환/fallback 용도로 유지
- Changed decisions:
  - 27번 세션의 "요청당 고정 과금 우선" 결정을 "토큰 기반 우선"으로 변경
- Deferred decisions:
  - 모델별 차등 단가 테이블(예: `gpt-4.1-mini` vs 상위 모델) 운영 방식

### Risks / Blockers
- AI 호출 후 차감 시점이므로, 사용량 대비 잔액이 부족한 케이스에서 사후 `insufficient_balance`가 발생할 수 있음(후속: 사전 hold/reservation 설계 필요)

### Next Actions
1. 특수 템플릿 의뢰-배포 워크플로우(소스 공개 동의) 연결
2. CSV export 고급 옵션(와이드 포맷/컬럼 선택) 검토
3. Managed AI 크레딧 사전 hold/reservation 설계

## 31) Work Session Entry (2026-03-04, Special Request + Store MVP + AI Billing Fix)

### Session
- Date: 2026-03-04
- Owner Request: 정정 반영 계획 구현 (의뢰/스토어/정산 + AI 즉시차감/실패환불)
- Working Branch: main

### Planned
1. Prisma 스키마 확장 및 마이그레이션
2. 특수 템플릿 의뢰 API 구현
3. 스토어/구매/정산 API 구현
4. 관리자/플랫폼 어드민 UI 연동
5. AI 과금 로직 즉시 차감 + 실패 환불로 전환

### Done
1. Prisma 스키마 확장
   - `SpecialTemplateRequestStatus` enum 추가
   - `SpecialTemplateRequest`, `TemplateStoreListing`, `TemplatePurchase` 모델 추가
   - 관계: User/Template와 연결
2. 마이그레이션 파일 추가 및 DB 적용
   - `apps/web/prisma/migrations/20260304081000_add_special_request_store_purchase/migration.sql`
   - `prisma db execute --file ...`로 적용
3. 신규 API 추가
   - 관리자:
     - `GET/POST /api/admin/special-requests`
     - `GET/POST /api/admin/store/listings`
     - `PATCH /api/admin/store/listings/{listingId}`
     - `GET/POST /api/admin/store/purchases`
   - 플랫폼 어드민:
     - `GET /api/platform-admin/special-requests`
     - `PATCH /api/platform-admin/special-requests/{requestId}/status`
     - `GET /api/platform-admin/store/settlements`
4. UI 연동
   - 관리자 콘솔:
     - 특수 템플릿 의뢰 등록(공개 동의 필수) + 의뢰 목록
     - 스토어 등록/수정/구매 + 구매/판매 내역
   - 플랫폼 어드민 콘솔:
     - 의뢰 큐 상태/메모 처리
     - 정산 요약/최근 구매/판매자별 정산
5. AI 과금 로직 정정
   - `POST /api/admin/ai/analyze` Managed 모드:
     - 시작 시 즉시 `SPEND`
     - 실패/예외 시 자동 `REFUND`
     - 토큰 사용량은 응답 메타/모니터링 용도로 유지

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - 특수 템플릿은 의뢰 기반 코드형 단일 정책으로 고정
  - 스토어 거래 대상은 SPECIAL 템플릿만 허용
  - 스토어 수수료 20%, 판매자 80% 정산 기본값 채택
  - AI Managed 과금은 즉시 차감 + 실패 환불로 고정
- Changed decisions:
  - 30번 세션의 토큰 단가 기반 과금 정책을 폐기하고, 즉시 차감/환불 정책으로 대체
  - CSV 고급 내보내기 항목은 이번 우선순위에서 제외
- Deferred decisions:
  - 환불/분쟁/정산취소 자동화는 2차 범위로 이관

### Risks / Blockers
- `prisma migrate dev`는 기존 DB 드리프트(`User.passwordHash`)로 자동 적용이 차단되어, 이번에는 마이그레이션 SQL 파일 + `db execute` 방식으로 동기화함

### Next Actions
1. 스토어 환불/분쟁 처리 정책 문서화 및 2차 범위 설계
2. 특수 템플릿 의뢰 상태 알림(이메일/내부 알림) 도입 검토
3. 구매 템플릿 버전 업그레이드/재배포 정책 정의

## 32) Work Session Entry (2026-03-04, OAuth Mismatch Triage + Brand Token Sync)

### Session
- Date: 2026-03-04
- Owner Request: 관리자 로그인 `redirect_uri_mismatch` 원인 점검 + Rorschach 프로젝트 디자인 레퍼런스 확인
- Working Branch: main

### Planned
1. Google OAuth 실패 원인 재현/확인
2. 재발 방지용 canonical domain 라우팅 추가
3. 레퍼런스 색상 토큰 반영

### Done
1. OAuth 요청값 재현 확인
   - 현재 앱이 Google로 보내는 redirect URI 확인:
     - `https://surveysicp.vercel.app/api/auth/callback/google`
   - 랜덤 배포 도메인(`surveysicp-*.vercel.app`)으로 접근 시 host 기반 callback이 달라져 mismatch 가능성 확인
2. 재발 방지 라우팅 추가
   - 파일: `apps/web/src/proxy.ts`
   - `NEXTAUTH_URL`를 canonical origin으로 사용해 비정식 host 접근 시 canonical host로 리다이렉트
3. 디자인 토큰 반영
   - 레퍼런스 확인 파일(읽기 전용): `../Computing-Program-for-Rorschach-Structural-Summary/v2-nextjs/app/globals.css`
   - 키컬러 반영:
     - `#C1D2DC` (base)
     - `#2A5F7F` (primary accent)
   - 적용 파일: `apps/web/src/app/globals.css`
4. 운영 문서 보강
   - `apps/web/README.md`에 Google OAuth Required Redirect URI 및 mismatch 주의사항 추가

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS

### Decision Updates
- New decisions:
  - 관리자 로그인 canonical domain은 `https://surveysicp.vercel.app`로 고정 운영
- Changed decisions:
  - 없음
- Deferred decisions:
  - Preview 도메인 로그인까지 허용할지(다중 redirect URI 운영 여부)는 추후 결정

### Risks / Blockers
- Vercel CLI 직접 업로드 배포는 Hobby 업로드 한도(`api-upload-free`)에 걸릴 수 있음
- Google OAuth client secret은 대화/로그에 노출되면 즉시 재발급 필요

### Next Actions
1. Google Cloud Console에서 callback URI 최종 반영 상태 점검
2. canonical domain 기준으로 관리자 로그인 정상 동작 확인
3. 관리자/피검자 화면 컴포넌트 단위로 브랜드 스타일 확장

## 33) Work Session Entry (2026-03-04, Owner Checkpoint Alignment)

### Session
- Date: 2026-03-04
- Owner Request: 계획 정합성 재확인 + 기록 지속 + 의논 필요 시 즉시 보고
- Working Branch: main

### Planned
1. 현재 구현과 확정 정책 간 정합성 재점검
2. 기록 루프 유지 상태 명시
3. 다음 구현 단계 준비

### Done
1. 정책 정합성 재확인 완료
   - 특수 템플릿: 의뢰 기반 정책 유지
   - 일반 관리자의 SPECIAL 직접 생성 차단 유지
   - 플랫폼 어드민 전용 처리 경로 유지
2. 운영 안정성 재확인
   - OAuth redirect mismatch 원인/대응 정리 완료
   - canonical domain 운영 원칙 적용 유지
3. 기록 루프 유지 선언
   - 이후 기능 단위 구현 시 본 로그에 세션 단위로 계속 누적 기록
   - 의사결정 필요 항목 발생 시 owner에게 선보고 후 진행

### Verification
- 기존 최신 검증 상태 유지:
  - `corepack pnpm --filter web lint` PASS
  - `corepack pnpm --filter web build` PASS
  - `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - 없음
- Changed decisions:
  - 없음
- Deferred decisions:
  - 없음

### Risks / Blockers
- 현재 즉시 blocker 없음

### Next Actions
1. 관리자/피검자 화면의 브랜드 스타일 확장 적용
2. 스토어/의뢰 플로우 UI 검증 시나리오 점검
3. 기능 추가 시 세션 로그 즉시 갱신 지속

## 34) Work Session Entry (2026-03-04, Brand Style Layer Expansion)

### Session
- Date: 2026-03-04
- Owner Request: "계속 진행" (계획 정합성 유지 + 기록 지속)
- Working Branch: main

### Planned
1. SICP 키컬러 기반 전역 UI 레이어 확장
2. 핵심 화면(홈/인증/관리자/피검자/플랫폼)에 공통 스타일 적용
3. 회귀 검증 + 실행로그 동기화

### Done
1. 전역 스타일 확장
   - 파일: `apps/web/src/app/globals.css`
   - 추가 내용:
     - `sa-page`, `sa-home`, `sa-home-card`, `sa-footer`, `sa-divider`, `sa-inline-message` 등 공통 클래스
     - 테이블/폼/버튼/섹션/카드 공통 룩앤필
     - 브랜드 토큰(`--brand-200`, `--brand-700`) 활용 강도 확장
2. 화면 적용
   - 홈: `apps/web/src/app/[locale]/page.tsx`
   - 관리자 로그인: `apps/web/src/app/[locale]/auth/admin/page.tsx`
   - 피검자 인증: `apps/web/src/app/[locale]/auth/participant/ParticipantAuthClient.tsx`
   - 관리자 대시보드: `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
   - 피검자 대시보드: `apps/web/src/app/[locale]/participant/ParticipantDashboardClient.tsx`
   - 플랫폼 어드민 대시보드: `apps/web/src/app/[locale]/platform/PlatformAdminClient.tsx`
   - 각 page footer/권한거부 화면 클래스 적용:
     - `apps/web/src/app/[locale]/admin/page.tsx`
     - `apps/web/src/app/[locale]/participant/page.tsx`
     - `apps/web/src/app/[locale]/platform/page.tsx`
3. 정합성 유지
   - 기존 정책(특수 템플릿 request-only, 역할 분리, OAuth canonical 운영)과 충돌 없음

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - 없음 (기존 브랜드/정책 가이드의 시각 적용 범위만 확대)
- Changed decisions:
  - 없음
- Deferred decisions:
  - 컴포넌트 단위 디자인 시스템 분리(`packages/ui`) 여부는 후속

### Risks / Blockers
- 현재 blocker 없음

### Next Actions
1. 관리자 의뢰/스토어 흐름 UX 미세조정(필드 그룹화/가독성)
2. 피검자 설문 응답 화면 모바일 터치 영역 최적화
3. 변경사항 커밋/푸시 후 배포 확인

## 35) Work Session Entry (2026-03-04, Mobile Scope Policy Enforcement)

### Session
- Date: 2026-03-04
- Owner Request: 모바일은 피검자만 지원, 관리자/어드민은 PC 웹 전용
- Working Branch: main

### Planned
1. 관리자/플랫폼/관리자 로그인 경로에 모바일 차단 UI 반영
2. 피검자 흐름은 모바일 지원 유지
3. 문서/로그 동기화 및 회귀 검증

### Done
1. 모바일 정책 스타일 클래스 추가
   - 파일: `apps/web/src/app/globals.css`
   - `sa-desktop-only`, `sa-mobile-policy-block`, `sa-mobile-policy-card` 추가
   - `@media (max-width: 1023px)`에서 desktop 섹션 숨김 + 정책 안내 노출
2. 모바일 차단 적용 라우트
   - 관리자 로그인: `apps/web/src/app/[locale]/auth/admin/page.tsx`
   - 관리자 콘솔: `apps/web/src/app/[locale]/admin/page.tsx`
   - 플랫폼 어드민 콘솔: `apps/web/src/app/[locale]/platform/page.tsx`
3. 홈 화면 안내 문구 보강
   - 파일: `apps/web/src/app/[locale]/page.tsx`
   - 관리자/플랫폼 카드에 `desktop only` 명시
4. 운영 문서 동기화
   - 파일: `apps/web/README.md`
   - mobile policy 항목 추가

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - 모바일 범위는 participant 전용으로 확정
- Changed decisions:
  - 없음
- Deferred decisions:
  - 없음

### Risks / Blockers
- 현재 blocker 없음

### Next Actions
1. 피검자 모바일 설문 응답 UI(터치영역/간격/입력 피드백) 고도화
2. 관리자/플랫폼 데스크톱 화면의 정보 밀도 개선
3. 지속적 회귀 검증 + 실행로그 업데이트

## 36) Work Session Entry (2026-03-04, Participant Mobile UX Touch Optimization)

### Session
- Date: 2026-03-04
- Owner Request: 계속 진행 (모바일은 participant만 지원)
- Working Branch: main

### Planned
1. 피검자 대시보드에서 모바일 터치/가독성 개선
2. 리커트 응답 선택 UI를 모바일 친화적으로 보정
3. 회귀 검증 + 기록 갱신

### Done
1. 피검자 대시보드 클래스 기반 리팩터링
   - 파일: `apps/web/src/app/[locale]/participant/ParticipantDashboardClient.tsx`
   - 주요 적용:
     - 코드 등록 폼, 패키지 카드, 액션 버튼, 설문 폼 영역 클래스화
     - 리커트 문항/옵션/라디오에 전용 클래스 부여
2. 모바일 터치 UX 스타일 추가
   - 파일: `apps/web/src/app/globals.css`
   - 추가 스타일:
     - `sa-participant-enroll-form`, `sa-participant-package-card`, `sa-participant-actions`
     - `sa-likert-*` 계열(옵션/라디오/레이블)
     - 모바일 브레이크포인트에서:
       - 등록/액션 버튼 100% 폭 + 최소 48px 터치 높이
       - 리커트 옵션 단일열 배치 + 터치 영역 확대
3. 정책 정합성 확인
   - 관리자/플랫폼 모바일 차단 정책(35번 세션) 유지
   - 이번 변경은 participant 흐름에만 적용

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - 없음 (기존 participant 모바일 지원 정책을 UX 수준으로 강화)
- Changed decisions:
  - 없음
- Deferred decisions:
  - participant 모바일 응답의 단계별 진행바/하단 고정 제출바 도입 여부

### Risks / Blockers
- 현재 blocker 없음

### Next Actions
1. participant 모바일 설문 진행 화면의 스텝/진척도 시각화 검토
2. 관리자/플랫폼 데스크톱 정보 밀도 미세조정
3. 변경사항 커밋/푸시 및 배포 확인

## 37) Work Session Entry (2026-03-04, Participant Survey Progress Indicator)

### Session
- Date: 2026-03-04
- Owner Request: 계속 진행
- Working Branch: main

### Planned
1. 피검자 응답 폼 내 진행 상태 시각화
2. 모바일 제출 행동 가시성 향상
3. 회귀 검증 후 배포

### Done
1. 설문 진행률 계산 로직 추가
   - 파일: `apps/web/src/app/[locale]/participant/ParticipantDashboardClient.tsx`
   - 내용:
     - 템플릿별 완료 판정(리커트/특수) 집계
     - `완료 템플릿 수 / 전체 템플릿 수 / 퍼센트` 계산
2. 진행률 UI 추가
   - 설문 폼 상단에 진행률 텍스트 + 프로그레스 바 표시
   - 접근성 속성(`role="progressbar"`, `aria-valuenow`) 반영
3. 모바일 제출 영역 가시성 보강
   - 파일: `apps/web/src/app/globals.css`
   - 내용:
     - 모바일 구간에서 제출 액션 영역 sticky 처리
     - participant 진행률 바/채움 스타일 추가

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - participant 모바일 UX는 "진행률 즉시 피드백"을 기본으로 유지
- Changed decisions:
  - 없음
- Deferred decisions:
  - 단계별 페이지네이션(템플릿 단위 1step) 도입 여부

### Risks / Blockers
- 현재 blocker 없음

### Next Actions
1. participant 모바일 설문 화면의 단계형 네비게이션 필요성 평가
2. 관리자/플랫폼 데스크톱 정보 밀도 미세조정
3. 변경사항 커밋/푸시 및 배포 확인

## 38) Work Session Entry (2026-03-04, Admin Participant Account Management MVP)

### Session
- Date: 2026-03-04
- Owner Request: 긴 작업 단위로 핵심 남은 기능 진행
- Working Branch: main

### Planned
1. 관리자 콘솔에 피검자 계정 관리 기능 추가
2. API(목록/상태변경) + 화면 연동
3. 검증/배포/기록 동기화

### Done
1. 피검자 계정 관리 API 추가
   - `GET /api/admin/participants`
   - `PATCH /api/admin/participants/{participantId}` (`ACTIVATE`/`DEACTIVATE`)
   - 파일:
     - `apps/web/src/app/api/admin/participants/route.ts`
     - `apps/web/src/app/api/admin/participants/[participantId]/route.ts`
2. 관리자 권한 범위 헬퍼 추가
   - 파일: `apps/web/src/lib/participant-admin-scope.ts`
   - 규칙:
     - Platform admin: 전체 participant 관리 가능
     - Research admin: 본인 소유 패키지와 연결된 participant만 관리 가능
3. 관리자 페이지 초기 데이터 확장
   - 파일: `apps/web/src/app/[locale]/admin/page.tsx`
   - participant 목록/카운트/최근응답 시각 포함
4. 관리자 대시보드 UI 연동
   - 파일: `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
   - 섹션 추가:
     - participant 목록 테이블
     - 계정 비활성화/복원 버튼
5. 문서 갱신
   - `apps/web/README.md`에 admin participant API 항목 추가

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - participant 계정 관리는 관리자 콘솔 MVP 범위에 포함
- Changed decisions:
  - 없음
- Deferred decisions:
  - participant 계정의 "말소(익명화/삭제)" 정책 상세(법적 보존/감사 대응 포함)

### Risks / Blockers
- "말소"는 단순 삭제 대신 데이터 보존/법적 요건 고려가 필요하여 정책 확정 전 보류

### Next Actions
1. participant 계정 "거부/말소" 정책 확정(soft-delete/anonymize 설계)
2. 관리자/플랫폼 데스크톱 화면 정보 밀도 개선
3. 변경사항 커밋/푸시 및 배포 확인

## 39) Work Session Entry (2026-03-04, Participant Soft-Anonymize + Prod Deploy)

### Session
- Date: 2026-03-04
- Owner Request: 긴 작업 단위로 남은 범위를 한 번에 밀어붙여 진행
- Working Branch: main

### Planned
1. participant 계정 관리의 "말소" 정책 공백 보완
2. 소프트 익명화(데이터 보존 + 로그인 식별정보 제거) 액션 추가
3. 검증 후 main push + production 배포 확인

### Done
1. participant 계정 PATCH 액션 확장
   - `ANONYMIZE` 액션 추가 (`ACTIVATE`/`DEACTIVATE`/`ANONYMIZE`)
   - 파일: `apps/web/src/app/api/admin/participants/[participantId]/route.ts`
   - 동작:
     - 응답/등록 데이터는 유지
     - `isActive=false`, `loginId/passwordHash/displayName/googleSub` 제거
2. participant 응답 payload 확장
   - `isAnonymized` 필드 추가
   - 파일:
     - `apps/web/src/app/api/admin/participants/route.ts`
     - `apps/web/src/app/[locale]/admin/page.tsx`
3. 관리자 UI 액션 확장
   - participant 상태 표시를 `활성/비활성/익명화됨`으로 표시
   - `말소(익명화)` 버튼 + 확인 다이얼로그 추가
   - 파일: `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
4. 문서 갱신
   - 파일: `apps/web/README.md`
   - participant PATCH API에 `ANONYMIZE` 정책 명시
5. 배포
   - `main` push 완료
   - Vercel production alias `https://surveysicp.vercel.app` 최신 배포 반영 확인

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `scripts/check-repo-safety.ps1` PASS
- `GET https://surveysicp.vercel.app/api/health/db` -> `200 {"ok":true,"db":"connected"}`

### Decision Updates
- New decisions:
  - participant "말소"는 hard delete가 아니라 soft anonymize를 기본 정책으로 채택
- Changed decisions:
  - 기존 "말소 정책 보류" 상태를 MVP 수준에서 해소
- Deferred decisions:
  - 법적 보존기한/감사 대응을 위한 추가 익명화 로그 정책

### Risks / Blockers
- 익명화 정책은 현재 "로그인 식별정보 제거" 중심 MVP이며, 법무/컴플라이언스 세부 요건은 추가 확정 필요

### Next Actions
1. 관리자/플랫폼 데스크톱 정보 밀도 개선(표 레이아웃/필드 그룹 정돈)
2. 특수 템플릿 제작 산출 코드 공개 고지 문구를 의뢰 화면에 법적 문안 수준으로 고정
3. e2e 시나리오(의뢰->스토어->구매->정산, participant 계정 복원/익명화) 자동화 범위 확정

## 40) Work Session Entry (2026-03-04, Desktop Ops Density + Consent Wording + Smoke Scope)

### Session
- Date: 2026-03-04
- Owner Request: 남은 작업을 한 번에 진행
- Working Branch: main

### Planned
1. 관리자/플랫폼 데스크톱 운영 화면 정보 밀도 개선
2. 특수 템플릿 의뢰 동의 문구를 법적 고지 수준으로 명확화
3. e2e/스모크 검증 범위 문서화 + 실행 스크립트 추가

### Done
1. Admin 콘솔 운영 요약 + 필터 추가
   - 요약 카드(템플릿/패키지/의뢰처리/스토어/피검자) 추가
   - 의뢰 상태 필터 추가
   - 피검자 검색/상태 필터(활성/비활성/익명화) 추가
   - 파일: `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
2. Platform Admin 콘솔 밀도 개선
   - 운영 현황을 카드 요약으로 전환
   - 의뢰 상태 필터, 마이그레이션 상태 필터 추가
   - 파일: `apps/web/src/app/[locale]/platform/PlatformAdminClient.tsx`
3. 공통 UI 카드 스타일 추가
   - 파일: `apps/web/src/app/globals.css`
4. 의뢰 동의 고지 강화
   - 의뢰 산출 코드의 MIT/GitHub 공개 가능성 명시
   - 소스 공개와 크레딧 보상 분리 정책 보조 문구 추가
   - 파일: `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
5. 스모크 검증 범위 고정
   - 스크립트: `scripts/smoke-web-api.ps1`
   - 실행 명령: `pnpm smoke:web`
   - 범위 문서: `docs/planning/E2E_SmokeScope_20260304.md`
   - 루트 문서 반영: `README.md`, `package.json`

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `powershell -ExecutionPolicy Bypass -File scripts/check-repo-safety.ps1` PASS
- `corepack pnpm smoke:web` PASS

### Decision Updates
- New decisions:
  - 데스크톱 운영 콘솔은 대량 데이터 전제를 기준으로 요약 카드 + 필터를 기본 UX로 채택
  - 스모크 자동검증은 "헬스 + 무인증 접근 차단"을 1차 고정 범위로 채택
- Changed decisions:
  - 없음
- Deferred decisions:
  - OAuth 브라우저 플로우 완전 자동화(e2e)는 후속

### Risks / Blockers
- OAuth/실사용 계정 기반 e2e는 비밀값/브라우저 세션 관리가 필요해 CI 자동화 범위로 바로 올리기 어려움

### Next Actions
1. 의뢰->제작->스토어 배포 운영 절차 문서(플랫폼 어드민 관점) 추가
2. 정산/크레딧 이상징후 알림(임계치) MVP 검토
3. QA 체크리스트 기반 정기 회귀 루틴 정착

## 41) Work Session Entry (2026-03-04, Ops Alerts + Release Checklist + Runbook)

### Session
- Date: 2026-03-04
- Owner Request: 남은 작업을 중간 끊김 없이 한 번에 진행
- Working Branch: main

### Planned
1. 운영 알림/이상징후 모니터링 MVP 추가
2. 출시 전 체크리스트 문서화
3. 특수 템플릿 의뢰 운영 런북 문서화

### Done
1. Platform Admin 운영 알림 MVP 추가
   - 알림 기준:
     - 관리자 총 크레딧 부족
     - 특수 의뢰 적체
     - 장기 미처리 의뢰
     - 동시 마이그레이션 과다
     - 마이그레이션 실패 과다
     - 정산 데이터 이상(구매 존재 + 수수료 0)
   - 파일:
     - `apps/web/src/app/[locale]/platform/PlatformAdminClient.tsx`
     - `apps/web/src/app/[locale]/platform/page.tsx`
     - `apps/web/src/app/globals.css`
2. 알림 임계치 환경변수 지원
   - 파일:
     - `.env.example`
     - `apps/web/README.md`
3. 릴리스 체크리스트 문서 추가
   - 파일: `docs/planning/ReleaseReadinessChecklist_20260304.md`
4. 특수 템플릿 운영 런북 문서 추가
   - 파일: `docs/planning/OpsRunbook_SpecialTemplateWorkflow_20260304.md`
5. 루트 문서 동기화
   - 파일: `README.md`

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `powershell -ExecutionPolicy Bypass -File scripts/check-repo-safety.ps1` PASS
- `corepack pnpm smoke:web` PASS

### Decision Updates
- New decisions:
  - 운영 알림은 플랫폼 어드민 콘솔 내 임계치 기반 경고 카드로 1차 적용
  - 릴리스 직전 점검은 체크리스트 문서를 단일 참조점으로 사용
- Changed decisions:
  - 없음
- Deferred decisions:
  - OAuth 브라우저 e2e 자동화(CI 통합)는 후속

### Risks / Blockers
- OAuth 브라우저 자동화는 계정/동의/시크릿 관리가 필요하여 즉시 CI 자동화로 올리기 어려움

### Next Actions
1. OAuth 포함 브라우저 e2e 자동화 전략 수립(수동+자동 분리)
2. 운영 알림 임계치 운영값(기관별) 튜닝 가이드 문서화
3. 릴리스 태그/체인지로그 자동화 스크립트 검토

## 42) Work Session Entry (2026-03-04, trust recovery + quality gate hardening)

### Session
- Date: 2026-03-04
- Owner Request: "수동으로 오류를 하나씩 찾지 않게 해달라"
- Working Branch: main

### Planned
1. 현재 코드 상태를 전체 재검증
2. 재발 방지를 위한 자동 품질게이트 추가
3. 문서(마스터플랜/실행로그) 동기화

### Done
1. 전체 재검증 수행
   - `corepack pnpm --filter web lint` PASS
   - `corepack pnpm --filter web build` PASS
   - `corepack pnpm smoke:web` PASS
   - `corepack pnpm safety:check` PASS
2. 자동 품질게이트 추가
   - 로컬 통합 검증 스크립트 추가: `scripts/verify-local.ps1`
   - 루트 스크립트 추가: `corepack pnpm verify:local`
   - pre-push 훅 추가: `.githooks/pre-push`
   - 훅 설치 스크립트 확장: `scripts/install-hooks.ps1` (pre-commit + pre-push)
   - GitHub Actions 품질게이트 추가: `.github/workflows/web-quality-gate.yml`
3. 운영 문서 반영
   - `docs/planning/MasterPlan_SurveyAssistant_20260304.md`
   - `README.md`

### Decision Updates
- New decisions:
  - Push 전 로컬 품질게이트(safety + lint + build)를 기본 정책으로 강제
  - GitHub CI에서도 동일 품질게이트를 main 브랜치 기준으로 강제
- Changed decisions:
  - 없음
- Deferred decisions:
  - OAuth 브라우저 e2e 자동화(CI)는 분리 트랙으로 후속

### Risks / Blockers
- CI 환경에서 OAuth 브라우저 플로우를 완전 자동화하려면 테스트 계정/동의 화면/시크릿 관리가 추가로 필요

### Next Actions
1. 플랫폼/관리자 핵심 시나리오 e2e(로그인 포함 제외) 자동화 추가
2. OAuth 수동 검증 체크리스트를 릴리스 절차에 고정
3. 릴리스 태그/체인지로그 자동화 스크립트 도입

## 43) Work Session Entry (2026-03-04, UX remediation + role flow clarity)

### Session
- Date: 2026-03-04
- Owner Request: "남은 4%까지 마무리하고, 역할/동선/UI를 실제 서비스 형태로 정리"
- Working Branch: main

### Planned
1. 역할 동선(피검자/관리자/플랫폼)을 화면에서 즉시 이해되게 수정
2. 공통 네비게이션/뒤로가기/로그인 UX 정리
3. 검증 후 배포 반영

### Done
1. 공통 헤더 추가
   - 파일: `apps/web/src/components/AppHeader.tsx`
   - 적용: `apps/web/src/app/[locale]/layout.tsx`
   - 내용: 이전 화면 버튼 + 역할별 빠른 진입 + ko/en 전환
2. 홈 화면 역할 CTA 전면 개편
   - 파일: `apps/web/src/app/[locale]/page.tsx`
   - 내용: 피검자/연구관리자/플랫폼어드민 각각 3단계 흐름 + 행동 유도 문구
3. 관리자 로그인 UX 정비
   - 파일: `apps/web/src/components/GoogleSignInButton.tsx`
   - 파일: `apps/web/src/app/[locale]/auth/admin/page.tsx`
   - 내용: 표준형 Google 브랜드 버튼 적용, 로그인 흐름/오류 가이드 명시
4. 피검자 인증 화면 UX 정비
   - 파일: `apps/web/src/app/[locale]/auth/participant/ParticipantAuthClient.tsx`
   - 내용: 익명형 가입 목적 설명, 단계 흐름, 필드 라벨/이동 링크 강화
5. 대시보드 역할 흐름 명시
   - 파일: `apps/web/src/app/[locale]/participant/ParticipantDashboardClient.tsx`
   - 파일: `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
   - 파일: `apps/web/src/app/[locale]/platform/PlatformAdminClient.tsx`
   - 내용: 역할별 3단계 운영 흐름 + 현재 권한 표시
6. 접근권한 부족 화면 보정
   - 파일: `apps/web/src/app/[locale]/participant/page.tsx`
   - 파일: `apps/web/src/app/[locale]/admin/page.tsx`
   - 파일: `apps/web/src/app/[locale]/platform/page.tsx`
   - 내용: 올바른 로그인 경로로 즉시 이동 링크 제공
7. 404 화면 개선
   - 파일: `apps/web/src/app/not-found.tsx`
8. 스타일 체계 확장
   - 파일: `apps/web/src/app/globals.css`
   - 내용: 헤더/CTA/흐름/인증카드/Google 버튼 스타일 추가

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `corepack pnpm verify:local` PASS
- `corepack pnpm smoke:web` PASS

### Decision Updates
- New decisions:
  - 역할 분리는 "라우팅 + 권한검사 + 화면 상단 흐름 가이드" 3중 구조로 고정
  - 관리자 OAuth 진입 버튼은 브랜드 표준형(아이콘 포함) 스타일로 고정
- Changed decisions:
  - 없음
- Deferred decisions:
  - OAuth 브라우저 e2e 자동화(CI)는 출시 자동화 트랙으로 유지

### Risks / Blockers
- OAuth 전체 자동 e2e는 계정/동의 화면 관리 이슈로 수동 점검 루프와 병행 필요

### Next Actions
1. 운영자가 요청한 상세 UI 카피 톤(문장 단위) 2차 튜닝
2. OAuth 시나리오 수동 회귀 체크리스트 문서화 강화
3. 릴리스 태그/체인지로그 자동화 스크립트 도입

## 44) Work Session Entry (2026-03-04, Consistency Recovery Reset Implementation)

### Session
- Date: 2026-03-04
- Owner Request: 기록 기반 리셋 플랜을 코드로 실제 반영(인증/세션/권한/원장/검증)
- Working Branch: main

### Planned
1. 관리자 인증 정책을 초대 기반으로 고정
2. 세션/로그아웃/인증 동선을 SaaS 운영 기준으로 보정
3. 관리자 데이터 경계 및 원장 정합성 강화
4. 최소 rate limit + 테스트/문서 동기화

### Done
1. Prisma/DB
- `User.email`, `User.lastLoginAt`, `User.disabledReason` 추가
- `CreditTransaction.idempotencyKey`(unique) 추가
- `AdminInvite`, `RateLimitBucket` 모델 추가
- `CreditWallet` 음수 잔액 방지 체크 제약 추가
- 마이그레이션 적용 완료: `20260304110500_hardening_auth_scope_ledger`

2. Auth.js 하드닝
- 관리자 Google 로그인:
  - 기존 활성 관리자만 자동 허용
  - 유효한 초대(`AdminInvite`)가 있을 때만 신규 생성/승격
  - 무초대 계정 차단(`admin_not_invited`)
  - 부트스트랩: `PLATFORM_ADMIN_EMAILS`는 초기 진입용 유지
  - 비활성 관리자 차단
- 피검자 credentials 로그인:
  - 실패 코드 세분화(`participant_invalid_credentials`, `participant_inactive`, `rate_limited:*`)
  - 로그인 성공 시 `lastLoginAt` 업데이트
- 세션 정책 명시:
  - `AUTH_SESSION_MAX_AGE_SEC`
  - `AUTH_SESSION_UPDATE_AGE_SEC`

3. 세션/로그아웃 UX
- `/api/auth/signout` 링크 제거
- `LogoutButton` 컴포넌트 도입(`signOut({ callbackUrl })`)
- `/auth/admin`, `/auth/participant` 접근 시 로그인 상태면 역할 홈 즉시 리다이렉트

4. 관리자 데이터 경계
- 유틸 추가: `src/lib/admin-scope.ts`
  - `withOwnerScope`, `withRequesterScope`, `withSellerScope`
  - `notFoundOrNoAccessResponse`
- `/api/admin/*` 경계 위반 응답 통일: `404 not_found_or_no_access`

5. 원장/과금 정합성
- `src/lib/credit-ledger.ts` 재구성:
  - 원자적 차감(조건부 debit)
  - idempotency replay 처리
  - 음수 잔액 불가
- 적용:
  - `POST /api/admin/ai/analyze` (즉시 차감 + 실패 환불 + idempotency)
  - `POST /api/admin/store/purchases` (구매 정산 idempotency)

6. Rate limiting 최소선
- 적용 엔드포인트:
  - `POST /api/auth/participant/signup`
  - participant credentials 로그인(Auth.js authorize)
  - `POST /api/participant/packages/enroll`
  - `POST /api/admin/ai/analyze`
  - `POST /api/admin/special-requests`
- 공통 응답: `429 rate_limited + retryAfterSec`

7. 검증 체계
- Playwright 스모크 추가:
  - 파일: `apps/web/e2e/smoke.spec.ts`
  - 설정: `apps/web/playwright.config.ts`
- 검증 명령:
  - `corepack pnpm --filter web lint` PASS
  - `corepack pnpm --filter web build` PASS
  - `corepack pnpm verify:local` PASS
  - `corepack pnpm smoke:web` PASS
  - `corepack pnpm --filter web e2e:smoke` PASS (1 passed, 1 skipped)

### Verification
- DB migration status: up-to-date
- App route build map에 신규 API 노출 확인:
  - `/api/platform-admin/admin-invites`
  - `/api/platform-admin/admin-invites/[inviteId]`

### Decision Updates
- New decisions:
  - 관리자 온보딩은 초대 기반을 기본으로 고정
  - `/api/admin/*` 경계 위반은 404 단일 코드(`not_found_or_no_access`)로 통일
  - AI/스토어 정산 과금은 idempotency 키를 표준 적용
- Changed decisions:
  - 기존 “이메일 allowlist 자동 승격”에서 “부트스트랩 한정”으로 축소
- Deferred decisions:
  - OAuth 브라우저 풀시나리오 자동화(CI)

### Risks / Blockers
- Playwright seeded full flow는 `DATABASE_URL`이 e2e 프로세스에 주입되지 않으면 skip됨
- OAuth 제공자 연동 테스트는 수동 체크리스트 병행이 필요

### Next Actions
1. Platform Admin UI에 `AdminInvite` 운영 섹션(목록/생성/상태수정) 연결
2. OAuth 수동 체크리스트와 e2e 결과를 Release Checklist에 고정
3. `/api/admin/*` 경계 회귀 테스트 케이스를 추가 확대

## 45) Work Session Entry (2026-03-04, Platform Admin Invite UI Wiring)

### Session
- Date: 2026-03-04
- Owner Request: "계속 해" 기준으로 리셋 플랜 후속 항목 마무리
- Working Branch: main

### Planned
1. Platform Admin 콘솔에 `AdminInvite` 운영 UI 연결
2. 서버 초기데이터 로드와 클라이언트 refresh 루프에 invite 반영
3. 콘솔 한글 문구 깨짐 구간 정리

### Done
1. Platform Admin invite UI 추가
- 파일: `apps/web/src/app/[locale]/platform/PlatformAdminClient.tsx`
- 기능:
  - 초대 생성(이메일/권한/메모/만료일수)
  - 상태 필터
  - 초대 목록 조회
  - 초대 상태/권한/메모 수정 반영
2. 데이터 로딩 루프 연결
- 초기 서버 로딩에 `adminInvites` 포함
- `refreshAll()`에서 `/api/platform-admin/admin-invites` 동기화 추가
3. 플랫폼 페이지 문자열 정리
- 파일: `apps/web/src/app/[locale]/platform/page.tsx`
- 접근권한/모바일 정책/푸터의 깨진 한글 문구를 정상 텍스트로 교체

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `corepack pnpm smoke:web` PASS
- `scripts/check-repo-safety.ps1` PASS

### Decision Updates
- New decisions:
  - 없음 (기존 정책 그대로 UI 연결만 완료)
- Changed decisions:
  - 없음
- Deferred decisions:
  - OAuth 브라우저 full e2e 자동화(CI)

### Risks / Blockers
- 초대 상태 변경 정책 중 `ACCEPTED`는 재오픈 불가이므로 UI에서도 상태변경을 제한 처리함

### Next Actions
1. lint/build 재검증 후 배포 반영 확인
2. OAuth 수동 체크리스트를 릴리스 문서에 고정
3. 관리자 권한 회귀(e2e) 케이스 확대

## 46) Work Session Entry (2026-03-04, E2E Skip Resolution + OAuth Checklist Lock)

### Session
- Date: 2026-03-04
- Owner Request: "남은 작업 있으면 마저 진행"
- Working Branch: main

### Planned
1. Playwright 스모크의 seeded flow skip 해소
2. OAuth 수동 검증 체크리스트 문서 고정
3. 문서/검증 루프 동기화

### Done
1. Playwright env 로딩 보강
- 파일:
  - `apps/web/playwright.config.ts`
  - `apps/web/e2e/smoke.spec.ts`
- 변경:
  - `@next/env`로 `.env` 자동 로딩
  - e2e DB 연결 문자열 fallback: `DATABASE_URL ?? DIRECT_URL`
  - e2e webServer 기본 `NEXTAUTH_URL`/`NEXTAUTH_SECRET` 주입
2. OAuth 수동 체크리스트 문서 추가
- 파일: `docs/planning/OAuthManualChecklist_20260304.md`
- 내용:
  - redirect URI/도메인 정책
  - 초대/비초대/비활성 관리자 로그인 검증
  - 로그아웃/세션 검증
  - 장애 시 점검 포인트
3. 릴리스/스모크 문서 연결
- 파일:
  - `docs/planning/ReleaseReadinessChecklist_20260304.md`
  - `docs/planning/E2E_SmokeScope_20260304.md`
  - `docs/planning/MasterPlan_SurveyAssistant_20260304.md`

### Verification
- `corepack pnpm --filter web e2e:smoke` PASS (`2 passed`)
- `corepack pnpm verify:local` PASS

### Decision Updates
- New decisions:
  - OAuth는 자동 E2E 대신 수동 체크리스트를 릴리스 게이트에 고정
- Changed decisions:
  - seeded participant e2e는 기본 로컬 환경에서 실행 가능 상태로 승격(skip 해소)
- Deferred decisions:
  - OAuth full browser automation의 CI 통합

### Risks / Blockers
- PostgreSQL SSL 모드 경고는 런타임 경고이며 현재 테스트 성공에는 영향 없음

### Next Actions
1. 변경사항 커밋/푸시 후 preview/prod에서 OAuth 수동 체크리스트 실행
2. 플랫폼 어드민 초대 플로우 실사용 QA(생성->수락->상태 확인) 수행
3. OAuth 자동화 여부를 후속 트랙으로 분리 검토

## 47) Work Session Entry (2026-03-04, Deployment Baseline Hardening)

### Session
- Date: 2026-03-04
- Owner Request: "부족한 부분까지 고려해서 끝까지 완성"
- Working Branch: main

### Planned
1. 배포 표준 관점의 누락 항목 정리
2. 보안/운영 기본기(헤더/감사로그/법적고지/런북) 반영
3. 빌드/스모크/e2e 재검증

### Done
1. 보안 헤더 베이스라인 적용
- 파일: `apps/web/next.config.ts`
- 항목:
  - CSP
  - HSTS(production)
  - X-Frame-Options / X-Content-Type-Options
  - Referrer-Policy / Permissions-Policy
  - `poweredByHeader` 비활성화
2. 구조화 감사로그 유틸 및 API 연동
- 신규 파일: `apps/web/src/lib/audit-log.ts`
- 연동 파일:
  - `apps/web/src/app/api/auth/participant/signup/route.ts`
  - `apps/web/src/app/api/participant/packages/enroll/route.ts`
  - `apps/web/src/app/api/admin/ai/analyze/route.ts`
  - `apps/web/src/app/api/admin/special-requests/route.ts`
  - `apps/web/src/app/api/admin/store/purchases/route.ts`
  - `apps/web/src/app/api/platform-admin/credits/route.ts`
  - `apps/web/src/app/api/platform-admin/admin-invites/route.ts`
  - `apps/web/src/app/api/platform-admin/admin-invites/[inviteId]/route.ts`
  - `apps/web/src/app/api/platform-admin/migration-jobs/[jobId]/status/route.ts`
  - `apps/web/src/app/api/platform-admin/special-requests/[requestId]/status/route.ts`
3. 법적 페이지 추가 및 UI 링크 연결
- 신규 페이지:
  - `apps/web/src/app/[locale]/legal/privacy/page.tsx`
  - `apps/web/src/app/[locale]/legal/terms/page.tsx`
- 공통 링크 컴포넌트:
  - `apps/web/src/components/LegalLinks.tsx`
- 연결:
  - `apps/web/src/app/[locale]/page.tsx`
  - `apps/web/src/app/[locale]/participant/page.tsx`
  - `apps/web/src/app/[locale]/admin/page.tsx`
  - `apps/web/src/app/[locale]/platform/page.tsx`
4. 운영 문서 보강
- 신규 문서:
  - `docs/planning/OpsRunbook_BackupRecovery_20260304.md`
  - `docs/planning/OpsRunbook_IncidentResponse_20260304.md`
- 동기화:
  - `docs/planning/ReleaseReadinessChecklist_20260304.md`
  - `docs/planning/MasterPlan_SurveyAssistant_20260304.md`
  - `README.md`, `apps/web/README.md`, `SECURITY.md`

### Verification
- `corepack pnpm verify:local` PASS
- `corepack pnpm --filter web e2e:smoke` PASS (`2 passed`)
- `corepack pnpm smoke:web` PASS

### Decision Updates
- New decisions:
  - 배포 표준 항목(보안 헤더/감사로그/법적 고지/운영 런북)을 릴리스 게이트에 포함
- Changed decisions:
  - 없음
- Deferred decisions:
  - OAuth full browser automation CI 통합(수동 체크리스트 병행 유지)

### Risks / Blockers
- PostgreSQL SSL mode 경고(`sslmode=require` alias)는 현재 기능에는 영향 없으나, 차기 pg 버전 전환 전 DSN 명시 정책(`verify-full` 또는 libpq 호환 옵션) 정리가 필요

### Next Actions
1. 운영환경에서 수동 OAuth 체크리스트 재실행
2. 크레딧/정산 API 감사로그 관측 대시보드(로그 필터) 정리
3. DSN SSL mode 경고 대응 정책 확정

## 48) Work Session Entry (2026-03-04, Commit/Push + Vercel Build Incident Fix)

### Session
- Date: 2026-03-04
- Owner Request: "커밋/푸시 해봐. 배포된 웹앱에서 확인"
- Working Branch: main

### Planned
1. 변경사항 커밋/푸시
2. 배포 실패 시 즉시 원인 분석/패치
3. 재푸시 후 배포 가능 상태 복구

### Done
1. 1차 커밋/푸시
- Commit: `552db8d`
- Message: `feat: harden auth and deployment baseline with ops docs`
- Push: `main -> origin/main` 성공
2. 배포 장애 확인(Vercel 로그)
- 에러:
  - `Cannot find module '@next/env'`
  - 위치: `apps/web/playwright.config.ts` / `apps/web/e2e/smoke.spec.ts`
3. 배포 장애 핫픽스
- 신규 파일: `apps/web/e2e/load-test-env.ts`
  - 외부 의존성 없이 `.env.local`, `.env`를 파싱/주입
- 수정 파일:
  - `apps/web/playwright.config.ts`
  - `apps/web/e2e/smoke.spec.ts`
- 결과:
  - `@next/env` import 제거
  - TypeScript 빌드 오류 제거
4. 2차 커밋/푸시
- Commit: `09f5daf`
- Message: `fix: remove @next/env dependency from playwright config`
- Push: `main -> origin/main` 성공

### Verification
- `corepack pnpm --filter web build` PASS
- `corepack pnpm verify:local` PASS
- Push 훅의 safety/lint/build 통과

### Decision Updates
- New decisions:
  - 테스트 환경 변수 로딩은 빌드 안정성을 위해 프레임워크 내부 패키지 의존 없이 자체 로더 사용
- Changed decisions:
  - 기존 e2e env 로딩 방식(`@next/env`) 폐기
- Deferred decisions:
  - 향후 중앙화된 env loader 통합 여부

### Risks / Blockers
- 없음(해당 배포 차단 이슈 해결됨)

### Next Actions
1. 배포 URL에서 UI/동선 품질 점검
2. UX 피드백 반영 라운드 진행

## 49) Work Session Entry (2026-03-04, Entry UX Direction Correction)

### Session
- Date: 2026-03-04
- Owner Request:
  - "설문조사 플랫폼 관점에서 피검자/관리자 고객 여정 분리 설계 필요"
  - "현재 디자인은 독단적 처리였는지 확인 요청"
- Working Branch: main

### Planned
1. 최초 진입 IA를 역할 여정 중심으로 재설계
2. 홈에서 목적별 선택과 고객 여정지도 제공
3. 헤더/인증 화면의 역할 문맥 강화

### Done
1. IA 정정 반영
- 홈에서 역할 분리:
  - 피검자 여정 카드
  - 연구 관리자 여정 카드
  - 플랫폼 운영 여정 맵
- "무엇을 하러 왔는가" 질문을 명시적으로 제시
2. 시각/동선 개선
- 헤더에 역할 힌트 및 active 상태 표시
- 홈 히어로 정보 구조 재정렬
- 인증 진입 화면 레이아웃 정돈
3. 기록 문서 추가
- `docs/planning/UXJourneyReference_20260304.md`
  - 역할 여정 중심 설계 원칙
  - 레퍼런스 패턴(개념 레벨)
  - 이후 확장 계획
4. 커밋/푸시
- Commit: `35b80ae`
- Message: `feat: redesign entry UX around participant and admin journeys`
- Push: `main -> origin/main` 성공

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- Push 훅 통과

### Decision Updates
- New decisions:
  - 홈 IA 우선순위를 "역할별 고객 여정 선택"으로 고정
- Changed decisions:
  - 기존 기능 나열형 홈 화면에서 목적 중심 구조로 전환
- Deferred decisions:
  - 관리자 콘솔 내부 IA(탭/정보구조) 대규모 재배치

### Risks / Blockers
- 외부 서비스의 상세 UI 패턴을 그대로 복제하는 수준의 레퍼런스 반영은 아직 미완
- 현재는 내부 요구사항 정합성 우선으로 구현

### Next Actions
1. 관리자 콘솔 IA를 운영 순서(템플릿->패키지->결과->의뢰/스토어) 중심으로 재구성
2. 피검자 모바일의 "오늘 해야 할 응답" 컴포넌트 강화

## 50) Work Session Entry (2026-03-04, End-of-Day Documentation Lock)

### Session
- Date: 2026-03-04
- Owner Request: "오늘은 여기까지. 계획/맥락/대화/작업내역을 하나도 빠짐없이 기록 후 종료"
- Working Branch: main

### Planned
1. 오늘까지의 의사결정/정정/산출물 전수 기록
2. 다음 세션에서 타 AI도 즉시 이어받을 수 있는 인수인계 문서 작성

### Done
1. 종합 컨텍스트 기록 문서 작성
- `docs/planning/EndOfDay_ContextDump_20260304.md`
- 포함 내용:
  - 프로젝트 기원(레거시/GAS 포기/오픈소스 전환)
  - 정책 잠금(역할/인증/크레딧/특수템플릿/민감데이터)
  - 구현 흐름/장애/수정 이력
  - 현재 기능 완성도와 미완 항목
  - 다음 세션 우선순위
2. MasterPlan/ExecutionLog 동기화
- Build snapshot에 오늘 정정사항 반영

### Verification
- 문서 동기화 완료(실행로그/마스터플랜/별도 종합 문서)

### Decision Updates
- New decisions:
  - 세션 종료 시점마다 "종합 컨텍스트 덤프" 문서 갱신을 운영 규칙으로 채택
- Changed decisions:
  - 없음
- Deferred decisions:
  - 없음

### Risks / Blockers
- 없음

### Next Actions
1. 다음 세션 시작 시 `EndOfDay_ContextDump_20260304.md`를 최우선 참조
2. 배포 앱에서 UX/동선 실사용 피드백 수집 후 IA 2차 정비

## 51) Work Session Entry (2026-03-05, Role Journey UX 2nd Pass + OAuth Contract Automation)

### Session
- Date: 2026-03-05
- Owner Request: 역할 여정 UX 2차 + OAuth 안정형 자동검증 + 릴리스 자동화 동시 마무리
- Working Branch: main

### Planned
1. 관리자 IA를 탭형 워크스페이스로 재구성
2. 피검자 모바일 Today Action UX 강화
3. OAuth 계약 자동검증(E2E + CI) 추가
4. 태그 기반 릴리스 드래프트 자동화
5. 문서/체크리스트 동기화

### Done
1. Admin IA 2차 정비
- `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
  - `AdminViewKey` + `?view=` URL 동기화
  - 탭 내비게이션 추가(`overview/templates/packages/results/special_store/participants`)
  - 섹션 표시를 탭 기반으로 전환(hidden gating)
  - Overview에 KPI + 빠른 이동 링크 유지
  - Results 탭에 CSV export 섹션 + AI 분석 섹션 배치
- `apps/web/src/app/[locale]/admin/page.tsx`
  - `searchParams.view` 파싱 및 초기 탭 전달

2. Participant 모바일 Today Action
- `apps/web/src/app/[locale]/participant/ParticipantDashboardClient.tsx`
  - 상단 Today Action 카드 추가
  - 응답 가능/마감 임박/최근 응답 계산(클라이언트 계산)
  - 1클릭 응답 시작 CTA + 응답 없음 시 코드 입력 유도 CTA
- `apps/web/src/app/globals.css`
  - Today 카드/CTA 스타일 및 모바일 터치 타겟(48px) 보강

3. OAuth 안정형 자동검증
- 신규: `apps/web/e2e/oauth-contract.spec.ts`
  - 관리자 로그인 페이지 렌더
  - Google 버튼 href 계약
  - `/api/auth/signin/google` redirect_uri 계약
  - 오류코드 UI 매핑(`admin_not_invited`, `admin_inactive`, `account_role_not_admin`)
- 수정: `apps/web/playwright.config.ts`
  - 계약 테스트용 fallback env 주입(로컬 재현성 강화)
- 신규 CI: `.github/workflows/web-e2e-oauth-contract.yml`

4. 릴리스 자동화
- 신규: `.github/workflows/release-on-tag.yml`
  - 태그 push 시 GitHub Release draft + autogenerated notes

5. 문서 동기화
- `docs/planning/OAuthManualChecklist_20260304.md`
  - OAuth contract automation 범위 추가
- `docs/planning/ReleaseReadinessChecklist_20260304.md`
  - OAuth contract gate 추가
- `docs/planning/MasterPlan_SurveyAssistant_20260304.md`
  - 2026-03-05 스냅샷 추가
- `README.md`
  - OAuth contract test / release automation 절차 추가

### Verification
- Pending in this entry (to run after code freeze):
  - `corepack pnpm --filter web lint`
  - `corepack pnpm --filter web build`
  - `corepack pnpm --filter web e2e -- e2e/oauth-contract.spec.ts`

### Decision Updates
- New decisions:
  - OAuth 자동화는 계약 레이어까지 CI 고정, 실제 Google 로그인은 수동 트랙 유지
- Changed decisions:
  - 관리자 화면 IA를 탭형 워크스페이스로 고정
- Deferred decisions:
  - Google 외부 UI까지 포함하는 end-to-end 계정 자동화

### Risks / Blockers
- 없음(정책 범위 내 구현)

### Next Actions
1. lint/build/e2e 실행으로 회귀 검증 완료
2. 프리뷰에서 `?view=` 공유 링크 및 모바일 Today 카드 동작 수동 확인
3. 필요 시 탭별 세부 컴포넌트 파일 분할(유지보수성)

## 2026-03-06 - Public Home Illustration Pass

### Context
- 사용자가 공개 홈 메인 카드가 너무 밋밋하다고 피드백함.
- 참고 일러스트의 핵심 톤은 다음으로 정리됨:
  - 둥근 실루엣
  - 무해하고 포근한 표정
  - 외곽선 없는 플랫 벡터
  - 분홍/보라/파랑 계열의 부드러운 파스텔 그라데이션
- 원본 이미지를 그대로 복제하지 않고, 동일한 감성만 가져온 독자 SVG 일러스트를 메인 카드에 적용하기로 결정.

### Implemented
- 신규: `apps/web/src/components/HomePortalIllustrations.tsx`
  - `ParticipantPortalIllustration`
  - `AdminPortalIllustration`
- 수정: `apps/web/src/app/[locale]/page.tsx`
  - 홈 카드별로 역할에 맞는 SVG 일러스트 연결
- 수정: `apps/web/src/app/globals.css`
  - 카드 내부를 텍스트/일러스트 2열 구성으로 재배치
  - 모바일에서는 일러스트가 카드 상단에 오도록 조정

### Verification
- `corepack pnpm --filter web lint`
- `corepack pnpm --filter web build`

### Decision Updates
- New decisions:
  - 공개 홈 메인 카드에는 사진 대신 직접 제작한 SVG 일러스트를 우선 사용
  - 일러스트는 브랜드 키컬러와 충돌하지 않도록 파스텔톤 보조색으로만 사용
- Deferred decisions:
  - 향후 카드 일러스트를 더 줄이거나 교체할지 여부는 실제 배포 화면 피드백 후 판단

### Feedback Loop Update
- 1차 SVG 시안은 색감과 무드에는 합격했지만, 인체 구조와 배경 구성이 어색하다는 피드백이 들어옴.
- 이에 따라 2차 시안에서는:
  - 전신에 가까운 형태를 버리고 상반신/소품 중심으로 단순화
  - 참여자 카드는 응답 카드/모바일, 관리자 카드는 패널/운영 화면을 더 명확히 드러내도록 재구성
  - 배경 장식도 곡선 1개와 보조 면 위주로 정리
- 이후 추가 아이디에이션을 통해 콘셉트를 다시 잠금:
  - 피검자 카드: 얼굴 있는 상반신 + 스마트폰 + 응답 UI
  - 연구관리자 카드: 얼굴 있는 상반신 + 클립보드 + 설문 패널
  - 산/해/풍경 같은 배경 요소는 사용하지 않음
- 추가 피드백:
  - 기존 시안은 여전히 역할 차이가 약했고, 배경 덩어리가 불필요하다는 지적이 있었음.
  - 이에 따라 일러스트를 다시 한 번 축소하여 `단일 타원 배경 + 상반신 + 명확한 소품`만 남김.
- 최신 피드백 반영:
  - 피검자 손의 물체가 스마트폰처럼 보이지 않고, 피검자가 실제로 응답 중인 자세처럼 보이지 않는 문제가 있었음.
  - 연구관리자 쪽도 클립보드/패널이 피검자 쪽 네모 형태와 크게 다르지 않아 역할 차이가 약했음.
  - 이에 따라 최신 시안은:
    - 피검자: 3/4 측면 얼굴 + 세로 스마트폰 + 폰 내부 응답 UI
    - 연구관리자: 안경 + 열린 노트북 + 원형 차트/지표 패널
    - 동일한 네모 소품 반복을 피하도록 재구성
- 추가 세부 피드백:
  - 피검자 캐릭터는 방향성은 좋아졌지만 눈이 하나만 보이고 입이 잘 읽히지 않았음.
  - 연구관리자 쪽은 전체 방향은 맞았으나, 노트북이 태블릿처럼 보여 더 명확한 클램셸 형태가 필요했음.
  - 차트 패널 역시 막대형보다 꺾은선 위주가 더 적합하다는 피드백이 있었음.
- 후속 디테일 피드백:
  - 피검자 얼굴의 입 위치가 얼굴 바깥으로 밀려 보이는 문제가 있어 중앙으로 재정렬함.
  - 연구관리자 쪽은 노트북의 꺾은선 그래프는 유지하고, 우측 대시보드는 막대그래프로 분리해 두 소품의 정보 구조를 구분함.
- UI 미세조정:
  - 카드 하단에 있던 `모바일` / `PC` 배지는 정보 위치가 어색하다는 판단에 따라 카드 제목 옆 인라인 배지로 이동함.
- 홈 카드 카피/행동 정리:
  - 카드 전체가 클릭 영역이므로 우측 하단 화살표는 중복 행동 표시로 판단하여 제거함.
  - 카드 제목은 `피검자 접속` / `연구자 접속`으로 단순화함.
  - 카드 설명은 한 줄로 읽히도록 더 짧은 문구로 축약함.
- 제품 방향 추가(2026-03-07):
  - 설문조사 도우미는 시니어층 친화적 제품을 목표로 하며, 큰 글자/직관적 그림/짧은 문구를 우선함.
  - 접근성은 후순위가 아니라 제품 원칙으로 관리함.
  - 향후 문항 음성 재생(TTS)은 프리미엄 BM 후보로 관리함.
- BM/제품 아이디어 추가(2026-03-07):
  - `SkillBook` 개념 도입:
    - 설문 데이터 해석 시 AI가 따라야 할 방법론/절차/연구 맥락을 담는 재사용 지식 단위
    - 연구 계획이나 방법론 문서를 기반으로 AI가 초안을 생성하고, 사용자가 편집/저장 가능
  - 문제 인식:
    - 단순 CSV + LLM 대화만으로는 사용자가 플랫폼 내부 AI 기능을 쓸 유인이 약함
    - SkillBook은 플랫폼 AI 기능의 차별화 포인트가 됨
  - 유통 모델:
    - 비공개 / 내부 공유 / 공개 스토어
  - BM 연결:
    - SkillBook 스토어 등록비
    - 판매 수수료
    - 플랫폼 제공 AI와 결합한 크레딧 사용
  - 운영 원칙 보강:
  - 무료 오픈소스 코어는 `일반 리커트 설문 운영 + CSV 다운로드 + BYOK AI 대화`까지로 고정
  - SkillBook은 무료 코어 위에 얹는 확장 계층으로 정의
  - 개인용 비공개 SkillBook은 무료 허용이 자연스럽고, 과금은 AI Builder/공개 스토어/플랫폼 제공 AI 자원 구간에 집중하는 편이 타당함
  - 즉, "지식 자체"보다 "지식 생성 보조와 유통, 플랫폼 자원 사용"이 BM 포인트임

## 52) Work Session Entry (2026-03-07, Free Core Completion + SkillBook Foundation)

### Session
- Date: 2026-03-07
- Owner Request:
  - `무료 코어 완결 + SkillBook 유료 단계 설계 일치화` 계획을 실제 코드로 구현
  - 핵심 우선순위:
    - `ZIP export + 3-provider BYOK chat`
    - SkillBook store-ready 기반 추가
- Working Branch: main

### Planned
1. 패키지 결과 export를 ZIP + master CSV 계약으로 확장
2. 관리자 AI를 BYOK multi-turn chat로 교체
3. SkillBook 스키마/API/UI/store/정산 기반 추가
4. lint/build/smoke/oauth-contract까지 검증

### Done
1. Prisma 스키마 확장
- 추가 enum:
  - `SkillBookVisibility`
  - `SkillBookStatus`
- 추가 모델:
  - `SkillBook`
  - `SkillBookSource`
  - `SkillBookListing`
  - `SkillBookPurchase`
- 마이그레이션 SQL 생성:
  - `apps/web/prisma/migrations/20260307110000_add_skillbook_models/migration.sql`
- 로컬/Neon 동기화:
  - 기존 마이그레이션 수정 이력 때문에 `migrate dev` 대신 `db push`로 안전 동기화

2. 무료 코어 export 완결
- 신규:
  - `apps/web/src/lib/package-dataset.ts`
  - `apps/web/src/lib/package-export.ts`
- 변경:
  - `GET /api/admin/packages/{packageId}/export`
- 결과:
  - 기본 응답은 ZIP
  - `format=csv`는 master long CSV 반환
  - ZIP 안에 overview/attempts/codebook/master/template-wide CSV 포함

3. 관리자 BYOK chat 구현
- 신규:
  - `apps/web/src/lib/ai/providers.ts`
  - `POST /api/admin/ai/chat`
- 지원 provider:
  - OpenAI
  - Gemini
  - Anthropic
- 보안 정책:
  - API 키는 DB 저장 안 함
  - 요청마다 전달하고 클라이언트 state에만 유지
- 데이터 주입 방식:
  - 업로드 파일 재전송이 아니라 DB에서 읽은 `master CSV + codebook`을 AI context로 사용

4. SkillBook 기반 추가
- 신규 라이브러리:
  - `apps/web/src/lib/skillbooks.ts`
- 신규 API:
  - `GET/POST /api/admin/skillbooks`
  - `PATCH /api/admin/skillbooks/{skillBookId}`
  - `POST /api/admin/skillbooks/{skillBookId}/compile`
  - `GET/POST /api/admin/skillbook-listings`
  - `PATCH /api/admin/skillbook-listings/{listingId}`
  - `POST /api/admin/skillbook-purchases`
  - `GET /api/platform-admin/skillbook-settlements`
- 신규 UI:
  - `apps/web/src/components/admin/AdminAiSkillBookPanel.tsx`
  - `apps/web/src/components/admin/AdminSkillBookStorePanel.tsx`
  - `apps/web/src/components/platform/PlatformSkillBookSettlementSection.tsx`

5. 관리자/플랫폼 콘솔 연결
- `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
  - 기존 손상된 문자열/인코딩 상태를 정리하고 UTF-8 기준으로 재작성
  - 결과 탭:
    - ZIP export
    - Master CSV export
    - SkillBook CRUD / compile / BYOK chat
  - 특수의뢰·스토어 탭:
    - 특수 템플릿 의뢰
    - 기존 SPECIAL 템플릿 스토어
    - SkillBook 스토어
- `apps/web/src/app/[locale]/platform/PlatformAdminClient.tsx`
  - SkillBook 정산 섹션 연결

6. 인코딩/빌드 안정화
- 이번 라운드 도중 일부 파일에서 invalid UTF-8 문제가 드러남
- 조치:
  - 관련 파일을 UTF-8 기준으로 재기록
  - 손상된 관리자 대시보드는 부분 수정보다 전체 재구성이 안전하다고 판단하고 재작성

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `corepack pnpm verify:local` PASS
- `corepack pnpm --filter web e2e:smoke` PASS (`2 passed`)
- `corepack pnpm --filter web e2e -- e2e/oauth-contract.spec.ts` PASS (`3 passed`)

### Decision Updates
- New decisions:
  - 무료 코어 export의 기준 형식은 `ZIP + master long CSV`로 잠금
  - SkillBook은 처음부터 store-ready 스키마로 설계하되, Builder/과금은 후속 단계로 분리
  - BYOK API 키 저장은 이번 범위에서 제외하고 요청 단위 전달로 시작
- Changed decisions:
  - 관리자 AI는 더 이상 OpenAI 단발 분석만의 개념으로 보지 않고, multi-provider BYOK chat를 무료 코어 일부로 포함
- Deferred decisions:
  - SkillBook Builder(플랫폼 키 기반 초안 생성)
  - 결제 게이트웨이/정기구독
  - BYOK 키 보관/재사용 UX

### Risks / Blockers
- Playwright 테스트는 병렬 실행 시 dev server 포트/lock 충돌이 발생함
- 운영 원칙:
  - e2e smoke와 oauth-contract는 순차 실행으로 고정하는 편이 안전

### Next Actions
1. Preview/배포 환경에서 관리자 콘솔의 ZIP export와 BYOK chat 수동 QA
2. SkillBook Builder 범위 설계(입력 원문 -> AI 초안 -> 사용자 편집)
3. 무료 코어와 유료 확장(BYOK vs 플랫폼 크레딧) 문서 분리를 README/정책 문서에 반영

## 53) Work Session Entry (2026-03-07, Admin Free-Core Regression + README Sync)

### Goal
- 2026-03-07 무료 코어 완결 라운드에서 남아 있던 두 가지 공백을 메운다.
  1. 새 기능 회귀 테스트 추가
  2. README / web README를 실제 코드 기준으로 동기화

### Completed
1. 관리자 free-core 회귀 테스트 추가
- 신규 파일:
  - `apps/web/e2e/admin-free-core.spec.ts`
- 검증 범위:
  - package export가 ZIP 번들과 master CSV를 반환하는지
  - `/api/admin/ai/chat`가 관리자 소유권 경계를 지키는지
  - SkillBook create -> compile -> listing -> purchase가 원장까지 반영되는지
- 구현 방식:
  - NextAuth JWT session cookie를 테스트에서 직접 발급해 관리자 세션을 재현
  - 외부 Google 로그인 자동화 없이 admin API 회귀를 검증

2. 테스트 실행 스크립트 추가
- `apps/web/package.json`
  - `e2e:admin-core`

3. lint 설정 보정
- `apps/web/eslint.config.mjs`
  - `test-results/**`
  - `playwright-report/**`
- 이유:
  - Playwright 산출물 폴더가 없을 때 ESLint가 scandir 에러를 내던 문제 정리

4. 로컬 검증 게이트 보강
- `scripts/verify-local.ps1`
  - 기존: lint + build
  - 변경 후:
    - lint
    - build
    - participant smoke e2e
    - admin free-core e2e
    - oauth contract e2e

5. README 동기화
- `README.md`
  - 무료 코어 범위
  - ZIP export 계약
  - BYOK AI / SkillBook 방향
  - 추가 E2E 명령
- `apps/web/README.md`
  - 새 export API
  - `/api/admin/ai/chat`
  - SkillBook API
  - platform skillbook settlements
  - free core / paid expansion boundary

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web e2e -- e2e/admin-free-core.spec.ts` PASS (`3 passed`)
- `corepack pnpm verify:local` PASS

### Notes
- 이번 admin 회귀 테스트는 실제 Google 브라우저 로그인 자동화가 아니라, JWT session cookie 생성 방식으로 관리자 API를 검증한다.
- 즉, OAuth 계약 검증과 admin API 회귀 검증을 분리해 안정적으로 유지하는 구조다.
- 후속 보정:
  - `verify-local.ps1`은 외부 명령 실패가 PowerShell 예외로 자동 전파되지 않는 문제가 있었음
  - `Invoke-Step` 래퍼를 추가해 각 단계 종료코드를 명시적으로 검사하도록 수정
  - 실제 push 과정에서 participant signup smoke가 `P2028`(transaction start timeout)로 실패하는 문제가 한 번 드러남
  - 원인:
    - `consumeRateLimit()`이 단순 카운터 업데이트에도 interactive transaction + serializable을 사용
  - 조치:
    - `apps/web/src/lib/rate-limit.ts`를 낙관적 `findUnique/create/updateMany` 재시도 방식으로 변경
    - participant smoke를 3회 반복 실행해 재현되지 않음을 확인

## 54) Work Session Entry (2026-03-07, Paid BM App Layer: Managed AI + SkillBook Builder)

### Goal
- 무료 코어 다음 단계로, 앱 내부에서 바로 쓸 수 있는 유료 BM 기능을 구현한다.
- 이번 배치의 범위는 다음으로 잠금:
  1. 플랫폼 제공 AI 키를 쓰는 Managed AI chat
  2. SkillBook Builder
  3. 관리자 자신의 크레딧 확인 UI/API
- 결제 게이트웨이/구독 청구는 이번 범위에서 제외

### Completed
1. Managed AI 공통 설정 추가
- 신규:
  - `apps/web/src/lib/ai/managed.ts`
- 역할:
  - provider별 managed API key 조회
  - provider별 managed model 조회
  - Managed AI chat / SkillBook Builder credit cost 조회

2. 관리자 Managed AI chat 확장
- 변경:
  - `POST /api/admin/ai/chat`
- 추가 기능:
  - `mode=MANAGED`
  - `X-Idempotency-Key` 요구
  - 즉시 차감(`SPEND`) + 실패 시 자동 환불(`REFUND`)
  - provider는 OpenAI / Gemini / Anthropic 중 선택 가능
- 관련 파일:
  - `apps/web/src/app/api/admin/ai/chat/route.ts`

3. 관리자 자기 지갑 조회 API 추가
- 신규:
  - `GET /api/admin/credits`
- 제공 데이터:
  - 내 지갑 잔액
  - 최근 크레딧 거래 내역
- 관련 파일:
  - `apps/web/src/app/api/admin/credits/route.ts`

4. SkillBook Builder API 추가
- 신규:
  - `POST /api/admin/skillbooks/builder`
- 동작:
  - 연구 메모 + 목표를 바탕으로 SkillBook 초안 생성
  - 즉시 차감 + 실패 시 자동 환불
  - 결과는 즉시 DB 저장하지 않고 draft로 반환
  - 사용자가 검토 후 기존 SkillBook 생성 API로 저장
- 관련 파일:
  - `apps/web/src/app/api/admin/skillbooks/builder/route.ts`

5. 관리자 UI 추가
- 신규:
  - `apps/web/src/components/admin/AdminManagedAiPanel.tsx`
- 포함 기능:
  - 내 크레딧/최근 내역
  - Managed AI chat
  - SkillBook Builder draft 생성
  - Builder draft를 private SkillBook으로 저장
- 연결:
  - `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`

6. paid-BM 회귀 테스트 추가
- 신규:
  - `apps/web/e2e/admin-paid-bm.spec.ts`
- 검증 범위:
  - `/api/admin/credits` 응답
  - Managed AI chat의 idempotency 계약
  - SkillBook Builder의 idempotency 계약
- 스크립트:
  - `apps/web/package.json` -> `e2e:admin-paid`
  - `scripts/verify-local.ps1`에 paid-BM e2e 추가

7. 문서 동기화
- `README.md`
- `apps/web/README.md`

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `corepack pnpm --filter web e2e:admin-core` PASS
- `corepack pnpm --filter web e2e:admin-paid` PASS

### Notes
- Playwright 스펙은 병렬 실행 시 dev server 포트 충돌이 다시 발생하므로, admin-core/admin-paid는 순차 실행 원칙을 유지한다.
- SkillBook Builder는 현재 `draft 생성 -> 사용자 검토 -> 저장` 구조다.
- 즉, “AI가 자동 저장”이 아니라 “AI가 초안 생성, 연구자가 검토 후 저장” 구조로 설계했다.

## 55) Work Session Entry (2026-03-07, Migration Request Intake for Research Admin)

### Goal
- 남아 있던 서비스형 기능 공백 중 `데이터 마이그레이션 의뢰` 흐름을 연구자 콘솔까지 연결한다.
- 이미 존재하던 `MigrationJob` 모델과 플랫폼 어드민 운영 API를 재사용하고, 연구자 측 `등록/조회` 진입선만 추가한다.

### Completed
1. 연구자용 migration request API 추가
- 신규:
  - `apps/web/src/app/api/admin/migration-jobs/route.ts`
- 제공 기능:
  - `GET /api/admin/migration-jobs`
  - `POST /api/admin/migration-jobs`
- 정책:
  - requester scope로 본인 의뢰만 조회
  - 생성 시 rate limit 적용
  - audit log 기록

2. 연구자 콘솔 연결
- 변경:
  - `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
- 추가 내용:
  - `특수의뢰·스토어` 탭에 데이터 마이그레이션 의뢰 폼/목록
  - 입력값:
    - 이전 시스템 이름
    - 백업 형식
    - 요청 메모
  - overview 카드에 열린 마이그레이션 의뢰 수 표시

3. 서버 초기 데이터 연결
- 변경:
  - `apps/web/src/app/[locale]/admin/page.tsx`
- 역할:
  - 연구자 본인 migration job 50건을 서버에서 읽어 초기 props로 전달

4. 회귀 테스트 확장
- 변경:
  - `apps/web/e2e/admin-free-core.spec.ts`
- 새 검증:
  - 연구자 A가 migration request를 생성 가능
  - 연구자 A 목록 조회 시 자기 의뢰만 보임
  - 연구자 B 의뢰는 노출되지 않음

5. 문서 동기화
- 변경:
  - `README.md`
  - `apps/web/README.md`
  - `docs/planning/MasterPlan_SurveyAssistant_20260304.md`

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `corepack pnpm verify:local` PASS

### Notes
- 이번 배치로 `데이터 마이그레이션`은 "자동 변환기"가 아니라 우선 `서비스 의뢰 intake` 단계까지 구현됐다.
- 즉, 현재 제품 수준은:
  - 연구자: 의뢰 등록/조회
  - 플랫폼 어드민: 운영 큐 조회/상태 변경
- 실제 파일 업로드/매핑/자동 변환 워크플로는 후속 단계다.

## 56) Work Session Entry (2026-03-07, Subscription + Credit Top-up Billing Operations)

### Goal
- 유료 BM에서 비어 있던 `구독/결제 운영층`을 구현한다.
- 외부 결제 게이트웨이 연동 전 단계로, 앱 내부에서 실제로 운영 가능한 흐름을 잠근다.
- 목표 범위:
  1. 플랜 카탈로그
  2. 연구자 결제 요청(구독 / 크레딧 충전)
  3. 플랫폼 어드민 승인/이행

### Completed
1. Billing 스키마 추가
- 변경:
  - `apps/web/prisma/schema.prisma`
- 신규 enum:
  - `BillingPlanCode`
  - `BillingRequestType`
  - `BillingRequestStatus`
- 신규 모델:
  - `BillingProfile`
  - `BillingRequest`

2. 플랜 카탈로그 정의
- 신규:
  - `apps/web/src/lib/billing/plans.ts`
- 기본 플랜:
  - `FREE`
  - `CLOUD_BASIC`
  - `CLOUD_PRO`

3. 연구자 결제 API 추가
- 신규:
  - `apps/web/src/app/api/admin/billing/route.ts`
  - `apps/web/src/app/api/admin/billing/requests/route.ts`
- 제공 기능:
  - 현재 플랜/크레딧/최근 결제 요청 조회
  - 구독 요청 생성
  - 크레딧 충전 요청 생성

4. 플랫폼 어드민 결제 운영 API 추가
- 신규:
  - `apps/web/src/app/api/platform-admin/billing/profiles/route.ts`
  - `apps/web/src/app/api/platform-admin/billing/requests/route.ts`
  - `apps/web/src/app/api/platform-admin/billing/requests/[requestId]/route.ts`
- 제공 기능:
  - 구독 프로필 조회
  - 결제 요청 큐 조회
  - 상태 변경
  - `FULFILLED` 처리 시:
    - 구독 요청: `BillingProfile` 갱신
    - 크레딧 요청: 원장 발행(`ISSUE`)

5. 연구자 콘솔 UI 추가
- 신규:
  - `apps/web/src/components/admin/AdminBillingPanel.tsx`
- 연결:
  - `apps/web/src/app/[locale]/admin/AdminDashboardClient.tsx`
- 포함 기능:
  - 플랜 카탈로그
  - 구독 플랜 요청
  - 크레딧 충전 요청
  - 최근 결제 요청 확인

6. 플랫폼 어드민 콘솔 UI 추가
- 신규:
  - `apps/web/src/components/platform/PlatformBillingOpsSection.tsx`
- 연결:
  - `apps/web/src/app/[locale]/platform/PlatformAdminClient.tsx`
- 포함 기능:
  - 유료 플랜 계정 요약
  - 구독 프로필 목록
  - 결제 요청 큐 처리

7. DB 반영
- `prisma migrate dev`는 기존 migration drift 때문에 사용 불가
- 이번에도 기존 운영 원칙대로 `prisma db push`로 실제 DB를 schema에 맞춤

8. paid-BM 회귀 테스트 확장
- 변경:
  - `apps/web/e2e/admin-paid-bm.spec.ts`
- 새 검증:
  - 연구자 billing overview 조회
  - 구독 요청 생성
  - 크레딧 충전 요청 생성
  - 플랫폼 어드민 fulfillment 후:
    - `BillingProfile.planCode` 반영
    - wallet balance 증가

9. 문서 동기화
- 변경:
  - `README.md`
  - `apps/web/README.md`
  - `docs/planning/MasterPlan_SurveyAssistant_20260304.md`

### Verification
- `corepack pnpm --filter web lint` PASS
- `corepack pnpm --filter web build` PASS
- `corepack pnpm --filter web e2e:admin-paid` PASS (`4 passed`)
- `corepack pnpm verify:local` PASS

### Notes
- 이번 배치까지 구현된 것은 `앱 내부 유료 BM 운영층`이다.
- 즉, 현재 가능한 것:
  - 플랜 요청
  - 크레딧 충전 요청
  - 플랫폼 어드민 승인/이행
  - 이행 결과가 실제 프로필/지갑에 반영
- 아직 남은 것은 외부 카드 결제/정기결제 인프라다.

## 57) Work Session Entry (2026-03-07, Naver OAuth Preparation + Payment Gateway Deferral)
### Summary
- Decision updated:
  - external payment gateway implementation remains intentionally deferred until PortOne/PG review is complete
  - current billing UX should clearly communicate `request intake now, hosted checkout later`
- In the same pass, admin OAuth was generalized from Google-only to Google+Naver-ready.

### Completed
1. Admin OAuth generalized
- changed `apps/web/src/lib/auth.ts`
- added conditional Naver provider support via `next-auth/providers/naver`
- admin invite/bootstrap policy remains the same for both providers
- same invited account can now be linked by email to Google and Naver separately
- new DB field added:
  - `User.naverSub String? @unique`

2. Admin sign-in UI updated
- changed `apps/web/src/app/[locale]/auth/admin/page.tsx`
- added Naver sign-in button alongside Google when env vars exist
- copy updated from Google-only to generic admin OAuth flow
- mobile policy remains desktop-only for admin/platform roles

3. Naver button component and styles added
- new file:
  - `apps/web/src/components/NaverSignInButton.tsx`
- changed:
  - `apps/web/src/app/globals.css`
- added:
  - oauth button row layout
  - Naver green button style

4. Billing UI clarified as deferred-checkout state
- changed:
  - `apps/web/src/components/admin/AdminBillingPanel.tsx`
  - `apps/web/src/components/platform/PlatformBillingOpsSection.tsx`
- added explanatory text that:
  - PortOne/PG review is pending
  - plan/top-up flows currently create requests
  - hosted checkout / recurring billing hooks will be connected later

5. OAuth contract test expanded
- changed:
  - `apps/web/e2e/oauth-contract.spec.ts`
  - `.github/workflows/web-e2e-oauth-contract.yml`
- now covers:
  - configured provider buttons on admin sign-in page
  - Google redirect contract
  - Naver redirect contract when env exists

6. Env/docs updated
- changed:
  - `.env.example`
  - `docs/setup/EnvironmentSetup.md`
  - `README.md`
- added `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
- documented payment gateway boundary as deferred

7. Stability fix discovered during verification
- `SkillBook purchase` flow hit Prisma interactive transaction timeout during admin-core e2e
- fixed by increasing transaction `maxWait` / `timeout` in:
  - `apps/web/src/app/api/admin/skillbook-purchases/route.ts`
  - `apps/web/src/app/api/admin/store/purchases/route.ts`
- result: purchase ledger regression is stable again

### Verification
- `corepack pnpm --filter web exec prisma generate` PASS
- `corepack pnpm --filter web exec prisma db push --accept-data-loss` PASS
- `corepack pnpm verify:local` PASS
  - lint PASS
  - build PASS
  - participant smoke PASS
  - admin free-core PASS
  - admin paid-BM PASS
  - oauth contract PASS

### Notes
- external payment modal/hosted checkout remains intentionally out of scope until PortOne onboarding is finished
- current best next step after gateway review completes:
  1. add PortOne hosted checkout session creation
  2. add webhook sync for payment success/failure/cancel
  3. switch request queue from manual fulfillment-only to payment-backed fulfillment
