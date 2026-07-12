# [api/state.rs](/RBackend/crates/api/src/state.rs)

## Назначение
`AppState` — общее состояние Axum-приложения, доступное в хендлерах через `State<AppState>`. Собирается в `AppState::discover()` на старте.

## Ключевая функциональность
- Поля: `project_root`, `public_base_url`, `api_secret`, `cors_origin`, `max_body_bytes`, `db: Option<db::Db>`, `profile_rate_limiter: Option<RateLimiter>`.
- `discover()` — читает env-переменные, подключает БД (`db::Db::connect_from_env_if_enabled`), запускает сидер `db::seed_itemdefinitions_if_empty` при включённой БД, проверяет наличие сгенерированных паков (`catalog_summary.fb`, `api_items_{en,ru}.fb`).
- `discover_project_root()` — поиск по дереву (env-override или авто-обнаружение `RBackend/`).
- В production требует `ROOT_API_SECRET` (или `ROOT_ALLOW_NO_SECRET=true`).

## Связи
- БД: [db crate](../../db.md).
- Сидер: `db::seed_itemdefinitions_if_empty` (см. [db/src/seed.rs](../../db.md)).
- Лимитер: [security/rate_limit.rs](security/rate_limit.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
