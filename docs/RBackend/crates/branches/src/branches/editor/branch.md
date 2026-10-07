# [Страница редактора (branch.rs)](/RBackend/crates/branches/src/branches/editor/branch.rs)

## Назначение
`EditorBranch` — серверная часть страницы `/editor`: заголовок и остров `EditorManager` с билдом из адреса.

## Ключевая функциональность
- `SPEC`: `name` `EditorBranch`, `path` `/editor`, `islands` `["EditorManager"]` (WASM острова предзагружается на этой странице, [roots/lazy.rs](../../roots/lazy.md)), `sitemap: false`.
- `head(ctx)`: `PageHead::section` с `editor_title` и `editor_meta_description`.
- `render(ctx)`: `section.wiki-section > .container > .wiki-header > h1.main-title` и остров, обёрнутый в `per_lang` ([roots/per_lang.rs](../../roots/per_lang.md)), чтобы смена языка пересоздавала остров. Параметры `h`, `b`, `s` из query (не длиннее `MAX_CODE` = 4000 символов) уходят в `UrlCode` ([model/url.rs](model/url.md)).
- `labels(ctx)` (приватная) — `EditorLabels` из словаря по ключам `editor_<поле>` (`Frontend/Web/static/lang/{en,ru}.json`).

## Стили
`site.scss` подключает для `main[data-branch="EditorBranch"]` стили каталога (заголовок) и [editor.scss](../../../style/branches/editor/editor.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-07.
