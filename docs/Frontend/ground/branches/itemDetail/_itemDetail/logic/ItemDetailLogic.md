# [Логика деталей предмета (ItemDetailLogic.ts)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/logic/ItemDetailLogic.ts)

## Назначение

`ItemDetailLogic` — logic-модуль для страницы деталей предмета в рамках [`StructuredBranch`](../../../../roots/StructuredBranch.md). Управляет:

*   навигацией `prev/next` между предметами ([`ItemNavigationManager`](../managers/ItemNavigationManager.md));
*   SEO-обновлением ([`ItemSEOManager`](../managers/ItemSEOManager.md));
*   обработчиком копирования текста.

## Связи

*   Использует [`ItemNavigationManager`](../managers/ItemNavigationManager.md) и [`ItemSEOManager`](../managers/ItemSEOManager.md).
*   Вызывается из [`ItemDetailBranch`](../../ItemDetailBranch.md), наследующего [`StructuredBranch`](../../../../roots/StructuredBranch.md).

---

> 📌 **Подпись документации:** создано в рамках миграции ItemDetail на StructuredBranch · 2026-06-18
