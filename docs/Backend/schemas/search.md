# [Схема поискового индекса (search.fbs)](/Backend/schemas/search.fbs)

## Назначение
Схема поискового индекса (пространство имён `BackpackInsight.Search`, корень `SearchIndexPack`, идентификатор `"BISR"`): для каждого токена — номера строк предметов, где он встречается.

## Таблицы
- `SearchIndexPack` — `schema_version`, `lang`, `postings`, все обязательные.
- `TokenPosting` — `token` и `item_rows` (номера строк, как `row` в [catalog](catalog.md)), обязательные.

## Использование
Схема нигде не используется: Rust-биндингов для неё нет, builder такой пак не собирает. Поиск предметов полностью выполняется в браузере по загруженному каталогу ([ItemsFilterManager](../../Frontend/ground/branches/items/_items/managers/ItemsFilterManager.md)).

## Планируется
Готовый индекс для поиска без полного каталога; срок не определён.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
