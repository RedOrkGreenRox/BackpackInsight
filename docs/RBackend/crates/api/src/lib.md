# [api/lib.rs](/RBackend/crates/api/src/lib.rs)

## Назначение
Сборка Axum-приложения: `app(state)` строит `Router`, монтирует операционные и защищённые FlatBuffer маршруты, слои CORS/trace/secret/rate-limit. `serve(addr)` запускает tokio-слушатель с graceful shutdown.

## Ключевая функциональность
- `pub fn app(state: AppState) -> Router` — собирает дерево маршрутов.
- `pub async fn serve(addr)` — `AppState::discover()` → `TcpListener` → `axum::serve(...).with_graceful_shutdown(...)`.
- `cors_layer(state)` — статический CORS на `ROOT_CORS_ORIGIN`.
- `shutdown_signal()` — Ctrl-C / SIGTERM / SIGINT.
- Репэкспорт: `pub use state::AppState`.

## Связи
- Маршруты: [routes/](routes/mod.md).
- Состояние: [state.rs](state.md).
- Защита: [security/](security/mod.md).

---
> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
