# [core/catalog/export/item.rs](/RBackend/crates/core/src/catalog/export/item.rs)

## Назначение
`ItemDef` — один предмет экспорта игры в строгом виде. `serde` с `rename_all = "camelCase"` и `deny_unknown_fields`: новое поле в экспорте или незнакомая редкость останавливают сборку, а не теряются молча.

## Поля
| Поле | Ключ JSON | Тип |
| :--- | :--- | :--- |
| `id` | `id` | `String`, английское имя, общее для всех языков |
| `name` | `name` | `String`; имена предметов в игре не переводятся |
| `rarity` | `rarity` | `ItemRarity` через [rarity.rs](rarity.md) |
| `coin_value` | `coinValue` | `u32` |
| `item_types` | `itemTypes` | `Vec<String>`: типы и теги (`Armor`, `Stealable_Grabber`, …), набор открытый |
| `connected_hero` | `connectedHero` | `String`; `Shared` у общих предметов |
| `unlock_source` | `unlockSource` | `String` (`Default`, `HeroLevel`, `Area`, …) |
| `item_shape` | `itemShape` | `Vec<Cell>` — клетки предмета |
| `item_stars` | `itemStars` | `Vec<Cell>` — клетки-звёзды |
| `purchasable` | `purchasable` | `bool` |
| `embargoed` | `embargoed` | `bool` |
| `embargo_code` | `embargoCode` | `Option<String>`, с 7.0.0: метка обновления у скрытого предмета (`Season7`) |
| `recipes` | `recipes` | `Vec<Recipe>` |
| `combat_stats` | `combatStats` | `CombatStats` |
| `tooltips` | `tooltips` | `Vec<String>` — тексты способностей (0–2) |
| `absorb_effect` | `absorbEffect` | `Option<Vec<String>>`, с 7.0.0: эффект поглощения у поглощаемых предметов |
| `all_stats` | `allStats` | `BTreeMap<String, f64>` |
| `levels` | `levels` | `Levels` |

Типы частей описаны в [parts.rs](parts.md). Открытые наборы (типы, герои, источники) оставлены строками: их пополняет каждое обновление игры, а особого смысла для кода у них пока нет.

## Связи
- Модуль: [export/mod.rs](mod.md). Потребитель на сайте: [branches/catalog/item.rs](/docs/RBackend/crates/branches/src/catalog/item.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
