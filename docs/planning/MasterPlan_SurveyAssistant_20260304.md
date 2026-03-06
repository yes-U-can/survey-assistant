# Survey Assistant (설문조사 도우미) - Master Plan

- Last Updated: 2026-03-04
- Owner: 김성균 (최고 기획자)
- Working Partner: Codex
- Goal: 연구소 실사용 가능한 설문조사 도우미를 완성하고, 오픈소스 미들웨어로 확장

## 1) Naming Decision

- Korean Product Name: 설문조사 도우미
- English Product Name (Recommended): Survey Assistant
- Repo Slug (Recommended): survey-assistant
- Reason:
  - 가장 직관적이고 검색 친화적
  - 교육/연구/의료/기업 환경 모두에서 의미가 분명함
  - 오픈소스 공개 시 설명 비용이 가장 낮음

### Alternative Names
- Survey Aide
- SurveyMate
- Survey Toolkit

## 2) Product Vision

- 1차 목적: 서울임상심리연구소 내부 실사용 시스템 완성
- 최종 목적: 오픈소스 설문조사 미들웨어로 공개
- 차별점:
  - 일반 리커트 템플릿 + 특수 템플릿(연구자 맞춤 과제)
  - 종단/횡단 연구 운영 지원
  - 결과 산출 CSV 중심 + AI 분석 연결

## 3) User Roles

### 3.1 피검자 (Participant)
- 회원가입/로그인
- 설문 코드 입력 후 참여
- 설문 진행 현황 확인
  - 최근 응답 일시
  - 전체 허용 응답 횟수 대비 완료 횟수
  - 남은 응답 횟수
  - 종단 연구의 다음 응답 가능 시점(필요 시)

### 3.2 관리자 (Research Admin)
- 템플릿 생성/수정/삭제
- 패키지 생성/운영(횡단/종단)
- 결과 다운로드(CSV 우선)
- 피검자 계정 승인/거부/복원/말소

### 3.3 플랫폼 어드민 (Platform Admin)
- 크레딧 발행/회수/정산
- 특수 템플릿 제작 의뢰 운영
- 스토어 검수/정책/신고 처리
- 경제 시스템 모니터링(유통량, 사용량)

## 4) Template Model

### 4.1 일반 리커트 템플릿
- 척도 min/max
- 척도 라벨
- 문항 목록
- 단일선택/복수선택(필요 시)

### 4.2 특수 템플릿
- 연구자 맞춤형 고유 설문 로직
- 운영 원칙: 특수 템플릿은 의뢰 기반 코드 개발만 허용 (사용자 직접 제작/노코드 미지원)
- 현재 기준 예시:
  - 정서 자극 판단 과제
  - 자기 측면 검사
- 소유권 모델:
  - 기본: 제작 의뢰자 소유
  - 선택: 스토어 공개 가능

## 5) Store + Credit Economy

- 특수 템플릿 제작 의뢰: 크레딧 소모
- 스토어 거래 대상: SPECIAL 템플릿만 허용
- 구매 시 정산 기본값: 판매자 80%, 플랫폼 수수료 20%
- 다운로드/라이선스: 크레딧 결제 모델
- 수익 정산: 구매 트랜잭션 시 자동 분배 원장 기록

## 6) AI Integration Principles

- BYOK (Bring Your Own Key): 관리자가 자신의 LLM API Key 연결
- Provider Adapter 구조:
  - OpenAI
  - Anthropic
  - Google Gemini
- AI 기능 범위:
  - CSV 기반 기초 통계 요약
  - 템플릿/패키지 단위 질의응답
  - 분석 힌트 제공 (진단/의료적 확정 판단 아님)

## 6.1) SkillBook Layer (Added 2026-03-07)

- 문제의식:
  - 단순히 CSV를 업로드하고 LLM과 대화만 하게 하면, 사용자는 굳이 Survey Assistant 내부 AI 기능을 쓸 이유가 약하다.
  - 따라서 플랫폼 내부 AI 기능은 "데이터 + 해석 방법론"이 결합된 형태여야 경쟁력이 생긴다.
- 정의:
  - `SkillBook`은 설문 데이터 해석 시 AI가 따라야 할 방법론, 분석 절차, 해석 원칙, 연구 맥락을 담은 재사용 가능한 지식 단위다.
  - 쉽게 말해, "특정 연구 방법론을 AI에게 읽히는 책"이다.
