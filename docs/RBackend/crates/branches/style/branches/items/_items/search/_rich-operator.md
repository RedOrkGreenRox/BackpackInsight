# [style/branches/items/_items/search/_rich-operator.scss](/RBackend/crates/branches/style/branches/items/_items/search/_rich-operator.scss)

## Назначение
Описывает inline-операторы `AND/OR/NOT` (`И/ИЛИ/НЕ`) внутри поисковой строки.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/items/_items/search/_rich-operator.scss](/docs/Frontend/ground/branches/items/_items/search/_rich-operator.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Классы и id: `.search-input-rich`, `.rich-operator`, `.op-and`, `.op-or`, `.op-not`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
