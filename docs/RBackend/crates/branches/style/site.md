# [branches/style/site.scss](/RBackend/crates/branches/style/site.scss)

## Назначение
Точка входа стилей сайта. cargo-leptos компилирует её (`style-file` в `[[workspace.metadata.leptos]]` файла `RBackend/Cargo.toml`) в один файл `/pkg/backpack-insight.css`, который подключает `shell` ([roots/shell.rs](../src/roots/shell.md)). Стили страниц перенесены из TS-версии без изменений; этот файл решает, где каждый из них действует.

## Ключевая функциональность
| Подключение | Файл | Где действует |
| :--- | :--- | :--- |
| `@use "roots/_roots"` | [_roots.scss](roots/_roots.md) | везде: переменные, шрифты, сброс, каркас (панель, фон, кнопка меню), карточки предметов |
| `@use "branches/404/404" as not-found` | [404.scss](branches/404/404.md) | везде: часть правил висит на `body.error-404`, вне `<main>` |
| `@use "leptos"` | [_leptos.scss](_leptos.md) | везде: дополнения для разметки Leptos |
| `meta.load-css("branches/main/main")` | [main.scss](branches/main/main.md) | внутри `main[data-branch="MainBranch"]` |
| `meta.load-css("branches/items/items")` | [items.scss](branches/items/items.md) | внутри `main[data-branch="ItemsBranch"]` и `main[data-branch="EditorBranch"]` |

- **Почему области.** В TS-версии стили ветки подгружались вместе с ней и исчезали при уходе со страницы. Здесь CSS один на весь сайт, поэтому общие селекторы веток (`.container`, `.main-title`, …) задели бы другие страницы: например, `.container` главной сужал каталог. `meta.load-css` внутри селектора добавляет каждому правилу ветки префикс `main[data-branch=…]`, который ставит `App`.
- **Алиас `not-found`.** Пространство имён по умолчанию взялось бы из имени файла `404`, а Sass не принимает имя, начинающееся с цифры.
- **Порядок.** `@use` идут до любых правил (требование Sass), `_leptos.scss` — после перенесённых стилей, чтобы его поправки побеждали при равной специфичности.

CSS кэшируется на час вместе с остальным `/pkg` ([roots/runner.rs](../src/roots/runner.md)).

## Связи
- Обзор крейта и сборка: [branches.md](../../branches.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
