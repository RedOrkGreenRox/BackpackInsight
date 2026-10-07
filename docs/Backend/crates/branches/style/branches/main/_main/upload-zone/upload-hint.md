# [Стили подсказки загрузки (upload-hint.scss)](/Backend/crates/branches/style/branches/main/_main/upload-zone/upload-hint.scss)

## Назначение
Агрегатор: подключает модульные стили подсказки `.upload-hint` из `hint-styles/`.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/main/_main/upload-zone/upload-hint.scss](/docs/Frontend/ground/branches/main/_main/upload-zone/upload-hint.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="MainBranch"]`, поэтому действует только на главной.

## Содержимое
- Подключает: [`hint-styles`](hint-styles/index.md).

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
