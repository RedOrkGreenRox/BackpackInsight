# [Стили списка предметов (items.scss)](../../../../../Frontend/Web/ground/branches/items/items.scss)

## Назначение
Корневой агрегатор стилей страницы «Список всех предметов»: подключает дизайн-систему и все атомы страницы через `@use`, плюс задаёт служебный `.items-scroll-sentinel` (маяк для бесконечной прокрутки).

## Связи (Dependencies)
Подключает [корневые стили](../../roots/_roots/_vars.md) и атомы:
*   Макет: [_layout](_items/layout/_layout.md).
*   Поиск: [_container](_items/search/_container.md), [_input](_items/search/_input.md).
*   Фильтры: [_filters](_items/filters/_filters.md), чипсы [_filter-chip](_items/chips/_filter-chip.md), [_rarity-colors](_items/chips/_rarity-colors.md).
*   Действия: [_filter-actions](_items/actions/_filter-actions.md), [_clear-btn](_items/actions/_clear-btn.md), [_checkbox](_items/actions/_checkbox.md).
*   Адаптив: [_tablet](_items/responsive/_tablet.md), [_mobile](_items/responsive/_mobile.md).
*   Анимации: [_loading-spinner](_items/animations/_loading-spinner.md), [_fade-up](_items/animations/_fade-up.md).

## Задаваемые стили
*   `.items-scroll-sentinel { width:100%; height:1px }` — невидимый элемент-«сентинел» в конце списка; по его появлению во вьюпорте [ItemsBranch](ItemsBranch.md) подгружает следующую порцию (IntersectionObserver).

## AI-контекст
*   Это barrel-файл: правьте атомы в `_items/*`, а не здесь. Логику самого скролла/догрузки см. в [ItemsBranch](ItemsBranch.md); `.items-scroll-sentinel` — контракт между стилями и этой логикой.

---

> 📌 **Подпись документации:** актуализировано при аудите (полнота, точность, ссылки).
