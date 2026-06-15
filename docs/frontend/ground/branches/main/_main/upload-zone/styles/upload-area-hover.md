# [Состояния hover/drag области загрузки (upload-area-hover.scss)](../../../../../../../../Frontend/Web/ground/branches/main/_main/upload-zone/styles/upload-area-hover.scss)

## Назначение
Визуальная обратная связь зоны `.upload-area` при наведении и при перетаскивании файла поверх.

## Задаваемые стили

### `.upload-area:hover`
*   `background: rgba(0,0,0,0.7)`; `border-color: rgba(255,255,255,0.8)`.

### `.upload-area.drag-over`
*   `background: rgba(0,0,0,0.8)`; `border-color: rgba(255,255,255,1)` — белая рамка как сигнал «можно бросать».

## Связи (Dependencies)
*   Класс `.drag-over` навешивает/снимает [Drag-and-Drop обработчик](../handlers/DragDropHandler.md).

## AI-контекст
*   `drag-over` — программный класс из JS, а не псевдокласс. Меняя имя, синхронизируйте с `DragDropHandler`.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
