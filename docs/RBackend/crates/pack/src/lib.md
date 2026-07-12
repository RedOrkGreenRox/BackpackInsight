# [pack/lib.rs](/RBackend/crates/pack/src/lib.rs)

## Назначение
Crate `pack` — runtime readers/writers для сгенерированных FlatBuffer-паков. Не зависит от `flatc` в runtime (использует сгенерированные баиндинги в `generated/`).

## Ключевая функциональность
- Подмодули: `api_items`, `catalog`, `error`, `profile`.
- Репэкспорт: `read_*_bytes`, `build_*_bytes`, `*Pack`.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
