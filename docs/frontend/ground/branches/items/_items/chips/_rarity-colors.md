# [Цвета редкостей чипсов (_rarity-colors.scss)](../../../../../../../Frontend/Web/ground/branches/items/_items/chips/_rarity-colors.scss)

## Назначение
Окрашивает текст чипсов-фильтров (`.filter-chip`) внутри `#filterRarities` в цвета соответствующих редкостей предметов **Backpack Brawl**.

## Связи (Dependencies)
*   [Переменные дизайна](../../../../roots/_roots/_vars.md): берёт эталонные цвета `--rarity-*-text`.

## Задаваемые стили

### Контекст `#filterRarities .filter-chip`
*   `&[class*="rarity-"] span`: `font-weight:600; text-shadow:0 1px 2px rgba(0,0,0,0.8)` — общий стиль текста любого чипа редкости.
*   Цвета по классам (через CSS-переменные):
    *   `.rarity-common span` → `--rarity-common-text`
    *   `.rarity-rare span` → `--rarity-rare-text`
    *   `.rarity-epic span` → `--rarity-epic-text`
    *   `.rarity-legendary span` → `--rarity-legendary-text`
    *   `.rarity-mythic span` → `--rarity-mythic-text`
    *   `.rarity-unique span` → `--rarity-unique-text`
    *   `.rarity-relic span` → `--rarity-relic-text`
    *   `.rarity-boon span` → `--rarity-boon-text`
    *   `.rarity-special span` → `--rarity-special-text`
*   **Активное состояние** `&.active[class*="rarity-"] span`: текст становится `white` с усиленной тенью `0 1px 2px rgba(0,0,0,0.9)` (на залитом активном фоне).

## AI-контекст
*   Никогда не задавайте hex цветов редкости здесь — только переменные `--rarity-*-text`. Добавление новой редкости = новый класс + новая переменная в `_vars.scss`.

---

> 📌 **Подпись документации:** актуализировано при аудите сетевой документации (добавлен детальный разбор стилей).
