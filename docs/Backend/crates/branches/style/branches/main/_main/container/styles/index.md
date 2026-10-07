# [Сборка стилей контейнера (index.scss)](/Backend/crates/branches/style/branches/main/_main/container/styles/index.scss)

## Назначение
Точка сборки для стилей макета главной страницы.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/main/_main/container/styles/index.scss](/docs/Frontend/ground/branches/main/_main/container/styles/index.md).
В [site.scss](../../../../../site.md) подключается через `meta.load-css` внутри `main[data-branch="MainBranch"]`, поэтому действует только на главной.

## Содержимое
- Подключает: [`container-base`](container-base.md), [`container-responsive`](container-responsive.md).

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
