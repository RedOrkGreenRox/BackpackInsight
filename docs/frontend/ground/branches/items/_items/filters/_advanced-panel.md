# [Панель расширенных фильтров (_advanced-panel.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/filters/_advanced-panel.scss)

## Назначение
Раскрывающаяся панель `.advanced-filters-panel` с анимацией раскрытия (скрыта по умолчанию, разворачивается классом `.show`).

## Задаваемые стили
### `.advanced-filters-panel` (свёрнуто)
*   `background: rgba(0,0,0,0.7); border-radius: 0 0 8px 8px`.
*   `display:none; max-height:0; padding:0; opacity:0; overflow:hidden; transform: translateY(-20px)`.
*   `transition: all 0.4s cubic-bezier(0.4,0,0.2,1)`.

### `&.show`
*   `display:block; padding:20px; max-height:2000px; overflow:visible; opacity:1; transform: translateY(0)`.

## AI-контекст
*   Нижние скругления (`0 0 8px 8px`) стыкуются с тоггл-кнопкой [_filter-toggle](_filter-toggle.md). Раскрытие через `max-height` (до 2000px) — учитывайте при очень длинных списках.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
