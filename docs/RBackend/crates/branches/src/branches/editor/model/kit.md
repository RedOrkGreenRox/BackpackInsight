# [Набор предметов редактора (kit.rs)](/RBackend/crates/branches/src/branches/editor/model/kit.rs)

## Назначение
`Kit` — набор предметов одной версии игры на одном языке для редактора; `KitItem` — предмет: `id`, `slug`, `name`, `rarity`, `rarity_rank`, `hero`, `types`, `price`, `shape`, `stars`, `image`, `placed` (картинка сумки в инвентаре, у большинства пустая). Сервер собирает его в [kit_fn.rs](../kit_fn.md), остров получает одним ответом.

## Ключевая функциональность
- `BAG_TYPE` = `Bag`, `SHARED_HERO` = `Shared`.
- `KitItem::is_bag` — есть ли тип `Bag`; `KitItem::bounds` — охват формы при `Up`; `KitItem::placed_image` — картинка для поля и склада: `placed`, а если её нет — `image`.
- `Kit::new(version, items)` строит индексы `by_id` и `by_slug` (они `#[serde(skip)]`); `indexed` восстанавливает их после десериализации.
- `item(piece)`, `by_id(id)`, `by_slug(slug)`; `heroes()` — герои со своими предметами по алфавиту, без `Shared`.

## Связи
- Картинка: `ItemImage` из [model.rs](../../../model.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
