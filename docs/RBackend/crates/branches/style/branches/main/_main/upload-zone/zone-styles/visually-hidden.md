# [Скрытие элементов без потери доступности (visually-hidden.scss)](/RBackend/crates/branches/style/branches/main/_main/upload-zone/zone-styles/visually-hidden.scss)

## Назначение
Утилитарный класс `.visually-hidden` для «честного» скрытия элементов (например, `input[type=file]`): невидим визуально, но доступен скринридерам и кликам по `<label>`.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/main/_main/upload-zone/zone-styles/visually-hidden.scss](/docs/Frontend/ground/branches/main/_main/upload-zone/zone-styles/visually-hidden.md).
В [site.scss](../../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="MainBranch"]`, поэтому действует только на главной.

## Содержимое
- Классы и id: `.visually-hidden`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
