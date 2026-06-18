# [Данные деталей предмета (ItemDetailData.ts)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/data/ItemDetailData.ts)

## Назначение

`ItemDetailData` — data-модуль для страницы деталей предмета в рамках [`StructuredBranch`](../../../../roots/StructuredBranch.md). Загружает данные предмета по slug из URL или по `playerItem`, переданному из профиля.

## Связи

*   Использует [`ItemDataLoader`](../managers/ItemDataLoader.md), [`ItemsCacheService`](../../../../utils/ItemsCacheService.md) и [`ItemPreviewPrefetchService`](../../../../utils/ItemPreviewPrefetchService.md).
*   Вызывается из [`ItemDetailBranch`](../../ItemDetailBranch.md), наследующего [`StructuredBranch`](../../../../roots/StructuredBranch.md).

---

> 📌 **Подпись документации:** создано в рамках миграции ItemDetail на StructuredBranch · 2026-06-18
