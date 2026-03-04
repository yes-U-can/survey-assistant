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
