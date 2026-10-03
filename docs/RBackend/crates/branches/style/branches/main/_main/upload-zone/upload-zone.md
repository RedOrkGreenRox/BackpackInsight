# [style/branches/main/_main/upload-zone/upload-zone.scss](/RBackend/crates/branches/style/branches/main/_main/upload-zone/upload-zone.scss)

## Назначение
Этот файл является связующим звеном для всех визуальных компонентов загрузчика профилей. Он обеспечивает общую видимость текста и правильную иерархию слоев.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/main/_main/upload-zone/upload-zone.scss](/docs/Frontend/ground/branches/main/_main/upload-zone/upload-zone.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="MainBranch"]`, поэтому действует только на главной.

## Содержимое
- Подключает: [`upload-area`](upload-area.md), [`upload-hint`](upload-hint.md), [`button-view-profile`](button-view-profile.md), [`../animations/animations`](../animations/animations.md), [`zone-styles`](zone-styles/index.md).
- Классы и id: `.upload-zone`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
