# [style/branches/items/_items/search/_prompt-lists.scss](/RBackend/crates/branches/style/branches/items/_items/search/_prompt-lists.scss)

## Назначение
Стили положительных/отрицательных списков чипсов в подсказке поиска (prompt-panel-top + prompt lists).

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/items/_items/search/_prompt-lists.scss](/docs/Frontend/ground/branches/items/_items/search/_prompt-lists.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Классы и id: `.prompt-panel-top`, `.prompt-lists`, `.prompt-list`, `.prompt-list-positive`, `.prompt-list-negative`, `.prompt-list-title`, `.prompt-list-items`, `.prompt-token`, `.filter-icon`, `.text-icon`, `.advanced-formula-preview`, `.advanced-search-help`, `.advanced-search-help-content`, `.copy-example`, `.copy-query-btn`, `.dropdown-filter`, `.logic-category`.
- Анимации: `@keyframes helpPanelIn`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
