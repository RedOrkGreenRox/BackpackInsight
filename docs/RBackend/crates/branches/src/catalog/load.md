# [branches/catalog/load.rs](/RBackend/crates/branches/src/catalog/load.rs)

## Назначение
Загрузка предметов одного языка из `RBackend/generated/items_{lang}.json` и вычисление ключей картинок. Файл пишет `builder build-catalog-json` ([builder/catalog/export.rs](/docs/RBackend/crates/builder/src/catalog/export.md)) после проверки экспорта игры строгой моделью; здесь та же модель `CatalogExport` ([core/catalog/export](/docs/RBackend/crates/core/src/catalog/export/mod.md)), так что расхождение формата — ошибка старта, а не тихо пропавшие поля.

## Ключевая функциональность
- **`load_items(path, images)`** — читает файл, разбирает `CatalogExport::parse` и превращает каждый `ItemDef` в `CatalogItem::new` ([item.rs](item.md)):
  - нет файла или он не совпадает с моделью — ошибка-строка с путём; сервер не стартует;
  - ключ картинки берётся из `images` (карта `id → ключ` английского каталога), если она передана и содержит `id`; иначе считается `image_key`.
  Для английского каталога `images` = `None`, для русского — карта из английского ([catalog/mod.rs](mod.md)).
- **`image_key(def)`** (приватная) — `ItemIconService::image_key` ([core/image_key.rs](/docs/RBackend/crates/core/src/image_key.md)) по `id`, редкости и первому тултипу. Тултип нужен английский: у планов ограбления номер шага (`Step N`) входит в ключ картинки. Поэтому русский каталог берёт готовые ключи, а не считает их по своему тексту.

## Связи
- Вызывающий: `Catalog::load` в [catalog/mod.rs](mod.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
