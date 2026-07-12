# [ItemsCanvasController.ts](/Frontend/Web/ground/branches/items/_items/managers/canvas/ItemsCanvasController.ts)

## Назначение
Главный оркестратор интерактивной сетки предметов (карусели): магнитное притяжение, 3D-наклон, click-to-zoom, навигация с клавиатуры, swipe, кастомные события. Создан как часть FE-1 (карусель).

## Ключевая функциональность
- `init(root, host)` — монтирует контроллер в DOM, поднимает sub-engines.
- `destroy()` — снимает все слушатели и MutationObserver.
- `refreshCardMap()` — пересчитывает карту карточек (на мутациях сетки).
- `setItems(items)` — синхронизация списка предметов после фильтрации.
- rAF-throttled pointer loop, `aria-activedescendant` для доступности.

## Связи
- Подконтроллеры: [magnetic](magnetic.md), [zoom](zoom.md), [keyboard](keyboard.md), [swipe](swipe.md), [canvas-events](canvas-events.md).
- Host: [ItemsManager](../ItemsManager.md) (поставляет `getFilteredItems`).
- Стили: [canvas/_canvas.scss](../../canvas/_canvas.md).
- Типы: [types.ts](types.md), [api-types.ts](../../../../../types/api-types.md).

## Инварианты
- Файл ≤150 строк (ARENA.MD правило); host-объекты вынесены в [controller-hosts](controller-hosts.md).

---
> 📌 **Подпись документации:** FE-1 карусель · 2026-07-12.
