# [api_items.fbs](/RBackend/schemas/api_items.fbs)

## Назначение
Схема пака предметов `api_items_<lang>.fb` (пространство имён `BackpackInsight.ApiItems`, корень `ApiItemsPack`, идентификатор `"BIAI"`). Пак хранит каталог предметов одного языка в виде произвольного JSON-подобного дерева, поэтому новые поля предмета не требуют правки схемы.

## Таблицы
| Таблица | Поля |
| :--- | :--- |
| `ApiItemsPack` | `schema_version` (сейчас `api_items.fbs@1`), `lang`, `items` — все обязательные |
| `ApiItem` | `item_id`, `value` — обязательные |
| `Value` | `kind` (перечисление `ValueKind`) и одно из полей `bool_value`, `int_value` (long), `float_value` (double), `string_value`, `array_value`, `object_value` |
| `KeyValue` | `key`, `value` — пара объекта |

`ValueKind`: `Null`, `Bool`, `Int`, `Float`, `String`, `Array`, `Object`.

## Кто пишет и читает
- Сборка: [builder/catalog/api_items_flatbuffer](../crates/builder/src/catalog/api_items_flatbuffer.md) переводит JSON в такие значения и вызывает `flatc`.
- Чтение в Rust: [pack/api_items](../crates/pack/src/api_items.md), затем [middleware/items](../crates/middleware/src/items.md).
- Чтение в браузере: [flatbuffer-decoders](../../Frontend/ground/middleware/flatbuffer-decoders.md) по TS-биндингам.
- Отдача: `GET /api/items.fb` ([routes/packs](../crates/api/src/routes/packs.md)).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
