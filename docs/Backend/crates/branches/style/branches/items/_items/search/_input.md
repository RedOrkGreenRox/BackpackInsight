# [Поле поиска (_input.scss)](/Backend/crates/branches/style/branches/items/_items/search/_input.scss)

## Назначение
Базовые стили contenteditable-поля поиска `.search-input-rich` (элемент с id itemSearch из ItemsLayoutRenderer). Поле работает в обычном потоке строк, чтобы каретку можно было ставить между чипами.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/items/_items/search/_input.scss](/docs/Frontend/ground/branches/items/_items/search/_input.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Классы и id: `.search-input-rich`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
