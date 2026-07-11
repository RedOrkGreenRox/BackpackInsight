# [Детализация предмета (ItemDetailBranch.ts)](../../../../../Frontend/Web/ground/branches/itemDetail/ItemDetailBranch.ts)

## Назначение

Класс `ItemDetailBranch` координирует отображение детальной информации о конкретном игровом предмете. Он реализован через [`StructuredBranch`](../../roots/StructuredBranch.md) и делегирует ответственность трём модулям:

*   **Display** — [`ItemDetailDisplay`](_itemDetail/display/ItemDetailDisplay.md) рендерит HTML.
*   **Data** — [`ItemDetailData`](_itemDetail/data/ItemDetailData.md) загружает данные предмета.
*   **Logic** — [`ItemDetailLogic`](_itemDetail/logic/ItemDetailLogic.md) управляет навигацией, SEO и обработчиками.

## Ключевая логика

### 1. Жизненный цикл
`StructuredBranch` вызывает:
1. `loadData(input)` → [`ItemDetailData`](_itemDetail/data/ItemDetailData.md).
2. `renderFullPage(context, input)` → [`ItemDetailDisplay`](_itemDetail/display/ItemDetailDisplay.md).
3. `createLogic(context, root)` → [`ItemDetailLogic`](_itemDetail/logic/ItemDetailLogic.md).
4. При уничтожении `destroy()` — `ItemDetailLogic` очищает слушатели и восстанавливает SEO.

### 2. Динамическое SEO
`ItemDetailBranch` передаёт `meta` через [`StructuredBranch`](../../roots/StructuredBranch.md). Заголовок формируется из названия предмета, полученного из URL или из `playerItem`.

## Связи (Dependencies)

*   **Display**: [`ItemDetailDisplay`](_itemDetail/display/ItemDetailDisplay.md), [`ItemDetailRenderer`](_itemDetail/components/ItemDetailRenderer.md).
*   **Data**: [`ItemDetailData`](_itemDetail/data/ItemDetailData.md), [`ItemDataLoader`](_itemDetail/managers/ItemDataLoader.md).
*   **Logic**: [`ItemDetailLogic`](_itemDetail/logic/ItemDetailLogic.md), [`ItemNavigationManager`](_itemDetail/managers/ItemNavigationManager.md), [`ItemSEOManager`](_itemDetail/managers/ItemSEOManager.md).

---

> 📌 **Подпись документации:** обновлено в рамках миграции ItemDetail на StructuredBranch · 2026-06-18
