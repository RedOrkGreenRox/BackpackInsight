# [core/catalog/columns.rs](/RBackend/crates/core/src/catalog/columns.rs)

## Назначение
`CatalogColumns` — колоночное хранилище каталога предметов: каждая колонка — вектор, строка таблицы — `ItemId` ([ids](ids.md)). Строковые колонки хранят `StringId` из общего [StringPool](strings.md), поэтому совпадающие значения (например, `item_id` и `name`) не дублируются.

## Типы
- `CatalogItemInput` — вход одной строки: `item_id`, `name`, `rarity` (`ItemRarity`, см. [items/rarity](../profile/items/rarity.md)), необязательный `first_tooltip`.
- `CatalogColumns` — колонки `item_ids`, `names`, `slugs`, `image_keys`, `rarities`.

## API
- `new()` — пустая таблица.
- `push(input)` — добавляет строку: интернирует `item_id` и имя, вычисляет slug ([slug](../slug.md)) и ключ картинки ([image_key](../image_key.md)), возвращает `ItemId` новой строки.
- `len()`, `is_empty()` — число строк; `string_count()` — число уникальных строк в пуле.
- Геттеры по строке: `item_id(row)`, `name(row)`, `slug(row)`, `image_key(row)`, `rarity(row)`; для несуществующей строки — `None`.

## Потребители
Диагностическая утилита [cli](../../../cli/src/main.md). Подробнее о задумке — [core_catalog_columns](../../../core_catalog_columns.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
