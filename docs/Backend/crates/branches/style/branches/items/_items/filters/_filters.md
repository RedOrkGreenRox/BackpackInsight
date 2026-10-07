# [Сборка стилей фильтров (_filters.scss)](/Backend/crates/branches/style/branches/items/_items/filters/_filters.scss)

## Назначение
Главная точка входа для модуля фильтрации. Координирует сборку выпадающих списков, панелей и кнопок управления.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/items/_items/filters/_filters.scss](/docs/Frontend/ground/branches/items/_items/filters/_filters.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Подключает: [`./filter-controls`](_filter-controls.md), [`./filter-toggle`](_filter-toggle.md), [`./advanced-panel`](_advanced-panel.md), [`./dropdown`](_dropdown.md), [`./dropdown-toggle`](_dropdown-toggle.md), [`./dropdown-content`](_dropdown-content.md), [`./filter-group`](_filter-group.md).

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
