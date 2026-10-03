# [crates/core/Cargo.toml](/RBackend/crates/core/Cargo.toml)

## Назначение
Манифест пакета `rbackend_core`. Крейт `core` с чистыми доменными правилами ([обзор](../core.md)). Имя пакета `rbackend_core`, потому что `core` занято стандартной библиотекой Rust.

## Ключевое
- **Имя пакета:** `rbackend_core`.
- **`[package]`**: `version = "0.1.0"`; `edition`, `license` и `repository` берутся из `[workspace.package]` ([RBackend/Cargo.toml](../../Cargo.toml.md)).
- **Зависимости:** одна внешняя — `unicode-normalization` 0.1, для нормализации строк при построении слагов в [slug.rs](src/slug.md).
- **`[lints] workspace = true`** — общие линты workspace: `unsafe_code = "forbid"`, `clippy::unwrap_used` и `clippy::expect_used` на уровне `warn`.

## Связи
- Workspace: [RBackend/Cargo.toml](../../Cargo.toml.md). Версии зависимостей зафиксированы в [Cargo.lock](../../Cargo.lock.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
