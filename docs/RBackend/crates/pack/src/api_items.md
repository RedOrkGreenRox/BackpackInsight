# [pack/api_items.rs](/RBackend/crates/pack/src/api_items.rs)

## Назначение
Чтение FlatBuffer `api_items_{en,ru}.fb` → `ApiItemsPack` + `PackValue` enum (Null/Bool/I64/U64/F64/String).

## Ключевая функциональность
- `enum PackValue { Null, Bool, I64, U64, F64, String }`.
- `read_api_items_bytes(bytes)` → `ApiItemsPack`.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
