# [branches/catalog/item.rs](/RBackend/crates/branches/src/catalog/item.rs)

## Назначение
`CatalogItem` — предмет каталога одного языка в типизированном виде. Здесь только поля, нужные каталогу и его будущим фильтрам; форма на сетке, рецепты и статы не читаются — они понадобятся странице предмета.

## Ключевая функциональность
- **Поля `CatalogItem`** и ключи пака, из которых они берутся:

| Поле | Ключ пака | Примечание |
| :--- | :--- | :--- |
| `id` | `id` | при отсутствии — `fallback_id` (идентификатор записи пака) |
| `slug` | — | `SlugService::to_slug(id)` ([core/slug.rs](/docs/RBackend/crates/core/src/slug.md)) |
| `name` | `name` | при отсутствии — `id` |
| `rarity` | `rarity` | пустая строка, если нет |
| `coin_value` | `coinValue` | `Option<i64>` |
| `item_types` | `itemTypes` | массив строк |
| `hero` | `connectedHero` | пустая строка → `None` |
| `unlock_source` | `unlockSource` | `Option<String>` |
| `purchasable` | `purchasable` | по умолчанию `false` |
| `tooltips` | `tooltips` | тексты способностей |
| `image` | — | передаётся снаружи ([load.rs](load.md)) |
| `search_text` | — | см. ниже |

- **`from_object(fallback_id, object, image)`** — собирает предмет через геттеры [fields.rs](fields.md). `image` считается снаружи, потому что ключ картинки зависит от английского текста, а предмет может быть русским. `search_text` — имя, `id`, герой, редкость и типы через пробел в нижнем регистре: по этой строке работает поиск ([search.rs](search.md)).
- **`card()`** — `ItemCard` для сетки: `slug`, `name`, `rarity`, `image` ([model.rs](../model.md)).

## Связи
- Модуль каталога: [catalog/mod.rs](mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
