# [Синхронизация чипов фильтров (chips-sync-service.ts)](/Frontend/Web/ground/branches/items/_items/managers/runtime/chips-sync-service.ts)

## Назначение
`ChipsSyncService` — приводит вид кнопок-чипов панели фильтров (`.filter-chip`) в соответствие с `FilterState` ([ItemsStateManager](../ItemsStateManager.md)) и приоритетами сортировки. Вызывается [ItemsManager](../ItemsManager.md) после каждого изменения.

## Методы
- `sync(filters, sortPriorities)` — обходит все чипы контейнера.
- `syncChip(chip, …)` — читает `data-value` и `data-group-type`; чипы «ещё» (`data-more-toggle`) пропускает. Сбрасывает классы (`resetChipClass` оставляет только `filter-chip` и `no-icon-extra`), затем ставит `active include` или `active exclude`; чипам редкости добавляет `rarity-<значение>`.
- `getState(val, type, filters)` — состояние по группе: `type`, `rarity`, `hero`, `unlock`, `buff`, `debuff`, `stat` или флаг `Purchasable` (по `purchasableOnly`).
- `stateFromSets(val, include, exclude)` — `include`, `exclude` или `none`.
- `syncSortChip(chip, key, priorities)` — у чипа сортировки показывает направление (↓ — `include`, ↑ — `exclude`) в `.sort-dir` и номер приоритета `#N` в `.sort-priority`.

`sortKeyFromOption(option)` — `Relevance` и `Alphabet` переводит в ключи, всё прочее — `rarity`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
