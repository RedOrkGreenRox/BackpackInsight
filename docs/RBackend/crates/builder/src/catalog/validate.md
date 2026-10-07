# [Проверка каталога (validate.rs)](/RBackend/crates/builder/src/catalog/validate.rs)

## Назначение
`validate_catalog(root)` — проверка нелокализованного каталога (`latest_plain_items_file`, см. [files](files.md)).

## Правила
- Ошибки: нет `id`, повторный `id`, нет `rarity`, рецепт ссылается на неизвестный `resultId` или `ingredientIds`.
- Предупреждения: совпадающие слаги (`SlugService::to_slug` от имени, [core/slug](../../../core/src/slug.md)) только считаются.
- Значение редкости здесь не разбирается — только наличие поля.

## API
- `CatalogValidationReport` — `items`, `recipes_checked`, `duplicate_slug_warnings`.
- `validate_recipes(items, ids, errors)` — проверка рецептов, возвращает число проверенных.
- `format_errors(title, errors)` — сводка с первыми 50 ошибками и счётчиком остальных.

## Тесты
`validates_repository_plain_catalog` — на данных репозитория: больше 1000 предметов, есть рецепты и дубли слагов.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
