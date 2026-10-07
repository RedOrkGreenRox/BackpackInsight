# [Манифест HTTP-сервера (Cargo.toml)](/RBackend/crates/api/Cargo.toml)

## Назначение
Манифест пакета `api`. HTTP-сервер RBackend на Axum: служебные маршруты и защищённое бинарное API ([обзор](../api.md)).

## Ключевое
- **Имя пакета:** `api`.
- **`[package]`**: `version = "0.1.0"`; `edition`, `license` и `repository` берутся из `[workspace.package]` ([RBackend/Cargo.toml](../../Cargo.toml.md)).
- **Зависимости:**
  - внутренние: `db`, `middleware`, `rbackend_core` (крейт `core`), `pack`;
  - `axum` 0.8 — маршруты и обработчики;
  - `tokio` 1 с `macros`, `rt-multi-thread`, `net`, `sync`, `signal` — рантайм, сокет и сигнал остановки;
  - `tower-http` 0.6 с `cors` и `trace` — `CorsLayer` и `TraceLayer` в [lib.rs](src/lib.md);
  - `subtle` 2 — сравнение секрета за постоянное время в [security/secret.rs](src/security/secret.md);
  - `serde`, `serde_json` — JSON служебных ответов и разбора профиля;
  - `tracing`, `tracing-subscriber` (`env-filter`) — логи с уровнем из `RUST_LOG` (по умолчанию `info`, см. [main.rs](src/main.md)).
- **`[lints] workspace = true`** — общие линты workspace: `unsafe_code = "forbid"`, `clippy::unwrap_used` и `clippy::expect_used` на уровне `warn`.

## Связи
- Workspace: [RBackend/Cargo.toml](../../Cargo.toml.md). Версии зависимостей зафиксированы в [Cargo.lock](../../Cargo.lock.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
