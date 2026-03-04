# Special Template Runtime (Draft)

## Purpose
- Provide a plugin-style runtime to render and validate special templates in participant flows.
- Keep default fallback (`JSON editor`) for unknown template schemas.

## Runtime Entry
- File: `apps/web/src/lib/template-runtime/special-renderers.tsx`
- Resolver: `resolveSpecialTemplateRenderer(schema)`

## Renderer Interface
- `matches(schema): boolean`
- `createInitialDraft(schema): { jsonText, state }`
- `render({ locale, schema, draft, onChangeDraft, disabled })`
- `buildResponse({ schema, draft }) -> { ok, responseJson | errorCode }`

## Built-in Renderers
1. `emotion_stimulus_judgment_v1`
- Intended for 정서 자극 판단 과제
- Schema expects:
  - `kind`
  - `stimuli[]` (`id`, `text`/`label`)
  - `scale` (`min`, `max`, optional `labels`)
  - optional `dimensions[]` (defaults to `valence`, `arousal`)

2. `self_aspect_inventory_v1`
- Intended for 자기 측면 검사
- Schema expects:
  - `kind`
  - `prompts[]` (`id`, `text`)
  - `aspects[]` (`id`, `label`)
  - `scale` (`min`, `max`, optional `labels`)

3. `special.json-fallback`
- Used when no specialized renderer matches.
- Stores raw JSON response.

## Participant Integration
- Page client: `apps/web/src/app/[locale]/participant/ParticipantDashboardClient.tsx`
- Flow:
  1. Load package survey (`GET /api/participant/packages/{packageId}/survey`)
  2. Resolve renderer per `SPECIAL` template
  3. Build validated response payload before `POST /api/participant/packages/respond`

## Notes
- This runtime is deliberately schema-driven.
- New renderer can be added without changing participant submission API shape.
