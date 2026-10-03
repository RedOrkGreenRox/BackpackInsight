# [branches/branches/editor/mod.rs](/RBackend/crates/branches/src/branches/editor/mod.rs)

## Назначение
`EditorBranch` — страница «Редактор» по адресу `/editor`. Пока заготовка: только заголовок, без содержимого. Чисто серверная (`ssr`), без островов. В TS-версии аналога нет.

## Ключевая функциональность
- **`struct EditorBranch`** + `impl Branch`:
  - `SPEC`: `name` `EditorBranch`, `path` `/editor`, `islands` пустой, `sitemap: false` (пустая страница не попадает в карту сайта);
  - `render(ctx)`:
    - `<Title>` «{editor_title} | Backpack Insight», `<Meta name="description">` из `editor_meta_description` и `<Meta name="robots" content="noindex">`;
    - каркас как у каталога: `section.wiki-section > .container > .wiki-header > h1.main-title` с ключом `editor_title` («Редактор» / «Editor»).
- Вкладка в боковой панели: строка `/editor` в `NAV` ([roots/chrome.rs](../../roots/chrome.md)) с подписью `sidebar_editor` и временной иконкой `fonticon/typebag`.

## Стили
Те же, что у каталога: [site.scss](../../../style/site.md) подключает [items.scss](../../../style/branches/items/items.md) внутри `main[data-branch="EditorBranch"]`, поэтому заголовок выглядит как на странице предметов.

## Связи
- Регистрация: [roots/gen.rs](../../roots/gen.md). Список веток: [branches/mod.rs](../mod.md).

## Планируется
- Содержимое редактора: пока не определено.

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
