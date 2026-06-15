# [Визуальное представление предмета (_visual.scss)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/visual/_visual.scss)

## Назначение
Стили крупного изображения предмета на странице деталей: контейнер `.item-visual`, обёртка `.item-image-wrapper` с radial-свечением по редкости и само изображение.

## Задаваемые стили

### `.item-visual`
*   `margin: 25px 0` — вертикальные отступы блока.

### `.item-image-wrapper`
*   Фиксированный размер: `width:160px; height:160px; position:relative`.
*   Псевдоэлемент `&::after` — свечение редкости:
    *   Центрируется `top/left:50% + translate(-50%,-50%)`, размер `130% × 130%`.
    *   `background: radial-gradient(circle, var(--rarity-glow-color, rgba(var(--azure-raw),0.2)) 0%, rgba(0,0,0,0) 65%)` — мягкий ореол цвета редкости (с fallback на azure).
    *   `z-index: 0`; `transition: background 0.3s ease`.

### `.item-image-wrapper img`
*   `width:100%; height:100%; object-fit: contain` — картинка целиком.
*   `filter: drop-shadow(0 8px 20px rgba(0,0,0,0.5))` — тень под предметом.
*   `position: relative; z-index: 1` — над свечением.

## AI-контекст
*   Цвет ореола задаётся CSS-переменной `--rarity-glow-color` извне (JS выставляет её по редкости предмета). Fallback — azure.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
