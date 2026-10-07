# [Пак сводки каталога (flatbuffer.rs)](/RBackend/crates/builder/src/catalog/flatbuffer.rs)

## Назначение
Сборка пака сводки каталога `RBackend/generated/catalog_summary.fb` (идентификатор `"BICS"`, схема `CATALOG_SCHEMA` — `RBackend/schemas/catalog.fbs`, см. [schemas](../../../../schemas.md)).

## `build_catalog_flatbuffer(root)`
1. `write_catalog_flatbuffer_json` пишет временный `CATALOG_JSON` из нелокализованного каталога ([files](files.md)).
2. Внешний `flatc -b` превращает его в `CATALOG_BIN`; без установленного flatc — ошибка с подсказкой.
3. Временный JSON удаляется (`remove_temp_json`) даже при ошибке flatc.
4. Бинарник переименовывается в `CATALOG_FB`, старый файл заменяется.
5. Результат читается `read_catalog_summary` ([pack/catalog](../../../pack/src/catalog.md)) для проверки.

## Содержимое пака
- `PackHeaderJson` — `schema_version` `catalog.fbs@0`, `game_version` = имя исходного файла без расширения, `build_hash` всегда `dev`.
- `ItemSummaryJson` — номер строки, `item_id`, имя, слаг ([core/slug](../../../core/src/slug.md)), ключ картинки ([core/image_key](../../../core/src/image_key.md)), редкость (по умолчанию Common; неизвестная — ошибка).
- `CatalogSummaryJson` — заголовок и список.

## Проверка
`verify_flatbuffer(root, path)` — читает пак по пути или по умолчанию из `RBackend/generated`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
