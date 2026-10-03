# [RBackend/Cargo.toml](/RBackend/Cargo.toml)

## Назначение
Корневой манифест Cargo workspace RBackend: состав крейтов, общие метаданные, линты и профиль сборки релиза.

## Ключевое
- **`[workspace]`**, `resolver = "2"`. Участники:

  | Крейт | Манифест |
  | :--- | :--- |
  | `core` (пакет `rbackend_core`) | [crates/core/Cargo.toml](crates/core/Cargo.toml.md) |
  | `cli` | [crates/cli/Cargo.toml](crates/cli/Cargo.toml.md) |
  | `api` | [crates/api/Cargo.toml](crates/api/Cargo.toml.md) |
  | `builder` | [crates/builder/Cargo.toml](crates/builder/Cargo.toml.md) |
  | `pack` | [crates/pack/Cargo.toml](crates/pack/Cargo.toml.md) |
  | `middleware` | [crates/middleware/Cargo.toml](crates/middleware/Cargo.toml.md) |
  | `db` | [crates/db/Cargo.toml](crates/db/Cargo.toml.md) |

- **`[workspace.package]`** — общие для всех крейтов `edition = "2021"`, `license = "MIT"` и `repository`.
- **`[workspace.lints]`** — `unsafe_code = "forbid"`; clippy `unwrap_used` и `expect_used` на уровне `warn`. Крейты подключают их через `[lints] workspace = true`; исключение — `pack`, которому нужен `unsafe` для сгенерированного кода.
- **`[profile.release]`** — `lto = "fat"`, `codegen-units = 1`, `strip = "symbols"`: меньше и быстрее бинарник ценой более долгой сборки.

## Связи
- Версия компилятора: [rust-toolchain.toml](../rust-toolchain.toml.md). Зафиксированные версии зависимостей: [Cargo.lock](Cargo.lock.md).
- Обзор бэкенда: [RBackend/index.md](index.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
