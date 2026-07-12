# [builder/catalog/mod.rs](/RBackend/crates/builder/src/catalog/mod.rs)

## Назначение
Агрегатор модулей сборки каталога предметов из `Backend/DB/items_*.json` в FlatBuffer-паки.

## Подмодули
- [files.rs](files.md) — чтение JSON-справочников.
- [locales.rs](locales.md) — проверка `en`/`ru` локализаций.
- [validate.rs](validate.md) — целостность каталога (рецепты, слаги).
- [images.rs](images.md) — проверка наличия иконок.
- [flatbuffer.rs](flatbuffer.md) — сборка `catalog_summary.fb`.
- [api_items_flatbuffer.rs](api_items_flatbuffer.md) — сборка `api_items_{en,ru}.fb`.

## Связи
- Точка входа: [builder/src/main.rs](../main.md) + [builder/src/root.rs](../root.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
