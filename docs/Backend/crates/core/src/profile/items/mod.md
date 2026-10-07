# [Правила предметов профиля (mod.rs)](/Backend/crates/core/src/profile/items/mod.rs)

## Назначение
Правила предметов профиля: редкость, сколько карт нужно до следующего уровня, сколько опыта даёт текущий уровень. `ItemLevelService` объединяет их в одну сводку.

## Подмодули
- `cards` → `CardsService` — [cards](cards.md).
- `rarity` → `RarityService` — [rarity](rarity.md).
- `types` → `Cards`, `ItemLevel`, `ItemLevelInfo`, `ItemRarity` — [types](types.md).
- `xp` → `ItemXpService` — [xp](xp.md).

## `ItemLevelService::inspect(rarity, level, cards)`
Возвращает `ItemLevelInfo`:
- `cards_need` — `CardsService::cards_need(rarity, level)`;
- `total_xp` — `ItemXpService::total_xp(rarity, level)`;
- `upgradable` — `CardsService::is_upgradable(cards, cards_need)`.

Пример: Common, уровень 10, 500 карт → нужно 400, опыт 1240, можно улучшить.

## Связи
- Вызывается в [api/profile/items](../../../../api/src/profile/items.md). Обзор: [core_items](../../../../core_items.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
