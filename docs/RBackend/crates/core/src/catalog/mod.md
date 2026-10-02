# [core/catalog/mod.rs](/RBackend/crates/core/src/catalog/mod.rs)

## Назначение
Корень подмодуля каталога в ядре: основа колоночного (data-oriented) хранения предметов — типизированные компактные id, интернирование строк и первые колонки.

## Состав
- `columns` → `CatalogColumns`, `CatalogItemInput` — [columns](columns.md).
- `ids` → `ItemId`, `HeroId`, `StringId` — [ids](ids.md).
- `strings` → `StringPool` — [strings](strings.md).

Все три реэкспортируются из [lib.rs](../lib.md). Сейчас этим слоем пользуется только диагностическая утилита [cli](../../../cli/src/main.md); сборщик паков работает с JSON-источниками напрямую.

## Связи
Тематический обзор: [core_catalog](../../../core_catalog.md), [core_catalog_columns](../../../core_catalog_columns.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
