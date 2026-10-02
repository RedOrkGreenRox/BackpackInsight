# [items-grid-renderer.ts](/Frontend/Web/ground/branches/items/_items/managers/runtime/items-grid-renderer.ts)

## Назначение
`ItemsGridRenderer` — отрисовка сетки карточек в `#wikiItemsGrid` порциями по 80 (`renderBatchSize`) с подгрузкой при прокрутке.

## Методы
- `render(items)` — очищает сетку, рисует первую порцию и запускает подгрузку.
- `destroy()` — отключает наблюдатель.
- `setupInfiniteScroll(items)` — `IntersectionObserver` на `#itemsScrollSentinel` с запасом 900 px: когда метка близко, дорисовывает следующую порцию. `disconnectInfiniteScroll()` — отключение.
- `appendNextItemsBatch(items)` — добавляет порцию одним фрагментом; когда всё нарисовано, отключает наблюдатель.
- `createCardLink(item, index)` — ссылка `/items?item=<слаг>` с атрибутами анимации AOS (задержка до 300 мс). При наведении запускает предзагрузку данных и картинки ([ItemPreviewPrefetchService](../../../../../utils/ItemPreviewPrefetchService.md)); клик не переходит по ссылке, а вызывает `onCardClick`, который [ItemsManager](../ItemsManager.md) связывает с открытием карточки предмета.
- `createCard(item, imageSrc, index)` — картинка ([ItemsIconService](../../services/ItemsIconService.md) и [ImageFormatService](../../../../../utils/ImageFormatService.md)), имя и редкость. Первые 12 картинок (`eagerImagesCount`) грузятся сразу с высоким приоритетом, остальные лениво. Имя и редкость вставляются в разметку без экранирования; данные приходят из собственного пака каталога.
- `animateVisible(grid, start, end)` — обновляет AOS и сразу запускает анимацию появления у новых карточек, которые уже на экране.
- `grid()` — элемент сетки.

Ошибки загрузки картинок (`data-fallback`) обрабатывает [image-error-handler](image-error-handler.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
