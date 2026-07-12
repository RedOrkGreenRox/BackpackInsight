# [canvas/keyboard.ts](/Frontend/Web/ground/branches/items/_items/managers/canvas/keyboard.ts)

## Назначение
`KeyboardController` — навигация по сетке с клавиатуры через `event.code` (физические клавиши, не зависят от раскладки).

## Ключевая функциональность
- ArrowUp/KeyW, ArrowDown/KeyS, ArrowLeft/KeyA, ArrowRight/KeyD → движение по сетке (WASD + ЦФЫВ/ЙЦУКЕН в одном обработчике).
- Enter/Space — toggle zoom.
- Escape — exit zoom.
- Home/End — первая/последняя карточка.
- PageUp/PageDown — прыжок на 3 ряда.
- Tab — falls through к нативной навигации фокуса.
- `colsFromGrid(grid)` — чтение числа колонок из `getComputedStyle`.
- `ensureCardVisible(card)` — скролл в видимость.

## Связи
- Типы: [types.ts](types.md).
- Хосты: [controller-hosts](controller-hosts.md).

---
> 📌 **Подпись документации:** FE-1 карусель · 2026-07-12.
