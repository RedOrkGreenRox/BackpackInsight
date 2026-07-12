# [builder/catalog/images.rs](/RBackend/crates/builder/src/catalog/images.rs)

## Назначение
Проверка наличия иконок предметов в `Frontend/Web/static/images/items/`: число проверенных, отсутствующие, лишние.

## Ключевая функциональность
- `ImageCheckReport { items, files_checked }`.
- `check_images(project_root)` — использует `rbackend_core::ItemIconService` + `RarityService`.

## Связи
- Иконки: [core/catalog](/docs/RBackend/crates/core_catalog.md) + frontend `static/images/items/`.

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
