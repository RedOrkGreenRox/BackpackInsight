# [search/_prompt-lists.scss](/Frontend/Web/ground/branches/items/_items/search/_prompt-lists.scss)

## Назначение
Стили положительных/отрицательных списков чипсов в подсказке поиска (prompt-panel-top + prompt lists).

## Ключевая функциональность
- `.prompt-panel-top` — верх панели подсказок: сетка «содержимое + кнопка» во всю ширину.
- `.prompt-lists` — две колонки списков; `.prompt-list` — блок списка, `.prompt-list-positive` (зелёная рамка) и `.prompt-list-negative` (красная), `.prompt-list-title` — их заголовки.
- `.prompt-list-items` — ряд токенов; пустой список (`.empty`) показывает текст из `data-empty`.
- `.prompt-token` — токен в списке: `.include` зелёный, `.exclude` красный; внутри иконка `.filter-icon` или `.text-icon`.
- `.advanced-formula-preview` — блок предпросмотра логической формулы во всю ширину.
- `.advanced-search-help` — раскрывающаяся справка (`details`/`summary`); `.advanced-search-help-content` — её выпадающая панель с анимацией `helpPanelIn`.
- `.copy-example` и `.copy-query-btn` — строка примера запроса и кнопка «скопировать».
- `.dropdown-filter` и `.logic-category` — блоки фильтров и логических операторов под верхом панели, с отступом между соседями.
- До 768px всё складывается в одну колонку.

## Связи
- Логика: [items-prompt-chips-controller](../managers/runtime/items-prompt-chips-controller.md).
- Контейнер: `_input.scss` (поиск).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.; селекторы сверены с исходником · 2026-10-06
