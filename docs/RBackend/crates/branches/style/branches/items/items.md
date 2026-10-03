# [style/branches/items/items.scss](/RBackend/crates/branches/style/branches/items/items.scss)

## Назначение
Главный агрегатор стилей для страницы Вики. Координирует сборку всех модульных компонентов поиска, фильтров и адаптивных сеток.

Перенесён из TS-версии ([ground/branches/items/items.scss](/docs/Frontend/ground/branches/items/items.md)). Единственное отличие от TS-версии: убран `@use` стилей `itemDetail` — страница деталей предмета в Leptos не переносится, её заменит ItemField.
В [site.scss](../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Подключает: [`../../roots/_roots`](../../roots/_roots.md), [`./_items/layout/layout`](_items/layout/_layout.md), [`./_items/search/container`](_items/search/_container.md), [`./_items/search/input`](_items/search/_input.md), [`./_items/search/prompt-lists`](_items/search/_prompt-lists.md), [`./_items/search/rich-token`](_items/search/_rich-token.md), [`./_items/search/rich-operator`](_items/search/_rich-operator.md), [`./_items/search/rich-placeholder`](_items/search/_rich-placeholder.md), [`./_items/search/rich-group`](_items/search/_rich-group.md), [`./_items/search/caret-spacer`](_items/search/_caret-spacer.md), [`./_items/filters/filters`](_items/filters/_filters.md), [`./_items/chips/filter-chip`](_items/chips/_filter-chip.md), [`./_items/chips/rarity-colors`](_items/chips/_rarity-colors.md), [`./_items/actions/filter-actions`](_items/actions/_filter-actions.md), [`./_items/actions/clear-btn`](_items/actions/_clear-btn.md), [`./_items/actions/checkbox`](_items/actions/_checkbox.md), [`./_items/responsive/tablet`](_items/responsive/_tablet.md), [`./_items/responsive/mobile`](_items/responsive/_mobile.md), [`./_items/animations/loading-spinner`](_items/animations/_loading-spinner.md), [`./_items/animations/fade-up`](_items/animations/_fade-up.md).
- Классы и id: `.items-scroll-sentinel`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
