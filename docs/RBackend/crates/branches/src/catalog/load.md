# [Загрузка предметов (load.rs)](/RBackend/crates/branches/src/catalog/load.rs)

## Назначение
Загрузка предметов одного языка из `RBackend/generated/items_{lang}.json`. Файл пишет `builder build-catalog-json` ([builder/catalog/export.rs](/docs/RBackend/crates/builder/src/catalog/export.md)) после проверки экспорта игры строгой моделью; здесь та же модель `CatalogExport` ([core/catalog/export](/docs/RBackend/crates/core/src/catalog/export/mod.md)), так что расхождение формата — ошибка старта, а не тихо пропавшие поля.

## Ключевая функциональность
- **`load_items(path, art)`** — читает файл, разбирает `CatalogExport::parse` и превращает каждый `ItemDef` в `CatalogItem::new` ([item.rs](item.md)) с картинкой `art.get(id)` из манифеста ([art.rs](art.md)). `id` одинаков во всех языках, поэтому картинки не зависят от языка. Нет файла или он не совпадает с моделью — ошибка-строка с путём; сервер не стартует.

## Связи
- Вызывающий: `Catalog::load` в [catalog/mod.rs](mod.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
