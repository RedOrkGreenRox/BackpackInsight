# [rust-toolchain.toml](/rust-toolchain.toml)

## Назначение
Закрепляет канал Rust для всего репозитория: rustup автоматически ставит и выбирает нужный тулчейн при запуске `cargo` в любой папке проекта.

## Ключевое
- `channel = "stable"` — последний стабильный Rust.
- `profile = "minimal"` — только `rustc`, `cargo` и `rust-std`, без документации и дополнительных компонентов.

## Связи
- Workspace: [RBackend/Cargo.toml](RBackend/Cargo.toml.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
