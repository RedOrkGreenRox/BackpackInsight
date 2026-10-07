# [Хранение профилей (lib.rs)](/Backend/crates/db/src/lib.rs)

## Назначение
Crate `db` — хранение профилей через SQLx с драйвером `Any`: один и тот же код работает с Postgres и SQLite (SQLite собирается вместе с бинарником через libsqlite3-sys, системная библиотека не нужна). Публичные функции принимают пул `AnyPool` и не знают, какой драйвер активен.

## API
- `Db` — обёртка над пулом; `pool()` отдаёт ссылку на него.
- `Db::connect_from_env_if_enabled()` — `Ok(None)`, если БД выключена. Иначе ставит драйверы `install_default_drivers`, открывает пул на 5 соединений и прогоняет миграции: `migrations/sqlite` для адреса, начинающегося с `sqlite:`, иначе `migrations/pg`. Миграции вшиты в бинарник макросом `sqlx::migrate!`.
- Реэкспорт: `save_profile`, `HeroSave`, `ItemSave`, `ProfileSave`, `SavedProfile` из [profile](profile.md) и `seed_itemdefinitions_if_empty` из [seed](seed.md).

## Окружение
- `db_enabled()` — если задан `ROOT_DB_ENABLED`, решает только он (`true` или `1`); иначе БД включена, когда задан `DATABASE_URL` или `POSTGRES_SERVER`.
- `database_url()` — непустой `DATABASE_URL`; иначе адрес Postgres из `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_SERVER`, `POSTGRES_PORT`, `POSTGRES_DB` (по умолчанию admin, secret, localhost, 5432, backpack_insight). Ошибки не возвращает, хотя тип результата это допускает.

## Потребители
[api/state](../../api/src/state.md) — подключение и сидирование при старте; [api/routes/profile_binary](../../api/src/routes/profile_binary.md) — сохранение профиля. Обзор crate — [db.md](../../db.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
