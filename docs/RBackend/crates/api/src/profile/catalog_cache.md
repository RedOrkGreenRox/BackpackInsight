# [api/profile/catalog_cache.rs](/RBackend/crates/api/src/profile/catalog_cache.rs)

## Назначение
Кеш каталога предметов в памяти процесса, по одному на язык. Паки `api_items_en.fb` и `api_items_ru.fb` собираются при сборке образа и не меняются, поэтому кеш заполняется один раз и не сбрасывается.

## API
- `Lang` — `En` или `Ru`.
- `normalize_lang(lang)` — `ru`, `rus`, `russian` в любом регистре дают `Ru`, всё остальное, включая пустую строку, — `En`.
- `CatalogItemLite` — `item_id`, `name`, `rarity` (`ItemRarity` из [core/items/rarity](../../../core/src/profile/items/rarity.md)).
- `CatalogLookup` — `BTreeMap` от строки к `CatalogItemLite`.
- `catalog_lookup(project_root, lang)` — ссылка `'static` на кеш нужного языка; строит его при первом вызове.

## Внутреннее
- `CATALOG_EN`, `CATALOG_RU` — ячейки `OnceLock`. `PROJECT_ROOT` записывается при каждом вызове, но нигде не читается.
- `get_or_build(cell, build)` — возвращает готовое значение или строит и кладёт его. Ошибка построения не кешируется, следующий вызов попробует снова.
- `build_lookup(project_root, lang)` — читает пак, декодирует через `decode_items` ([middleware/items](../../../middleware/src/items.md)), разбирает редкость `RarityService::parse` (неизвестная редкость — ошибка всего каталога). Каждый предмет кладётся по id и, если имя ещё не занято, по имени.

## Тесты
`normalize_lang_accepts_common_forms`; при наличии паков — `catalog_lookup_returns_cached_reference_on_second_call` и `catalog_lookup_ru_and_en_are_independent`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
