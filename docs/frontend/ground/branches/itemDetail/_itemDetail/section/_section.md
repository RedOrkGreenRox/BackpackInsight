# [Секции карточки предмета (_section.scss)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/section/_section.scss)

## Назначение
Стили внутренних секций карточки предмета: заголовок, шапка (герой/цена/редкость/типы), блок цены поверх иконки и блок типов.

## Задаваемые стили

### `.item-title`
*   `font-size: clamp(2rem,5vw,2.8rem); margin:0 0 8px; color: var(--text-default-color); font-family: var(--font-family-accent), serif; font-weight:700`; тень `0 2px 10px rgba(0,0,0,0.6)`.

### `.item-header` + `.item-header-left/right`
*   `display:flex; align-items:center; justify-content:center; gap:1em; width:100%`. Левая/правая части — `flex:1`, выравнивание к центру (`flex-end`/`flex-start`), `white-space:nowrap`.

### `.item-rarity`
*   Без плашки: `font-size:1.2rem; font-weight:600; text-transform:uppercase; letter-spacing:2px; text-shadow: 0 0 10px currentColor`.
*   Цвет задаётся классами `rarity-*` (из [_item-rarities](../../../../roots/_roots/items/_item-rarities.md)); `currentColor` в свечении подхватывает этот цвет.

## Связи (Dependencies)
*   Цвета редкости — [_item-rarities](../../../../roots/_roots/items/_item-rarities.md) / [_rarity-vars](../../../../roots/_roots/items/_rarity-vars.md).
*   Иконки героя/типов рендерит [Парсер иконок](../../../../utils/icon-parser.md); раскладку карточки задаёт [_layout](../layout/_layout.md).

### `.item-hero-icon` / `.cost-icon-wrapper`
*   Иконки `2.8em`; `.cost-value` — значение цены поверх иконки золота (`position:absolute; center; font-weight:900`) с многослойной чёрной тенью для читаемости.

### `.item-types-block`
*   `display:flex; gap:0.75em; flex-wrap:wrap; justify-content:center`. `.text-fallback` (когда нет иконки) — плашка `rgba(255,255,255,0.1)`, `padding:0.2em 0.6em; border-radius:6px`.

### Адаптив
*   `≤768px` и `≤480px`: уменьшение `item-title`, `item-rarity`, размеров иконок (`2.2em`/`1.8em`) и gap.

## AI-контекст
*   Свечение редкости через `text-shadow: 0 0 10px currentColor` — цвет автоматически = цвету текста редкости. Меняя палитру редкостей, правьте `_item-rarities.scss`, не здесь.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
