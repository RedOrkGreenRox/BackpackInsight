# [Декодер пака предметов (items.rs)](/RBackend/crates/middleware/src/items.rs)

## Назначение
Декодирование пака предметов (идентификатор `"BIAI"`, `api_items_<lang>.fb`) в типизированный список `ItemsData`.

## API
- `ItemsData` — `lang` и `items: Vec<ItemData>`.
- `ItemData` — поля предмета, взятые из JSON-подобного значения `PackValue`:

| Поле Rust | Ключ в паке | Если ключа нет |
| :--- | :--- | :--- |
| `id` | `id` | `item_id` записи пака |
| `name`, `rarity` | `name`, `rarity` | пустая строка |
| `coin_value` | `coinValue` | `None` |
| `item_types` | `itemTypes` | пустой список |
| `connected_hero`, `unlock_source` | `connectedHero`, `unlockSource` | `None` |
| `purchasable` | `purchasable` | `false` |
| `tooltips` | `tooltips` | пустой список |

- `decode_items(bytes)` — читает пак через `read_api_items_bytes` ([pack/api_items](../../pack/src/api_items.md)). Если значение записи не объект, возвращает `Err("<id> is not object")`.

## Внутренние помощники
- `as_object` — достаёт словарь из `PackValue::Object`.
- `string_field`, `int_field`, `bool_field` — значение ключа нужного типа, иначе `None` (значение другого типа тоже даёт `None`).
- `string_array_field` — строки из массива; нестроковые элементы отбрасываются.

## Тесты
`rejects_invalid_pack` — произвольные байты дают `Err`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
