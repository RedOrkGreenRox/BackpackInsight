# [api/security/secret.rs](/RBackend/crates/api/src/security/secret.rs)

## Назначение
Axum middleware для проверки заголовка `x-internal-secret` на защищённых эндпоинтах. Использует `subtle::ConstantTimeEq` для защиты от timing-атак.

## Ключевая функциональность
- `require_api_secret(state, request, next)` — сравнивает заголовок с `AppState::api_secret`.
- При отсутствии/несовпадении → `401` + FlatBuffer `BIER` (code=`unauthorized`).
- Если `api_secret` не задан (dev-режим) — пропускает запрос.

## Связи
- Состояние: [state.rs](../state.md).
- Ошибки: [pack](/docs/RBackend/crates/pack.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
