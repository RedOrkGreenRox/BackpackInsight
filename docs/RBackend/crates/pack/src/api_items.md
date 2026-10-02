# [pack/api_items.rs](/RBackend/crates/pack/src/api_items.rs)

## Назначение
Чтение пака предметов для API (`api_items_<lang>.fb`, схема `api_items.fbs`, идентификатор `"BIAI"`). Каждый предмет в паке хранится как дерево универсальных значений, которое здесь переводится в `PackValue`.

## Типы
- `PackValue` — JSON-подобное значение: `Null`, `Bool`, `Int(i64)`, `Float(f64)`, `String`, `Array`, `Object` (`BTreeMap`, ключи отсортированы).
- `ApiItemEntry` — `item_id` + `value`.
- `ApiItemsPackInfo` — `schema_version`, `lang`, список `items`.

## API
- `read_api_items(path)` — читает файл и делегирует в `read_api_items_bytes`.
- `read_api_items_bytes(bytes)` — проверяет идентификатор и разбирает все предметы.
- `fb_value_to_pack_value(value)` (приватная) — рекурсивное преобразование по `ValueKind`; строка без значения и неизвестный вид становятся `Null`.

## Потребители
- [builder/catalog/api_items_flatbuffer](../../builder/src/catalog/api_items_flatbuffer.md) — проверка собранного пака.
- [middleware/items](../../middleware/src/items.md) — декодирование для клиентов на Rust/WASM.

## Тесты
`rejects_non_flatbuffer_bytes`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
