# [Контракт страницы (branch.rs)](/Backend/crates/branches/src/roots/branch.rs)

## Назначение
Типизированный контракт страницы (трейт `Branch`) и его стёртая форма для реестра (`BranchEntry`). Rust-аналог [Branch.ts](/docs/Frontend/ground/roots/Branch.md), но без жизненного цикла: ветка — это одна чистая функция рендера.

## Ключевая функциональность
- **`trait Branch`** — то, что реализует каждая страница:
  - `const SPEC: BranchSpec` — статический контракт (имя, путь, острова, sitemap), см. [spec.rs](spec.md);
  - `fn head(ctx: &BranchCtx) -> PageHead` — заголовок и описание страницы ([head.rs](head.md)). Теги `<head>` ветка сама не ставит: их рисует каркас в одинаковой для всех страниц форме, иначе islands router теряет `<body>` при переходе;
  - `fn render(ctx: BranchCtx) -> AnyView` — рисует страницу для одного запроса. Рендер **синхронный**: каталог и словари уже в памяти сервера, поэтому HTML готов целиком в первом ответе, без `Suspense` и без потоковой догрузки.
- **`struct BranchEntry`** (`Clone + Copy`) — запись реестра: поле `spec` и указатели на функции `head: fn(&BranchCtx) -> PageHead` и `render: fn(BranchCtx) -> AnyView`. Нужна потому, что трейт с ассоциированной константой нельзя положить в срез как `dyn Branch`.
- **`BranchEntry::of::<B>()`** — `const fn`, собирает запись из `B::SPEC`, `B::head` и `B::render`. Благодаря `const` реестр в [gen.rs](gen.md) — это константный срез, вычисленный при компиляции.

## Реализации
[MainBranch](../branches/main/mod.md), [ItemsBranch](../branches/items/branch.md), [EditorBranch](../branches/editor/mod.md), [NotFoundBranch](../branches/not_found/mod.md).

## Связи
- Контекст запроса: [ctx.rs](ctx.md).
- Кто вызывает `head` и `render`: [shell.rs](shell.md) (`App` берёт запись из `Gen::resolve`).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-03.
