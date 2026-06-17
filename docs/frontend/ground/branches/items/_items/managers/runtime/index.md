# Runtime-подсеть страницы «Предметы»

## Назначение
Каталог `runtime/` содержит DOM/UI-контроллеры страницы предметов. Эти файлы не должны знать о структуре БД; они управляют rich input, панелью фильтров, логическими шаблонами, карточками и пользовательскими событиями.

## Узлы
- [advanced-panel-controller](advanced-panel-controller.md) — раскрытие advanced-панели.
- [autocomplete-controller](autocomplete-controller.md) — ghost autocomplete.
- [caret-utils](caret-utils.md) — вставка HTML и caret-spacer.
- [chips-sync-service](chips-sync-service.md) — синхронизация panel chips с query.
- [dropdown-controller](dropdown-controller.md) — dropdown-категории.
- [filter-icon-resolver](filter-icon-resolver.md) — иконки фильтров.
- [filter-options-controller](filter-options-controller.md) — инициализация групп chips.
- [group-dom-raw](group-dom-raw.md) — восстановление raw группы из DOM.
- [image-error-handler](image-error-handler.md) — fallback картинок.
- [items-grid-renderer](items-grid-renderer.md) — grid и infinite scroll.
- [items-runtime-types](items-runtime-types.md) — runtime-типы.
- [logic-labels](logic-labels.md) — локализация операторов.
- [logical-chips-controller](logical-chips-controller.md) — логические шаблоны.
- [multiselect-filter-controller](multiselect-filter-controller.md) — chips-категории.
- [raw-edit-controller](raw-edit-controller.md) — raw-редактирование.
- [rich-group-renderer](rich-group-renderer.md) — группы `[]`.
- [rich-input-controller](rich-input-controller.md) — contenteditable input.
- [rich-query-renderer](rich-query-renderer.md) — raw↔rich компиляция.
- [search-debouncer](search-debouncer.md) — debounce.
- [sort-query](sort-query.md) — исторический helper сортировки.
- [token-replacer](token-replacer.md) — замена focused token.

## Связи
- Оркестратор: [ItemsManager](../ItemsManager.md).
- Поиск: [filter index](../filter/index.md).
- Стили rich input: [search SCSS](../../search/_input.md).

---

> 📌 **Подпись документации:** runtime-подсеть items · 2026-06-17
