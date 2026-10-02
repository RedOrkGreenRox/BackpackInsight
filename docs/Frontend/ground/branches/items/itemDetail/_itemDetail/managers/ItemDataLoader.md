# [Загрузчик предмета по slug (ItemDataLoader.ts)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/managers/ItemDataLoader.ts)

## Назначение
Небольшой колбэчный загрузчик одного предмета по slug. Используется [ItemDetailDataLoader](../data/ItemDetailData.md), когда предмета нет ни во входе, ни в кешах.

## API
- `constructor(searchSlug)` — slug искомого предмета.
- `onLoaded(cb)` — колбэк с найденным `ItemDefinition`.
- `onNotFound(cb)` — колбэк, если каталог загружен, но предмета с таким slug нет.
- `onError(cb)` — колбэк, если загрузка каталога выбросила исключение.
- `load()` — вызывает [`ItemsCacheService.getBySlug()`](../../../../../utils/ItemsCacheService.md) и дергает ровно один из колбэков. Флаг `isLoading` защищает от повторного запуска, пока предыдущий вызов не завершён.

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02
