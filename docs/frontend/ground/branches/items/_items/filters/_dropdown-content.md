# [Контент выпадающего фильтра (_dropdown-content.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/filters/_dropdown-content.scss)

## Назначение
Стили раскрывающейся панели фильтров `.dropdown-content` с анимацией раскрытия и кастомным скроллбаром.

## Задаваемые стили

### `.dropdown-content` (свёрнуто)
*   `position:relative; background: rgba(0,0,0,0.7); border-radius:8px 8px 0 0`.
*   Свёрнутое состояние: `max-height:0; min-height:0; padding:0; opacity:0; overflow:hidden; transform: translateY(-20px)`.
*   `transition: all 0.4s cubic-bezier(0.4,0,0.2,1)` — плавное раскрытие.

### `&.show` (развёрнуто)
*   `max-height:500px; padding:12px; opacity:1; transform: translateY(0)`.
*   `overflow-y:auto; overflow-x:hidden`; тень `box-shadow: 0 4px 20px rgba(0,0,0,0.5)`.

### Кастомный скроллбар (`::-webkit-scrollbar`)
*   Ширина `8px`; трек `rgba(255,255,255,0.1)` со скруглением `4px`.
*   Ползунок `background: var(--azure)`, при наведении `rgba(var(--azure-raw),0.8)`.

## AI-контекст
*   Раскрытие сделано через анимацию `max-height` (0 → 500px), а не `display`, чтобы работал `transition`. Если контент выше 500px — увеличьте лимит.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
