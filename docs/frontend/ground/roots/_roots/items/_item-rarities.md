# [Применение цветов редкостей (_item-rarities.scss)](../../../../../../Frontend/Web/ground/roots/_roots/items/_item-rarities.scss)

## Назначение
Применяет цвета редкостей к классам `.rarity-*`: задаёт `color` текста и CSS-переменную `--rarity-glow-color` для свечения дочерних элементов.

## Связи (Dependencies)
*   Значения берёт из [_rarity-vars](_rarity-vars.md) (`--rarity-*-text`, `--rarity-*-glow`).

## Задаваемые стили
Для каждой редкости (`common, rare, epic, legendary, mythic, unique, relic, boon, special`):
*   `.rarity-{X} { color: var(--rarity-{X}-text); --rarity-glow-color: var(--rarity-{X}-glow); }`.

## AI-контекст
*   `--rarity-glow-color` затем используется, например, в свечении изображения предмета ([_visual](../../../branches/itemDetail/_itemDetail/visual/_visual.md)). Добавление редкости = новый блок здесь + переменные в `_rarity-vars`.
## Полный список селекторов
`.rarity-common`, `.rarity-rare`, `.rarity-epic`, `.rarity-legendary`, `.rarity-mythic`, `.rarity-unique`, `.rarity-relic`, `.rarity-boon`, `.rarity-special` — каждый задаёт `color: var(--rarity-<X>-text)` и `--rarity-glow-color: var(--rarity-<X>-glow)`.


---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
