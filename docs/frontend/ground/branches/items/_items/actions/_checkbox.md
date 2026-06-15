# [Стили чекбоксов (_checkbox.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/actions/_checkbox.scss)

## Назначение
Стили подписи-обёртки чекбокса фильтра `.filter-checkbox-label` и самого `input[type="checkbox"]` внутри неё.

## Задаваемые стили

### `.filter-checkbox-label`
*   `display:flex; align-items:center; gap:10px` — иконка чекбокса и текст в ряд.
*   `color: var(--text-default-color)`; `font-size: 0.95rem`.
*   `cursor: pointer`; `text-shadow: 0 1px 2px rgba(0,0,0,0.5)` (читаемость на фоне).

### `input[type="checkbox"]`
*   Размер `18px × 18px`; `cursor: pointer`.
*   `accent-color: var(--azure)` — нативная окраска галочки в фирменный azure.

### `span`
*   `user-select: none` — текст подписи нельзя случайно выделить при кликах.

## AI-контекст
*   Цвет галочки управляется нативным `accent-color`, а не кастомной отрисовкой — простой и доступный подход.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
