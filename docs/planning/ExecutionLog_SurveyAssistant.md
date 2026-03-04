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
- Current folder is not a git repository yet

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