- 생성 방식:
  - 연구자가 자신의 연구 계획/방법론/메모/txt 문서를 입력
  - AI가 이를 읽고 SkillBook 초안을 생성
  - 사용자가 편집/보완 후 저장
- 사용 방식:
  - 설문 패키지 결과를 해석할 때 특정 SkillBook을 선택
  - AI는 CSV/패키지 데이터와 함께 해당 SkillBook을 읽고 응답
- 공유 모델:
  - 비공개 보관 가능
  - 조직 내부 공유 가능
  - 공개 스토어 등록 가능
- 제품적 의미:
  - Survey Assistant의 AI 기능을 단순 API 래퍼가 아니라 "연구 방법론 보조 시스템"으로 격상시킨다.

## 6.2) SkillBook Store / BM Direction (Added 2026-03-07)

- SkillBook은 템플릿 스토어와 별도의 지식 스토어 축으로 운영 가능하다.
- 가능한 거래/유통 이벤트:
  - SkillBook 공개 등록
  - SkillBook 다운로드/가져오기
  - SkillBook 즐겨찾기/추천
  - SkillBook 판매/유통
- BM 연결 방향:
  - 무료 코어:
    - 일반 리커트 설문 운영
    - CSV 다운로드
    - BYOK 기반 AI 대화
  - 확장 가치:
    - SkillBook 생성 보조
    - SkillBook 스토어
    - 플랫폼 제공 AI + SkillBook 조합
- 과금 후보:
  - SkillBook 스토어 등록비
  - SkillBook 판매 수수료
  - 플랫폼 제공 AI 사용 시 크레딧 차감
  - 향후 프리미엄 SkillBook(검증/추천/공인 방법론 번들)
- 원칙:
  - API 키(BYOK)와 크레딧(플랫폼 제공 자원)은 역할을 명확히 분리한다.

## 6.3) SkillBook Product Operating Model (Added 2026-03-07)

- 무료 오픈소스 코어와의 관계:
  - 무료 코어는 끝까지 `설문 생성/실행/CSV 다운로드/BYOK AI 대화`에 집중한다.
  - SkillBook은 무료 코어를 대체하는 것이 아니라, "왜 굳이 플랫폼 내부 AI를 써야 하는가"에 대한 답을 제공하는 확장 계층이다.
- SkillBook이 해결하는 문제:
  - 일반 CSV 업로드+채팅만으로는 ChatGPT/Gemini와 차별성이 약하다.
  - SkillBook은 `데이터`에 `연구자의 해석 규칙`과 `방법론`을 결합해, 플랫폼 내부 AI를 "연구 맥락을 이해하는 도구"로 바꾼다.
- 사용자 가치:
  - 연구자는 매번 긴 프롬프트를 다시 붙여넣지 않아도 된다.
  - 자신의 연구 설계, 가설, 해석 원칙을 반복 재사용할 수 있다.
  - 하나의 SkillBook을 여러 패키지 결과 해석에 재사용할 수 있다.
- 생성 흐름(권장):
  1. 연구자가 텍스트 메모/방법론 문서/txt 파일을 업로드하거나 붙여넣음
  2. AI가 SkillBook 초안을 생성
  3. 사용자가 편집/확정
  4. 비공개/내부공유/공개스토어 중 하나로 배포 범위 선택
- 실행 흐름(권장):
  1. 연구자가 패키지 결과를 선택
  2. 사용할 SkillBook을 선택
  3. AI가 `패키지 데이터 + SkillBook`을 함께 읽고 해석
  4. 필요 시 다른 SkillBook으로 재해석 비교 가능
- BM 배치 원칙:
  - BYOK 일반 대화: 무료 코어 또는 저비용 기본 기능
  - AI 기반 SkillBook 초안 생성(Builder): 플랫폼 키를 쓰는 만큼 크레딧형 BM이 자연스럽다
  - SkillBook 공개 등록/판매/정산: 스토어형 BM이 자연스럽다
  - 향후 검증된 SkillBook 번들/추천 컬렉션: 구독 또는 프리미엄 번들로 확장 가능
- 초반 운영 원칙:
  - 처음부터 모든 SkillBook을 유료화하지 않는다.
  - 개인용 비공개 SkillBook은 무료로 허용하는 편이 진입장벽이 낮다.
  - 돈을 받는 지점은 `AI Builder`, `공개 스토어`, `플랫폼 제공 AI 자원`처럼 원가나 유통 행위가 발생하는 구간으로 한정한다.

