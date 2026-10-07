# [Применение фильтров к списку (filter-applier.ts)](/Frontend/Web/ground/branches/items/_items/managers/filter/filter-applier.ts)

## Назначение
Применение фильтров из `FilterState` ([ItemsStateManager](../ItemsStateManager.md)) к списку предметов.

## Экспорт
- `applyConcreteFilters(items, filters, matcher)` — фильтры панели по порядку: типы, редкости, герои (пустой герой считается `Shared`), источники открытия (пустой — `Unknown`), флаг покупаемости, баффы, дебаффы, характеристики. Для каждой группы есть включение и исключение. Баффы, дебаффы и характеристики проверяются `itemMatchesStrictTag` ([item-matcher](item-matcher.md)), остальное — сравнением полей.
- `applyFilters(items, filters, matcher)` — то же плюс строгий разбор `searchQuery` без тегов сортировки через [query-parser](query-parser.md). Используется только старым путём `ItemsFilterManager.applyFilters()`.

## Внутреннее
- `filterBySet(items, set, matcher, negated)` — предмет проходит, если совпал хотя бы один тег (или ни один при исключении).
- `normalizeHero(hero)` — `Hob Gang` приводится к `Hob`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
