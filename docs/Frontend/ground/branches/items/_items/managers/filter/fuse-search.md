# [Точки входа поиска (fuse-search.ts)](/Frontend/Web/ground/branches/items/_items/managers/filter/fuse-search.ts)

## Назначение
Точки входа поиска для [ItemsFilterManager](../ItemsFilterManager.md). Перед каждым поиском старые оценки релевантности снимаются (`clearSearchScores`, [search-score](search-score.md)).

## Экспорт
- `applySearch(items, rawQuery, fuse, matcher)` — расширенный режим: строит план ([search-plan](search-plan.md)), последовательно применяет каждое строгое условие (`applyStructuredSearch` — разбор [query-parser](query-parser.md) и проверка [item-matcher](item-matcher.md)), затем, если есть термы, — нечёткий поиск ([fuse-collector](fuse-collector.md)).
- `applyPlainTextSearch(items, rawQuery, fuse)` — обычный режим: символы `[ ] { } < > ! & | ( )` заменяются пробелами, остаётся только нечёткий поиск по термам. Пустой запрос возвращает копию списка.
- `withoutSearch(filters)` — копия `FilterState` с пустым `searchQuery`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
