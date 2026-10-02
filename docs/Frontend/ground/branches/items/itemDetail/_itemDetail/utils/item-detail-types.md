# [Типы деталей предмета (item-detail-types.ts)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/utils/item-detail-types.ts)

## Назначение
Общие TypeScript-типы подстраницы деталей предмета. Используются загрузчиком данных, рендерерами и логикой.

## Типы
- `PlayerItemData` — предмет из инвентаря игрока: `name`, `level`, `cards` (собрано карт), `cards_need` (нужно до следующего уровня; `-1` — максимальный уровень, строка с картами не выводится).
- `ItemDetailData` — контекст страницы: необязательные `name` (имя/slug из входа или URL), `playerItem` (присутствует только в режиме профиля), `itemData` (`ItemDefinition | null`) и `navigation`.
- `NavigationState` — соседние предметы в текущем списке: `prev` и `next` (имя или `null`).
- `ItemDefinition` — реэкспорт типа из [ItemIconService](../../../../../utils/ItemIconService.md), который, в свою очередь, берёт его из [api-types](../../../../../types/api-types.md).

## Связи
- Заполняется в [ItemDetailData](../data/ItemDetailData.md).
- Потребители: [ItemDetailRenderer](../components/ItemDetailRenderer.md), [ItemDetailParts](../components/ItemDetailParts.md), [ItemGridRenderer](../components/ItemGridRenderer.md), [ItemDetailLogic](../logic/ItemDetailLogic.md).

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02
