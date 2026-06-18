# [Отображение деталей предмета (ItemDetailDisplay.ts)](../../../../../../../Frontend/Web/ground/branches/itemDetail/_itemDetail/display/ItemDetailDisplay.ts)

## Назначение

`ItemDetailDisplay` — display-модуль для страницы деталей предмета в рамках [`StructuredBranch`](../../../../roots/StructuredBranch.md). Отвечает только за генерацию HTML:

*   `renderSkeleton()` — скелетон карточки предмета.
*   `renderError()` — сообщение об ошибке загрузки.
*   `renderFullPage(context, input)` — полный рендер карточки предмета, wiki-информации и блока игрока.

## Связи

*   Использует существующий [`ItemDetailRenderer`](../components/ItemDetailRenderer.md) для реального рендеринга.
*   Вызывается из [`ItemDetailBranch`](../../ItemDetailBranch.md), наследующего [`StructuredBranch`](../../../../roots/StructuredBranch.md).

---

> 📌 **Подпись документации:** создано в рамках миграции ItemDetail на StructuredBranch · 2026-06-18
