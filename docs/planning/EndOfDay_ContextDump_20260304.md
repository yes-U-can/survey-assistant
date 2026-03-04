# End-of-Day Context Dump (2026-03-04)

- 작성일: 2026-03-04 (KST)
- 목적: 다음 세션에서 동일 맥락을 1회독으로 복구할 수 있도록, 오늘까지의 대화/의사결정/구현/수정 이력을 통합 기록
- 대상 독자: 최고 기획자(Owner), 이후 참여할 AI/개발자

---

## 1) 오늘까지 확정된 최상위 방향

1. 제품 정체성
- 제품명: `설문조사 도우미` / `Survey Assistant`
- 성격: 연구기관용 설문조사 플랫폼(오픈소스 미들웨어 지향)
- 1차 목표: 서울임상심리연구소 내부 실사용
- 최종 목표: 공개 GitHub 오픈소스 + 타 기관 재사용 가능

2. 역할 분리(절대 고정)
- 피검자(Participant)
- 연구 관리자(Research Admin)
- 플랫폼 어드민(Platform Admin)

3. 언어 정책
- 기본: 한국어(`ko`)
- 보조: 영어(`en`)

4. 인증 정책
- 연구 관리자/플랫폼 어드민: Google SSO
- 피검자: 익명형 가입(기관 내부 식별자 기반, 최소 개인정보)

5. 특수 템플릿 정책
- 특수 템플릿은 **의뢰 기반 코드형**만 허용
- 사용자 노코드 제작 불가
- 스토어 거래 대상은 `SPECIAL` 템플릿만
- 소스 공개(MIT 가능성)와 크레딧 보상은 분리 처리

6. 크레딧/과금 정책
- 스토어 수수료: 20%
- 구매 시 자동 분배: 판매자 80%, 플랫폼 20%
- AI 관리형 과금: 즉시 차감(`SPEND`) + 실패 시 자동 환불(`REFUND`)
- `hold` 메커니즘 미사용

7. 보안/공개 경계 정책
- 레거시 민감 데이터(웹/DB 백업, 응답원본, 회원정보, IP 로그)는 공개 저장소 업로드 금지
- 오픈소스 공개 대상은 코드/문서/샘플 데이터만

---

## 2) 대화 맥락 연대기(핵심 정리)

### A. 문제 정의 단계
1. 기존 연구소 레거시 설문 시스템이 종료되었고, 정적 콘텐츠만 백업된 상태에서 설문 시스템 재구축이 필요함.
2. `sicp` 폴더(레거시 흔적 + 시도 흔적), `test` 폴더(GAS 코드 중심), `25.12.20 백업 데이터`(민감 데이터 포함) 맥락이 공유됨.
3. 최초엔 GAS로 분리 웹앱(피검자/관리자) 구현 시도했으나 한계로 인해 GAS 포기 선언.

### B. 제품 확장 아이디어 단계
1. 내부 도구에서 시작해 오픈소스 미들웨어로 확장하겠다는 방향 확정.
2. 특수 템플릿(예: 정서 자극 판단 과제, 자기 측면 검사) 의뢰 기반 비즈니스 모델(BM) 공유.
3. 스토어/크레딧/정산/어드민 콘솔 필요성이 도출됨.
4. 데이터 마이그레이션 기능(자체 + 의뢰형)도 코어 범위로 편입됨.

### C. 운영 정책 정교화 단계
1. "버전(v1/v2) 표기 금지" 요청 반영.
2. 모바일 정책 확정:
   - 피검자만 모바일 지원
   - 관리자/플랫폼 어드민은 PC 전용
3. 특수 템플릿 관련 법적 안내 문구 필요성 확정:
   - MIT 하 공개 가능성
   - 크레딧 보상과 별개 처리

### D. 정합성 리셋 단계
1. 사용자 피드백으로 "겉 UI보다 SaaS 기본기(인증/세션/권한/원장/검증) 우선"으로 리셋 플랜 가동.
2. 초대 기반 관리자 인증(`AdminInvite`) 도입.
3. 데이터 경계 강제(`/api/admin/*` owner scope), 원장 idempotency, rate limit, e2e 강화 진행.

