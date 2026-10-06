# [sqlite/0002_normalized_tables.sql](/RBackend/crates/db/migrations/sqlite/0002_normalized_tables.sql)

## Назначение
Вторая миграция для SQLite: те же таблицы `itemdefinition`, `hero`, `item`, связи и индексы, что в [pg/0002_normalized_tables](../pg/0002_normalized_tables.md).

## Индексы
Те же шесть, что в Postgres: `idx_hero_profile_id`, `idx_hero_name`, `idx_item_profile_id`, `idx_item_item_id`, `idx_itemdefinition_rarity`, `idx_itemdefinition_connected_hero`.

## Отличия от Postgres
- Типы: `INTEGER PRIMARY KEY AUTOINCREMENT`, `INTEGER` вместо BIGINT, флаги `purchasable` и `prestige` — INTEGER со значением по умолчанию 0, время — TEXT.
- Удаление старой колонки — `ALTER TABLE profiles DROP COLUMN profile_fb` без `IF EXISTS` (SQLite не поддерживает эту форму); повторного запуска нет, потому что sqlx отмечает выполненные миграции.

SQLite проверяет внешние ключи только при включённом `PRAGMA foreign_keys`; код [db/lib](../../src/lib.md) эту настройку не задаёт и полагается на значение по умолчанию драйвера sqlx, который её включает.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-06
