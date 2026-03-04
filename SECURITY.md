# SECURITY POLICY

## Data Safety Rules (Mandatory)
1. 실제 응답 원본, 개인정보, 계정 정보는 공개 저장소에 커밋 금지.
2. SQL 덤프/백업 CSV/XLSX는 기본적으로 비공개 자산으로 취급.
3. API 키/토큰/시크릿은 `.env`로만 관리하고 커밋 금지.
4. 샘플 데이터는 반드시 비식별/가명처리본만 사용.

## Auth Model (Planned)
- 관리자/어드민: Google SSO
- 피검자: 익명형 가입(기관 내부 식별자 기반, 최소 개인정보)

## Supported Languages (Planned)
- 기본 언어: 한국어
- 추가 지원: 영어

## Migration Policy (Planned)
- 타 시스템에서 이전하는 사용자를 위한 데이터 마이그레이션 기능 제공
- 필요 시 마이그레이션 의뢰 프로세스 운영
