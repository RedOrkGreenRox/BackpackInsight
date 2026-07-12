# [db/lib.rs](/RBackend/crates/db/src/lib.rs)

## Назначение
Crate `db` — SQLx persistence (dual-driver: Postgres + SQLite). `Db::connect_from_env_if_enabled()` запускает миграции.

## Ключевая функциональность
- `struct Db { pool: AnyPool }`.
- `Db::connect_from_env_if_enabled()` → `Option<Db>`.
- Репэкспорт: `save_profile`, `seed_itemdefinitions_if_empty`, `ProfileSave`, `HeroSave`, `ItemSave`.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
