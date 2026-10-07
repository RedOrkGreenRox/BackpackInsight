# [Плейсхолдер загрузки (_loading-spinner.scss)](/RBackend/crates/branches/style/branches/items/_items/animations/_loading-spinner.scss)

## Назначение
Стилизация текстового плейсхолдера, который отображается внизу сетки Вики, пока браузер подготавливает следующую порцию карточек предметов.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/items/_items/animations/_loading-spinner.scss](/docs/Frontend/ground/branches/items/_items/animations/_loading-spinner.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Классы и id: `.loading-spinner`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
