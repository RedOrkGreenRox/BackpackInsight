# [Типы API (api-types.ts)](/Frontend/Web/ground/types/api-types.ts)

## Назначение
Общие TypeScript-интерфейсы данных фронтенда: каталог предметов и профиль игрока. В эти формы приводят FlatBuffer-паки декодеры [flatbuffer-decoders](../middleware/flatbuffer-decoders.md).

## Каталог предметов
- `CombatStats` — боевые характеристики: `damageMin`, `damageMax`, `accuracy`, `staminaCost`, `cooldown`, `criticalChance`, `criticalDamage` (каждая `number | null`).
- `Recipe` — рецепт: `resultId` и список `ingredientIds`.
- `LevelChange` — изменение характеристики на уровне: `level`, `stat`, `value`, `type`.
- `LevelInfo` — прокачка: `maxLevel`, шансы (`chancePerLevel`, `baseChance`, `chanceBreakpointBonus`), `abilityDescription` и список `changes`.
- `ItemDefinition` — предмет каталога: `id`, `name`, `rarity`, `coinValue`, `itemTypes`, `connectedHero`, `unlockSource`, форма `itemShape` и звёзды `itemStars` (массивы `{x, y}`), `purchasable`, `recipes`, `combatStats`, `tooltips`, `allStats`, `levels`.

## Профиль игрока
- `PlayerHero` — герой в профиле: `name`, `level`, `rating`, `experience`, `exp_req`, `prestige`, `league`, `skin_num`.
- `PlayerItem` — предмет инвентаря: `name`, `rarity`, `level`, `cards`, `cards_need`.
- `PlayerProfile` — профиль целиком: никнейм, уровень, трофеи, валюты, опыт, область, `item_stats`, списки героев и предметов со счётчиками, версии игры, `profile_skins` и необязательный `itemsSort` (`'rarity' | 'level'`).

## Связи
- Серверные схемы: [Backend/schemas](../../../Backend/schemas.md).
- `ItemDefinition` реэкспортирует [ItemIconService](../utils/ItemIconService.md); его используют [ItemsCacheService](../utils/ItemsCacheService.md), [ItemsBranch](../branches/items/ItemsBranch.md) и [детали предмета](../branches/items/itemDetail/_itemDetail/utils/item-detail-types.md).

---
> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
