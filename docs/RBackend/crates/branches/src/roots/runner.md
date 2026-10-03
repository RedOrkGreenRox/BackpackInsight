# [branches/roots/runner.rs](/RBackend/crates/branches/src/roots/runner.rs)

## Назначение
`BranchRunner` превращает `BranchSpec` всех веток в маршруты Axum и запускает сервер. Один процесс отдаёт всё: HTML веток (SSR), серверные функции островов (`/_fn/*`), WASM/CSS (`/pkg`), картинки и шрифты из `Frontend/Web/static` и все маршруты крейта `api`. Если задан `API_SECRET`, сайт отвечает только запросам с заголовком `X-Internal-Secret` (его добавляет прокси Cloudflare Pages, см. [[[path]].ts](/docs/Frontend/functions/[[path]].md)). Аналог [BranchRunner.ts](/docs/Frontend/ground/roots/BranchRunner.md).

## Ключевая функциональность
- **`serve()`** — запуск, вызывается из [main.rs](../main.md):
  1. `any_spawner::Executor::init_tokio` — Leptos запускает фоновые задачи рендера через глобальный executor;
  2. `get_configuration(None)` — настройки Leptos из переменных `LEPTOS_*` или `[[workspace.metadata.leptos]]` в `RBackend/Cargo.toml`;
  3. `api::AppState::discover` — корень проекта, секреты, БД и проверка паков ([api/state.rs](../../../api/src/state.md));
  4. `Catalog::load` ([catalog/mod.rs](../catalog/mod.md)) и `Dict::load` ([i18n.rs](i18n.md)) из корня проекта;
  5. `TcpListener` на `site_addr`, `axum::serve` с `api::shutdown_signal` для мягкой остановки.
  Любая ошибка (нет паков, битый словарь, занят порт) завершает процесс с ошибкой.
- **`router(options, state, catalog, dict)`** — сборка `Router`:
  - замыкание `context` кладёт `CatalogHandle` и `Dict` в контекст Leptos каждого рендера и каждой серверной функции;
  - `render` = `render_app_async_with_context(context, shell)`: один обработчик на все ветки, конкретную ветку выбирает `App` через `Gen::resolve`;
  - по маршруту `GET` на каждый `entry.spec.axum_path()` из `Gen::branches()`;
  - `/_fn/{*fn_name}` (GET и POST) → `handle_server_fns_with_context` (сейчас там `search_items`, см. [search_fn.rs](../branches/items/search_fn.md));
  - `/pkg` (`Cache-Control` 1 час), `/images` (30 дней), `/fonts` (год, `immutable`) через `ServeDir`;
  - `fallback(render)` — неизвестный путь тоже рендерится, `Gen` отдаёт `NotFoundBranch` со статусом 404;
  - слой `api::require_api_secret` ([api/security/secret.rs](../../../api/src/security/secret.md)) поверх страниц, `/_fn`, `/pkg`, `/images`, `/fonts` и fallback: без верного `X-Internal-Secret` ответ 403. Без `API_SECRET` слой ничего не проверяет (локальный запуск);
  - `api::routes(state)` — все маршруты API, кроме `/` ([api/lib.rs](../../../api/src/lib.md)), подключаются после слоя, поэтому их защиту решает сам `api` (`/health` остаётся открытым);
  - `CompressionLayer` (br/gzip) поверх всего.
- **`cached(service, value)`** (приватная) — оборачивает сервис в `SetResponseHeader::if_not_present` с заданным `Cache-Control`.
- **`BoxError`** (приватный тип) — общий тип ошибки `serve`.

## Связи
- Обзор и порядок обработки запроса: [branches.md](../../../branches.md).

---
> 📌 **Подпись документации:** ручной аудит · 2026-10-02.
