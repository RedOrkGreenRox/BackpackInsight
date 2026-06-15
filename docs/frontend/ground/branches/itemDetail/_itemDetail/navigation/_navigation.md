# [Навигация в деталях (_navigation.scss)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/navigation/_navigation.scss)

## Назначение
Стили «липкой» панели навигации между предметами (`.item-navigation-top`/`.item-navigation-bottom`) и её кнопок (`.nav-btn-top`/`.nav-btn-bottom`, `.back-btn`) на странице деталей предмета.

## Задаваемые стили

### `.item-navigation-top`
*   `position: sticky; top: 20px; z-index: 10` — панель «прилипает» при прокрутке.
*   Раскладка: `display:flex; gap:0.75rem; width:100%; max-width:550px; margin-bottom:1.5rem`.
*   `pointer-events: auto`.
*   `.nav-group` внутри: `display:flex; flex:1; gap:0.5rem; width:100%`.

### `.nav-btn-top`
*   Центрирование контента: `display:flex; align-items:center; justify-content:center`.
*   Адаптивный padding/шрифт через `clamp()`: `padding: clamp(0.6rem,2vw,0.8rem)`, `font-size: clamp(1rem,2.5vw,1.2rem)`.
*   Стекло: `background: rgba(12,15,22,0.9)`; `border: 1px solid rgba(var(--azure-raw),0.2)`; `border-radius: 0.75rem`.
*   Тень: `box-shadow: 0 4px 12px rgba(0,0,0,0.5)`; `transition: all 0.2s ease`.
*   `&:hover:not(.disabled)`: подсветка `rgba(var(--azure-raw),0.2)`, `border-color: var(--azure)`, `translateY(-2px)`, усиленная тень.
*   `&.back-btn`: фиксированная узкая ширина `flex: 0 0 clamp(3rem,8vw,3.5rem)`.
*   `&.disabled`: `opacity:0.3; cursor:not-allowed`.

### Обратная совместимость
*   `.item-navigation-bottom` и `.nav-btn-bottom` через `@extend` повторяют верхние варианты (нижняя панель: `margin-top:1.5rem; margin-bottom:0`).

### Адаптивность (`@media`)
*   `≤768px`: `top:10px`, уменьшенные `gap`/`padding`.
*   `≤480px`: `top:5px`, `font-size:0.9rem`, `back-btn` сужается до `2.5rem`.

## AI-контекст
*   Цвета акцента берутся из `--azure`/`--azure-raw`. `sticky top` уменьшается на мобильных намеренно — экономия высоты экрана.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
