# [core/profile/area.rs](/RBackend/crates/core/src/profile/area.rs)

## Назначение
`AreaService` — таблица порогов трофеев `PROFILE_AREAS` для определения игровой зоны (0, 5, 50, 100, ...).

## Ключевая функциональность
- `PROFILE_AREAS: &[u64]` — 20 порогов.
- `AreaService::area_for_trophy(t)` → `PlayerArea`.

---

> 📌 **Подпись документации:** stub-документ для MIRROR-покрытия · 2026-07-12.
