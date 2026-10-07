# [Стили главной страницы (main.scss)](/Backend/crates/branches/style/branches/main/main.scss)

## Назначение
Главный агрегатор стилей для раздела импорта профиля. Он объединяет макеты контейнеров, заголовков и сложной зоны загрузки в единый визуальный блок.

Перенесён из TS-версии без изменений; подробное описание правил — в доке оригинала [ground/branches/main/main.scss](/docs/Frontend/ground/branches/main/main.md).
В [site.scss](../../site.md) подключается через `meta.load-css` внутри `main[data-branch="MainBranch"]`, поэтому действует только на главной.

## Содержимое
- Подключает: [`../../roots/_roots`](../../roots/_roots.md), [`_main/container/container`](_main/container/container.md), [`_main/title/title`](_main/title/title.md), [`_main/upload-zone/upload-zone`](_main/upload-zone/upload-zone.md), [`_main/error/error`](_main/error/error.md).
- Классы и id: `.main`.

- Не подключён, но лежит рядом: [json-validation.scss](_main/managers/validation/_json-validation/json-validation.md) — стили ошибок JSON для будущей загрузки профиля.

---

> 📌 **Подпись документации:** по исходнику и описанию TS-версии · 2026-10-02
