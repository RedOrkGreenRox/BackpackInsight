# [Каталог для сайта (export.rs)](/RBackend/crates/builder/src/catalog/export.rs)

## Назначение
Каталог для сайта: экспорт игры, проверенный строгой моделью `CatalogExport` ([core/catalog/export](/docs/RBackend/crates/core/src/catalog/export/mod.md)) и записанный в `RBackend/generated/items_{lang}.json`. Этот файл читает сайт ([branches/catalog/load.rs](/docs/RBackend/crates/branches/src/catalog/load.md)); паки FlatBuffers ему не нужны.

## Ключевая функциональность
- **`LANGS`** (приватная) — `en`, `ru`.
- **`generated_path(project_root, lang)`** — `{project_root}/RBackend/generated/items_{lang}.json`.
- **`build_catalog_json(project_root)`** — читает оба экспорта из `localized_files` ([files.rs](files.md)), разбирает их моделью, сверяет наборы `id` (`same_ids`) и пишет каждую модель обратно компактным JSON. Возвращает пути записанных файлов. Запись идёт из модели, поэтому в файл попадает только то, что модель знает, а тест [round trip](/docs/RBackend/crates/core/src/catalog/export/tests.md) показывает, что ничего не теряется.
- **`verify_catalog_json(project_root)`** — перечитывает оба файла моделью и возвращает пары «язык, число предметов».
- **`read(path)`** (приватная) — чтение файла и `CatalogExport::parse`, ошибка с путём.
- **`same_ids(en, ru)`** (приватная) — ошибка, если у языков разные `id` или в EN есть повторы; в тексте ошибки счётчики расхождений.

## Связи
- Команды `build-catalog-json`, `verify-catalog-json`, а также `build-all-packs` и `verify-all-packs`: [main.rs](../main.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
