# [Манифест декодеров (Cargo.toml)](/RBackend/crates/middleware/Cargo.toml)

## Назначение
Манифест пакета `middleware`. Слой декодирования бинарных контрактов бэкенда в типизированные структуры Rust ([обзор](../middleware.md)).

## Ключевое
- **Имя пакета:** `middleware`.
- **`[package]`**: `version = "0.1.0"`; `edition`, `license` и `repository` берутся из `[workspace.package]` ([RBackend/Cargo.toml](../../Cargo.toml.md)).
- **Зависимости:** `pack` (сгенерированные FlatBuffers-аксессоры) и `serde` с `derive`.
- **`[lints] workspace = true`** — общие линты workspace: `unsafe_code = "forbid"`, `clippy::unwrap_used` и `clippy::expect_used` на уровне `warn`.

## Связи
- Workspace: [RBackend/Cargo.toml](../../Cargo.toml.md). Версии зависимостей зафиксированы в [Cargo.lock](../../Cargo.lock.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
