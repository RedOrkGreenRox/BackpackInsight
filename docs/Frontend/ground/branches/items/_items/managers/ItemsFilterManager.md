# [ItemsFilterManager.ts](/Frontend/Web/ground/branches/items/_items/managers/ItemsFilterManager.ts)

## Назначение
`ItemsFilterManager` — фасад поиска и фильтрации страницы предметов. Держит Fuse-индекс и `ItemMatcher` и раздаёт вызовы чистым функциям каталога [filter/](filter/index.md). Синтаксис запросов для пользователя — [search_filter_syntax](../../../../../../search_filter_syntax.md).

## Состояние
- `fuse` — индекс Fuse по `PreparedItem` (публичное поле, `null` до инициализации).
- `preparedItems`, `preparedByKey`, `matcher` — подготовленные предметы, словарь по ключу и сопоставитель.

## Методы
- `initFuse(items)` — готовит предметы ([prepared-items](filter/prepared-items.md)) и строит Fuse с порогом 0.4 и весами полей: имя 2.4, типы 1.4, текст поиска 1.1, герой 1, подсказки 0.35.
- `parseQueryToAST(query)` — [query-parser](filter/query-parser.md).
- `matchAST(item, ast)`, `itemMatchesStrictTag(item, tag)` — [item-matcher](filter/item-matcher.md).
- `applyConcreteFilters(items, filters)` — фильтры панели без строки поиска ([filter-applier](filter/filter-applier.md)).
- `applyPlainTextSearch(items, query)` — обычный режим: спецсимволы вырезаются, остаётся нечёткий поиск ([fuse-search](filter/fuse-search.md)).
- `applyAdvancedSearch(items, query)` — расширенный режим: строгие условия и нечёткие термы.
- `applyFilters(items, filters)` — старый путь «поиск, затем все фильтры состояния». Страница его не вызывает; используется в тестах `items_logic.test.ts`.
- `sortItems(items, sortBy, query)` — [sort-service](filter/sort-service.md).
- `calculateFilterOptions(items)` — списки для панели фильтров ([filter-options](filter/filter-options.md)).

## Потребители
[ItemsManager](ItemsManager.md) — конвейер страницы: фильтры панели → поиск по режиму → сортировка. [ProfileManager](../../../profile/_profile/managers/ProfileManager.md) вызывает `applyAdvancedSearch` для поиска по предметам профиля.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
