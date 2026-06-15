# [Характеристики игрока в деталях (_player-stats.scss)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/player-stats/_player-stats.scss)

## Назначение
Стили блока вики-статистики предмета: контейнеры `.player-stats-block`/`.wiki-stats-block`, строки информации, блок описания и сетка боевых характеристик.

## Задаваемые стили

### `.player-stats-block, .wiki-stats-block`
*   `width: 100%`.

### `.wiki-stats-block`
*   `font-size: var(--wiki-stats-text-size)` — единый размер шрифта всего блока.
*   `* { font-size: inherit; }` — все потомки наследуют этот размер (ключевой приём унификации).

### `.info-row`
*   `display:flex; align-items:center; gap:0.5em; flex-wrap:wrap` — строка «иконка + значение», переносится на мобильных.
*   `padding: 0.25rem 0`; `color: var(--text-default-color)`.

### `.item-description`
*   Карточка описания: `margin:1rem 0; padding:1rem; background: rgba(0,0,0,0.2); border-radius:0.5rem`.
*   Акцентная полоса слева: `border-left: 0.2rem solid var(--azure)`.
*   `white-space: pre-wrap` (сохраняет переносы), `text-align: left`.
*   Подэлементы `.header-text, .value-text`: `color: var(--text-header-color); font-weight: bold`.

### `.combat-stats ul`
*   `list-style:none; padding:0; display:grid`.
*   Адаптивная сетка: `grid-template-columns: repeat(auto-fit, clamp(7.5rem,15vw,10rem))`, `gap:0.6rem`, `justify-content:start`.
*   `li`: карточка стата `background: rgba(0,0,0,0.15)`, `border:1px solid rgba(var(--azure-raw),0.1)`, `border-radius:0.4rem`, фиксированная ширина `clamp(7.5rem,15vw,10rem)`, `white-space:nowrap`, флекс «название ↔ значение».

## AI-контекст
*   Вся типографика блока управляется одной переменной `--wiki-stats-text-size` + `font-size: inherit`. Не задавайте размеры шрифта потомкам жёстко — сломаете единый масштаб.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
