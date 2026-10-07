# [Каталог предметов на сервере (mod.rs)](/RBackend/crates/branches/src/catalog/mod.rs)

## Назначение
Каталог предметов на сервере (только `ssr`). Читается один раз на старте из `RBackend/generated/items_{en,ru}.json` в строгую модель `ItemDef` ([core/catalog/export](/docs/RBackend/crates/core/src/catalog/export/mod.md)) и дальше живёт в памяти. В браузер каталог целиком не уходит: страницы получают готовый HTML, остров — порции по `PAGE_SIZE` карточек ([model.rs](../model.md)).

## Ключевая функциональность
- **Реэкспорт:** `CatalogItem` ([item.rs](item.md)); `search_page`, `search_upto`, `MAX_PAGE` ([search.rs](search.md)). Подмодули `art` ([art.rs](art.md)), `load` ([load.rs](load.md)) и `rarity` ([rarity.rs](rarity.md)) приватны.
- **`LangCatalog`** — каталог одного языка: предметы в порядке по умолчанию и два индекса `HashMap` (`by_slug`, `by_id`) → позиция.
  - `new(items)` — сортирует предметы по редкости от ценной к простой (`rarity::rank`, сортировка устойчивая, поэтому внутри одной редкости сохраняется порядок экспорта) и строит оба индекса. Это сортировка по умолчанию TS-версии;
  - `items()` — все предметы в порядке по умолчанию (по ним идёт поиск);
  - `by_slug(slug)` — предмет и его позиция в этом порядке;
  - `by_id(id)` — предмет по исходному `id` (английское имя из экспорта игры).
  Сейчас `by_slug` и `by_id` в крейте не вызываются: это задел для страницы предмета (см. «Планируется» в [обзоре](../../../branches.md)).
- **`Catalog`** — каталоги всех языков (`en`, `ru`):
  - `Catalog::load(project_root)` — читает манифест картинок `Frontend/Web/static/images/art/manifest.json` ([art.rs](art.md)) и оба файла `items_{en,ru}.json`; картинка предмета берётся из манифеста по `id`, одинаковому в обоих языках ([load.rs](load.md)). Нет манифеста или каталога — ошибка-строка; сервер не стартует;
  - `lang(lang)` — каталог нужного языка.
- **`CatalogHandle(Arc<Catalog>)`** — дешёвый клонируемый дескриптор для контекста Leptos; его кладёт `BranchRunner::router` и читают `BranchCtx` и `search_items`.

## Связи
- Модель предмета: [core/catalog/export](/docs/RBackend/crates/core/src/catalog/export/mod.md); запись `items_{lang}.json` — [builder/catalog/export.rs](/docs/RBackend/crates/builder/src/catalog/export.md).
- Потребители: [roots/ctx.rs](../roots/ctx.md), [roots/runner.rs](../roots/runner.md), [items/search_fn.rs](../branches/items/search_fn.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
