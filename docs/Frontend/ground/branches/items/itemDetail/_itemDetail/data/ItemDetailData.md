# [Загрузчик контекста деталей (ItemDetailData.ts)](../../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/data/ItemDetailData.ts)

## Назначение
`ItemDetailDataLoader` реализует контракт `BranchData` из [StructuredBranch](../../../../../roots/StructuredBranch.md): по входу [`ItemDetailInput`](../display/ItemDetailDisplay.md) собирает полный контекст [`ItemDetailData`](../utils/item-detail-types.md) — данные предмета, предмет игрока и соседей для навигации.

## `load(input)`
1. Копирует `name`, `playerItem`, `itemData` из входа.
2. Если `name` не передан — берёт последний сегмент `location.pathname` (через `decodeURIComponent`).
3. Режим профиля определяется по пути `/profile/item/…`. В этом режиме, если `playerItem` не передан, он восстанавливается из `sessionStorage['profileItemsList']` (`restorePlayerItem`).
4. `itemData` ищется по цепочке: вход → [ItemPreviewPrefetchService](../../../../../utils/ItemPreviewPrefetchService.md) `get()` → [ItemsCacheService](../../../../../utils/ItemsCacheService.md) `getBySlugFromCache()` → API через `loadFromApi`.
5. Считает `navigation` (`calculateNavigation`) и возвращает контекст.

## Приватные методы
- `restorePlayerItem(rawName)` — парсит JSON-список предметов профиля и находит запись с тем же slug ([SlugService](../../../../../utils/SlugService.md)); ошибки парсинга дают `undefined`.
- `loadFromApi(rawName)` — оборачивает колбэчный [ItemDataLoader](../managers/ItemDataLoader.md) в `Promise`; «не найдено» и ошибка сети оба превращаются в `undefined` (рендерер затем покажет «не найдено»).
- `calculateNavigation(itemName, isProfile)` — читает порядок предметов из `sessionStorage`: `profileItemsList` (массив объектов `{ name }`) в профиле или `filteredItemsOrder` (массив имён) в библиотеке. Находит текущий предмет по slug и возвращает соседей; при отсутствии данных или ошибке JSON — `{ prev: null, next: null }`.

## Замечание о режиме профиля
Путь `/profile/item/…` проверяется, но в [core.ts](../../../../../core.md) такой маршрут не зарегистрирован; подстраница сейчас открывается только из библиотеки предметов, поэтому фактически работает режим «библиотека».

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02
