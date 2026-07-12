# [api/routes/health.rs](/RBackend/crates/api/src/routes/health.rs)

## Назначение
Liveness/readiness пробы для Docker healthcheck и оркестратора.

## Ключевая функциональность
- `health()` — `GET /health` → `text/plain` `ok service=api`.
- `ready(state)` — `GET /ready` → проверяет наличие сгенерированных FlatBuffer-паков.

## Связи
- Использует `AppState` из [state.rs](../state.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
