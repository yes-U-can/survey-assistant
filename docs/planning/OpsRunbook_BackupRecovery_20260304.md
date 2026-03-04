# Backup & Recovery Runbook (2026-03-04)

## Scope
- Service: Survey Assistant (`apps/web`)
- Infra: Vercel + Neon PostgreSQL
- Goal: 배포 전/후 백업, 장애 시 복구 순서를 표준화

## 1) Backup Policy
1. 운영 배포 전, Neon DB 스냅샷 또는 `pg_dump` 백업 1회 수행
2. 배포 직후 핵심 API 스모크 통과 확인 후 백업 식별자 기록
3. 백업 파일은 공개 저장소 외부(사내 보안 저장소)에만 보관
4. 백업 파일명 예시:
   - `survey-assistant_prod_YYYYMMDD_HHMM.sql.gz`

## 2) Pre-Deploy Checklist
1. `corepack pnpm verify:local` PASS
2. `corepack pnpm smoke:web` PASS
3. `https://surveysicp.vercel.app/api/health/db` 200
4. OAuth 수동 체크리스트 통과
   - `docs/planning/OAuthManualChecklist_20260304.md`
5. DB 백업 완료 여부 기록

## 3) Recovery Trigger
- 아래 조건 중 1개라도 해당하면 복구 검토:
1. 로그인 실패율 급증
2. `admin_not_invited` 오탐 급증
3. 크레딧 원장 불일치(중복 차감/음수 잔액)
4. 핵심 API 5xx 비율 급증

## 4) Recovery Procedure
1. Vercel에서 직전 정상 배포로 즉시 롤백
2. 영향 범위 파악:
   - 인증
   - 원장
   - 설문 응답 저장
3. DB 복구가 필요하면 최신 안전 백업 기준으로 복구 환경에서 리허설
4. 복구 SQL 실행 전/후 검증:
   - 사용자 수
   - 응답 건수
   - 지갑 잔액 합계
   - 최근 트랜잭션 무결성
5. 복구 완료 후 스모크 테스트 재수행

## 5) Post-Incident Log
- 아래 항목을 `ExecutionLog`에 기록:
1. 장애 시작/종료 시각
2. 사용자 영향도
3. 원인
4. 임시 조치
5. 재발 방지 액션

