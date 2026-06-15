# [Переменные редкостей (_rarity-vars.scss)](../../../../../../Frontend/Web/ground/roots/_roots/items/_rarity-vars.scss)

## Назначение
Определяет в `:root` палитру редкостей **Backpack Brawl**: базовые цвета и производные переменные (text/glow/bg/border) для 9 редкостей.

## Задаваемые переменные
### Общая
*   `--rarity-border-unified: #321F19` — единый цвет рамки для всех редкостей.
### Базовые цвета (`--rarity-{X}-base`)
*   common `#EFEFEF`, rare `#AFE5FF`, epic `#E59FFF`, legendary `#FF8E56`, mythic `#ff5555`, unique `#00ffaa`, relic `#ff69b4`, boon `#FFD19A`, special `#FFEB7A`.
### Производные (для каждой редкости)
*   `--rarity-{X}-text` = base; `--rarity-{X}-glow` = base; `--rarity-{X}-bg` = `color-mix(in srgb, base, black 60%)`; `--rarity-{X}-border` = unified.

## Связи (Dependencies)
*   Потребители: [_item-rarities](_item-rarities.md), [_rarity-colors (чипсы)](../../../branches/items/_items/chips/_rarity-colors.md) и др.

## AI-контекст
*   Это единый источник правды по цветам редкостей. `bg` вычисляется через `color-mix` (затемнение base на 60%). Новая редкость = base + 4 производные здесь.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
