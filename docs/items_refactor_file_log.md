# Журнал файлов, затронутых нарезкой и доработкой поиска страницы «Предметы»

Дата: 2026-06-17

Фиксирует все файлы, которые были изменены, созданы или удалены в рамках текущей работы по странице `Frontend/Web/ground/branches/items`.

## Изменены

```text
Frontend/Web/ground/branches/items/_items/actions/_filter-actions.scss
Frontend/Web/ground/branches/items/_items/chips/_filter-chip.scss
Frontend/Web/ground/branches/items/_items/components/ItemsLayoutRenderer.ts
Frontend/Web/ground/branches/items/_items/filters/_advanced-panel.scss
Frontend/Web/ground/branches/items/_items/managers/ItemsFilterManager.ts
Frontend/Web/ground/branches/items/_items/managers/ItemsManager.ts
Frontend/Web/ground/branches/items/_items/search/_container.scss
Frontend/Web/ground/branches/items/_items/search/_input.scss
Frontend/Web/ground/branches/items/_items/search/_rich-operator.scss
Frontend/Web/ground/branches/items/_items/search/_rich-token.scss
Frontend/Web/ground/branches/items/items.scss
Frontend/Web/static/search/term-aliases.ru.json
```

## Созданы

```text
Frontend/Web/ground/branches/items/_items/managers/filter/alias-fuzzy.ts
Frontend/Web/ground/branches/items/_items/managers/filter/comparison.ts
Frontend/Web/ground/branches/items/_items/managers/filter/filter-applier.ts
Frontend/Web/ground/branches/items/_items/managers/filter/filter-options.ts
Frontend/Web/ground/branches/items/_items/managers/filter/filter-types.ts
Frontend/Web/ground/branches/items/_items/managers/filter/fuse-collector.ts
Frontend/Web/ground/branches/items/_items/managers/filter/fuse-search.ts
Frontend/Web/ground/branches/items/_items/managers/filter/fuzzy-term-guard.ts
Frontend/Web/ground/branches/items/_items/managers/filter/item-matcher.ts
Frontend/Web/ground/branches/items/_items/managers/filter/prepared-items.ts
Frontend/Web/ground/branches/items/_items/managers/filter/query-parser.ts
Frontend/Web/ground/branches/items/_items/managers/filter/search-plan.ts
Frontend/Web/ground/branches/items/_items/managers/filter/search-score.ts
Frontend/Web/ground/branches/items/_items/managers/filter/sort-service.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/advanced-panel-controller.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/autocomplete-controller.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/caret-utils.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/chips-sync-service.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/dropdown-controller.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/filter-icon-resolver.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/filter-options-controller.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/group-dom-raw.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/image-error-handler.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/items-grid-renderer.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/items-runtime-types.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/logical-chips-controller.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/logic-labels.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/multiselect-filter-controller.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/rich-group-renderer.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/raw-edit-controller.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/rich-input-controller.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/rich-query-renderer.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/search-debouncer.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/sort-query.ts
Frontend/Web/ground/branches/items/_items/managers/runtime/token-replacer.ts
Frontend/Web/ground/branches/items/_items/search/_rich-group.scss
Frontend/Web/ground/branches/items/_items/search/_rich-operator.scss
Frontend/Web/ground/branches/items/_items/search/_rich-placeholder.scss
Frontend/Web/ground/branches/items/_items/search/_rich-token.scss
docs/long_yaschik.md
docs/items_refactor_file_log.md
```

## Удалены

```text
нет
```

## Проверки после последней доработки

```text
npm run build — OK
npx vitest run — OK, 36 tests passed
Максимальный размер файла в Frontend/Web/ground/branches/items — 150 строк
```

## Документация, добавленная/обновлённая после замечания о сетевой документации