## 7) Data Export Policy

- Primary Export: CSV
- Secondary Export: XLSX (옵션)
- AI 호환 관점에서 CSV를 표준 산출물로 채택

## 8) Tech Stack (Draft Baseline)

- Frontend: Next.js + TypeScript
- Backend/API: Next.js Route Handlers or dedicated API layer
- DB: PostgreSQL (Neon)
- ORM: Prisma
- Auth: Auth.js (or Clerk, later decision)
- Hosting: Vercel
- Async Jobs: BullMQ + Redis (Upstash 등)
- Docs/API: OpenAPI + Markdown docs

## 9) Project Structure (Proposed)

```txt
survey-assistant/
  apps/
    web/
    api/
  packages/
    core-domain/
    template-engine/
    exporter-csv/
    ai-adapters/
  prisma/
  docs/
  archive/
    sicp-legacy/
    gas-prototype/
```

## 10) Source-of-Truth Data Assets

- Legacy Web/DB Snapshot: `sicp/`
- Final extracted data near shutdown: `프로그램 관리/25.12.20 백업 데이터/`
- GAS prototype code (primary): `프로그램 관리/test/`

## 11) Guardrails

- 레거시 데이터는 삭제하지 않고 archive로 보존
- PII/민감정보 로그 출력 최소화
- 비밀번호 평문 저장 금지 (해시 + 솔트 필수)
- AI 답변은 보조 도구로만 제공 (의학적 최종판단 금지)

## 12) Git/GitHub Collaboration Policy

