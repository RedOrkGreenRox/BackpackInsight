# [Подстраница деталей предмета (ItemDetail_Branch.ts)](../../../../../../Frontend/Web/ground/branches/items/itemDetail/ItemDetail_Branch.ts)

## Назначение
Сборка подстраницы «Детали предмета», которая открывается **поверх** библиотеки предметов в оверлее `.item-detail-overlay`. Собственного маршрута у неё нет (`routes: []`): её монтирует [`ItemsManager.openDetail()`](../_items/managers/ItemsManager.md) при клике по карточке или при заходе на `/items?item=<slug>`.

## Экспорты
- `itemDetailSubSpec` — декларативная [`BranchSpec`](../../../roots/BranchSpec.md) подстраницы:
  - `id: 'item-detail-sub'`, `routes: []`;
  - `styles.pageClass = 'item-detail-sub-page'`, `styles.bodyClass = 'item-detail-sub-body'`;
  - `display` — [`ItemDetailDisplay`](_itemDetail/display/ItemDetailDisplay.md);
  - `data` — [`ItemDetailDataLoader`](_itemDetail/data/ItemDetailData.md);
  - `meta` — делегирует в [`ItemDetailRenderer.getMeta()`](_itemDetail/components/ItemDetailRenderer.md);
  - `logic` — фабрика, создающая один [`ItemDetailLogic`](_itemDetail/logic/ItemDetailLogic.md) на корневой элемент.
- `ItemDetail_Branch` — класс страницы, полученный через [`BranchRunner.createBranchClass()`](../../../roots/BranchRunner.md). Наследует [`StructuredBranch`](../../../roots/StructuredBranch.md), поэтому жизненный цикл (skeleton → load → render → logic → destroy) общий для всех бранчей.

## Жизненный цикл в оверлее
1. `ItemsManager` создаёт `div.item-detail-overlay`, вызывает `new ItemDetail_Branch().mount(overlay, { itemData, name })`.
2. `StructuredBranch` рисует скелетон, вызывает `ItemDetailDataLoader.load(input)` и затем `ItemDetailDisplay.renderFullPage(context)`.
3. После рендера создаётся `ItemDetailLogic` (SEO, копирование, раскрытие рецептов).
4. Закрытие (Esc, клик по фону) вызывает `unmount()` → `ItemDetailLogic.destroy()` и удаление оверлея.

## Стили
Импортирует [`ItemDetail.scss`](ItemDetail.md) — агрегатор стилей подстраницы.

## Связи
- Индекс модулей: [_itemDetail/index.ts](_itemDetail/index.md).
- Типы данных: [item-detail-types](_itemDetail/utils/item-detail-types.md).
- Родительская страница: [ItemsBranch](../ItemsBranch.md).

---
> 📌 **Подпись документации:** создано по исходнику после переноса itemDetail в items/ · 2026-10-02
