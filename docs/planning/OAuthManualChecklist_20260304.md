# OAuth Manual Checklist (2026-03-04)

목적: Google OAuth 관리자 로그인 흐름을 배포 직전/직후에 수동으로 검증해
`redirect_uri_mismatch`, 무초대 로그인 허용, 비활성 계정 로그인 허용 같은 운영 리스크를 막는다.

## 1) 사전 조건
1. Google Cloud Console의 OAuth Client가 `Web application`으로 생성되어 있어야 한다.
2. Authorized redirect URI에 아래 2개가 등록되어 있어야 한다.
- `https://surveysicp.vercel.app/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/google`
3. Vercel 환경변수에 최소 아래 키가 설정되어 있어야 한다.
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL=https://surveysicp.vercel.app`
- `NEXTAUTH_SECRET` (production secret)

## 2) Canonical URL 검증
1. 배포 접속 시 도메인이 `https://surveysicp.vercel.app`인지 확인한다.
2. `https://surveysicp-*.vercel.app` 형태 preview URL에서 관리자 로그인을 시도하지 않는다.
3. 랜덤 preview URL에서 OAuth 시 `redirect_uri_mismatch`가 나오는 것은 정상 동작으로 기록한다.

## 3) 관리자 로그인 허용/차단 시나리오
1. 초대 없는 Google 계정으로 `/ko/auth/admin` 로그인 시도
- 기대결과: 로그인 차단, `admin_not_invited` 안내 표시
2. 초대된 Google 계정으로 `/ko/auth/admin` 로그인 시도
- 기대결과: 로그인 성공, `/ko/admin` 또는 `/ko/platform`으로 이동
3. 비활성 관리자 계정 로그인 시도
- 기대결과: 로그인 차단, `admin_inactive` 안내 표시

## 4) 플랫폼 어드민 초대 연동 검증
1. 플랫폼 어드민에서 초대 생성
- 경로: `/ko/platform`
- API: `POST /api/platform-admin/admin-invites`
2. 초대받은 계정으로 로그인
- 기대결과: 초대 상태가 `ACCEPTED` 반영
3. `ACCEPTED` 초대를 `PENDING`으로 되돌릴 수 없는지 확인
- 기대결과: 정책대로 재오픈 불가

## 5) 로그아웃/세션 검증
1. 로그인 후 `LogoutButton` 클릭
- 기대결과: 세션 해제 + 공개 화면으로 이동
2. 로그아웃 후 보호 페이지 직접 접근
- 기대결과: 인증 페이지로 리다이렉트

## 6) 장애 시 즉시 점검 포인트
1. `Error 400: redirect_uri_mismatch`
- Google Console redirect URI와 실제 URL 불일치 여부 확인
- `NEXTAUTH_URL` 값 확인
2. `oauth_signin`/`oauth_callback` 실패
- `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` 오타/환경 구분 확인
3. 로그인은 되는데 권한이 이상함
- `AdminInvite` 상태, `User.role`, `User.isActive` 확인

## 7) 최종 기록
1. 체크리스트 결과를 `docs/planning/ExecutionLog_SurveyAssistant.md`에 작업 세션으로 남긴다.
2. 실패 항목이 있으면 릴리스 보류하고 원인/조치/재검증 결과를 함께 기록한다.

## 8) OAuth Contract Automation Scope (Added 2026-03-05)
1. CI 자동검증 범위(안정형):
- 관리자 로그인 페이지 렌더
- Google sign-in 버튼 href 계약
- `/api/auth/signin/google` 302 redirect 계약
- `redirect_uri == ${NEXTAUTH_URL}/api/auth/callback/google` 검증
- 주요 에러코드(`admin_not_invited`, `admin_inactive`, `account_role_not_admin`) UI 매핑 검증
2. 제외 범위:
- 실제 Google 계정 입력/동의 화면 자동화
- 외부 Google UI 의존 E2E
3. 실행 경로:
- 로컬: `corepack pnpm --filter web e2e -- e2e/oauth-contract.spec.ts`
- CI: `.github/workflows/web-e2e-oauth-contract.yml`
