# Release Readiness Checklist (2026-03-04)

## 1) Security / Privacy
1. 레거시 폴더(`sicp`, 백업 DB/웹 파일)가 git 추적 대상이 아닌지 확인
2. `.env*` 실값 미커밋 확인 (`git status`, `git diff --cached`)
3. Vercel/Neon/Google OAuth 비밀값이 코드/문서에 평문 노출되지 않았는지 확인
4. `scripts/check-repo-safety.ps1` PASS 확인

## 2) Build / Deploy
1. `corepack pnpm --filter web lint` PASS
2. `corepack pnpm --filter web build` PASS
3. `corepack pnpm smoke:web` PASS
4. `https://surveysicp.vercel.app/api/health/db` 200 확인
5. OAuth 수동 체크리스트 수행:
   - `docs/planning/OAuthManualChecklist_20260304.md`
6. 보안 헤더 적용 확인:
   - `Content-Security-Policy`
   - `Strict-Transport-Security`(production)
   - `X-Content-Type-Options`, `X-Frame-Options`

## 3) Product Policy
1. 관리자/플랫폼: Google SSO, 피검자: 익명형 가입 정책 유지 확인
2. 특수 템플릿 의뢰 동의 문구:
   - MIT 공개 가능성
   - 소스 공개와 크레딧 보상 분리
3. AI 관리형 과금:
   - 시작 즉시 `SPEND`
   - 실패 시 `REFUND`

## 4) Core Flows Manual QA
1. 피검자 가입/로그인/코드 등록/응답 제출
2. 관리자 템플릿/패키지 생성, CSV 내보내기
3. 특수 의뢰 등록 -> 플랫폼 어드민 상태 변경
4. 스토어 등록/구매 -> 정산 요약 반영
5. 피검자 계정 비활성/복원/익명화
6. 플랫폼 어드민 관리자 초대 생성/수정/필터 동작 확인
7. 법적 페이지 접근 확인(`/legal/privacy`, `/legal/terms`)

## 5) Docs Sync
1. `docs/planning/ExecutionLog_SurveyAssistant.md` 세션 반영
2. `docs/planning/MasterPlan_SurveyAssistant_20260304.md` 완료도/남은 항목 동기화
3. `apps/web/README.md` API/정책 변경 반영
4. 운영 런북 최신화:
   - `docs/planning/OpsRunbook_BackupRecovery_20260304.md`
   - `docs/planning/OpsRunbook_IncidentResponse_20260304.md`

## 6) Consistency Recovery Gates (2026-03-04)
1. `AdminInvite` API validation
- `GET/POST /api/platform-admin/admin-invites`
- `PATCH /api/platform-admin/admin-invites/{inviteId}`
2. Uninvited Google admin login must be blocked (`admin_not_invited`)
3. Inactive admin login must be blocked (`admin_inactive`)
4. `/api/admin/*` ownership boundary violations must return `404 not_found_or_no_access`
5. Ledger checks
- no negative wallet balance
- idempotency replay does not duplicate SPEND/REFUND/REWARD
6. Rate-limit checks
- signup/login/enroll/ai/special-request endpoints emit `429` + `retryAfterSec`
7. E2E smoke
- `corepack pnpm --filter web e2e:smoke`
