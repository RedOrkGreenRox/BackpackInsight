# [Чтение предметов профиля (items.rs)](/Backend/crates/api/src/profile/items.rs)

## Назначение
Чтение предметов из объекта `Item` профиля. Значение — строка `уровень:карты`, где уровень хранится с нуля; ключ — id или имя предмета в каталоге.

## API
- `ProfileItemView` — то, что уходит в ответ: `name`, `rarity`, `level`, `cards`, `cards_need` (`-1`, если уровень максимальный).
- `ProfileItemRecord` — `item_id` и `total_xp` для записи в БД; в пак не попадает.
- `ProfileItemRead` — пара из представления и полей для БД.
- `read_items(json, project_root, lang)` — при пустом или отсутствующем `Item` каталог не загружается. Иначе берёт словарь из `catalog_lookup` ([catalog_cache](catalog_cache.md)); ошибка загрузки каталога — `Err`.
- `item_stats(items)` — число предметов по редкостям.
- Реэкспорт `CatalogItemLite` из [catalog_cache](catalog_cache.md).

## `read_item`
Уровень = сохранённое значение + 1. Предмет, которого нет в каталоге, или строка с ошибкой формата пропускаются без ошибки. Нужное число карт и суммарный опыт считает `ItemLevelService::inspect` ([core/items](../../../core/src/profile/items/mod.md)).

## Тесты
Работают только при собранном `api_items_en.fb`, иначе молча проходят.
- `reads_frontend_item_view` — Wooden Sword `5:200`: уровень 6, нужно 100 карт, опыт 190.
- `skips_unknown_and_malformed_items`.
- `builds_item_stats` — два предмета Common.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
