# [Планшетная адаптация предметов (_tablet.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/responsive/_tablet.scss)

## Назначение
Переопределения для экранов `≤768px`: панель фильтров, чипы, поиск, заголовки.

## Задаваемые стили (`@media (max-width: 768px)`)
*   `.filter-controls`: `margin:15px auto; padding:0 10px`.
*   `.advanced-filters-panel`: `padding:15px`.
*   `.filter-label`: `font-size:0.85rem; margin-bottom:8px`.
*   `.filter-chip`: `padding:6px 12px; font-size:0.8rem; min-height:32px; gap:4px`; иконки `18x18` (в `#filterHeroes` — `28x28`).
*   `.filter-multiselect`: `gap:6px`.
*   `.search-container`: `margin:15px auto 25px; padding:0 10px`; `.search-input`: `padding:12px 20px; font-size:1rem`.
*   `.main-title`: `clamp(1.8rem,6vw,2.5rem)`; `.wiki-subtitle`: `font-size:1rem`.

## AI-контекст
*   Только `@media`. Промежуточный брейкпоинт между десктопом и `_mobile` (480px).

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
