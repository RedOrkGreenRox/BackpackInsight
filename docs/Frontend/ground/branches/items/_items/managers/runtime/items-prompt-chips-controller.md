# [Списки выбранных фильтров (items-prompt-chips-controller.ts)](/Frontend/Web/ground/branches/items/_items/managers/runtime/items-prompt-chips-controller.ts)

## Назначение
`ItemsPromptChipsController` — два списка выбранных фильтров под строкой поиска: «искать» (`#positiveFilterList`) и «исключить» (`#negativeFilterList`). Каждый выбранный фильтр показан кнопкой `.prompt-token` с иконкой, подписью вида «Тип: Pet» и крестиком. Стили — [search/_prompt-lists](../../search/_prompt-lists.md).

## Методы
- `renderPromptLists()` — перерисовывает оба списка; пустому ставит класс `empty`.
- `promptChips(kind)` — кнопки по множествам `FilterState` ([ItemsStateManager](../ItemsStateManager.md)): выбранные для `include`, исключённые для `exclude`; флаг покупаемости — по `purchasableOnly`.
- `createChipHtml(kind, groupType, value, overrideLabel)` — разметка кнопки с `data-group-type` и `data-value`; иконка — [filter-icon-resolver](filter-icon-resolver.md).
- `getFilterIdForGroup(groupType)` — id контейнера группы для выбора иконок.
- `getGroupLabel(groupType)` — русская подпись группы.
- `escapeHtml`, `escapeAttr` — экранирование.

Для флага в вызов попадают переставленные аргументы: значением становится `filterFlags`, подписью — `Purchasable`, поэтому кнопка показывает «Purchasable: filterFlags» и не получает иконку.

Клик по кнопке (снятие фильтра) обрабатывает [ItemsManager](../ItemsManager.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
