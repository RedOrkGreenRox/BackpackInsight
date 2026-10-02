# [filter-options-controller.ts](/Frontend/Web/ground/branches/items/_items/managers/runtime/filter-options-controller.ts)

## Назначение
`FilterOptionsController` — заполняет панель фильтров чипами после загрузки каталога.

## API
- `RuntimeFilterOptions` — те же восемь списков, что `FilterOptions` из [filter-types](../filter/filter-types.md).
- `setup(options)` — для каждой группы вызывает `create` из [multiselect-filter-controller](multiselect-filter-controller.md): контейнеры `filterTypes`, `filterRarities`, `filterHeroes`, `filterUnlockSources`, `filterBuffs`, `filterDebuffs`, `filterStats`, `filterFlags` с типами групп `type`, `rarity`, `hero`, `unlock`, `buff`, `debuff`, `stat`, `flag`.

Списки считает [filter-options](../filter/filter-options.md); вызов — из [ItemsManager](../ItemsManager.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
