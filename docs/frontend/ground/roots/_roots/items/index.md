# [Главный агрегатор предметов (_items.scss)](../../../../../../Frontend/Web/ground/roots/_roots/items/_items.scss)

## Назначение
Этот файл является точкой сборки всей системы стилей предметов. Он не содержит кода, а лишь координирует правильный порядок загрузки зависимостей через `@use`.

---

## Порядок загрузки
1.  [`_rarity-vars.scss`](_rarity-vars.md) — сначала инициализируются цвета.
2.  [`_items-grid.scss`](_items-grid.md) — макет сетки.
3.  Компоненты карточки:
    *   [`_item-card.scss`](_item-card.md)
    *   [`_item-image.scss`](_item-image.md)
    *   [`_item-name.scss`](_item-name.md)
    *   [`_item-rarities.scss`](_item-rarities.md)
    *   [`_item-level.scss`](_item-level.md)
    *   [`_item-link.scss`](_item-link.md)

---

## Связи (Dependencies)
*   Подключается в глобальный файл стилей [**_roots.scss**](../_roots.md).

---

> 📌 **Подпись документации:** создано вручную в рамках глубокого аудита кодовой базы · 2026-06-15
