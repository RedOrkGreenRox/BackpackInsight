# [Спецификация страницы (BranchSpec.ts)](../../../../Frontend/Web/ground/roots/BranchSpec.ts)

## Назначение
`BranchSpec<TInput, TContext>` — декларативное описание страницы: из каких модулей она состоит. Императивной логики в файле нет; спецификацию превращает в класс страницы [BranchRunner](BranchRunner.md).

## Поля интерфейса
- `id` — идентификатор страницы; используется как CSS-класс страницы, если `styles.pageClass` не задан.
- `routes` — маршруты для регистрации в роутере [Gen](Gen.md) через `BranchRunner.register()`. Пустой массив — страница монтируется вручную (так устроена подстраница деталей предмета).
- `meta` (необязательно) — объект `PageMeta` или функция `(input) => PageMeta`.
- `styles` (необязательно) — `pageClass` и `bodyClass`.
- `display` — `BranchDisplay`: `renderSkeleton`, `renderError`, `renderFullPage`.
- `data` — **один** `BranchData` с методом `load(input)`.
- `state` (необязательно) — `BranchState` с `save`/`restore`.
- `logic` — массив `BranchLogic` или фабрика `(ctx, root) => BranchLogic[]`, где `ctx` — `BranchContext` (`input` + загруженный `context`).

Контракты `BranchDisplay`/`BranchData`/`BranchState`/`BranchLogic`/`BranchContext` объявлены в [StructuredBranch](StructuredBranch.md).

## Реальные спецификации
- `itemsSpec` — [ItemsBranch](../branches/items/ItemsBranch.md).
- `itemDetailSubSpec` — [ItemDetail_Branch](../branches/items/itemDetail/ItemDetail_Branch.md) (`routes: []`, логика через фабрику).
- Спецификации главной, профиля и 404 — [MainBranch](../branches/main/MainBranch.md), [ProfileBranch](../branches/profile/ProfileBranch.md), [NotFoundBranch](../branches/404/NotFoundBranch.md).

## Пример (сокращённо из `ItemDetail_Branch.ts`)
```typescript
export const itemDetailSubSpec: BranchSpec<ItemDetailInput, ItemDetailData> = {
  id: 'item-detail-sub',
  routes: [],
  styles: { pageClass: 'item-detail-sub-page', bodyClass: 'item-detail-sub-body' },
  display: new ItemDetailDisplay(),
  data: new ItemDetailDataLoader(),
  meta: (input) => ItemDetailRenderer.getMeta(input),
  logic: (_ctx, root) => [new ItemDetailLogic(root)],
};
```

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
