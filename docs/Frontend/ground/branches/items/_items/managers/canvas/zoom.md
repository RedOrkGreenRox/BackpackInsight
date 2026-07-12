# [canvas/zoom.ts](/Frontend/Web/ground/branches/items/_items/managers/canvas/zoom.ts)

## Назначение
`ZoomEngine` — «полёт камеры» к выбранной карточке: grid-контейнер получает `translate+scale` с `transform-origin` в центре фокус-карточки, и карточка «прилетает» в центр вьюпорта в ~2–4× масштабе. Поверх рисуется overlay с детализацией предмета через `ItemDetailRenderer.renderFullPage()`.

## Ключевая функциональность
- `enter(idx)`, `focusIdx(idx)`, `exit()`, `recompute()` — управление состоянием зума.
- Overlay `.canvas-detail-inset` переиспользует HTML из [ItemDetailRenderer](../../../../itemDetail/_itemDetail/components/ItemDetailRenderer.md).
- Перехват кликов по nav-кнопкам внутри overlay (prev/next → `focusIdx`, back → `exit`) с `stopPropagation`.
- Baseline `translate(0,0) scale(1)` обеспечивает корректную интерполяцию CSS-transition.

## Связи
- Рендерер: [ItemDetailRenderer](../../../../itemDetail/_itemDetail/components/ItemDetailRenderer.md).
- Типы: [types.ts](types.md), [api-types.ts](../../../../../types/api-types.md).
- Стили: [canvas/_canvas.scss](../../canvas/_canvas.md).

---
> 📌 **Подпись документации:** FE-1 карусель · 2026-07-12.
