# [Редкость предмета (rarity.rs)](/RBackend/crates/core/src/profile/items/rarity.rs)

## Назначение
`RarityService` — точка разбора строки редкости в `ItemRarity` ([types](types.md)).

## API
- `parse(value)` — делегирует `ItemRarity::from_str`: известные имена (от Common до Special) дают `Ok`, остальные — `Err` с текстом ошибки (например, для «Godly»).

## Потребители
[api/profile/catalog_cache](../../../../api/src/profile/catalog_cache.md), [builder/catalog/flatbuffer](../../../../builder/src/catalog/flatbuffer.md), [builder/catalog/images](../../../../builder/src/catalog/images.md), [cli](../../../../cli/src/main.md).

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
