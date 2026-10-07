# [Манифест ядра (Cargo.toml)](/RBackend/crates/core/Cargo.toml)

## Назначение
Манифест пакета `rbackend_core`. Крейт `core` с чистыми доменными правилами ([обзор](../core.md)). Имя пакета `rbackend_core`, потому что `core` занято стандартной библиотекой Rust.

## Ключевое
- **Имя пакета:** `rbackend_core`.
- **`[package]`**: `version = "0.1.0"`; `edition`, `license` и `repository` берутся из `[workspace.package]` ([RBackend/Cargo.toml](../../Cargo.toml.md)).
- **Зависимости:**
  - `unicode-normalization` 0.1 — нормализация строк при построении слагов в [slug.rs](src/slug.md);
  - `serde` 1 с `derive` и `serde_json` 1 — строгая модель экспорта каталога ([catalog/export](src/catalog/export/mod.md)).
- **`[lints] workspace = true`** — общие линты workspace: `unsafe_code = "forbid"`, `clippy::unwrap_used` и `clippy::expect_used` на уровне `warn`.

## Связи
- Workspace: [RBackend/Cargo.toml](../../Cargo.toml.md). Версии зависимостей зафиксированы в [Cargo.lock](../../Cargo.lock.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
