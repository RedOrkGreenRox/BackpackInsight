# [style/roots/_roots/items/_items.scss](/RBackend/crates/branches/style/roots/_roots/items/_items.scss)

## Назначение
Агрегатор глобальных стилей предметов: подключает переменные и все атомы через `@use` в правильном порядке.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/roots/_roots/items/_items.scss](/docs/Frontend/ground/roots/_roots/items/_items.md).
Общие стили каркаса: подключаются в [site.scss](../../../site.md) глобально.

## Содержимое
- Подключает: [`rarity-vars`](_rarity-vars.md), [`items-grid`](_items-grid.md), [`item-card`](_item-card.md), [`item-image`](_item-image.md), [`item-name`](_item-name.md), [`item-rarities`](_item-rarities.md), [`item-level`](_item-level.md), [`item-link`](_item-link.md).

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
