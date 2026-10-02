# [pack/catalog.rs](/RBackend/crates/pack/src/catalog.rs)

## Назначение
Чтение сводного пака каталога (`catalog_summary.fb`, схема `catalog.fbs`, идентификатор `"BICS"`) в лёгкую сводку для диагностики.

## Типы
- `CatalogPackItem` — одна строка: `row`, `item_id`, `name`, `slug`, `image_key`, `rarity` (имя варианта перечисления или `<unknown>`).
- `CatalogPackInfo` — `schema_version`, необязательные `game_version` и `build_hash`, число строк `items` и первая строка `first`. Оба типа сериализуются через serde.

## API
- `read_catalog_summary(path)` — читает файл и вызывает функцию ниже; ошибка чтения — `Err` с путём.
- `read_catalog_summary_bytes(bytes)` — проверяет идентификатор, разбирает буфер и возвращает сводку.

## Потребители
- [api/routes/health](../../api/src/routes/health.md) — проверка готовности (`/ready`).
- [builder/catalog/flatbuffer](../../builder/src/catalog/flatbuffer.md) — проверка только что собранного пака.

## Тесты
`rejects_non_flatbuffer_bytes`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
