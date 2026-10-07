# [Состояния чипов в поиске (_rich-token.scss)](/RBackend/crates/branches/style/branches/items/_items/search/_rich-token.scss)

## Назначение
Описывает визуальные состояния фильтр-чипов: обычный, exact, negated и focused.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/items/_items/search/_rich-token.scss](/docs/Frontend/ground/branches/items/_items/search/_rich-token.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Классы и id: `.search-input-rich`, `.rich-token`, `.plain`, `.exact`, `.negated`, `.focused-token`, `.token-close-btn`, `.filter-icon`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
