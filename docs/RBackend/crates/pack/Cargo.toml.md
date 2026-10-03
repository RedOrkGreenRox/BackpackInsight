# [crates/pack/Cargo.toml](/RBackend/crates/pack/Cargo.toml)

## Назначение
Манифест пакета `pack`. Чтение FlatBuffer-паков и сгенерированные `flatc` аксессоры ([обзор](../pack.md)).

## Ключевое
- **Имя пакета:** `pack`.
- **`[package]`**: `version = "0.1.0"`; `edition`, `license` и `repository` берутся из `[workspace.package]` ([RBackend/Cargo.toml](../../Cargo.toml.md)).
- **Зависимости:** `flatbuffers` 25 — рантайм аксессоров; `serde` с `derive`.
- **Свои линты вместо workspace:** `unsafe_code = "allow"`, потому что сгенерированные аксессоры FlatBuffers содержат `unsafe`. Разрешение изолировано в этом крейте, остальной workspace держит `forbid`. Линты clippy те же, что у workspace: `unwrap_used` и `expect_used` на уровне `warn`.

## Связи
- Workspace: [RBackend/Cargo.toml](../../Cargo.toml.md). Версии зависимостей зафиксированы в [Cargo.lock](../../Cargo.lock.md).

---

> 📌 **Подпись документации:** по исходнику · 2026-10-02
