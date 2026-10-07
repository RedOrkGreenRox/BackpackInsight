# [Анимация появления (_fade-up.scss)](/RBackend/crates/branches/style/branches/items/_items/animations/_fade-up.scss)

## Назначение
Описание кастомной анимации `fadeUp`, используемой для плавного появления карточек предметов при динамической подгрузке (Infinite Scroll).

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/items/_items/animations/_fade-up.scss](/docs/Frontend/ground/branches/items/_items/animations/_fade-up.md).
В [site.scss](../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]`, поэтому действует только на этих страницах.

## Содержимое
- Анимации: `@keyframes fadeUp`.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
