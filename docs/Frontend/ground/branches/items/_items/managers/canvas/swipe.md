# [canvas/swipe.ts](/Frontend/Web/ground/branches/items/_items/managers/canvas/swipe.ts)

## Назначение
`SwipeController` — обработка touch-событий: `touchstart`/`touchmove` кормят magnetic engine (палец = курсор), `touchend` интерпретирует жест.

## Ключевая функциональность
- `attach()`, `detach()` — lifecycle-методы для чистого подключения/отключения.
- `<8px` delta → tap (enter/exit zoom).
- `>8px` delta → swipe в доминантном направлении → соседняя карточка.

## Связи
- Типы: [types.ts](types.md).
- Хосты: [controller-hosts](controller-hosts.md).
- Магнит: [magnetic](magnetic.md).

---
> 📌 **Подпись документации:** FE-1 карусель · 2026-07-12.
