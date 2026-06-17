# Подсеть фильтрации и поиска страницы «Предметы»

## Назначение
Каталог `filter/` содержит чистую бизнес-логику поиска: подготовку предметов, Fuse-поиск, fuzzy-алиасы, строгий AST matcher, числовые сравнения и сортировку.

## Узлы
- [alias-fuzzy](alias-fuzzy.md) — fuzzy-поиск по словарю алиасов.
- [comparison](comparison.md) — числовые условия.
- [filter-applier](filter-applier.md) — применение legacy `FilterState`.
- [filter-options](filter-options.md) — расчёт списков фильтров.
- [filter-types](filter-types.md) — общие типы и веса.
- [fuse-search](fuse-search.md) — оркестратор search-пайплайна.
- [fuse-collector](fuse-collector.md) — агрегация Fuse score.
- [fuzzy-term-guard](fuzzy-term-guard.md) — защита коротких терминов.
- [item-matcher](item-matcher.md) — AST/exact matcher.
- [prepared-items](prepared-items.md) — подготовка `PreparedItem`.
- [query-parser](query-parser.md) — парсер строгого запроса.
- [search-plan](search-plan.md) — разделение free text и `[]`-условий.
- [search-score](search-score.md) — хранение score.
- [sort-service](sort-service.md) — сортировка.

## Связи
- Внешний facade: [ItemsFilterManager](../ItemsFilterManager.md).
- UI-слой: [runtime index](../runtime/index.md).
- Алиасы: [term-aliases.ru.json](../../../../../../../static/search/term-aliases.ru.md).

---

> 📌 **Подпись документации:** подсеть поиска items · 2026-06-17
