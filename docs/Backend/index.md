# 🗄 Backend — источники данных

Ветка `Backend/` содержит только статические JSON-справочники предметов для игры **Backpack Brawl**. Все серверные компоненты (FastAPI/Python/Alembic) удалены; живой бэкенд — Rust, см. [RBackend index](../RBackend/index.md).

## Содержимое
*   [`Backend/DB/`](DB/index.md) — справочники предметов по версиям игры (v3.1.0 → v5.1.0) и тултипы. Эти JSON-файлы являются **исходными данными** для [builder](../RBackend/crates/build.md) crate, который валидирует их и упаковывает в FlatBuffer-паки `RBackend/generated/*.fb`.

## Куда дальше
*   [Backend/DB index](DB/index.md) — список JSON-файлов.
*   [RBackend index](../RBackend/index.md) — живой Rust-бэкенд.
*   [Data index](../data/index.md) — обзор игровых механик.

---
> 📌 **Подпись документации:** обновлено после удаления Python-бэкенда · 2026-07-12.
