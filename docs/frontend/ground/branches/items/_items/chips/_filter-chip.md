# [Чип фильтра (_filter-chip.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/chips/_filter-chip.scss)

## Назначение
Базовые стили «чипа» фильтра `.filter-chip` (кнопка-таблетка), включая активное состояние, иконки внутри и icon-only вариант.

## Задаваемые стили
### `.filter-chip`
*   Геометрия: `padding:8px 16px; border-radius:20px; min-height:36px; display:inline-flex; align-items:center; justify-content:center; gap:8px; white-space:nowrap; line-height:1`.
*   Стекло: `background: rgba(255,255,255,0.1)`; `border:1px solid rgba(255,255,255,0.2)`.
*   Текст: `color: var(--text-default-color); font-size:0.9rem; font-family:'Signika'; text-shadow:0 1px 2px rgba(0,0,0,0.5)`.
*   `cursor:pointer; transition: all 0.2s ease`.
*   `&:hover`: фон/рамка ярче, `translateY(-1px)`.
*   `&.active`: `background: var(--azure); border-color: var(--azure); color:white; box-shadow: 0 0 10px rgba(var(--azure-raw),0.5)`.

### Иконки `.filter-icon, .text-icon`
*   `20x20`, `object-fit:contain`. В блоке `#filterHeroes` увеличены до `32x32`.
*   Icon-only чипы (`:has(.filter-icon):not(:has(span))`) → квадрат `40x40`, `padding:8px`.

## AI-контекст
*   Окраску текста редкостей добавляет [_rarity-colors](_rarity-colors.md); здесь — базовая форма/состояния. Использует современный `:has()` для icon-only вёрстки.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
