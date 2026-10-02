# [pg/0002_normalized_tables.sql](/RBackend/crates/db/migrations/pg/0002_normalized_tables.sql)

## Назначение
Вторая миграция Postgres: переход от хранения профиля одним бинарным полем к нормализованной схеме из четырёх таблиц — `profiles`, `itemdefinition`, `hero`, `item`.

## Новые таблицы
| Таблица | Колонки | Связи |
| :--- | :--- | :--- |
| `itemdefinition` | `item_id` (уникальный), `name`, `name_ru` (по умолчанию пусто), `rarity`, `coin_value`, `connected_hero`, `unlock_source`, `purchasable` (по умолчанию FALSE), `created_at`, `updated_at` | заполняется [db/seed](../../src/seed.md) |
| `hero` | `profile_id`, `name`, `level`, `experience`, `rating`, `prestige`, `league`, `exp_req`, `created_at` | `profile_id` → `profiles.id`, каскадное удаление |
| `item` | `profile_id`, `item_id`, `level`, `cards`, `cards_need` (по умолчанию −1), `total_xp`, `created_at` | `profile_id` → `profiles.id` и `item_id` → `itemdefinition.item_id`, оба с каскадным удалением |

Индексы: по `profile_id` и `name` у `hero`, по `profile_id` и `item_id` у `item`, по `rarity` и `connected_hero` у `itemdefinition`.

## Удаление старой колонки
`ALTER TABLE profiles DROP COLUMN IF EXISTS profile_fb` — бинарный пак профиля больше не хранится.

Из-за внешнего ключа предмет профиля можно сохранить только после сидирования справочника: поэтому сервер заполняет `itemdefinition` при старте ([api/state](../../../api/src/state.md)). Запись строк — [db/profile](../../src/profile.md). Вариант для SQLite — [sqlite/0002_normalized_tables](../sqlite/0002_normalized_tables.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
