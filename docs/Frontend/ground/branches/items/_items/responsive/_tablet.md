# [Планшетная адаптация Вики (_tablet.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/responsive/_tablet.scss)

## Назначение
Коррекция элементов библиотеки предметов для экранов шириной до 768px.

---

## Изменения
*   **Заголовок** `.main-title`: `clamp()` для динамического размера; подзаголовок `.wiki-subtitle` — `1rem`.
*   **Отступы по краям** (`10px`) у `.filter-controls` и `.search-container`, чтобы контент не прилипал к краям экрана.
*   **Панель** `.advanced-filters-panel`: отступ 15px; подписи `.filter-label` — `0.85rem`.
*   **Чипсы** `.filter-chip`: шрифт `0.8rem`, высота от 32px; иконки `.filter-icon`/`.text-icon` — 18px, у героев `#filterHeroes` — 28px; зазор в `.filter-multiselect` — 6px.
*   **Инпут** `.search-input`: шрифт `1rem`.

---

> 📌 **Подпись документации:** атомарный стиль библиотеки · 2026-06-15; селекторы сверены с исходником · 2026-10-06
