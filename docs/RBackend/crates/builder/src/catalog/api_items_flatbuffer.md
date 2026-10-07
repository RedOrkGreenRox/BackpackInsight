# [Паки предметов для API (api_items_flatbuffer.rs)](/RBackend/crates/builder/src/catalog/api_items_flatbuffer.rs)

## Назначение
Сборка паков предметов для API: `RBackend/generated/api_items_en.fb` и `api_items_ru.fb` (схема `RBackend/schemas/api_items.fbs`, `API_ITEMS_FILE_IDENTIFIER` = `"BIAI"`). Эти паки отдаёт [api/routes/packs](../../../api/src/routes/packs.md) и читает [middleware/items](../../../middleware/src/items.md).

## `build_api_items_flatbuffers(root)`
Для каждого языка: `write_api_items_json` → `run_flatc` → `remove_temp_json` → переименование `.bin` в `.fb` → `verify_api_items_file` (файл не короче 8 байт, байты 4–8 равны идентификатору).

## Подготовка данных
- `merged_items(root)` — берёт EN-каталог, добавляет каждому предмету `names_local` и `tooltips_local` (`with_localization`), затем вливает RU-имя и подсказки (`merge_ru_localization` через `set_localized_field`). Предмет, которого нет в EN, добавляется из RU. Поле `embargoed` удаляется.
- `apply_language(items, lang)` — подставляет в `name` и `tooltips` значения нужного языка; словари локализаций остаются в предмете.
- `write_api_items_json` — `schema_version` `api_items.fbs@1`, язык и список пар `item_id` + значение. `item_id` достаёт поле `id`; предмет без него пропускается.
- `json_to_pack_value(value)` — переводит JSON в тегированное значение схемы (Null, Bool, Int, Float, String, Array, Object); целое больше `i64::MAX` обрезается до максимума.

Параметр зеркального языка в `with_localization` всегда передаётся пустым.

## Проверка
`verify_api_items_flatbuffers(root)` — читает оба пака через `read_api_items` ([pack/api_items](../../../pack/src/api_items.md)).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
