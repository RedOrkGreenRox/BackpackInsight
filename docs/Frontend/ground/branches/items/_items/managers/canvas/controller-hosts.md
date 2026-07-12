# [canvas/controller-hosts.ts](/Frontend/Web/ground/branches/items/_items/managers/canvas/controller-hosts.ts)

## Назначение
Фабрики host-объектов для sub-контроллеров (events / swipe / keyboard), привязанные к родительскому `ItemsCanvasController`. Извлечены, чтобы держать основной файл контроллера ≤150 строк (правило ARENA.MD).

## Ключевая функциональность
- `buildEventsHost(controller)` → `CanvasEventsHost`.
- `buildSwipeHost(controller)` → `SwipeHost`.
- `buildKeyboardHost(controller)` → `KeyboardHost`.

## Связи
- Контроллер: [ItemsCanvasController](ItemsCanvasController.md).
- Подконтроллеры: [canvas-events](canvas-events.md), [swipe](swipe.md), [keyboard](keyboard.md).

---
> 📌 **Подпись документации:** FE-1 карусель · 2026-07-12.
