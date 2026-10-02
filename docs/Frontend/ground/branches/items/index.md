# [Библиотека предметов (ItemsBranch.ts)](../../../../../Frontend/Web/ground/branches/items/ItemsBranch.ts)

## Назначение
Точка входа раздела «Предметы»: интерактивный справочник всех предметов игры с поиском, фильтрами и карточкой деталей. Сборка страницы (`itemsSpec`, `ItemsDisplay`, `ItemsDataLoader`, `ItemsLogic`) описана в [ItemsBranch](ItemsBranch.md); здесь — карта модулей.

## Как устроена страница
1. `ItemsDataLoader` загружает каталог и синонимы поиска; `ItemsDisplay` рисует каркас ([ItemsLayoutRenderer](_items/components/ItemsLayoutRenderer.md)) как скелетон (`renderSkeleton`) и как полную страницу (`renderFullPage`); ошибки — `renderError`.
2. `ItemsLogic` запускает [ItemsManager](_items/managers/ItemsManager.md): восстановление фильтров ([ItemsStateManager](_items/managers/ItemsStateManager.md)), rich-поле поиска, панели фильтров, чипы.
3. Поиск и фильтрация — [ItemsFilterManager](_items/managers/ItemsFilterManager.md) и движок [managers/filter](_items/managers/filter/index.md): Fuse.js, синонимы, строгие теги, сравнения и логические формулы ([синтаксис](../../../../search_filter_syntax.md)).
4. Выдача рисуется порциями по 80 карточек с подгрузкой при прокрутке; первые 12 картинок грузятся с высоким приоритетом ([items-grid-renderer](_items/managers/runtime/items-grid-renderer.md)). Наведение на карточку прогревает данные для деталей ([ItemPreviewPrefetchService](../../utils/ItemPreviewPrefetchService.md)).
5. Клик по карточке или `?item=<slug>` открывает подстраницу деталей в оверлее — [ItemDetail_Branch](itemDetail/ItemDetail_Branch.md).

## Модули
- `_items/`: [индекс модуля](_items/index.md), [runtime-контроллеры](_items/managers/runtime/index.md), [поисковый движок](_items/managers/filter/index.md), [иконки предметов](_items/services/ItemsIconService.md).
- `itemDetail/`: [модули деталей предмета](itemDetail/_itemDetail/index.md).
- Стили: [items.scss](items.md).

## Состояние
Фильтры, сортировка и режим поиска сохраняются через [ItemsStateManager](_items/managers/ItemsStateManager.md); порядок текущей выдачи пишется в sessionStorage для кнопок «предыдущий/следующий» в деталях предмета.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
