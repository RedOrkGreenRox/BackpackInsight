# [pack/catalog.rs](/RBackend/crates/pack/src/catalog.rs)

## Назначение
Чтение FlatBuffer `catalog_summary.fb` → `CatalogPack` (список `CatalogPackItem`).

## Ключевая функциональность
- `struct CatalogPackItem { slug, name, rarity, ... }`.
- `read_catalog_summary_bytes(bytes)` → `CatalogPack`.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
