# [Тесты подбора файлов (resolve_tests.rs)](/RBackend/crates/art/src/resolve_tests.rs)

## Назначение
Тесты [resolve.rs](resolve.md) на временном архиве из [test_kit.rs](test_kit.md) и маленьких правилах `RULES`.

## Тесты
- `plain_item_finds_file_by_id_with_states` — `Antivenom` находит свой файл и состояние `Empty`.
- `falls_back_to_name_then_alias` — `Rat` → файл `Brown Rat` по `name`; `Spiked Whip` → `Spike Whip`; благо → `boon-vigor` из `ui/Icons/Boons`.
- `heist_step_is_scroll_plus_stamp` — `Boomscrolling II` = `Heist Plan 2` + `Heist Plan - Scroll`.
- `layers_rotate_and_missing_come_from_rules` — слои, явный поворот 270 и `missing`.
- `unknown_item_is_an_error_naming_the_id` — ошибка содержит `id`.

Помощники: `kit()`, `resolve(id, name)`, `layer_names(resolved)`.

---
> 📌 **Подпись документации:** по исходнику · 2026-10-06
