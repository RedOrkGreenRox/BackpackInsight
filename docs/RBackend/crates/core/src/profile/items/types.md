# [Типы предметов профиля (types.rs)](/RBackend/crates/core/src/profile/items/types.rs)

## Назначение
Доменные типы предметов профиля.

## Типы
- `ItemRarity` — перечисление редкостей каталога: `Common`, `Rare`, `Epic`, `Legendary`, `Mythic`, `Unique`, `Relic`, `Boon`, `Special`.
  - `as_str()` и `Display` — английское имя редкости;
  - `FromStr` — точное (с учётом регистра) сопоставление имени; неизвестное имя даёт ошибку `unknown item rarity: …`.
- `ItemLevel(u32)` — уровень предмета, считается с 1 (после разбора сырого профиля).
- `Cards(u32)` — количество карт; `Default` = 0.
- `ItemLevelInfo` — сводка: `cards_need` (`Option<Cards>`, `None` — улучшение картами невозможно), `total_xp` (`Xp`) и `upgradable`.

## Связи
`ItemRarity` используют также [catalog/columns](../../catalog/columns.md), сборщик паков и API (через [rarity](rarity.md)).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