### E. 배포/품질 단계
1. 커밋/푸시 후 Vercel 배포 중 `@next/env` 타입 에러 발생.
2. 테스트 env 로딩 방식을 자체 로더로 교체해 즉시 복구.
3. 사용자 UI/UX 강한 피드백 반영:
   - "역할별 고객 여정 분리" 중심으로 홈 IA 재설계.

---

## 3) 구현 현황(오늘 종료 시점 기준)

## 3.1 인증/세션/권한

1. 관리자 인증 하드닝
- `AdminInvite` 기반 관리자 온보딩
- 초대 없는 Google 관리자 로그인 차단(`admin_not_invited`)
- 비활성 관리자 차단(`admin_inactive`)
- `PLATFORM_ADMIN_EMAILS`는 부트스트랩 용도로만 제한

2. 세션/로그아웃
- Auth.js 세션 수명(`maxAge`, `updateAge`) 명시
- 공통 `LogoutButton` 기반 로그아웃 처리
- 인증 페이지 접근 시 로그인 상태면 역할 홈으로 리다이렉트

3. 역할별 페이지 정책
- 피검자/관리자/플랫폼 어드민 역할별 가드 적용
- 관리자/플랫폼 어드민 모바일 접근 차단(정책 안내 화면)

## 3.2 데이터 경계

1. 관리자 소유권 스코프 유틸 통합
- `/api/admin/*`에서 본인 소유 리소스만 조회/수정
- 경계 위반 응답 통일: `404 not_found_or_no_access`

## 3.3 원장/과금

1. 크레딧 원장 정합성
- `CreditTransaction.idempotencyKey` 도입
- 음수 잔액 방지
- 중복 차감 방어

2. AI 과금
- 관리형 모드 즉시 차감 + 실패 시 환불
- 토큰 사용량은 모니터링 지표로 유지

3. 스토어 정산
- 구매 시 buyer/seller/platform 분배 기록
- 수수료 20% 정책 반영

## 3.4 남용 방지

1. DB 기반 `RateLimitBucket` 적용 엔드포인트
- 피검자 가입
- 피검자 로그인(credentials)
- 패키지 코드 등록(enroll)
- 관리자 AI 분석 호출
- 특수 템플릿 의뢰 등록
- 초과 시 `429 + retryAfterSec`

## 3.5 운영 기능

1. 플랫폼 어드민 콘솔
- 관리자 초대 생성/조회/상태수정
- 크레딧 원장 발행/차감/조정
- 특수 의뢰 큐/상태 처리
- 마이그레이션 요청/상태 처리
- 정산 요약 조회

2. 관리자 콘솔
- 템플릿/패키지 관리
- CSV 내보내기
- 특수 의뢰/스토어 등록/구매
- 피검자 계정 운영(비활성/복원/익명화)

3. 피검자
- 가입/로그인
- 참여코드 등록
- 응답 제출
- 진행률/최근 응답 확인

## 3.6 품질/운영 문서

1. 체크리스트/런북
- OAuth 수동 체크리스트
- Release readiness 체크리스트
- 특수 템플릿 운영 런북
- 백업/복구 런북
- 장애 대응 런북

2. 검증
- `verify:local` (safety + lint + build)
- `smoke:web`
- `e2e:smoke`

---

## 4) 오늘 발생한 실제 장애와 조치

1. 장애 내용
- Vercel 빌드 실패:
  - `Cannot find module '@next/env'`
  - 발생 파일: `apps/web/playwright.config.ts`

2. 원인
- Playwright 설정/스펙에서 `@next/env`를 직접 참조.
- Vercel 타입체크 환경에서 해당 참조가 빌드 경로에 문제 유발.

3. 조치
- `@next/env` 제거.
- 의존성 없는 자체 로더 추가:
  - `apps/web/e2e/load-test-env.ts`
- 적용 파일:
  - `apps/web/playwright.config.ts`
  - `apps/web/e2e/smoke.spec.ts`

