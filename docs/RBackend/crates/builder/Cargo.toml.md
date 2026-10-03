# [crates/builder/Cargo.toml](/RBackend/crates/builder/Cargo.toml)

## Назначение
Манифест пакета `builder`. Консольная утилита проверки исходных данных и сборки FlatBuffer-паков ([обзор](../build.md)).

## Ключевое
- **Имя пакета:** `builder`.
- **`[package]`**: `version = "0.1.0"`; `edition`, `license` и `repository` берутся из `[workspace.package]` ([RBackend/Cargo.toml](../../Cargo.toml.md)).
- **Зависимости:** `rbackend_core` (крейт `core`) и `pack`; `serde`, `serde_json` — чтение исходных JSON из `Backend/DB`.
- Внешний компилятор `flatc` в зависимостях не указан: утилита вызывает его как программу.
- **`[lints] workspace = true`** — общие линты workspace: `unsafe_code = "forbid"`, `clippy::unwrap_used` и `clippy::expect_used` на уровне `warn`.

## Связи
- Workspace: [RBackend/Cargo.toml](../../Cargo.toml.md). Версии зависимостей зафиксированы в [Cargo.lock](../../Cargo.lock.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
