# [Манифест конвейера картинок (Cargo.toml)](/RBackend/crates/art/Cargo.toml)

## Назначение
Манифест пакета `art` — конвейера картинок предметов: оригинальный ContentKit игры + [правила](rules.toml.md) → нормализованные AVIF/WebP и `manifest.json` для сайта ([обзор](src/main.md)).

## Ключевое
- **`[package]`**: `version = "0.1.0"`; `edition`, `license`, `repository` из `[workspace.package]` ([RBackend/Cargo.toml](../../Cargo.toml.md)).
- **Зависимости:**
  - `rbackend_core` — строгая модель экспорта `CatalogExport`/`ItemDef`/`Cell` и `SlugService`;
  - `image` (только PNG) — чтение слоёв, поворот, ресайз Lanczos3;
  - `ravif` — AVIF (чистый Rust, rav1e); `webp` — WebP с потерями (libwebp);
  - `rayon` — параллельная сборка; `sha2` — хеш содержимого в именах;
  - `serde`, `serde_json`, `toml` — правила и манифест.
- **`[lints] workspace = true`** — общие линты workspace.

## Связи
- Workspace: [RBackend/Cargo.toml](../../Cargo.toml.md); версии — [Cargo.lock](../../Cargo.lock.md).

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
