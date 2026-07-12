# [core/profile/level.rs](/RBackend/crates/core/src/profile/level.rs)

## Назначение
`LevelService` — таблица опыта `PROFILE_EXP_NEED` для расчёта уровня игрока по Xp.

## Ключевая функциональность
- `PROFILE_EXP_NEED: &[u64]` — таблица опыта до каждого уровня.
- `LevelService::level_for_xp(xp)` → `PlayerLevel` + `LevelProgress`.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
