# [Предзагрузка предметов (ItemPreviewPrefetchService.ts)](../../../../Frontend/Web/ground/utils/ItemPreviewPrefetchService.ts)

## Назначение
Статический сервис, который запоминает данные предмета и прогревает его иконку **до клика**, чтобы детали предмета открывались без ожидания сети.

## API
- `prefetch(item, imageSrc)` — сохраняет `{ item, imageSrc }` в `Map` по slug имени ([SlugService](SlugService.md)) и вызывает `preloadImage`. Вызывается из [items-grid-renderer](../branches/items/_items/managers/runtime/items-grid-renderer.md) на событие pointerenter (наведение указателя) по карточке библиотеки.
- `get(rawNameOrSlug)` — возвращает сохранённый `ItemDefinition` по имени или slug (или `undefined`).
- `preloadImage(imageSrc)` — один раз на URL создаёт `new Image()` с `decoding = 'async'` и задаёт `src`, чтобы браузер положил картинку в кеш. Уже прогретые URL хранятся в `Set` и повторно не загружаются.

## Потребители
- [ItemDetailData](../branches/items/itemDetail/_itemDetail/data/ItemDetailData.md) — первым делом ищет предмет через `get()`, затем в [ItemsCacheService](ItemsCacheService.md), и только потом идёт в API.

## Ограничения
Хранилище живёт в памяти вкладки и не очищается; размер ограничен количеством карточек, на которые наводился курсор.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
