# [search-plan.ts](/Frontend/Web/ground/branches/items/_items/managers/filter/search-plan.ts)

## Назначение
`buildSearchPlan(rawQuery)` делит запрос расширенного режима на две части: строгие условия для [item-matcher](item-matcher.md) и взвешенные нечёткие термы для [fuse-collector](fuse-collector.md).

## Типы
- `WeightedTerm` — `value`, `weight`, `group` (номер группы, которую должен покрыть предмет).
- `SearchPlan` — `terms`, `strictQueries`, `groupCount`.

## Алгоритм
1. Убирает теги сортировки `{…}` (`stripSortTags`), заглушки групп (`sanitizeGroupPlaceholders` из [rich-group-renderer](../runtime/rich-group-renderer.md)), переводит слова логики в символы (`normalizeLogicWords`).
2. Если в запросе есть `&` или `|` (`hasGlobalLogic`), весь запрос уходит строгим условием, термов нет.
3. Иначе текст между скобками (`pushText`): начинающийся с `!` или похожий на сравнение (`isStrictText`, `isComparison`) — строгий; остальное — терм с весом 2.4.
4. Скобка (`processBracket`, конец ищет `findMatchingBracket`): `[Purchasable]` в любом виде превращается в `[<Purchasable>]` или `[!<Purchasable>]` (`isPurchasable`, `purchasableQuery`); вложенная, логическая, отрицательная, точная `<…>` или сравнение (`isStructuredBracket`, `isStrictToken`) — строгое условие; иначе терм с весом `weightForChip`: герой 1, тип 1.4, прочее 1.1 (`isHero`, `isLikelyType` — зашитые списки).
5. `addTerm` раскрывает терм через алиасы ([alias-fuzzy](alias-fuzzy.md)); все варианты получают одну группу, вес умножается на вес алиаса.

## Потребители
[fuse-search](fuse-search.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
