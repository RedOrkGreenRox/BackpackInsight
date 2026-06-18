# [BranchSpec.ts](../../../Frontend/Web/ground/roots/BranchSpec.ts)

## Назначение

`BranchSpec` — это декларативный объект (спецификация), который описывает страницу приложения в терминах модулей:

- `id` — уникальный идентификатор страницы.
- `routes` — массив маршрутов, которые ведут на страницу.
- `meta` — мета-данные для SEO или функция, генерирующая их из контекста.
- `styles` — CSS-классы страницы и body.
- `display` — модуль отображения (skeleton, error, полный рендер).
- `data` — массив загрузчиков данных.
- `state` — адаптер сохранения/восстановления состояния.
- `logic` — массив логических модулей (события, навигация, SEO и т.д.).

BranchSpec не содержит императивной логики. Он только **декларирует**, из каких модулей состоит страница.

## Связи

- Исполняется [`BranchRunner.ts`](BranchRunner.md).
- Основан на концепциях [`StructuredBranch.ts`](StructuredBranch.md): те же 4 слоя, но в форме композиции, а не наследования.
- Модули `display`, `data`, `logic` — это существующие классы вроде `ItemDetailRenderer`, `ItemDataLoader`, `ItemNavigationManager`, приведённые к единому контракту.

## Пример спецификации

```typescript
export const itemDetailSpec: BranchSpec<ItemDetailContext, ItemDetailInput> = {
  id: 'itemDetail',
  routes: ['/item/:name', '/profile/item/:name'],
  styles: {
    pageClass: 'item-detail-page',
    bodyClass: 'item-detail-body',
  },
  display: itemDetailDisplay,
  data: [itemDataLoader],
  state: itemDetailStateAdapter,
  logic: [itemNavigationModule, itemSeoModule],
};
```

## AI-контекст

- BranchSpec позволяет собирать страницы из готовых модулей без наследования.
- Это делает страницу читаемой как конфигурацию и упрощает тестирование.
- BranchSpec — это эволюция StructuredBranch: если StructuredBranch отвечает **как внутри устроена страница**, то BranchSpec отвечает **из чего страница состоит**.

---

> 📌 **Подпись документации:** создано в рамках внедрения BranchSpec+BranchRunner · 2026-06-18
