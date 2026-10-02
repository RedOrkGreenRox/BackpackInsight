# [Отображение деталей предмета (ItemDetailDisplay.ts)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/display/ItemDetailDisplay.ts)

## Назначение
Тонкий адаптер контракта `BranchDisplay` из [StructuredBranch](../../../../../roots/StructuredBranch.md): переводит вызовы жизненного цикла бранча в статические методы [ItemDetailRenderer](../components/ItemDetailRenderer.md). Логики и состояния не содержит.

## Экспорты
- `ItemDetailInput` — вход подстраницы: необязательные `name`, `playerItem` и `itemData` (типы взяты из [`ItemDetailData`](../utils/item-detail-types.md)). Именно этот объект передаёт [ItemsManager](../../../_items/managers/ItemsManager.md) в `mount()`.
- `ItemDetailDisplay`:
  - `renderSkeleton()` → `ItemDetailRenderer.renderSkeleton()`;
  - `renderError(error)` — пишет ошибку в `console.error` и возвращает `ItemDetailRenderer.renderError()`;
  - `renderFullPage(context)` — подставляет `{ prev: null, next: null }`, если `navigation` не посчитан, и вызывает `ItemDetailRenderer.renderFullPage(context, nav)`.

## Связи
- Регистрируется в [ItemDetail_Branch](../../ItemDetail_Branch.md) как `display`.

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02
