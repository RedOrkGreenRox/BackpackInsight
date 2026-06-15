# [Кнопка очистки фильтров (_clear-btn.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/actions/_clear-btn.scss)

## Назначение
Стили кнопки `.filter-clear-btn` («сбросить фильтры») в полупрозрачном стиле.

## Задаваемые стили

### `.filter-clear-btn`
*   Геометрия: `padding:10px 20px; border-radius:6px`.
*   Фон/рамка: `background: rgba(255,255,255,0.1)`; `border: 1px solid rgba(255,255,255,0.2)`.
*   Текст: `color: var(--text-default-color)`; `font-size:0.9rem`; `font-family:'Signika', sans-serif`; `text-shadow:0 1px 2px rgba(0,0,0,0.5)`.
*   `cursor: pointer`; `transition: all 0.2s ease`.

### `&:hover`
*   Подсветка фона `rgba(255,255,255,0.2)` и рамки `rgba(255,255,255,0.4)`.

## AI-контекст
*   Семейство шрифта задано явно (`Signika`) — кнопка вне основного типографического контекста.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
