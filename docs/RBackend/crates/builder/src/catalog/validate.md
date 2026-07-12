# [builder/catalog/validate.rs](/RBackend/crates/builder/src/catalog/validate.rs)

## Назначение
Валидация каталога: уникальность слагов, корректность рецептов, наличие обязательных полей.

## Ключевая функциональность
- `CatalogValidationReport { items, recipes_checked, duplicate_slug_warnings }`.
- `validate_catalog(project_root)` — использует `rbackend_core::SlugService` для нормализации.

## Связи
- Слаги: [core/slug.rs](/docs/RBackend/crates/core.md).
- Источник: [files.rs](files.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
