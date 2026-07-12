# [middleware/items.rs](/RBackend/crates/middleware/src/items.rs)

## Назначение
`decode_items(bytes)` → `ItemsData` — распаковка FlatBuffer `BIAI` (api_items_pack). Используется в api/profile/catalog_cache и seo/sitemap.

## Ключевая функциональность
- `struct ItemsData { lang, items: Vec<ItemData> }`.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
