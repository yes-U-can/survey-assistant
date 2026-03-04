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
