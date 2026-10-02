# [items-runtime-types.ts](/Frontend/Web/ground/branches/items/_items/managers/runtime/items-runtime-types.ts)

## Назначение
Общие типы, списки и значения по умолчанию для контроллеров интерфейса страницы предметов.

## Типы
- `SortKey` (`relevance`, `rarity`, `alphabet`), `SortDirection` (`down`, `up`), `SortPriority` — один критерий сортировки.
- `SortMode` — старые строковые режимы; `SortInput` — режим или список приоритетов. Разбирает [sort-service](../filter/sort-service.md).
- `ListenerRegistrar` — функция регистрации обработчика с автоматическим снятием при уходе со страницы.
- `ItemsViewCallbacks` — что контроллеры могут вызвать у [ItemsManager](../ItemsManager.md): получить и задать фильтры и сортировку, сохранить состояние, применить фильтры, синхронизировать чипы.

## Списки
`HERO_LIST`, `RARITY_LIST`, `TYPE_LIST` — слаги героев, редкостей и типов в нижнем регистре; по ним контроллеры решают, к какой группе относится введённое слово.

## Функции
- `defaultFilters()` — пустой `FilterState` ([ItemsStateManager](../ItemsStateManager.md)) с `purchasableOnly = null`.
- `defaultSortPriorities()` — редкость по убыванию.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
