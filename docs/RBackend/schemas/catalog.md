# [catalog.fbs](/RBackend/schemas/catalog.fbs)

## Назначение
Схема сводки каталога `catalog_summary.fb` (пространство имён `BackpackInsight.Catalog`, корень `CatalogSummaryPack`, идентификатор `"BICS"`). Короткая запись на каждый предмет: без подсказок и характеристик.

## Таблицы
| Таблица | Поля |
| :--- | :--- |
| `CatalogSummaryPack` | `header`, `items` — обязательные |
| `PackHeader` | `schema_version` (обязательное; сборка пишет `catalog.fbs@0`), `game_version`, `build_hash` |
| `ItemSummary` | `row`, `item_id`, `name`, `slug`, `image_key`, `rarity` |

`Rarity` — перечисление `Common`, `Rare`, `Epic`, `Legendary`, `Mythic`, `Unique`, `Relic`, `Boon`, `Special` (значения 0–8).

## Кто пишет и читает
- Сборка: [builder/catalog/flatbuffer](../crates/builder/src/catalog/flatbuffer.md).
- Чтение: [pack/catalog](../crates/pack/src/catalog.md); проверка готовности сервера `/ready` ([routes/health](../crates/api/src/routes/health.md)).
- Отдача: `GET /api/catalog-summary.fb` ([routes/packs](../crates/api/src/routes/packs.md)).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
