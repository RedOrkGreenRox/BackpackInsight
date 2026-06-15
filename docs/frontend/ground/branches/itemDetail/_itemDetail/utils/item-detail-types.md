# [Типы деталей предмета (item-detail-types.ts)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/utils/item-detail-types.ts)

## Назначение
Определения TypeScript-интерфейсов для страницы деталей предмета: данные игрока по предмету, агрегированные данные страницы и состояние навигации.

## Связи (Dependencies)
*   Импортирует и реэкспортирует `ItemDefinition` из [Сервиса иконок (ItemIconService)](../../../../utils/ItemIconService.md).

## Подробное описание типов
*   `PlayerItemData` — `name`, `level`, `cards`, `cards_need` (данные конкретного экземпляра предмета у игрока).
*   `ItemDetailData` — `name?`, `playerItem?: PlayerItemData`, `itemData?: ItemDefinition | null` (полный набор для рендера; наличие `playerItem` = режим профиля).
*   `NavigationState` — `prev`/`next` (имена соседних предметов или `null`).
*   Реэкспорт `ItemDefinition` для удобного импорта потребителями деталей.

## AI-контекст
*   `ItemDefinition` намеренно реэкспортируется отсюда, чтобы компоненты деталей не зависели напрямую от `ItemIconService`. Поле `cards_need === -1` — соглашение «карты не показывать».

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
