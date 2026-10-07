# [Модули деталей предмета (index.ts)](../../../../../../../Frontend/Web/ground/branches/items/itemDetail/_itemDetail/index.ts)

## Назначение
Barrel-файл: реэкспортирует публичные модули подстраницы деталей предмета, чтобы внешние потребители импортировали их из одной точки.

## Реэкспорты
| Экспорт | Модуль | Документация |
| :--- | :--- | :--- |
| `ItemDetailRenderer` | `components/ItemDetailRenderer` | [ItemDetailRenderer](components/ItemDetailRenderer.md) |
| `ItemDetailDataLoader` | `data/ItemDetailData` | [ItemDetailData](data/ItemDetailData.md) |
| `ItemDetailDisplay` | `display/ItemDetailDisplay` | [ItemDetailDisplay](display/ItemDetailDisplay.md) |
| `ItemDetailLogic` | `logic/ItemDetailLogic` | [ItemDetailLogic](logic/ItemDetailLogic.md) |
| типы `ItemDetailData`, `NavigationState`, `ItemDefinition` | `utils/item-detail-types` | [item-detail-types](utils/item-detail-types.md) |

## Структура папки
- `components/` — HTML-рендереры ([ItemDetailRenderer](components/ItemDetailRenderer.md), [ItemDetailParts](components/ItemDetailParts.md), [ItemGridRenderer](components/ItemGridRenderer.md)) и SCSS-партиалы ([_layout](components/_layout.md), [_top-row](components/_top-row.md), [_stats](components/_stats.md), [_recipes](components/_recipes.md), [_grid](components/_grid.md), [_responsive](components/_responsive.md)).
- `data/` — загрузка контекста: [ItemDetailData](data/ItemDetailData.md).
- `display/` — адаптер отображения для `StructuredBranch`: [ItemDetailDisplay](display/ItemDetailDisplay.md).
- `logic/` — поведение после рендера: [ItemDetailLogic](logic/ItemDetailLogic.md).
- `managers/` — [ItemDataLoader](managers/ItemDataLoader.md) (загрузка по slug) и [ItemSEOManager](managers/ItemSEOManager.md) (мета-теги и JSON-LD).
- `utils/` — типы: [item-detail-types](utils/item-detail-types.md).

Сама страница собирается в [ItemDetail_Branch](../ItemDetail_Branch.md); она импортирует модули напрямую, не через этот индекс.

---
> 📌 **Подпись документации:** создано по исходнику · 2026-10-02
