# [pg/0001_profiles.sql](/RBackend/crates/db/migrations/pg/0001_profiles.sql)

## Назначение
Первая миграция Postgres: таблица `profiles` — одна строка на игрока.

## Таблица `profiles`
| Колонка | Тип | Ограничения |
| :--- | :--- | :--- |
| `id` | BIGSERIAL | первичный ключ |
| `uid` | TEXT | обязательный, уникальный — ключ upsert в [db/profile](../../src/profile.md) |
| `nickname`, `area` | TEXT | обязательные |
| `level` | BIGINT | по умолчанию 1 |
| `trophy`, `bonus_trophy`, `coins`, `gems` | BIGINT | по умолчанию 0 |
| `profile_fb` | BYTEA | обязательный; удаляется миграцией [0002](0002_normalized_tables.md) |
| `created_at`, `updated_at` | TIMESTAMPTZ | по умолчанию `NOW()` |

Индексы: `idx_profiles_nickname`, `idx_profiles_level`, `idx_profiles_trophy`.

Все операторы с `IF NOT EXISTS`. Миграции применяются при подключении в [db/lib](../../src/lib.md) и вшиты в бинарник. Вариант для SQLite — [sqlite/0001_profiles](../sqlite/0001_profiles.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
