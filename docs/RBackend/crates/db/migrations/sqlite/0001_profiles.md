# [sqlite/0001_profiles.sql](/RBackend/crates/db/migrations/sqlite/0001_profiles.sql)

## Назначение
Первая миграция для SQLite (локальная разработка): таблица `profiles`, по смыслу совпадающая с [pg/0001_profiles](../pg/0001_profiles.md).

## Отличия от Postgres
- Типы: `INTEGER PRIMARY KEY AUTOINCREMENT` вместо BIGSERIAL, `INTEGER` вместо BIGINT, время хранится как TEXT с `CURRENT_TIMESTAMP`.
- `profile_fb` — BLOB со значением по умолчанию `x''` (в Postgres значения по умолчанию нет).

Индексы те же: `idx_profiles_nickname`, `idx_profiles_level`, `idx_profiles_trophy`. Колонку `profile_fb` удаляет [0002](0002_normalized_tables.md).

Выбор каталога миграций по адресу `sqlite:` — [db/lib](../../src/lib.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
