# Survey Assistant (설문조사 도우미)

오픈소스 설문조사 미들웨어 프로젝트.

## Vision
- 연구소/학교/기관이 자체 설문 시스템을 운영할 수 있도록 지원
- 일반 템플릿 + 특수 템플릿 + CSV 중심 분석 워크플로우
- 향후 AI 분석 보조 기능(BYOK) 지원

## Current Repository Layout
- `apps/`: 실행 애플리케이션 (web/api)
- `packages/`: 공통 도메인/라이브러리
- `docs/planning/`: 계획, 실행 로그, 의사결정 문서
- `docs/setup/`: 연동/환경 세팅 문서
- `archive/`: 레거시/프로토타입 자산 보관 (공개 제외 대상 다수)

## Security Notice
레거시 자산에는 민감 데이터/구형 설정이 포함될 수 있습니다.
커밋 전에 반드시 `.gitignore`와 `SECURITY.md`를 확인하세요.

## Environment Bootstrap
- Web app: `apps/web` (Next.js)
- Linked Vercel project: `survey_sicp`
- Neon project: `survey-sicp` (PostgreSQL)
- Setup guide: `docs/setup/EnvironmentSetup.md`

## Open-Source Boundary
- 공개 대상: 미들웨어 코드, 문서, 샘플/더미 데이터
- 비공개 대상: 레거시 DB 덤프, 응답 원본, 개인정보/접속로그
- 특수 템플릿 구현 코드는 MIT 정책 하에 공개될 수 있으며, 의뢰 플로우에서 동의 문구를 명시한다.
