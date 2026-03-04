# E2E Smoke Scope (2026-03-04)

## Goal
- 운영 중 회귀를 빠르게 감지하기 위한 최소 스모크 범위를 고정한다.
- 복잡한 통합 시나리오 전, 배포 상태와 권한 경계가 깨지지 않았는지 먼저 확인한다.

## Automated (Current)
1. `GET /api/health/db` returns `200` and `ok=true`
2. Unauthenticated `GET /api/admin/special-requests` returns `401`
3. Unauthenticated `GET /api/admin/store/purchases` returns `401`
4. Unauthenticated `GET /api/platform-admin/overview` returns `401`
5. Unauthenticated `GET /api/participant/packages` returns `401`

Script:
- `scripts/smoke-web-api.ps1`
- npm script: `pnpm smoke:web`

## Manual High-Priority Scenarios (Next)
1. Special request lifecycle:
   - Research admin creates request with required MIT/public-source consent.
   - Platform admin updates status and note.
2. Store purchase + settlement:
   - Seller lists SPECIAL template.
   - Buyer purchases with credit spend.
   - Seller reward and platform fee appear in settlement.
3. Participant account operations:
   - Admin deactivates/restores participant.
   - Admin anonymizes participant (soft anonymize) and response history remains queryable.
4. Managed AI billing:
   - Start request -> immediate `SPEND`.
   - Provider failure -> automatic `REFUND`.

## Out of Scope (This Snapshot)
1. Full browser automation for OAuth redirect flow
2. Migration job file ingest end-to-end fixtures
3. Refund dispute workflow automation
