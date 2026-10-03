# [branches/branches/not_found/mod.rs](/RBackend/crates/branches/src/branches/not_found/mod.rs)

## Назначение
`NotFoundBranch` — страница 404 для явного пути `/404` и для любого пути, который не принял ни один `BranchSpec`. Чисто серверная, без островов. Аналог [NotFoundBranch.ts](/docs/Frontend/ground/branches/404/NotFoundBranch.md).

## Ключевая функциональность
- **`struct NotFoundBranch`** + `impl Branch`:
  - `SPEC`: `name` `NotFoundBranch`, `path` `/404`, без островов, `sitemap: false`;
  - `render(ctx)`:
    - `ctx.set_status(StatusCode::NOT_FOUND)` — ответ уходит со статусом 404, а не 200 с текстом ошибки;
    - `<Title>` и описание из ключей `not_found_meta_title`, `not_found_meta_description`; `<Meta name="robots" content="noindex">`;
    - разметка TS-версии: `.not-found-page > .container-404` с заголовком `h1.title-404` (`not_found_title`), текстом `p.text-404` (`not_found_text`) и ссылкой `a#homeBtn.btn-404` на `/` (`not_found_button`).

Как сюда попадает неизвестный путь: fallback-обработчик в [roots/runner.rs](../../roots/runner.md) рендерит `App`, а `Gen::resolve` ([roots/gen.rs](../../roots/gen.md)) возвращает эту ветку по умолчанию. По имени ветки `App` ([roots/shell.rs](../../roots/shell.md)) ставит на `<body>` класс `error-404` и берёт фон из пяти картинок `/images/404/` по редкости ([roots/backdrop.rs](../../roots/backdrop.md)).

## Стили
Перенесённые без изменений [404.scss](../../../style/branches/404/404.md). Они подключаются в [site.scss](../../../style/site.md) глобально, потому что часть правил висит на `body.error-404`, вне `<main>`.

## Связи
- Список веток: [branches/mod.rs](../mod.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
