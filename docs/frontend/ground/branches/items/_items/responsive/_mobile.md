# [Мобильная адаптация предметов (_mobile.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/responsive/_mobile.scss)

## Назначение
Переопределения для экранов `≤480px`: компактные чипы, иконки, подписи и поле поиска.

## Задаваемые стили (`@media (max-width: 480px)`)
*   `.filter-chip`: `padding:5px 10px; font-size:0.75rem; min-height:30px`; иконки `16x16` (в `#filterHeroes` — `24x24`).
*   `.filter-multiselect`: `gap:4px`.
*   `.advanced-filters-panel`: `padding:12px`.
*   `.filter-label`: `font-size:0.8rem`.
*   `.search-input`: `padding:10px 15px; font-size:0.9rem`.

## AI-контекст
*   Только `@media`. База — в соответствующих атомах фильтров/поиска.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
