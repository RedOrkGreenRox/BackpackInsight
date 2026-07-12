# [canvas/types.ts](/Frontend/Web/ground/branches/items/_items/managers/canvas/types.ts)

## Назначение
Общие типы для подсети canvas-контроллера: `CardEntry`, `PointerPos`, `CanvasFlags`, `readFlags()`, `makeFlagsGetter()`.

## Ключевая функциональность
- `CardEntry { el, cx, cy, dirty }` — кеш центра карточки + флаг активной трансформации.
- `PointerPos { x, y }` — позиция курсора/пальца.
- `CanvasFlags { magnetic, tilt, zoom, reducedMotion, lowRes }` — предрасчитанные флаги режима.
- `readFlags()` — собирает флаги из [SettingsService](../../../../../utils/SettingsService.md) + `matchMedia` + `body.low-res-mode`.
- `makeFlagsGetter()` — кешированный + автоинвалидирующийся геттер.

## Связи
- Подписчик: [SettingsService](../../../../../utils/SettingsService.md).
- Используется: [magnetic](magnetic.md), [zoom](zoom.md), [keyboard](keyboard.md).

---
> 📌 **Подпись документации:** FE-1 карусель · 2026-07-12.
