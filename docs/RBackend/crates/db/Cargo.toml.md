# [Манифест слоя хранения (Cargo.toml)](/RBackend/crates/db/Cargo.toml)

## Назначение
Манифест пакета `db`. Слой хранения профилей на SQLx ([обзор](../db.md)).

## Ключевое
- **Имя пакета:** `db`.
- **`[package]`**: `version = "0.1.0"`; `edition`, `license` и `repository` берутся из `[workspace.package]` ([RBackend/Cargo.toml](../../Cargo.toml.md)).
- **Зависимости:**
  - `middleware` — `decode_items` для заполнения таблицы предметов из паков ([seed.rs](src/seed.md));
  - `sqlx` 0.8 без функций по умолчанию, с `runtime-tokio`, `tls-rustls`, `postgres`, `sqlite`, `any`, `migrate`, `macros`: драйвер `Any` выбирает Postgres или SQLite по адресу подключения, `migrate` встраивает SQL-миграции, TLS через rustls без OpenSSL;
  - `libsqlite3-sys` 0.30 с `bundled` — SQLite собирается вместе с бинарником, системная библиотека не нужна.
- **`[lints] workspace = true`** — общие линты workspace: `unsafe_code = "forbid"`, `clippy::unwrap_used` и `clippy::expect_used` на уровне `warn`.

## Связи
- Workspace: [RBackend/Cargo.toml](../../Cargo.toml.md). Версии зависимостей зафиксированы в [Cargo.lock](../../Cargo.lock.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
