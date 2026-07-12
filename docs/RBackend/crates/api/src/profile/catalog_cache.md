# [api/profile/catalog_cache.rs](/RBackend/crates/api/src/profile/catalog_cache.rs)

## Назначение
In-memory кеш каталога предметов с поддержкой локали. `api_items_{en,ru}.fb` иммутабельны внутри Docker-образа, поэтому инвалидация не нужна.

## Ключевая функциональность
- `Lang` enum (`En`/`Ru`), `normalize_lang` парсит `?lang=` query.
- `catalog_lookup()` / `CatalogItemLite` — индекс по slug и display-name.
- Использует `OnceLock` для ленивой инициализации из `RBackend/generated/api_items_*.fb`.
- `middleware::decode_items` — распаковка FlatBuffer.

## Связи
- Читает: [middleware/items.rs](/docs/RBackend/crates/middleware.md).
- Используется в [items.rs](items.md), [view.rs](view.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
