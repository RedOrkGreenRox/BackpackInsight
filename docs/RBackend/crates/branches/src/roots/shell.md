# [branches/roots/shell.rs](/RBackend/crates/branches/src/roots/shell.rs)

## Назначение
HTML-каркас документа (`shell`) и корневой компонент `App`, который выбирает ветку и рисует общий каркас страницы: боковую панель, фон с параллаксом, затемнение и `#app`. Аналог [Shell.ts](/docs/Frontend/ground/roots/Shell.md); разметка повторяет `Frontend/Web/index.html` TS-версии, но весь каркас приходит с сервера готовым HTML.

## Ключевая функциональность
- **`shell(options)`** — документ целиком; его рендерит обработчик страниц из `BranchRunner::router` ([runner.rs](runner.md)). В `<head>`:
  - `charset`, `viewport`, `theme-color` `#121212`, иконка из `/images/manifest/png/`;
  - `preload` шрифта `Signika-Regular.woff2`, чтобы текст не перерисовывался после загрузки шрифта;
  - стили по адресу `SplitFiles::stylesheet` ([split_files.rs](split_files.md)): `/{site_pkg_dir}/{output_name}.css`, при `hash-files` с хэшем в имени (собирает cargo-leptos из [site.scss](../../style/site.md));
  - `HydrationScripts` с `islands=true` и `islands_router=true`: грузит WASM, который оживляет только острова, и включает islands router;
  - `MetaTags` — сюда `leptos_meta` вставляет `<title>` и `<meta>` из `App`.
- **`App()`** — корневой компонент:
  1. `provide_meta_context` для `leptos_meta`;
  2. `BranchCtx::current()` ([ctx.rs](ctx.md));
  3. `Gen::resolve(path)` ([gen.rs](gen.md)) → запись ветки и параметры, `with_params`;
  4. `not_found` — выбрана ли `NotFoundBranch` (по имени из `SPEC`);
  5. `Backdrop::choose(ctx, not_found)` ([backdrop.rs](backdrop.md)) — пути к фону;
  6. разметка:
     - `<html lang=…>` и `<body class="loaded">` (на 404 ещё `error-404`). Старый CSS держит `body` прозрачным, пока нет класса `loaded`; в TS-версии его ставил JS, здесь сервер присылает страницу готовой;
     - теги `<head>` ветки: `(entry.head)(&ctx).tags(entry.spec.sitemap)` ([head.rs](head.md)) — `<title>`, `description` и `robots`, одинаковым набором на всех страницах;
     - `LazyIslands::links(entry.spec.islands)` ([lazy.rs](lazy.md)) — `preload` WASM ленивых островов: сразу для островов этой страницы, отложенный для остальных;
     - боковая панель `sidebar(ctx)` ([chrome.rs](chrome.md));
     - `#bgImage` с `<picture>` (AVIF и запасной WebP, `#bgImg` с `fetchpriority="high"`);
     - остров `ParallaxManager` ([shell/parallax.rs](../shell/parallax.md));
     - `.overlay` — затемнение поверх фона;
     - `<main id="app" data-branch=…>` с результатом `render` ветки. По `data-branch` [site.scss](../../style/site.md) включает стили нужной страницы.

## Переходы без перезагрузки
Islands router перехватывает клики по ссылкам и отправку форм, запрашивает новую страницу с заголовком `Islands-Router` и сравнивает её с текущим DOM. Меняются только отличающиеся узлы, острова не трогаются, смена оборачивается в `document.startViewTransition` (размытие текста задаёт [_leptos.scss](../../style/_leptos.md)). Фон при этом не меняется: сервер берёт его из cookie ([backdrop.rs](backdrop.md)).

Сравнение идёт по порядку узлов, поэтому `<head>` у всех страниц должен быть одной формы: лишний тег на одной странице сдвигает сравнение, и пропадает весь `<body>`. Поэтому теги ставит только `App` (см. [head.rs](head.md)).

## Стили
Каркас — перенесённые без изменений стили TS-версии из `style/roots` ([_roots.scss](../../style/roots/_roots.md)); поправки для Leptos — [_leptos.scss](../../style/_leptos.md).

## Связи
- Реэкспорт: [roots/mod.rs](mod.md). Точка входа WASM для островов: `hydrate` в [lib.rs](../lib.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
