# [Renderer layout страницы предметов (ItemsLayoutRenderer.ts)](../../../../../../../Frontend/Web/ground/branches/items/_items/components/ItemsLayoutRenderer.ts)

## Назначение
`ItemsLayoutRenderer` создаёт статический HTML-каркас страницы `/items`: заголовок, rich search input, advanced panel, dropdown-категории фильтров, сетку карточек и sentinel infinite scroll.

## Методы
- `render()` — статический каркас страницы (без данных), используется и как скелетон, и как полная страница в [ItemsBranch](../../ItemsBranch.md).
- `renderDropdown(id, label)` (приватный) — категория фильтра: кнопка `.dropdown-toggle` с `data-target` и пустой контейнер `#<id>.dropdown-content.filter-multiselect`, который наполняет [multiselect-filter-controller](../managers/runtime/multiselect-filter-controller.md).

## Структура разметки
- `.wiki-header`: заголовок `items_title`, подзаголовок и `.search-container`.
- `#itemSearch` — contenteditable rich-поле поиска (`.search-input-rich`) и кнопка `#advancedFiltersToggle` раскрытия панели.
- `#advancedFiltersPanel` (скрыта по умолчанию):
  - списки условий `#positiveFilterList` («Искать») и `#negativeFilterList` («Исключить») в `.prompt-lists`;
  - справка `#advancedSearchHelp` (наполняет [items-help-controller](../managers/runtime/items-help-controller.md));
  - блок «Продвинутая логика запроса» (класс `advanced-only`) с логическими чипами: группа `[]`, И `&`, ИЛИ `|`, НЕ `!`;
  - превью формулы `#advancedFormulaPreview`;
  - восемь категорий-дропдаунов: `filterTypes`, `filterRarities`, `filterHeroes`, `filterUnlockSources`, `filterBuffs`, `filterDebuffs`, `filterStats`, `filterFlags` (флаг «можно купить»);
  - `#clearFilters` и переключатель `#advancedModeToggle` «Продвинутые настройки».
- `#wikiItemsGrid` — сетка с 12 карточками-скелетонами из [LoadingStates](../../../../utils/LoadingStates.md).
- `#itemsScrollSentinel` — маркер бесконечной прокрутки для [items-grid-renderer](../managers/runtime/items-grid-renderer.md).

## Связи
- Runtime-оркестратор: [ItemsManager](../managers/ItemsManager.md).
- Панель: [advanced-panel-controller](../managers/runtime/advanced-panel-controller.md).
- Chips: [multiselect-filter-controller](../managers/runtime/multiselect-filter-controller.md).
- Стили панели: [advanced-panel.scss](../filters/_advanced-panel.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
