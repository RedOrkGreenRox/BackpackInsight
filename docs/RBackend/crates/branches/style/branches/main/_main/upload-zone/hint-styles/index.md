# [Сборка стилей подсказок (index.scss)](/RBackend/crates/branches/style/branches/main/_main/upload-zone/hint-styles/index.scss)

## Назначение
Объединяет базовые стили подсказок и логику их скрытия на ПК/мобильных.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/main/_main/upload-zone/hint-styles/index.scss](/docs/Frontend/ground/branches/main/_main/upload-zone/hint-styles/index.md).
В [site.scss](../../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="MainBranch"]`, поэтому действует только на главной.

## Содержимое
- Подключает: [`upload-hint-base`](upload-hint-base.md), [`upload-hint-pc-only`](upload-hint-pc-only.md).

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
