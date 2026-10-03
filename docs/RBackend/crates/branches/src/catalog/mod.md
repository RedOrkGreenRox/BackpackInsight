# [branches/catalog/mod.rs](/RBackend/crates/branches/src/catalog/mod.rs)

## Назначение
Каталог предметов на сервере (только `ssr`). Читается один раз на старте из FlatBuffers-паков `RBackend/generated/api_items_{en,ru}.fb` и дальше живёт в памяти. В браузер каталог целиком не уходит: страницы получают готовый HTML, остров — порции по `PAGE_SIZE` карточек ([model.rs](../model.md)).

## Ключевая функциональность
- **Реэкспорт:** `CatalogItem` ([item.rs](item.md)); `search_page`, `search_upto`, `MAX_PAGE` ([search.rs](search.md)). Подмодули `fields`, `load` и `rarity` ([rarity.rs](rarity.md)) приватны.
- **`LangCatalog`** — каталог одного языка: предметы в порядке по умолчанию и два индекса `HashMap` (`by_slug`, `by_id`) → позиция.
  - `new(items)` — сортирует предметы по редкости от ценной к простой (`rarity::rank`, сортировка устойчивая, поэтому внутри одной редкости сохраняется порядок пака) и строит оба индекса. Это сортировка по умолчанию TS-версии;
  - `items()` — все предметы в порядке по умолчанию (по ним идёт поиск);
  - `by_slug(slug)` — предмет и его позиция в этом порядке;
  - `by_id(id)` — предмет по исходному `id` (английское имя из экспорта игры).
  Сейчас `by_slug` и `by_id` в крейте не вызываются: это задел для страницы предмета (см. «Планируется» в [обзоре](../../../branches.md)).
- **`Catalog`** — каталоги всех языков (`en`, `ru`):
  - `Catalog::load(project_root)` — читает `api_items_en.fb`, собирает карту `id → ключ картинки` английского каталога и передаёт её при чтении `api_items_ru.fb`: ключи картинок считаются по английскому тексту и одинаковы в обоих языках ([load.rs](load.md)). Затем оба списка проходят `drop_missing_images`. Ошибка — строка; сервер не стартует;
  - `lang(lang)` — каталог нужного языка.
- **`drop_missing_images`** (приватная) — очищает `image`, если файла `Frontend/Web/static/images/items/webp/{image}.webp` нет: карточка покажет заглушку прямо в HTML ([items/card.rs](../branches/items/card.md)).
- **`CatalogHandle(Arc<Catalog>)`** — дешёвый клонируемый дескриптор для контекста Leptos; его кладёт `BranchRunner::router` и читают `BranchCtx` и `search_items`.

## Связи
- Пак и его чтение: [pack/api_items.rs](/docs/RBackend/crates/pack/src/api_items.md); сборка паков — [builder](/docs/RBackend/crates/build.md).
- Потребители: [roots/ctx.rs](../roots/ctx.md), [roots/runner.rs](../roots/runner.md), [items/search_fn.rs](../branches/items/search_fn.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
