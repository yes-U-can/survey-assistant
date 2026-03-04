# Incident Response Runbook (2026-03-04)

## Severity Definition
- `SEV-1`: 로그인/응답 제출/원장 처리 중단
- `SEV-2`: 핵심 일부 기능 장애(특수 의뢰, 스토어, 마이그레이션 등)
- `SEV-3`: 기능 저하 또는 UI 결함(우회 가능)

## 1) First 15 Minutes
1. 장애 재현 경로와 최초 보고 시각 기록
2. 영향 범위 분류(SEV-1/2/3)
3. 임시 우회 경로 가능 여부 확인
4. `Vercel Logs` + DB 에러 로그 확인
5. 필요 시 최신 배포 롤백 판단

## 2) Communication Protocol
1. 내부 운영 채널에 아래 형식으로 공지:
   - 증상
   - 영향 범위
   - 임시 조치
   - 다음 공지 ETA
2. 외부 공지 필요 시 서비스 상태/점검 문구 배포

## 3) Technical Triage
1. 인증 오류
   - OAuth redirect URI
   - `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`
2. 원장 오류
   - `CreditTransaction` idempotency 충돌 여부
   - 음수 잔액 제약 위반 여부
3. 데이터 경계 오류
   - `/api/admin/*` owner scope 적용 여부
4. 속도/남용 문제
   - Rate limit 임계치, 429 비율 확인

## 4) Recovery Validation
1. `/api/health/db` 200 확인
2. 피검자 가입/로그인/코드등록/응답
3. 관리자 로그인/템플릿/패키지/CSV
4. 플랫폼 어드민 초대/정산/크레딧
5. 실패 시 직전 정상 릴리스로 롤백 유지

## 5) Postmortem Checklist
1. 직접 원인(root cause)과 유발 요인(trigger) 분리 기록
2. 재발 방지 액션을 이슈로 분해
3. 문서 동기화
   - MasterPlan
   - ExecutionLog
   - Release Checklist

