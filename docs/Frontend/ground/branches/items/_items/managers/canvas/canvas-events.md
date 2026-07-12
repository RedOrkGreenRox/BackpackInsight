# [canvas/canvas-events.ts](/Frontend/Web/ground/branches/items/_items/managers/canvas/canvas-events.ts)

## Назначение
Извлечённые из [ItemsCanvasController](ItemsCanvasController.md) обработчики событий: `attachCanvasEvents()`, `onGridClick()`, `handleTap()`, `handleSwipe()`. Чистые хелперы — контроллер владеет состоянием.

## Ключевая функциональность
- `attachCanvasEvents(host)` — `mousemove`/`mouseleave`/`click`/`keydown`/`scroll`/`resize` + MutationObserver на grid childList.
- `onGridClick(target, host)` — перехват кликов по карточкам → `enterZoom`; модификатор-клик пробрасывает anchor `href="/item/:slug"`.
- `handleTap`, `handleSwipe` — делят жесты на tap/swipe.

## Связи
- Контроллер: [ItemsCanvasController](ItemsCanvasController.md).
- Хосты: [controller-hosts](controller-hosts.md).

---
> 📌 **Подпись документации:** FE-1 карусель · 2026-07-12.
