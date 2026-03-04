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
- 현재 기준 예시:
  - 정서 자극 판단 과제
  - 자기 측면 검사
- 소유권 모델:
  - 기본: 제작 의뢰자 소유
  - 선택: 스토어 공개 가능

## 5) Store + Credit Economy

- 특수 템플릿 제작 의뢰: 크레딧 소모
- 스토어 등록: 정책 기반 수수료 가능
- 다운로드/라이선스: 크레딧 결제 모델
- 수익 정산: 제작자/플랫폼 분배 정책 필요

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
