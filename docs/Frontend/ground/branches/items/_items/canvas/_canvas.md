# [canvas/_canvas.scss](/Frontend/Web/ground/branches/items/_items/canvas/_canvas.scss)

## Назначение
Стили карусели: трансформации сетки, focus-ring, zoom-overlay, reduced-motion guards. Импортируется из `items.scss` через `@use "./_items/canvas/canvas"`.

## Ключевая функциональность
- `.items-grid { transform-origin, will-change, transition: transform+opacity }`.
- `.item-card-link { contain, will-change, focus+is-selected ring }`.
- Нуллификация `:hover { transform: translateY(-5px) }` на `.item-card` (чтобы inline magnetic transform владел состоянием).
- `.canvas-detail-inset` overlay (fixed, 76vw×76vh, fade+scale transition, переиспользует `.item-detail-container`).
- `body.canvas-zoomed` overflow hidden + dim non-focused cards.
- `@media (prefers-reduced-motion: reduce)` и `body.low-res-mode` guards.

## Связи
- Контроллер: [ItemsCanvasController](../managers/canvas/ItemsCanvasController.md).
- Переиспользует: `.item-detail-container` (см. itemDetail стили).

---
> 📌 **Подпись документации:** FE-1 карусель · 2026-07-12.
