# [ItemsStateManager.ts](/Frontend/Web/ground/branches/items/_items/managers/ItemsStateManager.ts)

## Назначение
Тип `FilterState` и класс `ItemsStateManager`, который сохраняет состояние страницы предметов в `sessionStorage`, чтобы после перехода на другую страницу и обратно фильтры и поиск остались прежними. Состояние живёт до закрытия вкладки.

## `FilterState`
Строка поиска `searchQuery`, множества выбранных значений (`selectedTypes`, `selectedRarities`, `selectedHeroes`, `selectedUnlockSources`, `selectedBuffs`, `selectedDebuffs`, `selectedStats`), такие же необязательные множества исключённых (`excluded…`) и `purchasableOnly` (`true`, `false` или `null` — не важно). Применяет его [filter-applier](filter/filter-applier.md); значения по умолчанию даёт `defaultFilters` из [items-runtime-types](runtime/items-runtime-types.md).

## Методы
- `saveState(filters, currentSort, advancedFiltersVisible, advancedModeEnabled)` — пишет каждое поле под своим ключом из `STORAGE_KEYS` (префикс `items_`); множества — JSON-массивами. [ItemsManager](ItemsManager.md) передаёт в `currentSort` JSON списка приоритетов сортировки.
- `restoreState()` — читает ключи и возвращает `filters`, `currentSort` (по умолчанию `rarity`), `advancedFiltersVisible` и `advancedModeEnabled` (оба по умолчанию `false`).

Ошибки хранилища или разбора JSON только пишутся в консоль: при сбое восстановления остаётся то, что успело прочитаться, остальное — по умолчанию.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
