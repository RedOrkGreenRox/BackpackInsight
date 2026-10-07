# [Сборка стилей зоны загрузки (index.scss)](/RBackend/crates/branches/style/branches/main/_main/upload-zone/styles/index.scss)

## Назначение
Объединяет все модульные части оформления области перетаскивания.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/main/_main/upload-zone/styles/index.scss](/docs/Frontend/ground/branches/main/_main/upload-zone/styles/index.md).
В [site.scss](../../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="MainBranch"]`, поэтому действует только на главной.

## Содержимое
- Подключает: [`upload-area-base`](upload-area-base.md), [`upload-area-hover`](upload-area-hover.md), [`upload-area-user-select`](upload-area-user-select.md), [`upload-area-textarea`](upload-area-textarea.md), [`upload-area-responsive`](upload-area-responsive.md).

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
