# [Renderer layout страницы предметов (ItemsLayoutRenderer.ts)](../../../../../../../Frontend/Web/ground/branches/items/_items/components/ItemsLayoutRenderer.ts)

## Назначение
`ItemsLayoutRenderer` создаёт статический HTML-каркас страницы `/items`: заголовок, rich search input, advanced panel, dropdown-категории фильтров, сетку карточек и sentinel infinite scroll.

## Актуальная структура
- `#itemSearch` — contenteditable rich input.
- `#advancedFiltersPanel` — раскрываемая панель фильтров.
- Категории создаются через `renderDropdown(id, label)`.
- `filterLogic` представлен блоком «Логика запроса» с шаблонами группы, AND/OR/NOT.
- `filterFlags` содержит boolean-флаги, включая `Purchasable`.
- `#wikiItemsGrid` содержит skeleton до загрузки данных.

## Связи
- Runtime-оркестратор: [ItemsManager](../managers/ItemsManager.md).
- Панель: [advanced-panel-controller](../managers/runtime/advanced-panel-controller.md).
- Chips: [multiselect-filter-controller](../managers/runtime/multiselect-filter-controller.md).
- Стили панели: [advanced-panel.scss](../filters/_advanced-panel.md).

---

> 📌 **Подпись документации:** layout renderer items · 2026-06-17
