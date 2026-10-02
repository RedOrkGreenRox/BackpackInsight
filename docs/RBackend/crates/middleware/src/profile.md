# [middleware/profile.rs](/RBackend/crates/middleware/src/profile.rs)

## Назначение
Декодирование бинарного представления профиля (пак с идентификатором `"BIPR"`) в `ProfileData`.

## API
- `ProfileData` — `nickname`, `level`, `trophy`, `bonus_trophy`, `gems`, `coins`, `xp_current`, `xp_need`, `area`, `item_stats` (`BTreeMap<String, u64>`), `heroes`, `items`, `actual_version`, `install_version` (оба `Option`), `profile_skins` (`BTreeMap<String, Vec<String>>`).
- `HeroData` — `name`, `level`, `rating`, `experience`, `exp_req`, `prestige`, `league`, `skin_num`.
- `ProfileItemData` — `name`, `rarity`, `level`, `cards`, `cards_need` (знаковое `i32`).
- `decode_profile(bytes)` — `read_profile_view_bytes` из [pack/profile](../../pack/src/profile.md), затем `profile_from_pack`.

## Внутреннее
`profile_from_pack` переносит поля `ProfileViewPack` один к одному. `item_stats` и `profile_skins` собираются в `BTreeMap`, поэтому при сериализации ключи идут в отсортированном порядке.

## Тесты
`rejects_invalid_profile_pack` — произвольные байты дают `Err`.

---

> 📌 **Подпись документации:** переписано по исходнику · 2026-10-02
