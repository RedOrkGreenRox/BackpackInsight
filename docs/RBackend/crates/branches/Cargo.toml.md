# [Манифест сайта на Leptos (Cargo.toml)](/RBackend/crates/branches/Cargo.toml)

## Назначение
Манифест пакета `branches` — сайта на Leptos SSR + Islands ([обзор](../branches.md)). Один пакет собирается двумя способами: с фичей `ssr` как серверный бинарник, с фичей `hydrate` как WASM островов.

## Ключевое
- **`[package]`**: `version = "0.1.0"`; `edition`, `license` и `repository` берутся из `[workspace.package]` ([RBackend/Cargo.toml](../../Cargo.toml.md)).
- **`[lib] crate-type = ["cdylib", "rlib"]`** — `cdylib` нужен для WASM, `rlib` — чтобы бинарник использовал ту же библиотеку.
- **`[[bin]] branches`** (`src/main.rs`, [main.rs](src/main.md)) собирается только с `required-features = ["ssr"]`.
- **`[dependencies]`** — общие для обеих сборок:
  - `leptos` 0.8 с `islands` и `islands-router` — острова и переходы без перезагрузки;
  - `leptos_meta` 0.8 — `<Title>`, `<Meta>`, `<Html>`, `<Body>` из веток;
  - `serde` с `derive` — пропсы островов и ответы серверных функций.
- **`[features]`** — две сборки, необязательные зависимости включаются через `dep:`.
- **Фича `hydrate`** (WASM): `console_error_panic_hook`, `wasm-bindgen`, `web-sys` с нужными API браузера: `History`, `Location`, `HtmlAnchorElement`, `HtmlElement`, `DomTokenList`, `CssStyleDeclaration`, `Url`, `UrlSearchParams`, а для докачки ленивых островов ([shell/prefetch.rs](src/shell/prefetch.md)) ещё `Document`, `NodeList`, `HtmlLinkElement`, `Response`, `Window`.
- **Фича `ssr`** (сервер):
  - `leptos/ssr`, `leptos_meta/ssr`;
  - внутренние крейты `api` и `rbackend_core` (модель каталога); крейт `pack` сайту не нужен;
  - `axum` 0.8 и `leptos_axum` 0.8 с `islands-router` — без этой фичи сервер не размечает ветки `Either`, и смена языка не заменяет острова;
  - `any_spawner` с `tokio` — executor для фоновых задач рендера;
  - `tokio` (`macros`, `rt-multi-thread`, `net`);
  - `tower-http` с `fs`, `compression-br`, `compression-gzip`, `set-header` — статика, сжатие, `Cache-Control`;
  - `serde_json` — словари интерфейса ([i18n.rs](src/roots/i18n.md));
  - `tracing`, `tracing-subscriber` (`env-filter`) — логи.
- **Линты — свои вместо workspace:**
  - `[lints.rust]`: `unsafe_code = "deny"`, а не `forbid`: код-обвязка `wasm-bindgen` содержит `unsafe`, а `deny` всё равно запрещает его в рукописном коде;
  - `[lints.clippy]`: `pedantic` на уровне `warn`, плюс `unwrap_used` и `expect_used`;
  - `needless_pass_by_value` разрешён: `#[component]` и `#[island]` принимают пропсы по значению.

## Связи
- Настройки cargo-leptos и профиль `wasm-release`: [RBackend/Cargo.toml](../../Cargo.toml.md).
- Версии зависимостей: [Cargo.lock](../../Cargo.lock.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-06
