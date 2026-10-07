# [Сортировка результатов поиска (sort-service.ts)](/Frontend/Web/ground/branches/items/_items/managers/filter/sort-service.ts)

## Назначение
`sortItems(items, sortBy, query)` — сортировка результатов поиска по цепочке критериев; возвращает новый массив.

## Как выбираются критерии (`resolveCriteria`)
1. Если у предметов есть оценки поиска (`hasScores`), первым идёт `relevance`.
2. Теги в запросе (`parseSortTags`, `tagToCriterion`): `{relevance}`, `{rarity down}`, `{rarity up}`, `{alphabet up}`, `{alphabet down}` — если они есть, `sortBy` не используется.
3. Иначе массив `SortPriority` из [items-runtime-types](../runtime/items-runtime-types.md) переводится `priorityToCriterion`.
4. Иначе строка старого формата (`legacySort`: `rarity`, `rarity-up`, `name`, `alphabet-down`, `relevance`); при наличии оценок она игнорируется.
5. Повторы убираются (`dedupe`).

## Сравнение
`compareByCriteria` идёт по критериям, пока `compareOne` не даст ненулевой результат: оценка по убыванию, вес редкости `RARITY_WEIGHTS` ([filter-types](filter-types.md)) или имя через `localeCompare`.

[ItemsManager](../ItemsManager.md) всегда передаёт цепочку «релевантность, редкость по убыванию», а запрос — только в расширенном режиме, поэтому теги `{…}` работают только там.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
