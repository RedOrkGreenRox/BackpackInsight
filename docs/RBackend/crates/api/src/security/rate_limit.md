# [api/security/rate_limit.rs](/RBackend/crates/api/src/security/rate_limit.rs)

## Назначение
Per-IP rate limiter для `POST /api/profile.fb` (паритет с Python `slowapi` 20/minute). Token bucket с burst = `per_minute` и равномерным refill.

## Ключевая функциональность
- `RateLimiter` — структура с `DashMap<IpAddr, bucket>`.
- `parse_rate_limit(raw)` — парсит `20` или `20/m` или `0` (disable).
- `rate_limit_profile(state, request, next)` — Axum middleware: при превышении → `429` + FlatBuffer `BIER` (code=`rate_limited`).

## Связи
- Конфиг: `ROOT_PROFILE_RATE_LIMIT` env (см. [state.rs](../state.md)).
- Ошибки: [pack](/docs/RBackend/crates/pack.md) → `build_api_error_bytes`.

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