4. 결과
- 로컬 빌드 및 검증 통과.
- 재푸시 완료.

---

## 5) 오늘 커밋 이력(중요)

1. `552db8d`
- `feat: harden auth and deployment baseline with ops docs`
- 인증/권한/원장/보안헤더/감사로그/법적 페이지/운영문서 대규모 반영

2. `09f5daf`
- `fix: remove @next/env dependency from playwright config`
- 배포 차단 이슈 긴급 복구

3. `35b80ae`
- `feat: redesign entry UX around participant and admin journeys`
- 홈 IA를 역할별 고객 여정 중심으로 재설계

---

## 6) UI/UX 관련 현재 상태와 인식

1. 인정된 문제
- 초기 디자인 일부가 기능 우선/독단 처리였고, 역할 여정 분리 설계가 충분하지 않았음.

2. 이번 반영
- 최초 진입에서 목적 선택(피검자/관리자/플랫폼 운영) 구조 강화
- 고객 여정 지도 섹션 추가
- 헤더 역할 힌트/active 상태 추가
- 인증 화면 정보 위계 개선

3. 아직 남은 UX 과제
- 관리자 콘솔 IA를 운영 작업 순서 중심으로 더 정교화 필요
- 피검자 모바일의 “오늘 해야 할 응답” 가시성 강화 필요
- 레퍼런스 기반 컴포넌트 품질 고도화 필요

---

## 7) 민감정보/보안 관련 절대 준수사항(재확인)

1. 아래 데이터는 절대 공개 저장소로 푸시 금지
- 레거시 DB dump
- 회원정보/응답원본/IP 원문 로그
- 백업 CSV/XLSX 실데이터

2. `.env` 실값 커밋 금지

3. 저장소 안전 체크 스크립트 통과를 푸시 전 필수 게이트로 유지

---

## 8) 다음 세션 시작 체크리스트 (실무용)

1. 문서 우선 읽기 순서
- `docs/planning/EndOfDay_ContextDump_20260304.md` (본 문서)
- `docs/planning/MasterPlan_SurveyAssistant_20260304.md`
- `docs/planning/ExecutionLog_SurveyAssistant.md`
- `docs/planning/ReleaseReadinessChecklist_20260304.md`

2. 코드/배포 상태 확인
- `git log --oneline -n 5`
- Vercel 최신 배포가 `35b80ae` 반영됐는지 확인

3. 품질 검증
- `corepack pnpm verify:local`
- `corepack pnpm --filter web e2e:smoke`

4. 다음 우선 구현(권장)
- 관리자 콘솔 IA 2차 정비(템플릿->패키지->결과 중심)
- 피검자 모바일 과업 카드 강화
- 플랫폼 콘솔 운영 경고/큐 우선순위 시각화 개선

---

## 9) 오늘 Owner 피드백 중 반드시 기억할 문장(정책화)

1. "민감정보는 절대 인터넷에 올라가면 안 된다."
2. "버전(v1/v2) 같은 표현 함부로 쓰지 말라."
3. "특수 템플릿은 의뢰 기반 코드형만."
4. "피검자/관리자/플랫폼 어드민 고객 여정을 분리해서 설계하라."
5. "기록은 맥락까지 남겨서, 다른 AI가 와도 막힘 없이 이어갈 수 있어야 한다."

---

## 10) 연결 문서

1. 마스터 플랜: `docs/planning/MasterPlan_SurveyAssistant_20260304.md`
2. 실행 로그: `docs/planning/ExecutionLog_SurveyAssistant.md`
3. 릴리스 체크리스트: `docs/planning/ReleaseReadinessChecklist_20260304.md`
4. OAuth 체크리스트: `docs/planning/OAuthManualChecklist_20260304.md`
5. UX 여정 참고: `docs/planning/UXJourneyReference_20260304.md`
6. 백업/복구 런북: `docs/planning/OpsRunbook_BackupRecovery_20260304.md`
7. 장애 대응 런북: `docs/planning/OpsRunbook_IncidentResponse_20260304.md`

---

끝. (다음 세션은 본 문서를 Source of Truth로 시작)

