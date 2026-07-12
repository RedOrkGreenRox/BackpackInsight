# [api/routes/packs.rs](/RBackend/crates/api/src/routes/packs.rs)

## Назначение
Защищённые FlatBuffer- эндпоинты каталога: раздаёт сгенерированные `.fb` паки с диска как `application/octet-stream`.

## Ключевая функциональность
- `items_pack(query, state)` — `GET /api/items.fb?lang=en|ru` → `api_items_{en,ru}.fb`.
- `catalog_summary_pack(state)` — `GET /api/catalog-summary.fb` → `catalog_summary.fb`.
- При ошибке возвращает FlatBuffer `BIER` через `pack::build_api_error_bytes`.

## Связи
- Чтение: `RBackend/generated/*.fb` (строит [builder](/docs/RBackend/crates/build.md)).
- Защита: [security/secret.rs](../security/secret.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
