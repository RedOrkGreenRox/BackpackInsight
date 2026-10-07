# [Манифест консольной утилиты (Cargo.toml)](/Backend/crates/cli/Cargo.toml)

## Назначение
Манифест пакета `cli`. Консольная утилита для ручной сверки правил крейта `core` ([обзор](../cli.md)).

## Ключевое
- **Имя пакета:** `cli`.
- **`[package]`**: `version = "0.1.0"`; `edition`, `license` и `repository` берутся из `[workspace.package]` ([Backend/Cargo.toml](../../Cargo.toml.md)).
- **Зависимости:** только `backend_core` (крейт `core`) и `serde_json` для печати результатов.
- **`[lints] workspace = true`** — общие линты workspace: `unsafe_code = "forbid"`, `clippy::unwrap_used` и `clippy::expect_used` на уровне `warn`.

## Связи
- Workspace: [Backend/Cargo.toml](../../Cargo.toml.md). Версии зависимостей зафиксированы в [Cargo.lock](../../Cargo.lock.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
