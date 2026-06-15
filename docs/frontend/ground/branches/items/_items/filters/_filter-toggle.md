# [Кнопка-тоггл расширенных фильтров (_filter-toggle.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/filters/_filter-toggle.scss)

## Назначение
Стили кнопки `.filter-toggle-btn`, раскрывающей/скрывающей [панель расширенных фильтров](_advanced-panel.md), и её иконки `.filter-toggle-icon`.

## Задаваемые стили
### `.filter-toggle-btn`
*   `width:100%; padding:12px 20px; display:flex; justify-content:space-between; align-items:center`.
*   `background: rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.2); border-radius:8px`.
*   Текст: `color: var(--text-default-color); font-size:1rem; font-family:'Signika'; text-shadow:0 1px 2px rgba(0,0,0,0.5)`.
*   `&:hover`: темнее, `border-color: var(--azure)`, `translateY(-1px)`, тень.
*   `&:active`: `translateY(0)`.
*   `&.open`: `border-color: var(--azure)`, фон `rgba(0,0,0,0.7)`, `border-radius:8px 8px 0 0` (стыковка с панелью), `overflow:visible`.
### `.filter-toggle-icon`
*   `color: var(--azure); font-size:0.8rem; transition: transform 0.3s ease`.
*   `&.open` → иконка `transform: rotate(180deg)`.

## AI-контекст
*   Верхние скругления в `.open` намеренно стыкуются с нижними у `.advanced-filters-panel`, образуя единый блок.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
