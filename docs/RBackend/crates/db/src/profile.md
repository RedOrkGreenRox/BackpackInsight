# [db/profile.rs](/RBackend/crates/db/src/profile.rs)

## Назначение
Транзакционный upsert `profiles` + `hero` + `item` на `&AnyPool`. Диалект-портабельный SQL с `$N` placeholders.

## Ключевая функциональность
- `struct ProfileSave { uid, nickname, level, ..., heroes: Vec<HeroSave>, items: Vec<ItemSave> }`.
- `save_profile(pool, &ProfileSave)` — транзакция: upsert profiles → DELETE old → bulk INSERT heroes+items.
- `build_placeholders(rows, cols)` — генератор `$N` плейсхолдеров.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
