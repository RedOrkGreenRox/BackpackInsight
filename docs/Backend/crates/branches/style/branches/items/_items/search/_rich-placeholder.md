# [Слоты выбора условия (_rich-placeholder.scss)](/Backend/crates/branches/style/branches/items/_items/search/_rich-placeholder.scss)

## Назначение
Описывает активные слоты выбора условия внутри логических шаблонов.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/items/_items/search/_rich-placeholder.scss](/docs/Frontend/ground/branches/items/_items/search/_rich-placeholder.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Классы и id: `.search-input-rich`, `.rich-placeholder`, `.active-placeholder`, `.ghost-suggestion`.
- Анимации: `@keyframes pulse-placeholder`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
