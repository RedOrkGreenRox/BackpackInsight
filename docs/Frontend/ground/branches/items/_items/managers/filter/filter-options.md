# [filter-options.ts](/Frontend/Web/ground/branches/items/_items/managers/filter/filter-options.ts)

## Назначение
`calculateFilterOptions(items, preparedByKey)` — списки значений для панели фильтров (`FilterOptions` из [filter-types](filter-types.md)), собранные по всем предметам каталога.

## Состав и порядок
| Список | Источник | Порядок |
| :--- | :--- | :--- |
| `sortedTypes` | `itemTypes` | сначала `PRIORITY_TYPES` (оружие ближнего и дальнего боя, питомец, еда, аксессуар, броня), затем по алфавиту, `LAST_TYPES` (сумка) в конце (`sortTypes`) |
| `sortedRarities` | `rarity` | по убыванию `RARITY_WEIGHTS` |
| `sortedHeroes` | `connectedHero` (`Hob Gang` → `Hob`, пусто → `Shared`) | `Shared` первым, затем по алфавиту (`sortHeroes`) |
| `sortedUnlockSources` | `unlockSource` (пусто → `Unknown`) | по алфавиту |
| `sortedBuffs`, `sortedDebuffs` | слова из `BUFFS` и `DEBUFFS`, найденные в тексте предмета | общий `Buff`/`Debuff` первым (`sortWithFirst`) |
| `sortedStats` | слова из `STATS` | по алфавиту |
| `sortedFlags` | — | всегда `Purchasable` |

## Внутреннее
- `collectTerms(prepared, …)` — извлекает строгие термины из подсказок, базового текста и типов через `SearchTermService.extractStrictTerms` ([SearchTermService](../../../../../utils/SearchTermService.md)).
- `addExtracted(keys, extracted, target)` — добавляет найденные ключи с заглавной буквы.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
