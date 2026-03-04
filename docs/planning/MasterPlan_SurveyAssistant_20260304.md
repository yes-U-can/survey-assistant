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

## 22) Build Snapshot (2026-03-04)
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

## 23) Build Snapshot Update (2026-03-04, late)
- Overall completion (current MVP line): ~92%
- Newly completed in this update
  - Admin/Platform desktop 운영 요약 카드 + 상태 필터(대량 운영 가독성 개선)
  - 특수 템플릿 의뢰 동의 문구의 법적 고지 명확화(MIT 공개 가능/보상 분리)
  - 배포 스모크 자동검증 스크립트(`pnpm smoke:web`) 및 범위 문서 고정
- Remaining focus
  - OAuth 포함 브라우저 e2e 자동화
  - 운영 알림/이상징후 모니터링(정산/크레딧)
  - 출시 전 컴플라이언스 체크리스트 마감

## 24) Build Snapshot Update (2026-03-04, final)
- Overall completion (current MVP line): ~96%
- Newly completed in this update
  - 플랫폼 어드민 운영 알림(임계치 경고) MVP 추가
  - 운영 임계치 환경변수화 및 문서 반영
  - 릴리스 체크리스트/특수템플릿 운영 런북 문서 완성
- Remaining focus
  - OAuth 브라우저 e2e 자동화(CI 통합)
  - 릴리스 태그/체인지로그 자동화
