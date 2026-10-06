# [branches/catalog/item.rs](/RBackend/crates/branches/src/catalog/item.rs)

## Назначение
`CatalogItem` — предмет каталога одного языка: строгая запись экспорта игры `ItemDef` ([core/catalog/export/item.rs](/docs/RBackend/crates/core/src/catalog/export/item.md)) плюс поля, которые нужны только сайту. Все данные игры (форма, звёзды, рецепты, уровни, статы) лежат в `def` без потерь, поэтому будущему полю предметов второй источник не понадобится.

## Ключевая функциональность
- **Поля `CatalogItem`:**

| Поле | Откуда | Примечание |
| :--- | :--- | :--- |
| `def` | экспорт игры | `ItemDef` целиком |
| `slug` | `def.id` | `SlugService::to_slug(id)` ([core/slug.rs](/docs/RBackend/crates/core/src/slug.md)) |
| `image` | снаружи | ключ картинки от [load.rs](load.md); пустой, если файла нет ([catalog/mod.rs](mod.md)) |
| `search_text` | `def` | см. ниже |

- **`new(def, image)`** — собирает предмет. `image` считается снаружи, потому что ключ картинки зависит от английского текста, а предмет может быть русским. `search_text` — имя, `id`, `connected_hero` (у общих предметов это `Shared`), редкость и типы через пробел в нижнем регистре; по этой строке работает поиск ([search.rs](search.md)).
- **`card()`** — `ItemCard` для сетки: `slug`, `def.name`, редкость строкой (`ItemRarity` через `Display`), `image` ([model.rs](../model.md)).

## Связи
- Модуль каталога: [catalog/mod.rs](mod.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
