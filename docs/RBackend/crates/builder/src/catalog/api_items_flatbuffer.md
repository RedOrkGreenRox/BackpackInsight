# [builder/catalog/api_items_flatbuffer.rs](/RBackend/crates/builder/src/catalog/api_items_flatbuffer.rs)

## Назначение
Сборка `api_items_{en,ru}.fb` — локализованные FlatBuffer-паки предметов для runtime API.

## Ключевая функциональность
- `API_ITEMS_SCHEMA = "RBackend/schemas/api_items.fbs"`.
- Читает `localized_files` через [files.rs](files.md) → формирует `Map<String, Value>` per локаль.
- Вызывает `flatc --binary` через `std::process::Command`.
- Использует `HashMap` для дедупликации по `id`.

## Связи
- Схема: `RBackend/schemas/api_items.fbs` (см. [schemas.md](/docs/RBackend/schemas.md)).
- Выход: `RBackend/generated/api_items_{en,ru}.fb`.
- Потребитель: [api/profile/catalog_cache.rs](../../../api/src/profile/catalog_cache.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