- 모든 큰 결정은 docs에 ADR 또는 Decision log 기록
- 브랜치 전략: main + feature/*
- PR 템플릿으로 변경 목적/영향/테스트 내역 고정
- 작업 단위는 이슈 단위로 분리

## 13) Immediate Next Steps

1. GitHub 신규 레포 생성: `survey-assistant`
2. 로컬 초기 스캐폴딩
3. Neon 프로젝트/DB 연결
4. 최소 도메인 스키마 작성
5. 피검자 플로우 MVP 구현
6. 관리자 패키지 + CSV export MVP 구현
7. 어드민 최소 기능(크레딧 원장) 구현

## 14) Human-in-the-loop Agreement

- 최고 기획자(김성균)에게 정기 보고
- 중간중간 요구사항 변경을 즉시 문서 반영
- 계획 대비 구현 정합성 점검을 매 작업마다 수행

## 15) Localization Policy (Added 2026-03-04)
- Primary locale: Korean (`ko`)
- Secondary locale: English (`en`)
- Scope for now: bilingual UI/content only (ko/en)

## 16) Authentication Policy (Added 2026-03-04)
- Research Admin / Platform Admin: Google SSO required
- Participant: anonymous-style registration allowed (institutional identifier only)
- Minimize collection of direct personal identifiers

## 17) Data Migration Product Scope (Added 2026-03-04)
- Self-service migration tools for organizations with legacy survey systems
- Assisted migration request workflow (service intake)
- Our own institute data will be migrated after Survey Assistant core is stabilized

## 18) Special Template Open-Source Notice (Added 2026-03-04)
- Special template implementation source code may be publicly disclosed under MIT.
- Request flow must include explicit requester consent.
- Credit compensation and source publication are handled as separate tracks.

## 19) Migration Capability (Added 2026-03-04)
- Data migration is a core platform feature, not a side task.
- Provide self-service + assisted migration request workflow.

## 20) Progress Label Policy (Added 2026-03-04)
- 완료 전 단계의 문서/작업 표기는 버전 번호(`v1`, `v2`)를 사용하지 않는다.
- 진행 구분은 날짜 스냅샷(`YYYY-MM-DD`)과 단계명으로만 관리한다.
- 버전 번호는 첫 공개 릴리스 이후에만 도입한다.

## 21) Platform-Managed AI Credit Policy (Added 2026-03-04)
- 기본 원칙: 관리자는 BYOK로 자신의 API 키를 연결해 사용할 수 있다.
- 편의 옵션: API 키 발급/관리 부담이 큰 사용자에게는 플랫폼 제공 키를 크레딧 결제로 사용할 수 있게 한다.
- 크레딧은 피검자가 아니라 관리자(연구자 계정) 운영 자산으로 관리한다.
- 원장 거래 유형은 최소 `ISSUE`, `SPEND`, `REFUND`, `REWARD`, `ADJUSTMENT`를 지원한다.
- Managed AI 과금은 요청 시작 시 즉시 `SPEND` 차감하고, 실패/예외 시 `REFUND`로 자동 복구한다.
- 토큰 사용량은 과금 기준이 아니라 로그/모니터링 지표로 유지한다.

## 22) Senior Accessibility Product Direction (Added 2026-03-07)
- 주요 타깃 중 하나는 시니어 사용자이므로, 홈/인증/설문 UI는 "큰 글자, 단순한 문구, 직관적인 그림"을 우선한다.
- 접근성은 단순한 시각 디자인 문제가 아니라 제품 원칙으로 다룬다.
- 관리자/피검자 공통으로 과도한 정보 밀도, 작은 글씨, 복잡한 설명문을 지양한다.
- 향후 접근성 고도화 범위:
  - 더 큰 기본 타이포 스케일
  - 더 넓은 클릭 영역
  - 문항 단위 음성 재생
  - 키보드/스크린리더 대응 강화

## 23) Accessibility Premium Opportunity (Added 2026-03-07)
- 시각 약자/고령층 사용성을 위한 "문항 음성 재생" 기능은 향후 유료 부가 기능 후보로 관리한다.
- 초기 방향:
  - 문항 텍스트 TTS 재생
  - 문항/선택지 단위 재생 제어
  - 반복 재생/속도 조절 가능성 검토
- BM 관점:
  - 기본 설문 기능과 분리된 프리미엄 접근성 옵션
  - 컴퓨팅 비용이 드는 기능이므로 플랫폼 제공 기능으로 유료화 가능
  - 관리자가 연구 대상 특성에 따라 선택적으로 활성화하는 구조를 우선 검토

## 24) Build Snapshot (2026-03-04)
- Overall completion (current MVP line): ~85%
- Completed
  - Participant: 가입/로그인, 코드 등록, 응답 제출, 응답 진행현황/모바일 UX
  - Research Admin: 템플릿/패키지 관리, CSV 다운로드, 특수템플릿 의뢰, 스토어 등록/구매
  - Platform Admin: 크레딧 원장 관리, 의뢰 큐 상태 처리, 스토어 정산 요약
  - Auth/Policy: 관리자 Google SSO, participant 익명형 가입, 관리자/플랫폼 모바일 차단
  - Billing: AI managed 모드 즉시 차감 + 실패 환불
  - Participant ops: 계정 비활성/복원 + 소프트 익명화(말소) MVP
- Remaining focus
  - 관리자/플랫폼 PC 화면의 정보 밀도 및 운영 UX 고도화
  - 법무/컴플라이언스 수준의 익명화/보존 로그 정책 명문화
  - e2e 자동화(핵심 운영 시나리오) 및 릴리스 체크리스트 강화

## 25) Build Snapshot Update (2026-03-04, late)
- Overall completion (current MVP line): ~92%
- Newly completed in this update
  - Admin/Platform desktop 운영 요약 카드 + 상태 필터(대량 운영 가독성 개선)
  - 특수 템플릿 의뢰 동의 문구의 법적 고지 명확화(MIT 공개 가능/보상 분리)
  - 배포 스모크 자동검증 스크립트(`pnpm smoke:web`) 및 범위 문서 고정
- Remaining focus
  - OAuth 포함 브라우저 e2e 자동화
  - 운영 알림/이상징후 모니터링(정산/크레딧)
  - 출시 전 컴플라이언스 체크리스트 마감

## 26) Build Snapshot Update (2026-03-04, final)
- Overall completion (current MVP line): ~96%
- Newly completed in this update
  - 플랫폼 어드민 운영 알림(임계치 경고) MVP 추가
  - 운영 임계치 환경변수화 및 문서 반영
  - 릴리스 체크리스트/특수템플릿 운영 런북 문서 완성
- Remaining focus
  - OAuth 브라우저 e2e 자동화(CI 통합)
  - 릴리스 태그/체인지로그 자동화

## 27) Build Snapshot Update (2026-03-04, quality gate)
- Overall completion (current MVP line): ~96%
- Newly completed in this update
  - 전역 스타일 누락 이슈 수정(`apps/web/src/app/[locale]/layout.tsx`에서 `globals.css` 로드)
  - 플랫폼 어드민 경고 시간 계산 버그 수정(페이지 열린 상태에서도 경과 시간 갱신)
  - 로컬 품질게이트 스크립트 추가(`verify:local` = safety + lint + build)
  - Git hooks 강화(pre-push에서 품질게이트 강제)
  - GitHub Actions 품질게이트 추가(`web-quality-gate.yml`)
- Remaining focus
  - OAuth 브라우저 e2e 자동화(CI 통합)
  - 릴리스 태그/체인지로그 자동화

## 28) Build Snapshot Update (2026-03-04, UX completion pass)
- Overall completion (current MVP line): ~100% (product UX flow scope)
- Newly completed in this update
  - 공통 상단 네비게이션/뒤로가기/역할별 빠른 진입 추가
  - 홈 화면 문구를 역할 중심 CTA로 재작성(피검자/관리자/플랫폼 어드민)
  - 관리자 Google 로그인 버튼을 표준형 브랜드 버튼으로 교체
  - 피검자/관리자/플랫폼 각 화면에 "역할별 3단계 운영 흐름" 명시
  - 접근권한 부족 화면에 즉시 이동 링크 추가(잘못된 진입 경로 보정)
  - Not Found 페이지를 한/영 홈 복귀 중심 화면으로 개선
- Remaining focus
  - OAuth 브라우저 e2e 자동화(CI 통합) (출시 자동화 트랙)
  - 릴리스 태그/체인지로그 자동화 (출시 자동화 트랙)

## 29) Build Snapshot Update (2026-03-04, Consistency Recovery Reset)
- Scope type: 운영 안정성 복구(인증/세션/권한/원장/검증)
- Completed in this update
  - Auth.js 유지 전제에서 관리자 초대 기반 통제 추가
    - 모델: `AdminInvite`, enum: `AdminInviteStatus`
    - API: `GET/POST /api/platform-admin/admin-invites`, `PATCH /api/platform-admin/admin-invites/{inviteId}`
    - Google 관리자 로그인 정책:
      - 활성 기존 관리자 허용
      - 유효 초대 수락 시 계정 생성/승격 허용
      - 그 외 계정 차단(`admin_not_invited`)
      - `PLATFORM_ADMIN_EMAILS`는 부트스트랩(초기 진입) 용도로만 사용
      - 비활성 관리자 차단
  - 세션 정책 명시
    - `AUTH_SESSION_MAX_AGE_SEC`, `AUTH_SESSION_UPDATE_AGE_SEC`
    - `lastLoginAt` 기록 추가
  - 로그아웃 UX 정규화
    - `/api/auth/signout` 링크 제거
    - 공통 `LogoutButton` + `signOut({ callbackUrl })` 사용
  - 인증 페이지 동선 보정
    - 로그인 상태에서 `/auth/*` 접근 시 역할 홈 자동 리다이렉트
    - 로그인 실패 코드별 메시지 분기(피검자/관리자)
  - 관리자 데이터 경계 강제 유틸 도입
    - `withOwnerScope`, `withRequesterScope`, `withSellerScope`
    - 경계 위반 응답 통일: `404 not_found_or_no_access`
  - 크레딧 원장 정합성 강화
    - `CreditTransaction.idempotencyKey`(unique) 추가
    - 음수 잔액 방지 DB 체크(`CreditWallet_balance_non_negative`)
    - 차감 원자성 강화(조건부 차감) + idempotent replay 처리
    - AI 과금/환불 및 스토어 구매 정산에 idempotency 키 적용
  - 남용 방지 최소선 추가
    - 모델: `RateLimitBucket`
    - 적용:
      - 피검자 가입
      - 피검자 credentials 로그인
      - 코드 등록(enroll)
      - 관리자 AI 분석 호출
      - 특수 템플릿 의뢰 등록
    - 초과 시 `429 rate_limited + retryAfterSec`
  - 검증 루프 보강
    - Playwright 스모크 테스트 추가(`apps/web/e2e/smoke.spec.ts`)
    - 설정 추가(`apps/web/playwright.config.ts`)
- Current known gap
  - OAuth 브라우저 전체 플로우 자동화는 수동 체크리스트와 병행 필요

## 30) Build Snapshot Update (2026-03-04, Platform Admin Invite UI Completion)
- Scope type: 리셋 플랜 후속 UI 정합성 마무리
- Completed in this update
  - Platform Admin 콘솔에 관리자 초대 운영 UI 연결
    - 초대 생성(이메일/권한/메모/만료일수)
    - 초대 상태 필터
    - 초대 상태/권한/메모 수정
  - 서버 초기 데이터 로딩 + 클라이언트 refresh 루프에 `adminInvites` 연동
    - `apps/web/src/app/[locale]/platform/page.tsx`
    - `apps/web/src/app/[locale]/platform/PlatformAdminClient.tsx`
  - 플랫폼 페이지 깨진 한글 문자열 정리
    - 접근권한/모바일 정책/푸터 텍스트 교정
- Current known gap
  - OAuth 브라우저 전체 플로우 자동화는 여전히 수동 체크리스트 병행 필요

## 31) Build Snapshot Update (2026-03-04, Deployment Baseline Hardening)
- Scope type: 배포 표준/운영 기본기 보강
- Completed in this update
  - 웹 보안 헤더 기본 세트 적용(`next.config.ts`)
    - CSP, HSTS(production), XFO, XCTO, Referrer/Permissions policy
  - 구조화 감사 로그 유틸 추가(`src/lib/audit-log.ts`)
  - 핵심 변경 API 감사 로그 연동
    - participant signup/enroll
    - admin AI analyze / store purchase / special request
    - platform admin invite / migration status / special request status / credit mutation
  - 법적 페이지 추가(ko/en)
    - `/{locale}/legal/privacy`
    - `/{locale}/legal/terms`
  - 백업/복구 및 장애대응 런북 추가
    - `OpsRunbook_BackupRecovery_20260304.md`
    - `OpsRunbook_IncidentResponse_20260304.md`
- Current known gap
  - OAuth 브라우저 전체 자동화(CI) 대신 수동 체크리스트 병행 정책 유지

## 32) Build Snapshot Update (2026-03-04, Deployment Incident Hotfix)
- Scope type: 배포 차단 장애 복구
- Incident
  - Vercel build failed with:
    - `Cannot find module '@next/env'`
    - from `apps/web/playwright.config.ts`
- Completed in this update
  - `@next/env` 의존 제거
  - 자체 테스트 env 로더 추가:
    - `apps/web/e2e/load-test-env.ts`
  - 적용:
    - `apps/web/playwright.config.ts`
    - `apps/web/e2e/smoke.spec.ts`
  - 커밋/푸시:
    - `09f5daf`
- Outcome
  - web build 재통과
  - 배포 차단 이슈 해소

## 33) Build Snapshot Update (2026-03-04, Entry IA Redesign by Journey)
- Scope type: 홈 IA/UX 정합성 보정
- Trigger
  - Owner feedback:
    - 플랫폼 최초 진입에서 피검자/관리자/플랫폼 어드민의 고객 여정을 명확히 분리해야 함
    - 기존 디자인의 독단적 구성 지적
- Completed in this update
  - 홈 IA를 역할별 고객 여정 선택 구조로 재설계
    - 피검자/연구관리자 1차 진입 카드
    - 플랫폼 운영 여정 별도 맵
    - 고객 여정 지도 섹션 추가
  - 헤더 역할 힌트 및 active 상태 강화
  - 인증 화면의 정보 위계/동선 개선
  - UX 근거 문서 추가:
    - `docs/planning/UXJourneyReference_20260304.md`
  - 커밋/푸시:
    - `35b80ae`
- Current known gap
  - 관리자 콘솔 내부 IA(템플릿/패키지/결과 중심) 2차 정비 필요

## 34) Build Snapshot Update (2026-03-05, Role-Journey UX Round 2 + OAuth Contract Automation)
- Scope type: IA/UX + validation automation (DB migration 없음)
- Completed in this update
  - Admin 콘솔 IA를 탭형 워크스페이스(`view` query sync)로 정비
    - `/{locale}/admin?view=<overview|templates|packages|results|special_store|participants>`
    - 잘못된 view 값은 `overview` fallback
  - Participant 모바일에 Today Action 카드 추가
    - 지금 응답 가능 수, 마감 임박(24h) 수, 최근 응답 요약
    - 응답 가능 시 1클릭 `바로 응답 시작` CTA
    - 응답 없음 시 참여코드 입력 유도 CTA
  - OAuth 계약 자동검증 E2E 추가
    - `apps/web/e2e/oauth-contract.spec.ts`
    - Google sign-in redirect/callback/error mapping 계약 검증
  - CI 워크플로 추가
    - `.github/workflows/web-e2e-oauth-contract.yml`
  - 릴리스 태그 자동화 추가
    - `.github/workflows/release-on-tag.yml`
- Current known gap
  - 실제 Google 계정 상호작용 자동화는 수동 체크리스트 병행(정책 유지)
