# [builder/catalog/files.rs](/RBackend/crates/builder/src/catalog/files.rs)

## Назначение
Чтение JSON-справочников предметов из `Backend/DB/`. Хелперы поиска старшей версии и локализованных файлов.

## Ключевая функциональность
- `db_dir(project_root)` → `Backend/DB`.
- `latest_plain_items_file(dir)` — выбирает старший `items_*_*_*_*.json`.
- `localized_files(dir)` — пара `(en, ru)` 5.1.0.
- `read_items_array(path)` — парсит JSON в `Vec<Value>`.
- `web_root(project_root)` — путь к статике фронтенда.

## Связи
- Источник: [`Backend/DB/`](/docs/Backend/DB/index.md).
- Используется во всех подмодулях [catalog](mod.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
