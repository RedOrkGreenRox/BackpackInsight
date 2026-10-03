# [branches/catalog/load.rs](/RBackend/crates/branches/src/catalog/load.rs)

## Назначение
Загрузка предметов одного языка из FlatBuffers-пака `api_items_{lang}.fb` и вычисление ключей картинок.

## Ключевая функциональность
- **`load_items(path, images)`** — читает пак через `pack::read_api_items` ([pack/api_items.rs](/docs/RBackend/crates/pack/src/api_items.md)) и превращает каждую запись в `CatalogItem` ([item.rs](item.md)):
  - запись, которая не является объектом, — ошибка с путём файла и `item_id`: битый пак не загружается частично;
  - ключ картинки берётся из `images` (карта `id → ключ` английского каталога), если она передана и содержит `item_id`; иначе считается `image_key`.
  Для английского пака `images` = `None`, для русского — карта из английского ([catalog/mod.rs](mod.md)).
- **`image_key(id, object)`** (приватная) — `ItemIconService::image_key` ([core/image_key.rs](/docs/RBackend/crates/core/src/image_key.md)) по `id`, редкости и первому тултипу. Тултип нужен английский: у планов ограбления номер шага (`Step N`) входит в ключ картинки. Поэтому русский каталог берёт готовые ключи, а не считает их по своему тексту.

## Связи
- Геттеры полей: [fields.rs](fields.md). Вызывающий: `Catalog::load` в [catalog/mod.rs](mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
