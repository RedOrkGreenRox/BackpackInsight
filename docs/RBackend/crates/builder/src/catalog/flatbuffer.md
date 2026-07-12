# [builder/catalog/flatbuffer.rs](/RBackend/crates/builder/src/catalog/flatbuffer.rs)

## Назначение
Сборка `catalog_summary.fb` — суммарный FlatBuffer-пак каталога (без локализаций). Использует `flatc` CLI для компиляции `.fbs`-схемы и packing.

## Ключевая функциональность
- Читает `latest_plain_items_file` через [files.rs](files.md).
- Вызывает `flatc --binary` через `std::process::Command`.
- Использует `rbackend_core::{ItemIconService, RarityService, SlugService}` для нормализации.

## Связи
- Схема: `RBackend/schemas/catalog.fbs` (см. [schemas.md](/docs/RBackend/schemas.md)).
- Выход: `RBackend/generated/catalog_summary.fb`.

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