### Изменены
```text
docs/Frontend/ground/branches/items/_items/actions/_filter-actions.md
docs/Frontend/ground/branches/items/_items/components/ItemsLayoutRenderer.md
docs/Frontend/ground/branches/items/_items/filters/_advanced-panel.md
docs/Frontend/ground/branches/items/_items/managers/ItemsFilterManager.md
docs/Frontend/ground/branches/items/_items/managers/ItemsManager.md
docs/Frontend/ground/branches/items/_items/search/_input.md
docs/Frontend/static/search/term-aliases.ru.md
```

### Созданы
```text
docs/Frontend/ground/branches/items/_items/managers/filter/index.md
docs/Frontend/ground/branches/items/_items/managers/filter/alias-fuzzy.md
docs/Frontend/ground/branches/items/_items/managers/filter/comparison.md
docs/Frontend/ground/branches/items/_items/managers/filter/filter-applier.md
docs/Frontend/ground/branches/items/_items/managers/filter/filter-options.md
docs/Frontend/ground/branches/items/_items/managers/filter/filter-types.md
docs/Frontend/ground/branches/items/_items/managers/filter/fuse-collector.md
docs/Frontend/ground/branches/items/_items/managers/filter/fuse-search.md
docs/Frontend/ground/branches/items/_items/managers/filter/fuzzy-term-guard.md
docs/Frontend/ground/branches/items/_items/managers/filter/item-matcher.md
docs/Frontend/ground/branches/items/_items/managers/filter/prepared-items.md
docs/Frontend/ground/branches/items/_items/managers/filter/query-parser.md
docs/Frontend/ground/branches/items/_items/managers/filter/search-plan.md
docs/Frontend/ground/branches/items/_items/managers/filter/search-score.md
docs/Frontend/ground/branches/items/_items/managers/filter/sort-service.md
docs/Frontend/ground/branches/items/_items/managers/runtime/index.md
docs/Frontend/ground/branches/items/_items/managers/runtime/advanced-panel-controller.md
docs/Frontend/ground/branches/items/_items/managers/runtime/autocomplete-controller.md
docs/Frontend/ground/branches/items/_items/managers/runtime/caret-utils.md
docs/Frontend/ground/branches/items/_items/managers/runtime/chips-sync-service.md
docs/Frontend/ground/branches/items/_items/managers/runtime/dropdown-controller.md
docs/Frontend/ground/branches/items/_items/managers/runtime/filter-icon-resolver.md
docs/Frontend/ground/branches/items/_items/managers/runtime/filter-options-controller.md
docs/Frontend/ground/branches/items/_items/managers/runtime/group-dom-raw.md
docs/Frontend/ground/branches/items/_items/managers/runtime/image-error-handler.md
docs/Frontend/ground/branches/items/_items/managers/runtime/items-grid-renderer.md
docs/Frontend/ground/branches/items/_items/managers/runtime/items-runtime-types.md
docs/Frontend/ground/branches/items/_items/managers/runtime/logical-chips-controller.md
docs/Frontend/ground/branches/items/_items/managers/runtime/logic-labels.md
docs/Frontend/ground/branches/items/_items/managers/runtime/multiselect-filter-controller.md
docs/Frontend/ground/branches/items/_items/managers/runtime/raw-edit-controller.md
docs/Frontend/ground/branches/items/_items/managers/runtime/rich-group-renderer.md
docs/Frontend/ground/branches/items/_items/managers/runtime/rich-input-controller.md
docs/Frontend/ground/branches/items/_items/managers/runtime/rich-query-renderer.md
docs/Frontend/ground/branches/items/_items/managers/runtime/search-debouncer.md
docs/Frontend/ground/branches/items/_items/managers/runtime/sort-query.md
docs/Frontend/ground/branches/items/_items/managers/runtime/token-replacer.md
docs/Frontend/ground/branches/items/_items/search/_caret-spacer.md
docs/Frontend/ground/branches/items/_items/search/_rich-group.md
docs/Frontend/ground/branches/items/_items/search/_rich-operator.md
docs/Frontend/ground/branches/items/_items/search/_rich-placeholder.md
docs/Frontend/ground/branches/items/_items/search/_rich-token.md
```
